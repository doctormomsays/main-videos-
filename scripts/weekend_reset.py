#!/usr/bin/env python3
"""Weekend Reset reel (@honestlyworthit.ugc), cut with plain ffmpeg.

    python3 scripts/weekend_reset.py [main hook_B hook_C notext banked]

Clips live in clips/honestlyworthit/weekend_reset/ (not committed). Outputs go to
out/weekend_reset/. The brief is briefs/weekend-reset.md.

Each shot is rendered to its own 1080x1920/30fps segment (speed, motion, audio level),
then one filter graph joins them (hard cuts, xfade transitions) and overlays the text
cards, which are PNGs drawn with Pillow and faded in/out with alpha fades.
"""
import json, math, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ugc_text
from ugc_text import BUTTER, PINK, WHITE

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIPS = os.path.join(ROOT, "clips/honestlyworthit/weekend_reset")
OUT = os.path.join(ROOT, "out/weekend_reset")
WORK = os.path.join(OUT, "_work")
FONT = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
W, H, FPS = 1080, 1920, 30
NATURAL = 0.6  # natural sound level (no music track yet)

# motion: ("push", z0, z1) eased over the shot | ("punch", t0, t1, z) instant step in/out
# anchor: (fx, fy) point that stays put while zooming (0.5, 0.5 = centre)
def shot(clip, ss, dur, speed=1.0, motion=None, anchor=(0.5, 0.5), join="cut", what=""):
    return dict(clip=clip, ss=ss, dur=dur, speed=speed, motion=motion or [], anchor=anchor,
                join=join, what=what)

HOOK = [shot("IMG_3678", 172.0, 3.3, motion=[("push", 1.0, 1.08)], anchor=(0.5, 0.7),
             what="coffee on the window seat, robot rolls in")]
BEFORE = [shot("IMG_3597", 25.0, 2.2, join="fade", what="grimy burner close-up")]
DYSON = [
    shot("IMG_3646", 59.0, 1.5, join="slideleft", what="curtain head attached"),
    shot("IMG_3648", 11.5, 3.0, speed=1.25, what="reach to the top of the curtain"),
    shot("IMG_3648", 20.5, 3.0, speed=1.25, what="second reach"),
    shot("IMG_3648", 37.5, 3.0, speed=1.25, what="third reach"),
]
INVISEL = [
    shot("IMG_3600", 8.3, 1.6, join="fade", what="can set on the stove"),
    shot("IMG_3607", 151.5, 1.6, what="foam burst on the burner base"),
    shot("IMG_3602", 17.0, 1.5, what="foam on the burner ring"),
    shot("IMG_3607", 243.8, 3.0, speed=1.25, what="cloth wipes through the foam"),
    shot("IMG_3607", 249.8, 3.0, speed=1.25, what="wiping round the burner"),
    shot("IMG_3611", 0.0, 2.0, what="dirty cloth"),
]
RETURN = [shot("IMG_3678", 191.8, 6.0, join="fade",
               motion=[("push", 1.0, 1.04)], anchor=(0.6, 0.85),
               what="robot crosses the floor")]
AFTER = [
    shot("IMG_3607", 445.0, 3.0, join="fade", what="clean burner (tripod-steady stretch)"),
    shot("IMG_3649", 3.0, 3.5, motion=[("push", 1.10, 1.0)], anchor=(0.5, 1.0), what="Dyson resting under the curtains"),
]
REVEAL_B = [
    shot("IMG_3607", 146.0, 1.0, what="before"),
    shot("IMG_3607", 272.0, 2.2, join="wiperight", motion=[("punch", 0.5, 1.5, 1.15)],
         anchor=(0.55, 0.45), what="after"),
]
BEFORE_C = [shot("IMG_3597", 25.0, 2.6, what="grimy burner close-up")]

