import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Theme} from './brands';
import {Doodle} from './Doodles';

export const EndCard: React.FC<{cta: string; theme: Theme}> = ({cta, theme}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {colors, fonts} = theme;
  const s = (delay: number) => spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 160}});
  const rise = (delay: number) => ({
    opacity: s(delay),
    transform: `translateY(${interpolate(s(delay), [0, 1], [40, 0])}px)`,
  });

  return (
    <AbsoluteFill
      style={{
        background: colors.endBg,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.body,
        color: colors.ink,
        opacity: interpolate(frame, [0, 6], [0, 1], {extrapolateRight: 'clamp'}),
      }}
    >
      <div style={{position: 'absolute', top: -220, right: -200, width: 640, height: 640, borderRadius: '50%', background: colors.blobA}} />
      <div style={{position: 'absolute', bottom: -260, left: -220, width: 700, height: 700, borderRadius: '50%', background: colors.blobB}} />
      <div style={{position: 'absolute', top: 300, left: 90, width: 36, height: 36, borderRadius: '50%', background: colors.dot}} />
      {theme.endDoodles?.map((d, i) => (
        <div key={i} style={{position: 'absolute', top: d.top + Math.sin((frame + i * 20) / 14) * 10, left: d.left, opacity: s(6 + i * 2)}}>
          <Doodle seed={i} name={d.name} size={d.size} rotate={d.rotate} color={d.color} style={{top: 0, left: 0}} />
        </div>
      ))}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, padding: '0 80px', textAlign: 'center'}}>
        <div style={{...rise(0), width: 210, height: 210, borderRadius: '50%', background: colors.badge, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 40px rgba(0,0,0,0.18)'}}>
          <span style={{fontFamily: fonts.title, fontWeight: 700, fontSize: 92, color: colors.badgeText}}>{theme.monogram}</span>
        </div>
        <div style={{...rise(4), fontFamily: fonts.title, fontWeight: 700, fontSize: 92, color: colors.title, lineHeight: 1.3, textShadow: theme.titleShadow}}>{theme.displayName}</div>
        <div style={{...rise(8), fontWeight: 700, fontSize: 40, letterSpacing: 1, textShadow: theme.titleShadow ? '0 2px 8px rgba(232,68,122,0.5)' : undefined}}>{theme.tagline}</div>
        <div style={{...rise(12), marginTop: 20, background: colors.handleBg, color: colors.handleText, fontWeight: 800, fontSize: 64, padding: '22px 54px', borderRadius: 999, border: theme.handleBorder ? `6px solid ${theme.handleBorder}` : undefined, boxShadow: '0 14px 36px rgba(0,0,0,0.18)'}}>
          {theme.handle}
        </div>
        <div style={{...rise(18), marginTop: 10, fontWeight: 700, fontSize: 50, lineHeight: 1.2, maxWidth: 880, textShadow: theme.titleShadow ? '0 2px 8px rgba(232,68,122,0.5)' : undefined}}>{cta || theme.defaultCta}</div>
      </div>
    </AbsoluteFill>
  );
};
