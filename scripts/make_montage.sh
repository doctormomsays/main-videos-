#!/usr/bin/env bash
# Multi-clip calm montage (no talking): edit list -> graded shots -> Remotion -> MP4s.
#   scripts/make_montage.sh edits/<name>.json [version ...]
# Versions default to everything prep_montage.py writes (v1, variants, and *_notext).
# Output: out/<name>/<name>_<version>.mp4, plus out/<name>/sections/ cut from v1_notext.
set -euo pipefail
cd "$(dirname "$0")/.."

EDL="$1"; shift || true
LOG="$(python3 scripts/prep_montage.py "$EDL" | tee /dev/stderr)"
NAME="$(echo "$LOG" | sed -n 's/^NAME=//p')"
WORK="public/work/${NAME}"
OUT="out/${NAME}"; mkdir -p "$OUT/sections"

if [ $# -gt 0 ]; then VERSIONS=("$@"); else
  VERSIONS=(); for p in "$WORK"/props_*.json; do v="$(basename "$p" .json)"; VERSIONS+=("${v#props_}"); done
fi

for V in "${VERSIONS[@]}"; do
  RAW="$OUT/.raw_${V}.mp4"
  npx remotion render src/index.ts Montage "$RAW" \
    --props="$WORK/props_${V}.json" \
    --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell \
    --codec=h264 --crf=14 --pixel-format=yuv420p --audio-bitrate=320k \
    --concurrency=4 --log=error
  # Two-pass linear loudness: same level across versions, natural dynamics kept.
  STATS="$(ffmpeg -nostdin -i "$RAW" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')"
  get() { echo "$STATS" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
  ffmpeg -nostdin -v error -y -i "$RAW" -c:v copy \
    -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
    -c:a aac -b:a 320k -shortest -movflags +faststart "$OUT/${NAME}_${V}.mp4"
  rm -f -- "$RAW"
  echo "DONE: $OUT/${NAME}_${V}.mp4"
done

# Section clips (clean, no text) for rebuilding ads later.
if [ -f "$OUT/${NAME}_v1_notext.mp4" ]; then
  python3 - "$WORK/props_v1_notext.json" "$OUT/${NAME}_v1_notext.mp4" "$OUT/sections" <<'EOF'
import json, subprocess, sys
props, src, out = json.load(open(sys.argv[1])), sys.argv[2], sys.argv[3]
spans, at = {}, 0
for s, sec in zip(props["shots"], props["sections"]):
    a, b = spans.get(sec, (at, at))
    spans[sec] = (min(a, at), at + s["frames"])
    at += s["frames"]
for sec, (a, b) in spans.items():
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", src,
                    "-vf", f"trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS",
                    "-af", f"atrim=start={a/30:.4f}:end={b/30:.4f},asetpts=PTS-STARTPTS",
                    "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", f"{out}/{sec}.mp4"], check=True)
    print(f"section {sec}: {(b-a)/30:.2f}s")
EOF
fi
