# Reels editor: handoff notes

Owner: Dr. Priyatharini (Priya), pediatrician + mom, works from an **iPad**. All
editing happens here in the cloud. She wants a human, warm tone, short replies, and
the finished MP4 sent back in chat (SendUserFile) so she can save it to Photos.

## Two Instagram pages, two presets (`src/brands.ts`)

| Page | Folder | Look |
|---|---|---|
| @doctormomsays | `clips/doctormomsays/` | Brand palette (eucalyptus green #6FA088, terracotta #C9785B, honey #E0A93C, cream #F7EFE6). Bold uppercase Montserrat captions with honey active word, green hook card, tight punchy cuts. Hook shows for 2 s. |
| @honestlyworthit (UGC) | `clips/honestlyworthit/` | Girly, flirty, aesthetic, soothing. Built from her two reference reels: text straight on the video (no boxes), tight Inter sans + Instrument Serif italic + Great Vibes script + Pacifico pink script with white outline glow, butter yellow #FBF3A6 + pink #FF9EC8 + white, small lowercase captions (active word soft pink), a few white outline doodles, pink to yellow end card. Calmer pacing. Hook shows for **3 s**. |

Still to confirm with her: that **@honestlyworthit** is the exact handle, and the
placeholder end-card lines ("pretty finds · honest reviews", "follow for more
pretty little finds 🎀").

## Setup in a fresh container

```bash
npm install
pip install --break-system-packages faster-whisper
```
Whisper's `small` model downloads from huggingface.co on first use (reachable).

## Making a reel

```bash
scripts/make_reel.sh clips/<brand>/<clip>.mp4 "Hook" ["End-card line"]
# -> out/<brand>-<clip>-reel.mp4, then SendUserFile it to her
```
1. `scripts/edit_clip.py`: Whisper word timestamps, then cuts fillers + dead air (ffmpeg),
   crops to 1080x1920 30fps, loudness-normalises, writes `public/work/<brand>-<clip>/props.json`.
2. Remotion renders captions + hook + end card. ~1.5 min per 20 s of video.

Per-video tweaks (she expects to ask for these): edit that clip's `props.json`
(fix misheard words, hook, cta, `notes`) and re-run only the `npx remotion render ...`
line from `make_reel.sh`. Re-run `edit_clip.py` only if the cuts need to change
(pacing lives in `BRANDS` in `scripts/edit_clip.py`). One-off changes stay in the
props file. Change `src/brands.ts` only when she says "make this the default".

### honestlyworthit hook syntax (lines split by ` / `)
`^kicker` curved small line · `_script_` types itself out · `~pink~` pink script with white glow ·
`*serif*` butter-yellow italic serif · plain = huge tight sans. Emoji may follow a marker.
Example: `^3 signs to look for / _is your baby_ / ~ready~ / *for solids?* 🎀`.
She gives the idea in plain words; you write the styled hook. Keep it short enough to read in 3 s.

`notes` (optional, in props.json): `[{start, end, title, sub}]` in edited-timeline
seconds for mid-video section titles like "step one". Get the times from `words`.

## Multi-clip montages (no talking, e.g. UGC product b-roll)

```bash
scripts/make_montage.sh edits/<name>.json [v1 v1_notext v2 ...]
# -> out/<name>/<name>_<version>.mp4 + out/<name>/sections/*.mp4 (clean, from v1_notext)
```
- The edit list (`edits/*.json`) holds the shots (clip, in-point, duration, section), the
  text lines with times, hook `variants` (first shot + first line swapped), and an
  optional `alt` per shot (renders as `v1_profile`). It's committed; the clips aren't.
- `scripts/prep_montage.py` cuts and grades each shot (warm soft daylight, lifted
  shadows), lifts natural sound by `gainDb`, and adds `fadeFrames` of tail for the
  crossfade. `src/Montage.tsx` lays out shots + small lowercase lines in the safe zone
  (clear of top 250px / bottom 400px). Loudness: two-pass linear loudnorm to -16 LUFS.
- `music`: no licensed track yet. Put one in `public/work/<name>/` and set it in the edit list.
- First example: `edits/dyson_curtain.json` (@honestlyworthit Dyson Big Ball, 42 s).
  Raw clips were in Drive folder "claude edit clips"; the connector couldn't see it, so they
  were pulled over drive.usercontent.google.com after she shared the folder by link and
  allowed that domain in the environment's network settings.
- Faceless brief: check head crops of every body shot; she shows her profile in IMG_3649.

## Getting her clips

- **Google Drive (preferred, any length):** she uploads via the Drive app and tells
  you the file name. Find and download it with the Google Drive connector, into its
  own new folder, then copy it to `clips/<brand>/`.
- Attached in chat, or GitHub web upload (25 MB limit, so only very short clips).
- Suggest recording at 1080p 30fps (not 4K).

## Gotchas already solved (don't undo)

- Audio goes to Whisper via ffmpeg -> numpy (avoids PyAV version clashes, handles .MOV/HEVC).
- Whisper tends to drop "um"; an `initial_prompt` with fillers makes it transcribe them,
  and silencedetect trims loose word edges.
- Chromium can't load Google Fonts through the proxy, so fonts are bundled via
  @fontsource and `src/fonts.ts` holds rendering until they load.
- Render with `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.
- `out/` and `public/work/` are gitignored. Don't commit her raw clips or test clips
  unless she asks. Commit code/preset changes and push to `main`.
- Check renders by grabbing frames (`ffmpeg ... select=eq(n\,N),tile`) and viewing them before sending.
