
export function WorldZone({ emoji, name, color, bg, locked, x, y, size = 110 }: {
  emoji: string; name: string; color: string; bg: string;
  locked?: boolean; x: number; y: number; size?: number;
}) {
  return (
    <g transform={`translate(${x},${y})`} style={{ pointerEvents: "none" }}>
      {/* Glow ring */}
      {!locked && <circle cx={size / 2} cy={size / 2} r={size / 2 + 6} fill={bg} opacity="0.4" />}
      {/* Main circle */}
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={locked ? "#E5E7EB" : bg} />
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill={locked ? "#F9FAFB" : "white"} opacity="0.6" />
      {/* Emoji */}
      <text x={size / 2} y={size / 2 + (locked ? 8 : 10)} fontSize={locked ? 28 : 34} textAnchor="middle" dominantBaseline="middle">
        {locked ? "🔒" : emoji}
      </text>
      {/* Label */}
      <text x={size / 2} y={size + 18} fontSize="12" textAnchor="middle" fontWeight="800" fill={locked ? "#9CA3AF" : color} fontFamily="Nunito, sans-serif">
        {name}
      </text>
      {/* Stars below (progress) */}
      {!locked && (
        <g transform={`translate(${size / 2 - 24}, ${size + 26})`}>
          {["⭐", "⭐", "☆"].map((s, i) => (
            <text key={i} x={i * 16} y={0} fontSize="12">{s}</text>
          ))}
        </g>
      )}
    </g>
  );
}
