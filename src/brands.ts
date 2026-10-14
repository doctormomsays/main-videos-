// One block per Instagram page. The upload folder (clips/<brand>/) picks the preset.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const HOOK_SECONDS = 2;
export const END_CARD_SECONDS = 3;

import type {DoodleSpot} from './Doodles';

export type BrandId = 'doctormomsays' | 'honestlyworthit';

export type Theme = {
  handle: string;
  displayName: string; // big name on the end card
  tagline: string;
  monogram: string;
  defaultCta: string;
  fonts: {caption: string; hook: string; title: string; body: string};
  colors: {
    endBg: string;
    blobA: string;
    blobB: string;
    dot: string;
    badge: string;
    badgeText: string;
    title: string;
    ink: string;
    handleBg: string;
    handleText: string;
    hookBg: string;
    hookText: string;
    hookBorder: string;
    hookAccent: string;
  };
  captions: {
    uppercase: boolean;
    weight: number;
    size: number;
    color: string;
    activeColor: string;
    stroke: string | null; // thick outline (punchy) or null (soft shadow)
    strokeWidth?: number;
    activeStroke?: string;
    lineHeight?: number;
    activePill: string | null; // soft highlight behind the active word
    shadow: string;
    // 'pop' = snappy scale-in, 'float' = slow fade + gentle rise
    motion: 'pop' | 'float';
  };
  hook: {
    weight: number;
    tilt: number;
    radius: number;
    motion: 'pop' | 'float';
    size?: number;
    ornament?: string;
    dashedInner?: string; // white dashed "sticker" outline inside the card
    textShadow?: string;
    doodles?: DoodleSpot[]; // positioned relative to the card
  };
  titleShadow?: string;
  handleBorder?: string;
  // White outline frame around the footage + doodles in the corners.
  videoFrame?: {color: string; inset: number; width: number; radius: number};
  videoDoodles?: DoodleSpot[];
  endDoodles?: DoodleSpot[];
};

const montserrat = "'Montserrat', sans-serif";
const playfair = "'Playfair Display', serif";
const pacifico = "'Pacifico', cursive";
const quicksand = "'Quicksand', sans-serif";

export const BRANDS: Record<BrandId, Theme> = {
  doctormomsays: {
    handle: '@doctormomsays',
    displayName: 'Dr. Priyatharini',
    tagline: 'Pediatrician · Mom · Child Nutrition',
    monogram: 'DP',
    defaultCta: 'Follow for more evidence-based parenting tips',
    fonts: {caption: montserrat, hook: montserrat, title: playfair, body: montserrat},
    colors: {
      endBg: '#F7EFE6',
      blobA: '#DCEBDD',
      blobB: '#F0CDB6',
      dot: '#E0A93C',
      badge: '#6FA088',
      badgeText: '#F8F1E8',
      title: '#3C5C4C',
      ink: '#3A332D',
      handleBg: '#C9785B',
      handleText: '#F8F1E8',
      hookBg: '#6FA088',
      hookText: '#F8F1E8',
      hookBorder: '#F8F1E8',
      hookAccent: '#E0A93C',
    },
    captions: {
      uppercase: true,
      weight: 900,
      size: 96,
      color: '#FFFFFF',
      activeColor: '#E0A93C',
      stroke: '#1E1A17',
      activePill: null,
      shadow: '0 8px 24px rgba(0,0,0,0.45)',
      motion: 'pop',
    },
    hook: {weight: 900, tilt: -1.5, radius: 28, motion: 'pop'},
  },

  // Girly, flirty, aesthetic: bubblegum pink + butter yellow + lots of white,
  // flirty script type, white outline doodles. Motion stays slow and soothing.
  honestlyworthit: {
    handle: '@honestlyworthit',
    displayName: 'honestly worth it',
    tagline: 'pretty finds · honest reviews',
    monogram: '♡',
    defaultCta: 'follow for more pretty little finds ♡',
    fonts: {caption: pacifico, hook: pacifico, title: pacifico, body: quicksand},
    colors: {
      endBg: 'linear-gradient(165deg, #FF9EC4 0%, #FFB6D0 50%, #FFE38A 100%)',
      blobA: 'rgba(255,255,255,0.35)',
      blobB: 'rgba(255,227,138,0.85)',
      dot: 'transparent',
      badge: '#FFFFFF',
      badgeText: '#FF5C93',
      title: '#FFFFFF',
      ink: '#FFFFFF',
      handleBg: '#FFE066',
      handleText: '#E8447A',
      hookBg: '#FF8FB8',
      hookText: '#FFFFFF',
      hookBorder: '#FFFFFF',
      hookAccent: '#FFE066',
    },
    titleShadow: '0 4px 0 #E8447A, 0 10px 30px rgba(232,68,122,0.4)',
    handleBorder: '#FFFFFF',
    captions: {
      uppercase: false,
      weight: 400,
      size: 92,
      color: '#FFFFFF',
      activeColor: '#FFE066',
      stroke: '#FF5C93',
      strokeWidth: 12,
      activeStroke: '#E8447A',
      activePill: null,
      shadow: '0 6px 18px rgba(232,68,122,0.45)',
      lineHeight: 1.45,
      motion: 'float',
    },
    hook: {
      weight: 400,
      tilt: -2.5,
      radius: 46,
      motion: 'float',
      size: 80,
      dashedInner: '#FFFFFF',
      textShadow: '0 4px 0 #E8447A',
      doodles: [
        {name: 'sparkle', top: -60, left: -50, size: 90, color: '#FFE066', rotate: -10},
        {name: 'heart', top: -40, left: 880, size: 80, rotate: 14},
        {name: 'squiggle', top: 250, left: 700, size: 120, color: '#FFE066'},
      ],
    },
    videoFrame: {color: '#FFFFFF', inset: 34, width: 7, radius: 56},
    videoDoodles: [
      {name: 'heart', top: 70, left: 60, size: 96, rotate: -14},
      {name: 'sparkle', top: 90, left: 930, size: 70, color: '#FFE066'},
      {name: 'star', top: 640, left: 950, size: 70, rotate: 12},
      {name: 'dots', top: 800, left: 40, size: 80},
      {name: 'flower', top: 1710, left: 70, size: 110, rotate: 8},
      {name: 'bow', top: 1700, left: 900, size: 110, rotate: -6},
      {name: 'sparkle', top: 1620, left: 260, size: 46, color: '#FFE066'},
    ],
    endDoodles: [
      {name: 'heart', top: 170, left: 90, size: 120, rotate: -12},
      {name: 'sparkle', top: 240, left: 850, size: 100},
      {name: 'loop', top: 560, left: 760, size: 150, rotate: 10},
      {name: 'star', top: 1350, left: 110, size: 110, rotate: -8},
      {name: 'flower', top: 1500, left: 820, size: 140},
      {name: 'squiggle', top: 1640, left: 360, size: 170},
      {name: 'bow', top: 520, left: 110, size: 110, rotate: -10},
      {name: 'dots', top: 1180, left: 880, size: 100},
    ],
  },
};
