# Reels editor — @doctormomsays & @honestlyworthit

Raw 15–20 sec UGC clip in, finished 9:16 Instagram reel out:
umms and dead air cut, bold word-by-word captions (Whisper), a hook title for the
first 2 seconds, and a branded end card.

## Uploading from iPad (Safari → GitHub)

Put the clip in the folder for the page it's for. The folder picks the style:

| Folder | Look |
|---|---|
| `clips/doctormomsays/` | Eucalyptus green / terracotta / honey, bold uppercase captions, punchy cuts |
| `clips/honestlyworthit/` | Girly, flirty, aesthetic (from reference reels): text straight on the video, tight sans + italic serif + handwritten script, butter yellow + pink with white outline glow, tiny lowercase captions, a few white doodles |

On github.com, open the folder → **Add file → Upload files** → pick from Photos → **Commit changes**.
Then tell Claude the file name and your hook (or ask Claude to write one).

## Making a reel

```bash
scripts/make_reel.sh clips/doctormomsays/my-clip.mp4 "Hook title" ["End-card line"]
```

Output: `out/<brand>-<clip>-reel.mp4`. The end-card line defaults per brand.
For hard-to-catch accents use a bigger model: `WHISPER_MODEL=medium scripts/make_reel.sh ...`

## honestlyworthit hook styling

Write the hook as lines separated by ` / `. A marker on each line picks its look:

| Write | Looks like |
|---|---|
| `^3 signs to look for` | small white kicker, curved in an arc |
| `_is your baby_` | thin handwritten script that types itself out |
| `~ready~` | bold pink script with a white outline glow |
| `*for solids?*` | big butter-yellow italic serif |
| `how to` | huge tight butter-yellow sans |

Emoji can follow any line: `*for solids?* 🎀`.
Optional section titles mid-video ("step one" + a subline) go in `notes` in the clip's `props.json`.

## Where to change things

- Colours, fonts, caption style, end-card text: `src/brands.ts` (one block per page)
- Cut pacing and loudness per page: `BRANDS` in `scripts/edit_clip.py`
- Preview in the browser: `npm run studio`

Setup on a fresh machine: `npm install` and `pip install faster-whisper`.
