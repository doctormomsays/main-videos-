import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {HOOK_SECONDS, type Theme} from './brands';

export const HookTitle: React.FC<{text: string; theme: Theme}> = ({text, theme}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const total = HOOK_SECONDS * fps;
  if (!text || frame >= total) return null;

  const {colors, hook} = theme;
  const float = hook.motion === 'float';
  const enter = spring({
    frame,
    fps,
    config: float ? {damping: 200, stiffness: 70} : {damping: 14, stiffness: 180},
    durationInFrames: float ? 16 : 12,
  });
  const exit = interpolate(frame, [total - (float ? 12 : 8), total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = interpolate(enter, [0, 1], [float ? 30 : -60, 0]);
  const scale = float ? 1 : interpolate(enter, [0, 1], [0.9, 1]);

  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 230}}>
      <div
        style={{
          transform: `translateY(${y}px) scale(${scale}) rotate(${hook.tilt}deg)`,
          opacity: Math.min(enter, exit),
          maxWidth: 940,
          padding: '30px 50px 34px',
          background: colors.hookBg,
          borderRadius: hook.radius,
          border: `6px solid ${colors.hookBorder}`,
          boxShadow: '0 18px 50px rgba(0,0,0,0.3)',
          color: colors.hookText,
          fontFamily: theme.fonts.hook,
          fontWeight: hook.weight,
          fontSize: text.length > 40 ? 64 : 78,
          lineHeight: 1.12,
          textAlign: 'center',
          letterSpacing: -0.5,
        }}
      >
        {text}
        <div style={{height: 10, width: 140, background: colors.hookAccent, borderRadius: 6, margin: '18px auto 0'}} />
      </div>
    </AbsoluteFill>
  );
};