# doodles: (name, anchor relative to the text block, size, rotation, colour)
SP, HT, DT, BW, ST, SQ, LP = "sparkle", "heart", "dots", "bow", "star", "squiggle", "loop"
# (shots, [(first shot index, styled text, doodles)]); see scripts/ugc_text.py for the markup
SECTIONS = {
    "hook": (HOOK, [(0, "3 little helpers / _that gave me_ / ~my saturdays back~ 🎀",
                     [(SP, (-0.06, 0.2), 72, 0, BUTTER), (HT, (1.07, 0.85), 60, 12, WHITE), (DT, (0.92, -0.08), 80, 0, WHITE)])]),
    "before": (BEFORE, [(0, "^be honest / does yours look / *like this too?*",
                         [(SQ, (0.5, 1.15), 150, 0, WHITE), (SP, (1.08, 0.1), 56, 0, BUTTER)])]),
    "dyson": (DYSON, [(0, "^helper one / ~curtains~ / *the job I always skip*",
                       [(HT, (-0.06, 0.45), 62, -12, PINK), (SP, (1.06, 0.3), 64, 0, BUTTER), (DT, (0.85, -0.1), 80, 0, WHITE)]),
                      (2, "no taking them down / _just slow, quiet passes_",
                       [(SP, (-0.05, 0.2), 58, 0, BUTTER), (HT, (1.05, 0.9), 54, 10, WHITE)])]),
    "invisel": (INVISEL, [(0, "^helper two / ~my stove~",
                           [(ST, (-0.12, 0.5), 64, -10, BUTTER), (SP, (1.12, 0.3), 60, 0, WHITE)]),
                          (2, "_a little foam_ / *one easy wipe*",
                           [(LP, (1.1, 0.75), 100, 10, WHITE), (SP, (-0.1, 0.2), 56, 0, BUTTER)]),
                          (5, "and all of this / ~came right off~",
                           [(HT, (1.07, 0.75), 64, 12, PINK), (SP, (-0.07, 0.2), 60, 0, BUTTER), (DT, (0.1, -0.15), 80, 0, WHITE)])]),
    "return": (RETURN, [(0, "^helper three / ~the floors~ / *done while I sipped*",
                         [(HT, (1.06, 0.55), 60, 12, PINK), (SP, (-0.06, 0.25), 66, 0, BUTTER), (DT, (0.88, -0.08), 80, 0, WHITE)])]),
    "after": (AFTER, [(0, "slow saturday / *reset done*",
                       [(SP, (-0.08, 0.3), 64, 0, BUTTER), (ST, (1.08, 0.7), 56, 10, WHITE)]),
                      (1, "_honestly_ / ~worth it~ 🎀",
                       [(HT, (-0.12, 0.6), 66, -12, PINK), (SP, (1.1, 0.2), 70, 0, BUTTER), (BW, (1.0, 1.15), 84, -8, WHITE)])]),
    "hook_B": (REVEAL_B, [(0, "_this is what_ / ~saturday mornings~ / *look like now*",
                           [(SP, (-0.06, 0.2), 70, 0, BUTTER), (HT, (1.06, 0.8), 60, 12, WHITE)])]),
    "hook_C": (BEFORE_C, [(0, "*a week of mess* / _two hours later_ / ~all done~",
                           [(SP, (-0.06, 0.2), 70, 0, BUTTER), (HT, (1.06, 0.8), 60, 12, PINK)])]),
}
BODY = ["before", "dyson", "invisel", "return", "after"]
VERSIONS = {
    "main": ["hook"] + BODY,
    "hook_B": ["hook_B"] + BODY,
    "hook_C": ["hook_C"] + BODY[1:],  # the hook is the before shot, so skip it in the body
    "notext": ["hook"] + BODY,
}
XFADE = {"fade": 0.3, "slideleft": 0.25, "wiperight": 0.4}
BANKED = {
    "dyson_curtain": shot("IMG_3648", 11.5, 4.0),
    "invisel_foam": shot("IMG_3607", 150.8, 5.0),
    "deebot_pass": shot("IMG_3678", 192.0, 5.0),
}


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f"ffmpeg failed:\n{' '.join(cmd)}\n{r.stderr[-3000:]}")


def zoom_expr(s, plain):
    """zoompan zoom expression in output seconds (`it`)."""
    if plain or not s["motion"]:
        return "1"
    out_dur = s["dur"] / s["speed"]
    z = "1"
    for m in s["motion"]:
        if m[0] == "push":
            _, z0, z1 = m
            ease = f"(1-cos(PI*min(it/{out_dur:.3f},1)))/2"
            z = f"({z0}+({z1 - z0})*{ease})"
        elif m[0] == "punch":
            _, t0, t1, zp = m
            z = f"({z})*if(between(it,{t0},{t1}),{zp},1)"
    return z


