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
    letterSpacing?: string;
    maxWords?: number;
    maxChars?: number;
    bottom?: number; // distance of the caption block from the bottom edge
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
    seconds?: number; // how long the hook stays up (default HOOK_SECONDS)
    size?: number;
    ornament?: string;
    dashedInner?: string; // white dashed "sticker" outline inside the card
    textShadow?: string;
    doodles?: DoodleSpot[]; // positioned relative to the card
  };
  // Magazine-style hook (see EditorialHook.tsx). When set, replaces the card hook.
  editorial?: {
    fonts: {sans: string; serif: string; script: string; pinkScript: string};
    colors: {big: string; kicker: string; script: string; scriptGlow: string; pink: string; pinkGlow: string; outline: string};
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
const inter = "'Inter', sans-serif";
const instrument = "'Instrument Serif', serif";
const greatVibes = "'Great Vibes', cursive";

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

  // Girly, flirty, aesthetic, after Priya's reference reels: text sits straight on
  // the video (no boxes), tight sans + italic serif + handwritten script, pale
  // butter yellow and pink with white outline glow, tiny lowercase captions.
  honestlyworthit: {
    handle: '@honestlyworthit',
    displayName: 'honestly worth it',
    tagline: 'pretty finds · honest reviews',
    monogram: '♡',
    defaultCta: 'follow for more pretty little finds 🎀',
    fonts: {caption: inter, hook: inter, title: instrument, body: inter},
    editorial: {
      fonts: {sans: inter, serif: instrument, script: greatVibes, pinkScript: pacifico},
      colors: {
        big: '#FBF3A6',
        kicker: '#FFFFFF',
        script: '#FFFFFF',
        scriptGlow: 'rgba(255,182,213,0.9)',
        pink: '#FF9EC8',
        pinkGlow: 'rgba(255,158,200,0.8)',
        outline: '#FFFFFF',
      },
    },
    colors: {
      endBg: 'linear-gradient(165deg, #FFB6D0 0%, #FFD1E0 50%, #FBF3A6 100%)',
      blobA: 'rgba(255,255,255,0.35)',
      blobB: 'rgba(251,243,166,0.9)',
      dot: 'transparent',
      badge: '#FFFFFF',
      badgeText: '#FF7FB2',
      title: '#FFFFFF',
      ink: '#FFFFFF',
      handleBg: '#FBF3A6',
      handleText: '#E0558F',
      hookBg: 'transparent',
      hookText: '#FBF3A6',
      hookBorder: 'transparent',
      hookAccent: '#FF9EC8',
    },
    titleShadow: '0 4px 0 #E0558F, 0 10px 30px rgba(224,85,143,0.4)',
    handleBorder: '#FFFFFF',
    captions: {
      uppercase: false,
      weight: 600,
      size: 62,
      color: '#FFFFFF',
      activeColor: '#FFC2DD',
      stroke: null,
      activePill: null,
      shadow: '0 2px 10px rgba(0,0,0,0.55)',
      lineHeight: 1.05,
      letterSpacing: '-0.05em',
      maxWords: 5,
      maxChars: 26,
      bottom: 760,
      motion: 'float',
    },
    hook: {
      seconds: 3,
      weight: 600,
      tilt: 0,
      radius: 0,
      motion: 'float',
      doodles: [
        {name: 'sparkle', top: -10, left: -40, size: 70, color: '#FBF3A6', rotate: -10},
        {name: 'heart', top: 20, left: 860, size: 64, rotate: 14},
      ],
    },
    videoDoodles: [
      {name: 'sparkle', top: 1240, left: 90, size: 52, color: '#FBF3A6'},
      {name: 'heart', top: 1290, left: 900, size: 58, rotate: 12},
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
