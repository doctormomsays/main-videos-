#!/usr/bin/env python3
"""Transcribe a raw reel clip with Whisper, cut umms and dead air, and write
an edited 1080x1920 clip plus word-level caption timings for Remotion.

Usage: python3 scripts/edit_clip.py clips/<brand>/my-clip.mp4 --hook "Hook text" [--cta "..."]
The brand (doctormomsays / honestlyworthit) comes from the folder the clip is in.
Outputs: public/work/<brand>-<name>/edited.mp4 and props.json
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30

FILLERS = {"um", "umm", "ummm", "uh", "uhh", "uhm", "erm", "er", "ah", "ahh", "hmm", "hm", "mm", "mmm", "mhm"}
# Per-brand pacing. doctormomsays: tight, punchy cuts. honestlyworthit: calm,
# keeps a short breath between phrases so it doesn't feel jumpy.
BRANDS = {
    "doctormomsays": {"pad_before": 0.08, "pad_after": 0.10, "max_gap": 0.18, "lufs": -14},
    "honestlyworthit": {"pad_before": 0.12, "pad_after": 0.22, "max_gap": 0.35, "lufs": -16},
}
DEFAULT_BRAND = "doctormomsays"
SILENCE_DB = -38      # used to tighten Whisper's loose word boundaries
SILENCE_MIN = 0.30
# Nudging Whisper to transcribe disfluencies so we can find and cut them.
FILLER_PROMPT = "Umm, so, uh, I mean, hmm. Okay so, um, let me tell you."


def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def probe_duration(path):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]).stdout
    return float(out.strip())


def has_audio(path):
    out = run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", str(path)]).stdout
    return bool(out.strip())


def transcribe(path, model_name, language):
    from faster_whisper import WhisperModel

    import numpy as np

    # Decode with ffmpeg ourselves (handles iPhone .MOV/HEVC and avoids PyAV version issues).
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
        check=True, capture_output=True,
    ).stdout
    audio = np.frombuffer(pcm, dtype=np.float32)
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(
        audio,
        language=language,
        word_timestamps=True,
        initial_prompt=FILLER_PROMPT,
        condition_on_previous_text=False,
        vad_filter=False,
    )
    words = []
    for seg in segments:
        for w in seg.words or []:
            text = w.word.strip()
            if text:
                words.append({"text": text, "start": float(w.start), "end": float(w.end), "p": float(w.probability)})
    return words


def is_filler(text):
    return re.sub(r"[^a-z]", "", text.lower()) in FILLERS


def silences(path, duration):
    """Return [(start, end)] stretches of near-silence."""
    res = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(path), "-af", f"silencedetect=noise={SILENCE_DB}dB:d={SILENCE_MIN}", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    out, start = [], None
    for line in res.stderr.splitlines():
        if m := re.search(r"silence_start: ([\d.]+)", line):
            start = float(m.group(1))
        elif (m := re.search(r"silence_end: ([\d.]+)", line)) and start is not None:
            out.append((start, float(m.group(1))))
            start = None
    if start is not None:
        out.append((start, duration))
    return out


def subtract(intervals, holes):
    result = []
    for s, e in intervals:
        pieces = [(s, e)]
        for hs, he in holes:
            nxt = []
            for ps, pe in pieces:
                if he <= ps or hs >= pe:
                    nxt.append((ps, pe))
                    continue
                if hs > ps:
                    nxt.append((ps, hs))
                if he < pe:
                    nxt.append((he, pe))
            pieces = nxt
        result.extend(p for p in pieces if p[1] - p[0] > 0.04)
    return result


def merge(intervals, gap):
    merged = []
    for s, e in sorted(intervals):
        if merged and s - merged[-1][1] <= gap:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))
    return merged


def plan_cuts(words, duration, silence_spans, pace):
    spoken = [w for w in words if not is_filler(w["text"])]
    if not spoken:
        sys.exit("Whisper found no speech in this clip.")
    raw = [(max(0.0, w["start"] - pace["pad_before"]), min(duration, w["end"] + pace["pad_after"])) for w in spoken]
    keep = merge(raw, pace["max_gap"])

    # Whisper often stretches word edges into silence; trim real silences out,
    # leaving a short cushion at each edge. Skip if it would remove too much
    # (very quiet or noisy recordings).
    holes = [(s + 0.06, e - 0.06) for s, e in silence_spans if e - s > 0.12]
    tightened = merge(subtract(keep, holes), pace["max_gap"])
    kept_before = sum(e - s for s, e in keep)
    kept_after = sum(e - s for s, e in tightened)
    if kept_after > 0.6 * kept_before:
        keep = tightened

    # Snap to the frame grid so audio and video cut on the same boundaries.
    snapped = []
    for s, e in keep:
        s, e = round(s * FPS) / FPS, round(e * FPS) / FPS
        if e - s >= 2 / FPS:
            snapped.append((s, e))
    return spoken, snapped


def remap_words(spoken, keep):
    out, offset = [], 0.0
    offsets = []
    for s, e in keep:
        offsets.append(offset)
        offset += e - s
    for w in spoken:
        mid = (w["start"] + w["end"]) / 2
        for (s, e), off in zip(keep, offsets):
            if s - 0.05 <= mid <= e + 0.05:
                ns = off + max(0.0, w["start"] - s)
                ne = off + min(e - s, w["end"] - s)
                out.append({"text": w["text"], "start": round(ns, 3), "end": round(max(ne, ns + 0.05), 3)})
                break
    return out, offset


def render_cut(src, keep, dest, lufs):
    parts, labels = [], []
    for i, (s, e) in enumerate(keep):
        d = e - s
        fade = min(0.012, d / 4)
        parts.append(f"[0:v]trim=start={s:.4f}:end={e:.4f},setpts=PTS-STARTPTS[v{i}]")
        parts.append(
            f"[0:a]atrim=start={s:.4f}:end={e:.4f},asetpts=PTS-STARTPTS,"
            f"afade=t=in:d={fade:.4f},afade=t=out:st={d - fade:.4f}:d={fade:.4f}[a{i}]"
        )
        labels.append(f"[v{i}][a{i}]")
    parts.append(f"{''.join(labels)}concat=n={len(keep)}:v=1:a=1[vc][ac]")
    # Fill a 9:16 1080x1920 frame (crops the sides of anything wider).
    parts.append("[vc]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[vo]")
    parts.append(f"[ac]aresample=48000,loudnorm=I={lufs}:TP=-1.5:LRA=11[ao]")
    dest.parent.mkdir(parents=True, exist_ok=True)
    run([
        "ffmpeg", "-y", "-hide_banner", "-i", str(src), "-filter_complex", ";".join(parts),
        "-map", "[vo]", "-map", "[ao]", "-c:v", "libx264", "-preset", "medium", "-crf", "16",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", str(dest),
    ])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("--hook", default="", help="Hook title shown for the first 2 seconds")
    ap.add_argument("--cta", default="", help="End-card line (blank = brand default)")
    ap.add_argument("--brand", choices=sorted(BRANDS), help="Override the brand picked from the folder")
    ap.add_argument("--model", default="small", help="Whisper model: base, small, medium, large-v3")
    ap.add_argument("--language", default="en")
    args = ap.parse_args()

    src = Path(args.clip).resolve()
    if not src.exists():
        sys.exit(f"Clip not found: {src}")
    if not has_audio(src):
        sys.exit("This clip has no audio track, so there is nothing to caption.")
    brand = args.brand or (src.parent.name if src.parent.name in BRANDS else DEFAULT_BRAND)
    pace = BRANDS[brand]
    name = brand + "-" + (re.sub(r"[^A-Za-z0-9_-]+", "-", src.stem).strip("-") or "clip")
    work = ROOT / "public" / "work" / name
    duration = probe_duration(src)

    print(f"[{brand}] Transcribing {src.name} ({duration:.1f}s) with Whisper '{args.model}'...")
    words = transcribe(src, args.model, args.language)
    fillers = [w["text"] for w in words if is_filler(w["text"])]
    spoken, keep = plan_cuts(words, duration, silences(src, duration), pace)

    render_cut(src, keep, work / "edited.mp4", pace["lufs"])
    new_words, new_duration = remap_words(spoken, keep)
    new_duration = probe_duration(work / "edited.mp4")

    props = {
        "brand": brand,
        "video": f"work/{name}/edited.mp4",
        "videoDuration": round(new_duration, 3),
        "words": new_words,
        "hook": args.hook,
        "cta": args.cta,
    }
    (work / "props.json").write_text(json.dumps(props, indent=2))
    (work / "transcript.txt").write_text(" ".join(w["text"] for w in spoken) + "\n")

    print(f"Transcript: {' '.join(w['text'] for w in spoken)}")
    print(f"Fillers removed: {', '.join(fillers) if fillers else 'none detected'}")
    print(f"Cut {duration - new_duration:.1f}s of pauses/fillers across {len(keep)} segments: {duration:.1f}s -> {new_duration:.1f}s")
    print(f"NAME={name}")


if __name__ == "__main__":
    main()
