
export function Confetti() {
  const colors = ["#7C3AED", "#F97316", "#0D9488", "#EC4899", "#FCD34D", "#34D399", "#60A5FA"];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 56 }).map((_, i) => (
        <div key={i}
          className="absolute rounded-sm animate-bounce"
          style={{
            width:  Math.random() * 10 + 6,
            height: Math.random() * 10 + 6,
            left:   `${Math.random() * 100}%`,
            top:    `-${Math.random() * 20}%`,
            background: colors[i % colors.length],
            opacity: 0.85,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1.5 + Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}