def render_segment(s, name, plain=False):
    out_dur = s["dur"] / s["speed"]
    key = json.dumps([s, plain], sort_keys=True)
    path = os.path.join(WORK, f"{name}.mp4")
    if os.path.exists(path + ".key") and open(path + ".key").read() == key:
        return path, out_dur
    fx, fy = s["anchor"]
    z = zoom_expr(s, plain)
    # 2x canvas so zoompan's integer crop offsets are half-pixels at output size
    vf = (f"setpts=(PTS-STARTPTS)/{s['speed']},fps={FPS},"
          f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase:flags=lanczos,crop={W*2}:{H*2},"
          f"zoompan=z='{z}':x='(iw-iw/zoom)*{fx}':y='(ih-ih/zoom)*{fy}':d=1:s={W}x{H}:fps={FPS},"
          f"eq=gamma=1.03:saturation=1.06,colorbalance=rm=0.03:bm=-0.02,setsar=1,format=yuv420p")
    tempo = f"atempo={s['speed']}," if s["speed"] != 1 else ""
    af = (f"asetpts=PTS-STARTPTS,{tempo}aresample=48000,aformat=channel_layouts=stereo,"
          f"loudnorm=I=-16:TP=-1.5:LRA=11,volume={NATURAL},"
          f"apad,atrim=0:{out_dur:.3f}")
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(s["ss"]), "-t", f"{s['dur']:.3f}",
         "-i", os.path.join(CLIPS, s["clip"] + ".mov"), "-vf", vf, "-af", af,
         "-t", f"{out_dur:.3f}", "-c:v", "libx264", "-crf", "14", "-preset", "medium",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", path])
    open(path + ".key", "w").write(key)
    return path, out_dur


def balanced_lines(words, font, d, max_w=880):
    """Fewest lines that fit, split so the lines are as even as possible (no orphans)."""
    width = lambda ws: d.textlength(" ".join(ws), font=font)
    if width(words) <= max_w:
        return [" ".join(words)]
    best = None
    for i in range(1, len(words)):
        a, b = words[:i], words[i:]
        if width(b) > max_w:
            continue
        rest = [" ".join(b)]
        if width(a) > max_w:
            continue
        score = max(width(a), width(b))
        if best is None or score < best[0]:
            best = (score, [" ".join(a)] + rest)
    return best[1] if best else [" ".join(words)]


def text_png(text, name):
    """White bold text with a soft dark shadow, centred, wrapped to ~880px."""
    path = os.path.join(WORK, f"text_{name}.png")
    font = ImageFont.truetype(FONT, 76)
    d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    lines = balanced_lines(text.split(), font, d)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    lh, top = 94, 330  # upper third, clear of the IG header
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd, td = ImageDraw.Draw(shadow), ImageDraw.Draw(img)
    for i, ln in enumerate(lines):
        x = (W - d.textlength(ln, font=font)) / 2
        y = top + i * lh
        sd.text((x + 2, y + 5), ln, font=font, fill=(0, 0, 0, 170))
        td.text((x, y), ln, font=font, fill=(255, 255, 255, 255))
    shadow = shadow.filter(ImageFilter.GaussianBlur(10))
    Image.alpha_composite(shadow, img).save(path)
    return path


