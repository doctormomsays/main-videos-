import React from 'react';
import {Composition} from 'remotion';
import {END_CARD_SECONDS, FPS, HEIGHT, WIDTH} from './brands';
import {Reel} from './Reel';
import type {ReelProps} from './types';

const defaultProps: ReelProps = {
  brand: 'doctormomsays',
  video: 'work/sample/edited.mp4',
  videoDuration: 10,
  words: [],
  hook: 'Your hook title here',
  cta: '',
};

export const RemotionRoot: React.FC = () => (
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
);
