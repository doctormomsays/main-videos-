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

## Step 1 inspection (2026-10-19)
Source: Drive folder `1e41IeNFPe1cWMu_sFkXfVseP_ZZngI6z` (link-shared; the Drive connector can't see it, so
download via `drive.usercontent.google.com/download?id=<id>&export=download&confirm=t`). 28 unique clips, all
portrait 1080x1920 30fps with audio (IMG_3603 is 720p). IMG_3441–3444 were uploaded 3x each (identical md5).
No /music, no /sfx.

- **Dyson (3441–3455): unboxing only.** Box shots, opening, unwrapping the canister (3452 @24–29 best reveal),
  parts laid out (3453), static setup (3455). No sofa/mattress/rug/corner/bin footage.
  Face: 3450 @54–55 (profile, cut). Legs/feet in 3450 @61–64.
- **INVISEL:** wide stove 3597, can on stove 3600/3601, foam spray 3602 @17–23, 3603 (720p, spray @4–12 then static dwell),
  3607 (7.6 min): glass-top wipe @20–80, grimy burner base @143–150, spray @151–154, wipe @160–170 & @240–260,
  clean base @265–300 (same angle as @150, so wiperight before/after works), clean reassembled burner @430–457.
  3609/3610 cooking on the stove, 3611 @0–3 dirty cloth. No face anywhere.
- **Coffee/Deebot (3678, 3.6 min):** locked wide shot, she sits on the window seat. **Face visible throughout**
  (profile; toward camera ~75–90, 107–119; walks to camera 209–213). Robot passes: small/far 25–52,
  foreground 173–178 (best), mid-floor 192–199, re-enters 214–216. Faceless fix: crop `574:1020:x:900`
  (feet + bench + floor), a 1.88x upscale; it looks fine. No cup+hands close-up exists.

## Final edit (2026-10-20)
Priya: use the **curtain** clips (IMG_3646–3650, same Drive folder, from the earlier Dyson curtain reel) for the
Dyson job, and her **side profile is fine** in the coffee/robot clip (3678), so it stays wide and uncropped.
Edit list + renderer: `scripts/weekend_reset.py` (all versions: `python3 scripts/weekend_reset.py`).
Clips are symlinked into `clips/honestlyworthit/weekend_reset/` (gitignored). Outputs: `out/weekend_reset/`.

hook 3678@172.5 push-in → fade → before 3597@25 (grimy burner) → slideleft → Dyson: 3646@59 curtain head,
3648@11.5/20.5/37.5 at 1.5x (back views) → fade → INVISEL: 3600@8.3 can, 3607@151.5 foam, 3602@17 foam,
3607@157 wipe 2x, 3607@146 → wiperight → 3607@272 (punch 115%), 3611@0 dirty cloth → fade → 3678@191.8 robot
pass (drift + punch 115%) → fade → 3607@440 clean burner (pull-out), 3650@70 Dyson parked.
Note: the before/after reveal shows the glass top cleaned (smears gone); rust marks on the burner base remain,
so no text claims those came off. Natural sound only (no music/sfx supplied), loudnorm -16 then ×0.6.

### Revision 1 (main only, 2026-10-20)
Priya's notes: better wipe after the foam; drop the stained-only clip after it; clean hob was shaky; last Dyson shot shaky.
- Wipe: 3607@243.8 and @249.8 (1.5x, cloth through the foam). Removed the 146→272 before/after wipe pair.
- Clean hob: 3607@445 (motion-measured steady stretch 444–456; @440 had camera shake), no zoom.
- End: 3649@3 Dyson resting on the floor under the curtains (locked shot), pull-out anchored to the bottom.
