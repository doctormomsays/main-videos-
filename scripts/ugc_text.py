"""@honestlyworthit text cards for ffmpeg edits: styled lines + white outline doodles as PNGs.

Same look as the Remotion preset (src/brands.ts, src/Doodles.tsx), drawn with Pillow so plain
ffmpeg edits can use it. Line markup (lines split by " / "):
  ^kicker      small spaced sans
  _script_     white Great Vibes script
  ~pink~       dusty-rose Pacifico script
  *serif*      butter-yellow Instrument Serif italic
  plain        tight bold lowercase sans
"""
import math, os, re
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(HERE, "assets/fonts")
INTER_BOLD = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
INTER_SEMI = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
# PINK is a dusty rose (Priya picked it over the bright #FF9EC8 for this reel style)
PINK, BUTTER, WHITE = (236, 170, 188), (251, 243, 166), (255, 255, 255)
W, H = 1080, 1920

STYLES = {
    "kicker": dict(font=INTER_SEMI, size=40, fill=WHITE, track=6),
    "script": dict(font=os.path.join(FONTS, "GreatVibes-Regular.ttf"), size=124, fill=WHITE),
    "pink": dict(font=os.path.join(FONTS, "Pacifico-Regular.ttf"), size=92, fill=PINK),
    "serif": dict(font=os.path.join(FONTS, "InstrumentSerif-Italic.ttf"), size=96, fill=BUTTER),
    "sans": dict(font=INTER_BOLD, size=70, fill=WHITE, track=-1),
}
EMOJI_FONT = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"

# 100x100 outline doodles, same paths as src/Doodles.tsx
PATHS = {
    "heart": "M50 84 C22 62 8 44 17 27 C26 11 45 14 50 31 C55 14 74 11 83 27 C92 44 78 62 50 84 Z",
    "star": "M50 9 L61 37 L91 39 L68 58 L76 89 L50 72 L24 89 L32 58 L9 39 L39 37 Z",
    "sparkle": "M50 6 C53 37 63 47 94 50 C63 53 53 63 50 94 C47 63 37 53 6 50 C37 47 47 37 50 6 Z",
    "squiggle": "M6 55 C16 33 26 77 36 55 C46 33 56 77 66 55 C76 33 86 77 94 52",
    "loop": "M18 52 C16 22 84 18 85 47 C86 78 22 82 18 54 C16 38 42 26 62 28",
    "bow": "M50 50 C35 30 12 32 14 48 C16 64 38 62 50 50 C62 62 84 64 86 48 C88 32 65 30 50 50 Z M50 50 L40 82 M50 50 L60 82",
    "swirl": "M14 82 C26 34 82 18 74 50 C67 74 34 58 54 36 L86 20 M86 20 L72 17 M86 20 L83 34",
}


def parse(line):
    words = line.split()
    emoji = words.pop() if words and not words[-1].isascii() else ""
    body = " ".join(words)
    kind = {"^": "kicker", "_": "script", "~": "pink", "*": "serif"}.get(body[:1], "sans")
    if kind != "sans":
        body = body[1:].rstrip(body[0])
    body = body.lower() if kind == "sans" else body.upper() if kind == "kicker" else body
    return kind, body.strip(), emoji


def _polylines(d, size, rot, ox, oy):
    toks = re.findall(r"[MLCZ]|-?\d+\.?\d*", d)
    out, cur, start, i = [], None, None, 0
    s, c, sn = size / 100, math.cos(math.radians(rot)), math.sin(math.radians(rot))
    tf = lambda x, y: (ox + ((x - 50) * c - (y - 50) * sn) * s, oy + ((x - 50) * sn + (y - 50) * c) * s)
    while i < len(toks):
        t = toks[i]; i += 1
        if t == "M":
            cur = start = (float(toks[i]), float(toks[i + 1])); i += 2
            out.append([tf(*cur)])
        elif t == "L":
            cur = (float(toks[i]), float(toks[i + 1])); i += 2
            out[-1].append(tf(*cur))
        elif t == "C":
            p = [cur] + [(float(toks[i + k]), float(toks[i + k + 1])) for k in (0, 2, 4)]; i += 6
            for n in range(1, 21):
                u = n / 20
                x = sum(b * q[0] for b, q in zip([(1-u)**3, 3*u*(1-u)**2, 3*u*u*(1-u), u**3], p))
                y = sum(b * q[1] for b, q in zip([(1-u)**3, 3*u*(1-u)**2, 3*u*u*(1-u), u**3], p))
                out[-1].append(tf(x, y))
            cur = p[-1]
        elif t == "Z":
            out[-1].append(tf(*start)); cur = start
    return out


