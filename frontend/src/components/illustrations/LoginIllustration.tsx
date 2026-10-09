
export function LoginIllustration() {
  return (
    <svg viewBox="0 0 360 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
      {/* Decorative circles */}
      <circle cx="180" cy="240" r="150" fill="rgba(255,255,255,0.05)" />
      <circle cx="180" cy="240" r="100" fill="rgba(255,255,255,0.05)" />
      {/* Family scene */}
      {/* Parent figure */}
      <circle cx="150" cy="190" r="28" fill="#FFD4A8" />
      <rect x="120" y="220" width="60" height="80" rx="20" fill="rgba(255,255,255,0.3)" />
      {/* Child figure */}
      <circle cx="220" cy="200" r="22" fill="#FFE4BC" />
      <rect x="196" y="224" width="48" height="68" rx="18" fill="rgba(255,255,255,0.2)" />
      {/* Heart between them */}
      <path d="M185 175 C185 170 178 165 178 172 C178 165 171 170 171 175 C171 180 178 186 178 186 C178 186 185 180 185 175Z" fill="white" opacity="0.6" />
      {/* Floating elements */}
      <circle cx="80"  cy="130" r="12" fill="rgba(255,255,255,0.15)" />
      <circle cx="280" cy="150" r="16" fill="rgba(255,255,255,0.1)"  />
      <circle cx="60"  cy="320" r="10" fill="rgba(255,255,255,0.12)" />
      <circle cx="300" cy="350" r="14" fill="rgba(255,255,255,0.1)"  />
      <text x="68"  y="138" fontSize="14" opacity="0.7">✦</text>
      <text x="268" y="158" fontSize="16" opacity="0.6">✦</text>
      <text x="48"  y="328" fontSize="12" opacity="0.5">✦</text>
      {/* Decorative pills */}
      <rect x="50" y="350" width="120" height="42" rx="14" fill="rgba(255,255,255,0.12)" />
      <text x="62" y="368" fontSize="18">🗣️</text>
      <text x="86" y="368" fontSize="12" fill="white" fontWeight="700" fontFamily="Nunito, sans-serif">Lenguaje</text>
      <text x="86" y="383" fontSize="10" fill="rgba(255,255,255,0.6)" fontFamily="Nunito, sans-serif">Terapia virtual</text>
      <rect x="190" y="350" width="120" height="42" rx="14" fill="rgba(255,255,255,0.12)" />
      <text x="202" y="368" fontSize="18">🎯</text>
      <text x="226" y="368" fontSize="12" fill="white" fontWeight="700" fontFamily="Nunito, sans-serif">Seguimiento</text>
      <text x="226" y="383" fontSize="10" fill="rgba(255,255,255,0.6)" fontFamily="Nunito, sans-serif">Personalizado</text>
    </svg>
  );
}
