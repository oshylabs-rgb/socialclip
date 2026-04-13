import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  text: string;
  brandName: string;
  colors: string[];
}

export const HookScene: React.FC<Props> = ({ text, brandName, colors }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 20], [0.8, 1], { extrapolateRight: "clamp" });
  const brandOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${colors[0] || "#7c3aed"}, ${colors[1] || "#06b6d4"})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "10%",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          color: "#fff",
          fontSize: "clamp(24px, 5vw, 56px)",
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.2,
          textShadow: "0 2px 20px rgba(0,0,0,0.3)",
        }}
      >
        {text}
      </div>
      <div
        style={{
          opacity: brandOpacity,
          marginTop: 30,
          color: "rgba(255,255,255,0.8)",
          fontSize: "clamp(14px, 2.5vw, 28px)",
          fontWeight: 500,
        }}
      >
        {brandName}
      </div>
    </AbsoluteFill>
  );
};
