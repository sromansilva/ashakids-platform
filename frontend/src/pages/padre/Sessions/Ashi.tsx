
export function Ashi({ size = 100, mood = "happy" }: { size?: number; mood?: "happy" | "wave" | "celebrate" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="60" cy="112" rx="28" ry="5" fill="#1C1135" opacity="0.08" />
      {/* Backpack */}
      <rect x="44" y="76" width="32" height="26" rx="8" fill="#A78BFA" />
      <rect x="50" y="80" width="20" height="12" rx="4" fill="#7C3AED" />
      <rect x="58" y="76" width="4" height="6" rx="2" fill="#DDD6FE" />
      {/* Body */}
      <ellipse cx="60" cy="84" rx="22" ry="24" fill="#F5C58A" />
      {/* Tummy */}
      <ellipse cx="60" cy="88" rx="13" ry="14" fill="#FDEAC6" />
      {/* Star on chest */}
      <path d="M60 78 L61.5 83 L67 83 L62.5 86 L64 91 L60 88 L56 91 L57.5 86 L53 83 L58.5 83 Z" fill="#F97316" />
      {/* Head */}
      <circle cx="60" cy="54" r="26" fill="#F5C58A" />
      {/* Ears */}
      <circle cx="37" cy="34" r="10" fill="#F5C58A" />
      <circle cx="83" cy="34" r="10" fill="#F5C58A" />
      <circle cx="37" cy="34" r="6"  fill="#F9A8D4" opacity="0.6" />
      <circle cx="83" cy="34" r="6"  fill="#F9A8D4" opacity="0.6" />
      {/* Face */}
      <circle cx="52" cy="50" r="4.5" fill="#1C1135" />
      <circle cx="68" cy="50" r="4.5" fill="#1C1135" />
      <circle cx="53.5" cy="48.5" r="1.5" fill="white" />
      <circle cx="69.5" cy="48.5" r="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="60" cy="57" rx="4" ry="2.5" fill="#E8A87C" />
      {/* Smile */}
      {mood === "happy" && <path d="M53 62 Q60 68 67 62" stroke="#C4703A" strokeWidth="2" strokeLinecap="round" fill="none" />}
      {mood === "wave"  && <path d="M52 63 Q60 70 68 63" stroke="#C4703A" strokeWidth="2.5" strokeLinecap="round" fill="none" />}
      {mood === "celebrate" && <>
        <path d="M52 62 Q60 70 68 62" stroke="#C4703A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <text x="20" y="30" fontSize="14">✨</text>
        <text x="88" y="30" fontSize="14">🌟</text>
      </>}
      {/* Cheek blush */}
      <circle cx="45" cy="58" r="5" fill="#F9A8D4" opacity="0.45" />
      <circle cx="75" cy="58" r="5" fill="#F9A8D4" opacity="0.45" />
      {/* Wave arm */}
      {mood === "wave" && <path d="M82 72 Q95 60 98 50 Q100 44 96 42 Q92 40 90 46 Q88 52 82 58" stroke="#F5C58A" strokeWidth="10" strokeLinecap="round" fill="none" />}
    </svg>
  );
}
