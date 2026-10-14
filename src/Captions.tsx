import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Theme} from './brands';
import type {Word} from './types';

const MAX_WORDS_PER_PAGE = 3;
const MAX_CHARS_PER_PAGE = 18;

// Group words into short "pages" so each screen holds 1-3 words.
// A new page also starts after a sentence ends or a noticeable pause.
const paginate = (words: Word[]): Word[][] => {
  const pages: Word[][] = [];
  let current: Word[] = [];
  for (const w of words) {
    const prev = current[current.length - 1];
    const chars = current.reduce((n, x) => n + x.text.length + 1, 0) + w.text.length;
    const breakHere =
      current.length >= MAX_WORDS_PER_PAGE ||
      chars > MAX_CHARS_PER_PAGE ||
      (prev && /[.!?,]$/.test(prev.text)) ||
      (prev && w.start - prev.end > 0.35);
    if (current.length && breakHere) {
      pages.push(current);
      current = [];
    }
    current.push(w);
  }
  if (current.length) pages.push(current);
  return pages;
};

const clean = (t: string, upper: boolean) => {
  const x = t.replace(/^[\s"“”]+|[\s"“”,.]+$/g, '');
  return upper ? x.toUpperCase() : x;
};

export const Captions: React.FC<{words: Word[]; theme: Theme}> = ({words, theme}) => {
  const c = theme.captions;
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const pages = React.useMemo(() => paginate(words), [words]);

  const page = pages.find((p, i) => {
    const next = pages[i + 1];
    const pageEnd = next ? Math.min(next[0].start, p[p.length - 1].end + 0.6) : p[p.length - 1].end + 0.6;
    return t >= p[0].start && t < pageEnd;
  });
  if (!page) return null;

  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 520}}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: c.activePill ? '6px 10px' : '0 26px',
          maxWidth: 940,
          fontFamily: theme.fonts.caption,
          fontWeight: c.weight,
          fontSize: c.size,
          lineHeight: c.lineHeight ?? 1.1,
          textAlign: 'center',
        }}
      >
        {page.map((w, i) => {
          const spoken = t >= w.start;
          const active = spoken && (t < w.end || i === page.length - 1 || t < page[i + 1].start);
          const startFrame = Math.round(w.start * fps);
          const float = c.motion === 'float';
          const p = spring({
            frame: frame - startFrame,
            fps,
            config: float ? {damping: 200, stiffness: 80} : {damping: 12, stiffness: 220},
            durationInFrames: float ? 10 : 8,
          });
          const scale = !spoken || float ? 1 : interpolate(p, [0, 1], [0.7, 1]) * (active ? 1.06 : 1);
          const rise = spoken && float ? interpolate(p, [0, 1], [18, 0]) : 0;
          return (
            <span
              key={`${w.start}-${i}`}
              style={{
                opacity: spoken ? (float ? p : 1) : 0,
                transform: `translateY(${rise}px) scale(${scale})`,
                color: active ? c.activeColor : c.color,
                background: active && c.activePill ? c.activePill : 'transparent',
                borderRadius: 999,
                padding: c.activePill ? '0 22px 6px' : 0,
                WebkitTextStroke: c.stroke ? `${c.strokeWidth ?? 14}px ${active && c.activeStroke ? c.activeStroke : c.stroke}` : undefined,
                paintOrder: 'stroke fill',
                textShadow: active && c.activePill ? 'none' : c.shadow,
                boxShadow: active && c.activePill ? '0 6px 20px rgba(60,40,80,0.25)' : 'none',
                display: 'inline-block',
              }}
            >
              {clean(w.text, c.uppercase)}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
