import React from 'react';
import {Composition, Still} from 'remotion';
import {END_CARD_SECONDS, FPS, HEIGHT, WIDTH} from './brands';
import {Cover} from './Cover';
import {Montage} from './Montage';
import {Reel} from './Reel';
import type {MontageProps, ReelProps} from './types';

const defaultProps: ReelProps = {
  brand: 'doctormomsays',
  video: 'work/sample/edited.mp4',
  videoDuration: 10,
  words: [],
  hook: 'Your hook title here',
  cta: '',
};

const montageDefaults: MontageProps = {shots: [], texts: [], fadeFrames: 5, music: null, musicVolume: 0.18};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Reel"
      component={Reel}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      durationInFrames={Math.round((defaultProps.videoDuration + END_CARD_SECONDS) * FPS)}
      defaultProps={defaultProps}
      calculateMetadata={({props}) => ({
        durationInFrames: Math.round((props.videoDuration + END_CARD_SECONDS) * FPS),
      })}
    />
    <Composition
      id="Montage"
      component={Montage}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      durationInFrames={FPS}
      defaultProps={montageDefaults}
      calculateMetadata={({props}) => ({
        durationInFrames: Math.max(1, props.shots.reduce((n, s) => n + s.frames, 0)),
      })}
    />
    <Still
      id="Cover"
      component={Cover}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{bg: 'work/sample/cover.png', title: 'your title', dim: 0.18, doodles: []}}
    />
  </>
);
