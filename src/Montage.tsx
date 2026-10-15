import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BRANDS} from './brands';
import {DoodleLayer} from './Doodles';
import './fonts';
import type {MontageProps, MontageText} from './types';

// Calm multi-clip b-roll reel: soft crossfades between pre-graded shots, small
// lines that fade in and out inside the 9:16 safe zone (clear of the top 250px
// and bottom 400px), with optional doodles that fade with each line.
// Lines split on " / " and take the editorial markers, scaled down:
//   *serif*  butter-yellow italic serif   ~pink~  pink script, white glow
//   _script_ white script, pink glow      plain   small tight sans
const TEXT_TOP = 1220;
const TEXT_FADE = 10;

const LinePart: React.FC<{raw: string}> = ({raw}) => {
  const theme = BRANDS.honestlyworthit;
  const e = theme.editorial!;
  const c = theme.captions;
  const shadow = `${c.shadow}, 0 0 28px rgba(0,0,0,0.35)`;
  const m = raw.trim().match(/^([_*~])(.+)\1(.*)$/);
  const text = m ? (m[2] + m[3]).trim() : raw.trim();
  if (m?.[1] === '*') {
    return <div style={{fontFamily: e.fonts.serif, fontStyle: 'italic', fontSize: 84, lineHeight: 1, letterSpacing: -1.5, color: e.colors.big, textShadow: shadow}}>{text}</div>;
  }
  if (m?.[1] === '~') {
    return (
      <div style={{fontFamily: e.fonts.pinkScript, fontSize: 66, lineHeight: 1.3, color: e.colors.pink, WebkitTextStroke: `7px ${e.colors.outline}`, paintOrder: 'stroke fill', textShadow: `0 0 16px ${e.colors.outline}, 0 0 30px ${e.colors.pinkGlow}`}}>
        {text}
      </div>
    );
  }
  if (m?.[1] === '_') {
    return <div style={{fontFamily: e.fonts.script, fontSize: 92, lineHeight: 1.05, color: e.colors.script, textShadow: `0 0 14px ${e.colors.scriptGlow}, ${shadow}`}}>{text}</div>;
  }
  return <div style={{fontFamily: theme.fonts.caption, fontWeight: c.weight, fontSize: 54, lineHeight: 1.12, letterSpacing: '-0.04em', color: c.color, textShadow: shadow}}>{text}</div>;
};

const Line: React.FC<{t: MontageText; frames: number}> = ({t, frames}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, TEXT_FADE, frames - TEXT_FADE, frames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rise = interpolate(frame, [0, TEXT_FADE * 2], [8, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity}}>
      {t.doodles ? <DoodleLayer spots={t.doodles} /> : null}
      <AbsoluteFill style={{top: TEXT_TOP, height: 300, alignItems: 'center', padding: '0 100px', textAlign: 'center', transform: `translateY(${rise}px)`}}>
        {t.text.split(' / ').map((part, i) => (
          <LinePart key={i} raw={part} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Shot: React.FC<{src: string; frames: number; fadeIn: number; fadeOut: number}> = ({src, frames, fadeIn, fadeOut}) => {
  const frame = useCurrentFrame();
  const total = frames + fadeOut;
  const opacity = fadeIn ? interpolate(frame, [0, fadeIn], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  return (
    <AbsoluteFill style={{opacity}}>
      <OffthreadVideo
        src={staticFile(src)}
        volume={(f) =>
          Math.min(
            fadeIn ? interpolate(f, [0, fadeIn], [0, 1], {extrapolateRight: 'clamp'}) : 1,
            fadeOut ? interpolate(f, [total - fadeOut, total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1,
          )
        }
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
    </AbsoluteFill>
  );
};

export const Montage: React.FC<MontageProps> = ({shots, texts, fadeFrames, music, musicVolume}) => {
  const fps = 30;
  let at = 0;
  const placed = shots.map((s, i) => {
    const from = at;
    at += s.frames;
    return {...s, from, fadeIn: i ? fadeFrames : 0, fadeOut: i < shots.length - 1 ? fadeFrames : 0};
  });
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {placed.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.frames + s.fadeOut}>
          <Shot src={s.src} frames={s.frames} fadeIn={s.fadeIn} fadeOut={s.fadeOut} />
        </Sequence>
      ))}
      {music ? <Audio src={staticFile(music)} volume={musicVolume} /> : null}
      {texts.map((t, i) => {
        const from = Math.round(t.start * fps);
        const frames = Math.round(t.end * fps) - from;
        return (
          <Sequence key={`t${i}`} from={from} durationInFrames={frames}>
            <Line t={t} frames={frames} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
