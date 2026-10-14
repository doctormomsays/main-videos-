#!/usr/bin/env bash
# One command from raw clip to finished reel.
#   scripts/make_reel.sh clips/<brand>/my-clip.mp4 "Hook title" ["End-card line"]
# <brand> folder = doctormomsays or honestlyworthit (picks colours, fonts, pacing).
set -euo pipefail
cd "$(dirname "$0")/.."

CLIP="$1"; HOOK="${2:-}"; CTA="${3:-}"

LOG="$(python3 scripts/edit_clip.py "$CLIP" --hook "$HOOK" --cta "$CTA" ${WHISPER_MODEL:+--model "$WHISPER_MODEL"} | tee /dev/stderr)"
NAME="$(echo "$LOG" | sed -n 's/^NAME=//p')"

mkdir -p out
npx remotion render src/index.ts Reel "out/${NAME}-reel.mp4" \
  --props="public/work/${NAME}/props.json" \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell \
  --concurrency=4 --log=error
echo "DONE: out/${NAME}-reel.mp4"
