# Weekend Reset reel (@honestlyworthit.ugc)

Faceless UGC reel, 30–40 s, built with plain ffmpeg (not the Remotion pipeline).
Status: **waiting on footage.** Not in the repo or Google Drive as of 2026-10-19.

## Footage expected
- Dyson Big Ball: sofa, mattress, rugs, corners, bin emptying
- INVISEL: stove (spray + wipe), other surface wipes
- Coffee cup + hands while the Ecovacs Deebot cleans the floor behind
- Optional: `/music` (bed at ~25%), `/sfx` (whoosh for the slide transition only)

## Step 1: inspect, then STOP for approval
- ffprobe every clip: duration, resolution, fps, orientation, audio yes/no.
- Grab 1 frame/sec into `/frames` and look at them.
- For each clip report: what happens, the best 1–3 s moments (timestamps), shaky/blurry/duplicate bits,
  and **any frame where her face shows** (crop or cut it).
- Flag missing shots. Never assume a shot exists.
- Show the cut list (clip, in/out, on-screen text, **transition + zoom at each point**) and wait for her OK.

## Step 2: story (each product does one job, no overlap)
Deebot = floors · Dyson = sofa, mattress, rugs, corners · INVISEL = stove/surfaces

| Time | Shot | Text |
|---|---|---|
| 0–2 s | Coffee: cup + hands, robot behind | Saturday reset, but I'm not the one doing the floors |
| 2–4 s | Messiest "before" | The house after a full week |
| 4–12 s | Dyson sofa/rugs, fast passes, bin if available | Sofa + rugs: Dyson |
| 12–22 s | INVISEL stove: spray, wipe, clean-stripe reveal | Stove: INVISEL |
| 22–28 s | Back to coffee, robot passing | Floors: the robot's been at it this whole time |
| 28–34 s | Best "after" shots | Saturday 11am. Reset done. |

Adjust to what the footage actually supports.

## Step 3: specs
- 1080x1920, 30 fps, H.264 + AAC. Crop horizontals to fill the frame, action centred, no bars.
- Cuts every 1–2 s in action sections. Let the stove reveal and the Dyson bin breathe ~2 s.
- 1.5–2x speed on long passes if it still looks natural. Never speed up the payoff reveals.
- Text: bold sans, white with soft dark shadow, centred in the upper third. Keep clear of the bottom 20%
  and the right edge. Max 8 words per card, each up ≥1.5 s.
- Natural audio ~60%, music ~25% if `/music` exists, otherwise natural only (and tell her).
- No logos, no brand claims beyond what's on screen, no health/germ/safety claims.

## Step 3B: transitions & motion (subtle, native)
- **Hard cuts** inside action sections.
- **xfade=fade 0.3 s** only between sections: hook→before, Dyson→INVISEL, INVISEL→coffee, coffee→after.
- **One** slideleft/smoothleft 0.25 s: before → first Dyson pass. Whoosh at ~30% here only, if `/sfx` has one.
- **wiperight 0.4 s** before→after, only if there's a matching angle of the same spot.
- No dissolves over 0.4 s. No spins, glitches or flashes.
- Hook coffee: eased push-in 100→108%.
- Punch-in 100→115%, held ~1 s, then cut: INVISEL stripe reveal, Dyson bin dirt, robot passing behind the cup.
- Final after shot: eased pull-out 110→100%.
- Any static shot >2 s: 2–4% eased drift. Keep the subject centred and check nothing gets cropped.
- Text fades in/out over 0.2 s each and lands on the cut. No bounce or typewriter.

## Step 4: exports
1. `reset_main.mp4`
2. `reset_hook_B.mp4`: opens on the INVISEL stove reveal, "This is what Saturday morning looks like now"
3. `reset_hook_C.mp4`: opens on the messiest before shot, "Week's mess → 2 hours → done"
4. `reset_notext.mp4`: no text, **no transitions or zooms**
5. `/banked_clips`: each product's best 3–5 s, raw, **no transitions or zooms**

Hook variants B and C get the same transitions and motion as main.

QC every export with frame grabs: no face, text not cut off, nothing stretched, no black frames.
Then send her a short summary plus a reshoot list.
