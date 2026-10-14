// One block per Instagram page. The upload folder (clips/<brand>/) picks the preset.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const HOOK_SECONDS = 2;
export const END_CARD_SECONDS = 3;

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
    activePill: string | null; // soft highlight behind the active word
    shadow: string;
    // 'pop' = snappy scale-in, 'float' = slow fade + gentle rise
    motion: 'pop' | 'float';
  };
  hook: {weight: number; tilt: number; radius: number; motion: 'pop' | 'float'; size?: number; ornament?: string};
  // Small floating accents on the end card (hearts, sparkles).
  decor?: {char: string; top: number; left: number; size: number; color: string; rotate?: number}[];
};

const montserrat = "'Montserrat', sans-serif";
const playfair = "'Playfair Display', serif";
const script = "'Dancing Script', cursive";
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

  // Girly, flirty, aesthetic: blush + rose + berry, handwritten script with soft
  // rounded captions, slow float-in motion so it still feels soothing.
  honestlyworthit: {
    handle: '@honestlyworthit',
    displayName: 'honestly worth it',
    tagline: 'pretty finds · honest reviews',
    monogram: '♡',
    defaultCta: 'follow for more pretty little finds ♡',
    fonts: {caption: quicksand, hook: script, title: script, body: quicksand},
    colors: {
      endBg: 'linear-gradient(170deg, #FFF8F5 0%, #FCE8EC 55%, #F9DDE3 100%)',
      blobA: '#F4C6D0',
      blobB: '#F6E7D8',
      dot: 'transparent',
      badge: '#E08AA0',
      badgeText: '#FFF8F5',
      title: '#8E3B5A',
      ink: '#8E3B5A',
      handleBg: '#E08AA0',
      handleText: '#FFF8F5',
      hookBg: 'rgba(255,248,245,0.95)',
      hookText: '#8E3B5A',
      hookBorder: '#F4B6C2',
      hookAccent: '#E08AA0',
    },
    captions: {
      uppercase: false,
      weight: 700,
      size: 86,
      color: '#FFFFFF',
      activeColor: '#8E3B5A',
      stroke: null,
      activePill: '#F9D3DC',
      shadow: '0 3px 16px rgba(142,59,90,0.55)',
      motion: 'float',
    },
    hook: {weight: 700, tilt: -2, radius: 60, motion: 'float', size: 96, ornament: '♡'},
    decor: [
      {char: '♡', top: 250, left: 120, size: 70, color: '#E08AA0', rotate: -14},
      {char: '✦', top: 420, left: 900, size: 54, color: '#E8B4A0', rotate: 0},
      {char: '♡', top: 1460, left: 860, size: 90, color: '#F4B6C2', rotate: 12},
      {char: '✧', top: 1580, left: 170, size: 60, color: '#E08AA0', rotate: 0},
      {char: '✦', top: 330, left: 760, size: 30, color: '#F4B6C2', rotate: 0},
    ],
  },
};
