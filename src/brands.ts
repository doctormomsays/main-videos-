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
  hook: {weight: number; tilt: number; radius: number; motion: 'pop' | 'float'};
};

const montserrat = "'Montserrat', sans-serif";
const playfair = "'Playfair Display', serif";
const fredoka = "'Fredoka', sans-serif";

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

  // Soft pastels, rounded type and slower motion for a calm feel.
  honestlyworthit: {
    handle: '@honestlyworthit',
    displayName: 'honestly worth it',
    tagline: 'real finds · real reviews · no fluff',
    monogram: '✿',
    defaultCta: 'Follow for more honest finds',
    fonts: {caption: fredoka, hook: fredoka, title: fredoka, body: fredoka},
    colors: {
      endBg: '#FBF6EE',
      blobA: '#E4DCF0',
      blobB: '#D7E5D3',
      dot: '#F2C4B0',
      badge: '#B8A6D9',
      badgeText: '#FFFFFF',
      title: '#5B4B6E',
      ink: '#5B4B6E',
      handleBg: '#9FBF9A',
      handleText: '#FFFFFF',
      hookBg: 'rgba(251,246,238,0.94)',
      hookText: '#5B4B6E',
      hookBorder: '#E4DCF0',
      hookAccent: '#F2C4B0',
    },
    captions: {
      uppercase: false,
      weight: 700,
      size: 88,
      color: '#FFFFFF',
      activeColor: '#5B4B6E',
      stroke: null,
      activePill: '#F6E3DC',
      shadow: '0 4px 18px rgba(60,40,80,0.45)',
      motion: 'float',
    },
    hook: {weight: 600, tilt: 0, radius: 60, motion: 'float'},
  },
};
