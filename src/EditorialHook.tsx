import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Theme} from './brands';
import {DoodleLayer} from './Doodles';

/*
 * Magazine-style hook written as lines separated by " / ". A marker on each line
 * picks its look:
 *   ^text    small kicker, curved in an arc (tight sans)
 *   _text_   thin handwritten script that types itself out with a cursor
 *   *text*   elegant italic serif
 *   ~text~   bold pink script with a white outline glow
 *   text     huge tight sans
 * e.g. "^5 steps to your first paid deal / how to / *start ugc*"
 */
type Kind = 'kicker' | 'type' | 'serif' | 'pink' | 'big';

const parse = (line: string): {kind: Kind; text: string} => {
  const t = line.trim();
  if (t.startsWith('^')) return {kind: 'kicker', text: t.slice(1).trim()};
  // Anything after the closing marker (usually an emoji) is kept on the same line.
  const m = t.match(/^([_*~])(.+)\1(.*)$/);
  if (m) {
    const kind: Kind = m[1] === '_' ? 'type' : m[1] === '*' ? 'serif' : 'pink';
    return {kind, text: (m[2] + m[3]).trim()};
  }
  return {kind: 'big', text: t};
};

const fit = (text: string, base: number, perChar: number) => Math.min(base, perChar / Math.max(text.length, 1));

const ArcText: React.FC<{text: string; e: Theme['editorial']}> = ({text, e}) => {
  const size = fit(text, 50, 1500);
  return (
    <svg width={960} height={170} viewBox="0 0 960 170" style={{overflow: 'visible', marginBottom: -48}}>
      <defs>
        <path id="kickerArc" d="M 60 165 Q 480 10 900 165" />
      </defs>
      <text
        fontFamily={e!.fonts.sans}
        fontWeight={600}
        fontSize={size}
        letterSpacing={-1.5}
        fill={e!.colors.kicker}
        style={{filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.35))'}}
      >
        <textPath href="#kickerArc" startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
    </svg>
  );
};

export const EditorialLines: React.FC<{text: string; theme: Theme; total: number; typewriter?: boolean}> = ({text, theme, total, typewriter = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = theme.editorial!;
  const lines = text.split(' / ').map(parse);
  const exit = interpolate(frame, [total - 10, total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shadow = '0 4px 18px rgba(0,0,0,0.35)';

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', opacity: exit, position: 'relative'}}>
      {lines.map((l, i) => {
        const delay = i * 4;
        const p = spring({frame: frame - delay, fps, config: {damping: 200, stiffness: 90}, durationInFrames: 14});
        const style: React.CSSProperties = {opacity: p, transform: `translateY(${interpolate(p, [0, 1], [24, 0])}px)`};

        if (l.kind === 'kicker') return <div key={i} style={style}><ArcText text={l.text} e={e} /></div>;

        if (l.kind === 'type') {
          const chars = typewriter ? Math.floor(interpolate(frame, [0, Math.min(total * 0.5, l.text.length * 1.4)], [0, l.text.length], {extrapolateRight: 'clamp'})) : l.text.length;
          const cursorOn = Math.floor(frame / 8) % 2 === 0;
          return (
            <div key={i} style={{fontFamily: e.fonts.script, fontSize: fit(l.text, 135, 2200), color: e.colors.script, lineHeight: 1.15, textShadow: `0 0 18px ${e.colors.scriptGlow}, ${shadow}`}}>
              {l.text.slice(0, chars)}
              <span style={{fontFamily: e.fonts.sans, fontWeight: 300, opacity: cursorOn ? 0.9 : 0, color: e.colors.script, marginLeft: 6}}>|</span>
            </div>
          );
        }

        if (l.kind === 'serif') {
          return (
            <div key={i} style={{...style, fontFamily: e.fonts.serif, fontStyle: 'italic', fontSize: fit(l.text, 210, 2100), color: e.colors.big, lineHeight: 0.92, letterSpacing: -3, textShadow: shadow}}>
              {l.text}
            </div>
          );
        }

        if (l.kind === 'pink') {
          return (
            <div
              key={i}
              style={{
                ...style,
                fontFamily: e.fonts.pinkScript,
                fontSize: fit(l.text, 150, 1700),
                color: e.colors.pink,
                lineHeight: 1.25,
                WebkitTextStroke: `10px ${e.colors.outline}`,
                paintOrder: 'stroke fill',
                textShadow: `0 0 22px ${e.colors.outline}, 0 0 40px ${e.colors.pinkGlow}`,
              }}
            >
              {l.text}
            </div>
          );
        }

        return (
          <div key={i} style={{...style, fontFamily: e.fonts.sans, fontWeight: 600, fontSize: fit(l.text, 200, 1500), color: e.colors.big, lineHeight: 0.9, letterSpacing: '-0.06em', textShadow: shadow}}>
            {l.text}
          </div>
        );
      })}
    </div>
  );
};

export const EditorialHook: React.FC<{text: string; theme: Theme; seconds: number}> = ({text, theme, seconds}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const total = Math.round(seconds * fps);
  if (!text || frame >= total) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 210, paddingLeft: 60, paddingRight: 60}}>
      <div style={{position: 'relative'}}>
        <EditorialLines text={text} theme={theme} total={total} />
        {theme.hook.doodles ? <DoodleLayer spots={theme.hook.doodles} /> : null}
      </div>
    </AbsoluteFill>
  );
};

// Mid-video section titles ("step one" + subline), same typography.
export type Note = {start: number; end: number; title: string; sub?: string};

export const Notes: React.FC<{notes: Note[]; theme: Theme}> = ({notes, theme}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const e = theme.editorial;
  const n = notes.find((x) => t >= x.start && t < x.end);
  if (!n || !e) return null;
  const local = frame - Math.round(n.start * fps);
  const total = Math.round((n.end - n.start) * fps);
  const p = spring({frame: local, fps, config: {damping: 200, stiffness: 90}, durationInFrames: 14});
  const exit = interpolate(local, [total - 8, total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 250, opacity: Math.min(p, exit)}}>
      <div style={{fontFamily: e.fonts.serif, fontStyle: 'italic', fontSize: 150, color: e.colors.big, lineHeight: 1, letterSpacing: -2, textShadow: '0 4px 18px rgba(0,0,0,0.35)', transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`}}>
        {n.title}
      </div>
      {n.sub ? (
        <div style={{fontFamily: e.fonts.sans, fontWeight: 600, fontSize: 50, color: '#FFFFFF', letterSpacing: '-0.05em', marginTop: 8, textShadow: '0 3px 12px rgba(0,0,0,0.4)'}}>
          {n.sub}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
