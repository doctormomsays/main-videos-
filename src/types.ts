import type {BrandId} from './brands';

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
};
