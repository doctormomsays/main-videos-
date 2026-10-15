#!/usr/bin/env python3
"""Multi-clip montage prep (b-roll / UGC reels with no talking).

Reads an edit list (edits/<name>.json), cuts each shot from its source clip,
applies one consistent grade, lifts the natural sound a little, and writes
1080x1920 30fps shots plus Remotion props for every version:

  public/work/<name>/shots/*.mp4
  public/work/<name>/props_<version>.json   (v1, v1_profile, v2.., *_notext)

Each shot carries `fadeFrames` extra frames at the tail so the next shot can
crossfade over it without shortening the timeline.
"""
import argparse
import json
import subprocess
from pathlib import Path

FPS = 30
W, H = 1080, 1920

# Warm, soft daylight: gentle contrast, lifted shadows, a touch warmer.
GRADE = (
    "eq=contrast=0.94:brightness=0.012:saturation=0.96,"
    "curves=master='0/0.045 0.25/0.275 0.75/0.765 1/0.985',"
    "colorbalance=rs=0.035:bs=-0.035:rm=0.025:bm=-0.025:rh=0.015:bh=-0.02"
)


def cut_shot(src: Path, start: float, frames: int, out: Path, gain_db: float):
    vf = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},setsar=1,{GRADE},format=yuv420p"
    af = f"highpass=f=40,volume={gain_db}dB,aresample=48000"
    subprocess.run(
        ["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{start:.3f}", "-i", str(src),
         "-frames:v", str(frames), "-t", f"{frames / FPS:.4f}",
         "-vf", vf, "-af", af, "-ac", "2",
         "-c:v", "libx264", "-preset", "medium", "-crf", "12",
         "-c:a", "aac", "-b:a", "256k", str(out)],
        check=True,
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("edl")
    ap.add_argument("--force", action="store_true", help="re-cut shots that already exist")
    args = ap.parse_args()

    root = Path(__file__).resolve().parent.parent
    edl = json.loads(Path(args.edl).read_text())
    name, fade = edl["name"], edl["fadeFrames"]
    work = root / "public" / "work" / name
    (work / "shots").mkdir(parents=True, exist_ok=True)
    clips = root / edl["clipsDir"]

    def key(clip, start):
        return f"{clip}_{start:07.2f}".replace(".", "p")

    jobs = {}

    def shot(clip, start, dur, what):
        frames = round(dur * FPS)
        k = key(clip, start)
        jobs[k] = (clips / f"{clip}.MOV", start, frames + fade)
        return {"src": f"work/{name}/shots/{k}.mp4", "frames": frames, "what": what}

    base = [shot(s["clip"], s["in"], s["dur"], s["what"]) for s in edl["shots"]]
    sections = [s["section"] for s in edl["shots"]]

    versions = {"v1": (base, edl["texts"])}
    alt = list(base)
    for i, s in enumerate(edl["shots"]):
        if "alt" in s:
            alt[i] = shot(s["alt"]["clip"], s["alt"]["in"], s["dur"], s["alt"]["what"])
    if alt != base:
        versions["v1_profile"] = (alt, edl["texts"])
    for vid, v in edl.get("variants", {}).items():
        shots = [shot(v["shot"]["clip"], v["shot"]["in"], edl["shots"][0]["dur"], v["shot"]["what"])] + base[1:]
        versions[vid] = (shots, [{**edl["texts"][0], "text": v["text"]}] + edl["texts"][1:])

    for k, (src, start, frames) in jobs.items():
        out = work / "shots" / f"{k}.mp4"
        if out.exists() and not args.force:
            continue
        print(f"cut {k} ({frames} frames)", flush=True)
        cut_shot(src, start, frames, out, edl.get("gainDb", 0))

    music = f"work/{name}/{edl['music']}" if edl.get("music") else None
    for vid, (shots, texts) in versions.items():
        for show in (True, False):
            props = {
                "shots": shots, "sections": sections, "texts": texts if show else [],
                "fadeFrames": fade, "music": music, "musicVolume": edl.get("musicVolume", 0.18),
            }
            suffix = "" if show else "_notext"
            (work / f"props_{vid}{suffix}.json").write_text(json.dumps(props, indent=1))
    total = sum(s["frames"] for s in base)
    print(f"NAME={name}\nVERSIONS={' '.join(versions)}\nFRAMES={total} ({total / FPS:.2f}s)")


if __name__ == "__main__":
    main()
