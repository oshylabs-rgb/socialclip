export interface VideoScene {
  title: string;
  script: string;
  duration: number;
  visualDescription: string;
}

export interface VideoProps {
  brandName: string;
  tagline: string;
  colors: string[];
  cta: string;
  scenes: VideoScene[];
  width: number;
  height: number;
}
