import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig} from 'remotion';
import {BRANDS, HOOK_SECONDS} from './brands';
import {Captions} from './Captions';
import {DoodleLayer} from './Doodles';
import {EditorialHook, Notes} from './EditorialHook';
import {EndCard} from './EndCard';
import './fonts';
import {HookTitle} from './HookTitle';
import type {ReelProps} from './types';

export const Reel: React.FC<ReelProps> = ({brand, video, videoDuration, words, hook, cta, notes}) => {
  const {fps} = useVideoConfig();
  const theme = BRANDS[brand] ?? BRANDS.doctormomsays;
  const videoFrames = Math.round(videoDuration * fps);

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <Sequence durationInFrames={videoFrames}>
        <OffthreadVideo src={staticFile(video)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {theme.videoFrame ? (
          <AbsoluteFill
            style={{
              margin: theme.videoFrame.inset,
              border: `${theme.videoFrame.width}px solid ${theme.videoFrame.color}`,
              borderRadius: theme.videoFrame.radius,
              boxShadow: '0 0 18px rgba(232,68,122,0.35), inset 0 0 18px rgba(232,68,122,0.25)',
            }}
          />
        ) : null}
        {theme.videoDoodles ? <DoodleLayer spots={theme.videoDoodles} /> : null}
        <Captions words={words} theme={theme} />
        {theme.editorial ? <EditorialHook text={hook} theme={theme} seconds={HOOK_SECONDS} /> : <HookTitle text={hook} theme={theme} />}
        {notes?.length ? <Notes notes={notes} theme={theme} /> : null}
      </Sequence>
      <Sequence from={videoFrames}>
        <EndCard cta={cta} theme={theme} />
      </Sequence>
    </AbsoluteFill>
  );
};
