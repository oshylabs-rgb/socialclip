import { Composition } from "remotion";
import { PromoVideo } from "./PromoVideo";
import type { VideoProps } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PromoVideoComp = PromoVideo as React.FC<any>;

const defaultProps: VideoProps = {
  brandName: "FlowSync",
  tagline: "Automate your workflow",
  colors: ["#7c3aed", "#06b6d4", "#f59e0b"],
  cta: "Start Free Trial",
  scenes: [
    { title: "Hook", script: "Tired of scattered workflows?", duration: 3, visualDescription: "" },
    { title: "Problem", script: "Teams waste 5+ hours weekly switching tools.", duration: 3, visualDescription: "" },
    { title: "Solution", script: "FlowSync brings everything into one hub.", duration: 4, visualDescription: "" },
    { title: "Features", script: "Real-time collab. Smart routing. Integrations.", duration: 4, visualDescription: "" },
    { title: "CTA", script: "Start your free trial today.", duration: 3, visualDescription: "" },
  ],
  width: 1080,
  height: 1920,
};

const totalDuration = defaultProps.scenes.reduce((acc, s) => acc + s.duration, 0);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromoReel"
        component={PromoVideoComp}
        durationInFrames={totalDuration * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      <Composition
        id="PromoSquare"
        component={PromoVideoComp}
        durationInFrames={totalDuration * 30}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{ ...defaultProps, width: 1080, height: 1080 }}
      />
      <Composition
        id="PromoLandscape"
        component={PromoVideoComp}
        durationInFrames={totalDuration * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ ...defaultProps, width: 1920, height: 1080 }}
      />
    </>
  );
};
