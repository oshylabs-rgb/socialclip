"use client";

import { Player } from "@remotion/player";
import { PromoVideo } from "@/remotion/PromoVideo";
import type { VideoProps } from "@/remotion/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Comp = PromoVideo as React.FC<any>;

interface Props {
  videoProps: VideoProps;
  width: number;
  height: number;
}

export function VideoPlayer({ videoProps, width, height }: Props) {
  const totalDuration = videoProps.scenes.reduce((acc, s) => acc + s.duration, 0);

  return (
    <Player
      component={Comp}
      inputProps={videoProps}
      durationInFrames={totalDuration * 30}
      fps={30}
      compositionWidth={width}
      compositionHeight={height}
      style={{
        width: "100%",
        maxHeight: 500,
        borderRadius: 12,
        overflow: "hidden",
      }}
      controls
      autoPlay
      loop
    />
  );
}
