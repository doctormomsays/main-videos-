import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BRANDS} from './brands';
import {DoodleLayer, type DoodleSpot} from './Doodles';
import './fonts';

// Reel cover still: a frame from the reel, softened and dimmed so a big flirty
// title in the top third pops. Lines split on " / ".
export type CoverProps = {bg: string; title: string; dim: number; doodles: DoodleSpot[]};

export const Cover: React.FC<CoverProps> = ({bg, title, dim, doodles}) => {
  const e = BRANDS.honestlyworthit.editorial!;
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <Img src={staticFile(bg)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.92) brightness(0.97)'}} />
      {/* Even veil over the whole frame, deeper behind the title. */}
      <AbsoluteFill style={{backgroundColor: `rgba(40,28,24,${dim})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(30,20,18,0.45) 0%, rgba(30,20,18,0.30) 30%, rgba(30,20,18,0) 48%)'}} />
      <DoodleLayer spots={doodles} />
      <AbsoluteFill style={{top: 300, height: 360, alignItems: 'center', justifyContent: 'center', padding: '0 70px', textAlign: 'center'}}>
        {title.split(' / ').map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: e.fonts.pinkScript,
              fontSize: 132,
              lineHeight: 1.12,
              color: '#FFFFFF',
              WebkitTextStroke: `12px ${e.colors.big}`,
              paintOrder: 'stroke fill',
              textShadow: '0 6px 18px rgba(0,0,0,0.45), 0 0 34px rgba(251,243,166,0.55)',
            }}
          >
            {line}
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