def draw_doodle(img, name, cx, cy, size, rot=0, color=WHITE, width=6):
    d = ImageDraw.Draw(img)
    if name == "dots":
        for x, y, r in ((22, 30, 5), (52, 58, 4), (80, 34, 6)):
            px, py = cx + (x - 50) * size / 100, cy + (y - 50) * size / 100
            rr = r * size / 100 + width / 2
            d.ellipse((px - rr, py - rr, px + rr, py + rr), fill=color + (255,))
        return
    for line in _polylines(PATHS[name], size, rot, cx, cy):
        d.line(line, fill=color + (255,), width=width, joint="curve")
        for p in (line[0], line[-1]):
            d.ellipse((p[0] - width / 2, p[1] - width / 2, p[0] + width / 2, p[1] + width / 2), fill=color + (255,))


def _line_img(kind, text, emoji):
    st = STYLES[kind]
    font = ImageFont.truetype(st["font"], st["size"])
    track = st.get("track", 0)
    probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    widths = [probe.textlength(ch, font=font) + track for ch in text]
    tw = int(sum(widths)) + 40
    asc, desc = font.getmetrics()
    em = None
    if emoji:
        ef = ImageFont.truetype(EMOJI_FONT, 109)
        em = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
        ImageDraw.Draw(em).text((0, 0), emoji, font=ef, embedded_color=True)
        em = em.crop(em.getbbox())
        em = em.resize((int(em.width * st["size"] * 0.75 / em.height), int(st["size"] * 0.75)))
    lw = tw + (em.width + 16 if em else 0)
    img = Image.new("RGBA", (lw + 40, asc + desc + 60), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x = 40
    for ch, cw in zip(text, widths):
        kw = dict(font=font, fill=st["fill"] + (255,))
        if st.get("outline"):
            kw.update(stroke_width=5, stroke_fill=st["outline"] + (255,))
        d.text((x, 30), ch, **kw)
        x += cw
    if em:
        img.alpha_composite(em, (int(x) + 16, 30 + int(asc * 0.3)))
    return img.crop(img.getbbox())


def card(text, path_fmt, doodles=(), top=300, frames=3):
    """Render `frames` PNGs (path_fmt % i) of the card; doodles wobble between frames ("boil")."""
    lines = [_line_img(*parse(ln)) for ln in text.split(" / ")]
    gap = 18
    block_h = sum(l.height for l in lines) + gap * (len(lines) - 1)
    block_w = max(l.width for l in lines)
    text_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    y = top
    for l in lines:
        text_layer.alpha_composite(l, ((W - l.width) // 2, y))
        y += l.height + gap
    box = ((W - block_w) // 2, top, (W + block_w) // 2, top + block_h)
    # soft dark halo so white and pastel text reads on bright windows
    alpha = text_layer.getchannel("A")
    wide = Image.new("RGBA", (W, H), (40, 20, 30, 0))
    wide.putalpha(alpha.point(lambda a: int(a * 0.8)))
    wide = wide.filter(ImageFilter.GaussianBlur(24))
    tight = Image.new("RGBA", (W, H), (40, 20, 30, 0))
    tight.putalpha(alpha.point(lambda a: int(a * 0.55)))
    halo = Image.alpha_composite(wide, tight.filter(ImageFilter.GaussianBlur(5)))
    pink_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pink_glow.putalpha(text_layer.getchannel("A").point(lambda a: int(a * 0.35)))
    pink_glow = pink_glow.filter(ImageFilter.GaussianBlur(22))
    # a big, very soft shade behind the whole block: invisible on dark shots, rescues bright windows
    shade = Image.new("RGBA", (W, H), (30, 15, 25, 0))
    ImageDraw.Draw(shade).ellipse((box[0] - 90, box[1] - 70, box[2] + 90, box[3] + 70), fill=(30, 15, 25, 105))
    shade = shade.filter(ImageFilter.GaussianBlur(60))
    base = Image.alpha_composite(shade, halo)
    base.alpha_composite(pink_glow)
    base.alpha_composite(text_layer)
    out = []
    for f in range(frames):
        img = base.copy()
        dl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        wob, sc = [-3, 1, 3][f % 3], [1, 1.03, 0.98][f % 3]
        for name, anchor, size, rot, color in doodles:
            # anchor is relative to the text block: (0,0) top-left corner, (1,1) bottom-right
            cx = box[0] + anchor[0] * (box[2] - box[0])
            cy = box[1] + anchor[1] * (box[3] - box[1])
            draw_doodle(dl, name, cx, cy, size * sc, rot + wob, color)
        shadow = Image.new("RGBA", (W, H), (214, 51, 108, 0))
        shadow.putalpha(dl.getchannel("A").point(lambda a: int(a * 0.35)))
        shadow = shadow.filter(ImageFilter.GaussianBlur(6))
        img.alpha_composite(shadow, (0, 3))
        img.alpha_composite(dl)
        p = path_fmt % f
        img.save(p)
        out.append(p)
    return out, box
