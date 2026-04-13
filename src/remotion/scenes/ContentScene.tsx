import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  title: string;
  text: string;
  colors: string[];
  index: number;
}

export const ContentScene: React.FC<Props> = ({ title, text, colors, index }) => {
  const frame = useCurrentFrame();
  const slideIn = interpolate(frame, [0, 15], [60, 0], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });

  const bgColor = index % 2 === 0 ? colors[0] || "#7c3aed" : colors[2] || "#f59e0b";

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${bgColor}, ${colors[1] || "#06b6d4"})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "10%",
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          color: "rgba(255,255,255,0.6)",
          fontSize: "clamp(12px, 2vw, 20px)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 3,
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      <div
        style={{
          opacity,
          transform: `translateY(${slideIn}px)`,
          color: "#fff",
          fontSize: "clamp(20px, 4.5vw, 48px)",
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1.3,
          textShadow: "0 2px 16px rgba(0,0,0,0.2)",
          maxWidth: "90%",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
