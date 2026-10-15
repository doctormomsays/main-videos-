import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BRANDS} from './brands';
import './fonts';
import type {MontageProps, MontageText} from './types';

// Calm multi-clip b-roll reel: soft crossfades between pre-graded shots, small
// lowercase lines that fade in and out inside the 9:16 safe zone.
// Safe zone: clear of the top 250px and bottom 400px.
const TEXT_TOP = 1270;
const TEXT_FADE = 10;

const Line: React.FC<{t: MontageText; frames: number}> = ({t, frames}) => {
  const frame = useCurrentFrame();
  const theme = BRANDS.honestlyworthit;
  const c = theme.captions;
  const opacity = interpolate(frame, [0, TEXT_FADE, frames - TEXT_FADE, frames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rise = interpolate(frame, [0, TEXT_FADE * 2], [8, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{top: TEXT_TOP, height: 250, alignItems: 'center', padding: '0 110px'}}>
      <div
        style={{
          fontFamily: theme.fonts.caption,
          fontWeight: c.weight,
          fontSize: 54,
          lineHeight: 1.12,
          letterSpacing: '-0.04em',
          color: c.color,
          textShadow: `${c.shadow}, 0 0 28px rgba(0,0,0,0.35)`,
          textAlign: 'center',
          opacity,
          transform: `translateY(${rise}px)`,
        }}
      >
        {t.text}
      </div>
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
