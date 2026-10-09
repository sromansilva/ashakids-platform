import { B } from "@/theme/brand/B";

export function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-lg">
      {/* Background blobs */}
      <ellipse cx="280" cy="210" rx="170" ry="165" fill="#EDE9FE" opacity="0.6" />
      <ellipse cx="380" cy="100" rx="60" ry="55" fill="#DDD6FE" opacity="0.5" />
      <ellipse cx="120" cy="320" rx="55" ry="50" fill="#CCFBF1" opacity="0.5" />
      {/* Decorative dots */}
      <circle cx="60"  cy="80"  r="6" fill={B.orange}  opacity="0.4" />
      <circle cx="440" cy="180" r="8" fill={B.teal}    opacity="0.3" />
      <circle cx="90"  cy="370" r="5" fill={B.violet}  opacity="0.3" />
      <circle cx="420" cy="340" r="7" fill={B.orange}  opacity="0.25" />
      {/* Floating stars */}
      <text x="50"  y="200" fontSize="18" opacity="0.6">✦</text>
      <text x="410" y="260" fontSize="14" opacity="0.5">✦</text>
      <text x="160" y="60"  fontSize="12" opacity="0.5">✦</text>
      {/* Session card — main focal element */}
      <rect x="100" y="80" width="280" height="260" rx="28" fill="white" filter="url(#shadow)" />
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="20" floodColor="#7C3AED" floodOpacity="0.12" />
        </filter>
      </defs>
      {/* Video call header */}
      <rect x="100" y="80" width="280" height="90" rx="28" fill="#2D1B69" />
      <rect x="100" y="138" width="280" height="32" fill="#2D1B69" /> {/* square off bottom corners of header */}
      {/* Two video thumbnails in call */}
      <rect x="118" y="96"  width="110" height="60" rx="12" fill="#3D2880" />
      <rect x="252" y="96"  width="110" height="60" rx="12" fill="#3D2880" />
      {/* Parent figure (left) */}
      <circle cx="173" cy="110" r="14" fill="#FFD4A8" />
      <rect   x="158" y="126" width="30" height="24" rx="8"  fill={B.violet} />
      {/* Child figure (right) */}
      <circle cx="307" cy="114" r="12" fill="#FFD4A8" />
      <rect   x="294" y="128" width="26" height="20" rx="7"  fill={B.teal}   />
      {/* Recording dot */}
      <circle cx="370" cy="100" r="4" fill="#EF4444" />
      <text x="140" y="176" fontSize="11" fill="white" opacity="0.7" fontFamily="Nunito, sans-serif">En sesión · 00:32:14</text>
      {/* Info section */}
      <text x="130" y="215" fontSize="13" fontWeight="700" fill={B.text} fontFamily="Nunito, sans-serif">Terapia del Lenguaje</text>
      <text x="130" y="233" fontSize="11" fill={B.textMid} fontFamily="Nunito, sans-serif">Mateo · 7 años</text>
      {/* Progress bar */}
      <rect x="130" y="248" width="220" height="7" rx="4" fill="#EDE9FE" />
      <rect x="130" y="248" width="171" height="7" rx="4" fill={B.violet} />
      <text x="130" y="270" fontSize="10" fill={B.textMuted} fontFamily="Nunito, sans-serif">Progreso: 78%</text>
      {/* Tag pills */}
      <rect x="130" y="284" width="64" height="22" rx="11" fill="#EDE9FE" />
      <text x="144" y="299" fontSize="10" fill={B.violet} fontWeight="700" fontFamily="Nunito, sans-serif">Lenguaje</text>
      <rect x="202" y="284" width="80" height="22" rx="11" fill={B.tealLight} />
      <text x="213" y="299" fontSize="10" fill={B.teal} fontWeight="700" fontFamily="Nunito, sans-serif">Comunicación</text>
      {/* Bottom action */}
      <rect x="130" y="318" width="220" height="36" rx="12" fill={B.orange} />
      <text x="196" y="341" fontSize="12" fill="white" fontWeight="700" fontFamily="Nunito, sans-serif">Unirse al Zoom</text>
      {/* Floating badges */}
      <rect x="30"  y="160" width="100" height="44" rx="14" fill="white" filter="url(#shadow)" />
      <text x="42"  y="180" fontSize="16">⭐</text>
      <text x="62"  y="180" fontSize="11" fontWeight="700" fill={B.text} fontFamily="Nunito, sans-serif">12 sesiones</text>
      <text x="62"  y="194" fontSize="10" fill={B.textMuted} fontFamily="Nunito, sans-serif">completadas</text>
      <rect x="350" y="280" width="96" height="44" rx="14" fill="white" filter="url(#shadow)" />
      <text x="362" y="300" fontSize="16">🏆</text>
      <text x="382" y="300" fontSize="11" fontWeight="700" fill={B.text} fontFamily="Nunito, sans-serif">Logro</text>
      <text x="382" y="314" fontSize="10" fill={B.textMuted} fontFamily="Nunito, sans-serif">desbloqueado</text>
    </svg>
  );
}