def build(version):
    plain = version == "notext"
    shots, cards = [], []  # cards: (name, text, doodles, index of its first shot)
    for sec in VERSIONS[version]:
        sec_shots, sec_cards = SECTIONS[sec]
        for j, (off, text, doodles) in enumerate(sec_cards):
            cards.append((f"{sec}{j}", text, doodles, len(shots) + off))
        for i, s in enumerate(sec_shots):
            s = dict(s)
            if plain:
                s["join"] = "cut"
            if version == "hook_C" and sec == "dyson" and i == 0:
                s["join"] = "slideleft"
            if not shots:
                s["join"] = "cut"
            shots.append((sec, i, s))

    inputs, starts, t = [], [], 0.0
    vlast, alast, graph = None, None, []
    for k, (sec, i, s) in enumerate(shots):
        seg, dur = render_segment(s, f"{version}_{sec}_{i}", plain)
        inputs += ["-i", seg]
        graph.append(f"[{k}:v]settb=AVTB,setpts=PTS-STARTPTS[i{k}]")  # concat and xfade need one timebase
        if vlast is None:
            vlast, alast, start, t = f"i{k}", f"{k}:a", 0.0, dur
        elif s["join"] == "cut":
            graph.append(f"[{vlast}][{alast}][i{k}][{k}:a]concat=n=2:v=1:a=1[v{k}][a{k}]")
            vlast, alast, start, t = f"v{k}", f"a{k}", t, t + dur
        else:
            d = XFADE[s["join"]]
            graph.append(f"[{vlast}][i{k}]xfade=transition={s['join']}:duration={d}:offset={t - d:.3f}[v{k}]")
            graph.append(f"[{alast}][{k}:a]acrossfade=d={d}:c1=tri:c2=tri[a{k}]")
            vlast, alast, start, t = f"v{k}", f"a{k}", t - d, t + dur - d
        starts.append(start)
    total = t

    if not plain:
        # each card lands on its shot's cut, rises in softly and leaves just before the next card
        for n, (name, text, doodles, first) in enumerate(cards):
            t0 = starts[first] + (XFADE.get(shots[first][2]["join"], 0) if first else 0)
            t1 = (starts[cards[n + 1][3]] if n + 1 < len(cards) else total) - 0.05
            assert t1 - t0 >= 1.5, (name, t0, t1)
            fmt = os.path.join(WORK, f"card_{version}_{name}_%d.png")
            ugc_text.card(text, fmt, doodles)
            idx = len(shots) + n
            # 3 doodle frames looped at 6 fps = a hand-drawn "boil" every 5 video frames
            inputs += ["-framerate", "6", "-loop", "1", "-t", f"{total:.3f}", "-i", fmt]
            graph.append(f"[{idx}:v]fps={FPS},format=rgba,fade=t=in:st={t0:.3f}:d=0.35:alpha=1,"
                         f"fade=t=out:st={t1 - 0.3:.3f}:d=0.3:alpha=1[t{n}]")
            rise = f"18*max(0,1-(t-{t0:.3f})/0.5)"
            graph.append(f"[{vlast}][t{n}]overlay=0:'{rise}':enable='between(t,{t0:.3f},{t1:.3f})'[o{n}]")
            vlast = f"o{n}"

    graph.append(f"[{vlast}]format=yuv420p[vout]")
    path = os.path.join(OUT, f"reset_{version}.mp4")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(graph),
         "-map", "[vout]", "-map", f"[{alast}]", "-t", f"{total:.3f}",
         "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-profile:v", "high",
         "-pix_fmt", "yuv420p", "-r", str(FPS), "-c:a", "aac", "-b:a", "192k",
         "-movflags", "+faststart", path])
    timeline = [dict(section=sec, start=round(st, 2), **{k: s[k] for k in ("clip", "ss", "dur", "speed", "join", "what")})
                for (sec, i, s), st in zip(shots, starts)]
    with open(os.path.join(WORK, f"{version}_timeline.json"), "w") as f:
        json.dump(timeline, f, indent=1)
    print(f"{path}  {total:.2f}s")


def banked():
    os.makedirs(os.path.join(OUT, "banked_clips"), exist_ok=True)
    for name, s in BANKED.items():
        seg, _ = render_segment(s, f"banked_{name}", plain=True)
        dst = os.path.join(OUT, "banked_clips", f"{name}.mp4")
        run(["ffmpeg", "-v", "error", "-y", "-i", seg, "-c:v", "libx264", "-crf", "18",
             "-preset", "slow", "-c:a", "copy", "-movflags", "+faststart", dst])
        print(dst)


if __name__ == "__main__":
    os.makedirs(WORK, exist_ok=True)
    for v in sys.argv[1:] or ["main", "hook_B", "hook_C", "notext", "banked"]:
        banked() if v == "banked" else build(v)
