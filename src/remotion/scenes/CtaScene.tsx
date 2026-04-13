import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  cta: string;
  brandName: string;
  colors: string[];
}

export const CtaScene: React.FC<Props> = ({ cta, brandName, colors }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 20], [0.6, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const pulse = interpolate(frame, [30, 45, 60, 75], [1, 1.05, 1, 1.05], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${colors[0] || "#7c3aed"}, ${colors[2] || "#f59e0b"})`,
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
          fontSize: "clamp(16px, 3vw, 32px)",
          fontWeight: 500,
          marginBottom: 30,
          textAlign: "center",
        }}
      >
        {brandName}
      </div>
      <div
        style={{
          opacity,
          transform: `scale(${pulse})`,
          background: "rgba(255,255,255,0.95)",
          color: colors[0] || "#7c3aed",
          fontSize: "clamp(16px, 3.5vw, 36px)",
          fontWeight: 800,
          padding: "16px 40px",
          borderRadius: 16,
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        {cta}
      </div>
    </AbsoluteFill>
  );
};
