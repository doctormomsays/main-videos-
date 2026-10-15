import type {DoodleSpot} from './Doodles';
import type {BrandId} from './brands';
import type {Note} from './EditorialHook';

export type Word = {
  text: string;
  start: number; // seconds, on the edited (pause-free) timeline
  end: number;
};

export type ReelProps = {
  brand: BrandId;
  video: string; // path inside public/, e.g. "work/myclip/edited.mp4"
  videoDuration: number; // seconds, of the edited clip
  words: Word[];
  hook: string;
  cta: string; // empty = brand default
  notes?: Note[]; // optional mid-video section titles
};

export type MontageShot = {src: string; frames: number; what?: string};
export type MontageText = {text: string; start: number; end: number; doodles?: DoodleSpot[]}; // seconds on the reel timeline

export type MontageProps = {
  shots: MontageShot[]; // pre-graded clips in public/, each with fadeFrames of extra tail
  sections?: string[];
  texts: MontageText[];
  fadeFrames: number;
  music: string | null; // optional bed under the natural sound, path inside public/
  musicVolume: number;
};
