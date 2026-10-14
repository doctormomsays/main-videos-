import React from 'react';
import {useCurrentFrame} from 'remotion';

// Hand-drawn style outline doodles (100x100 viewBox, stroke only).
const SHAPES: Record<string, React.ReactNode> = {
  heart: <path d="M50 84 C22 62 8 44 17 27 C26 11 45 14 50 31 C55 14 74 11 83 27 C92 44 78 62 50 84 Z" />,
  star: <path d="M50 9 L61 37 L91 39 L68 58 L76 89 L50 72 L24 89 L32 58 L9 39 L39 37 Z" />,
  sparkle: <path d="M50 6 C53 37 63 47 94 50 C63 53 53 63 50 94 C47 63 37 53 6 50 C37 47 47 37 50 6 Z" />,
  squiggle: <path d="M6 55 C16 33 26 77 36 55 C46 33 56 77 66 55 C76 33 86 77 94 52" />,
  swirl: <path d="M14 82 C26 34 82 18 74 50 C67 74 34 58 54 36 L86 20 M86 20 L72 17 M86 20 L83 34" />,
  flower: (
    <g>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx={50} cy={27} rx={11} ry={18} transform={`rotate(${r} 50 50)`} />
      ))}
      <circle cx={50} cy={50} r={8} />
    </g>
  ),
  loop: <path d="M18 52 C16 22 84 18 85 47 C86 78 22 82 18 54 C16 38 42 26 62 28" />,
  bow: <path d="M50 50 C35 30 12 32 14 48 C16 64 38 62 50 50 C62 62 84 64 86 48 C88 32 65 30 50 50 Z M50 50 L40 82 M50 50 L60 82" />,
  dots: (
    <g>
      <circle cx={22} cy={30} r={5} />
      <circle cx={52} cy={58} r={4} />
      <circle cx={80} cy={34} r={6} />
    </g>
  ),
};

export type DoodleName = keyof typeof SHAPES;

export const Doodle: React.FC<{
  name: DoodleName;
  size: number;
  color?: string;
  stroke?: number;
  rotate?: number;
  style?: React.CSSProperties;
  seed?: number;
}> = ({name, size, color = '#FFFFFF', stroke = 6, rotate = 0, style, seed = 0}) => {
  const frame = useCurrentFrame();
  // "Boil": a tiny wobble every 5 frames, like a hand-drawn animation.
  const step = Math.floor((frame + seed * 3) / 5) % 3;
  const wobble = [-3, 1, 3][step];
  const scale = [1, 1.03, 0.98][step];
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{
        position: 'absolute',
        overflow: 'visible',
        transform: `rotate(${rotate + wobble}deg) scale(${scale})`,
        filter: 'drop-shadow(0 3px 6px rgba(214,51,108,0.35))',
        ...style,
      }}
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {SHAPES[name]}
    </svg>
  );
};

export type DoodleSpot = {name: DoodleName; top: number; left: number; size: number; rotate?: number; color?: string};

export const DoodleLayer: React.FC<{spots: DoodleSpot[]; delayStep?: number}> = ({spots}) => (
  <>
    {spots.map((d, i) => (
      <Doodle key={i} seed={i} name={d.name} size={d.size} rotate={d.rotate} color={d.color} style={{top: d.top, left: d.left}} />
    ))}
  </>
);
