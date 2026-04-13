import { Sequence } from "remotion";
import type { VideoProps } from "./types";
import { HookScene } from "./scenes/HookScene";
import { ContentScene } from "./scenes/ContentScene";
import { CtaScene } from "./scenes/CtaScene";

const FPS = 30;

export const PromoVideo: React.FC<VideoProps> = ({
  brandName,
  tagline,
  colors,
  cta,
  scenes,
}) => {
  let frameOffset = 0;

  return (
    <>
      {scenes.map((scene, i) => {
        const durationInFrames = scene.duration * FPS;
        const from = frameOffset;
        frameOffset += durationInFrames;

        if (i === 0) {
          return (
            <Sequence key={scene.title} from={from} durationInFrames={durationInFrames}>
              <HookScene text={scene.script} brandName={brandName} colors={colors} />
            </Sequence>
          );
        }

        if (i === scenes.length - 1) {
          return (
            <Sequence key={scene.title} from={from} durationInFrames={durationInFrames}>
              <CtaScene cta={cta} brandName={brandName} colors={colors} />
            </Sequence>
          );
        }

        return (
          <Sequence key={scene.title} from={from} durationInFrames={durationInFrames}>
            <ContentScene
              title={scene.title}
              text={scene.script}
              colors={colors}
              index={i}
            />
          </Sequence>
        );
      })}
    </>
  );
};
