import { useState } from "react";
import ashaKidsLogo from "@/imports/ashakids-logo-final-transparent-1.png";
import {
  Eye, EyeOff, ChevronRight, Menu,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Brand tokens ──────────────────────────────────────────────────────────────

export const B = {
  violet:      "#7C3AED",
  violetDark:  "#5B21B6",
  violetDeep:  "#2D1B69",
  violetLight: "#EDE9FE",
  violetMid:   "#DDD6FE",
  orange:      "#F97316",
  orangeLight: "#FFF1E6",
  teal:        "#0D9488",
  tealLight:   "#CCFBF1",
  bg:          "#FAFAF9",
  surface:     "#FFFFFF",
  text:        "#1C1135",
  textMid:     "#6B5E8A",
  textMuted:   "#9E95B7",
  border:      "#E8E5F4",
  success:     "#16A34A",
  successLight:"#DCFCE7",
  warning:     "#D97706",
  warningLight:"#FEF3C7",
  danger:      "#DC2626",
  dangerLight: "#FEE2E2",
};

// ─── Mock data ─────────────────────────────────────────────────────────────────

export const therapists = [
  { id: 1, name: "Dra. Ana Ruiz",       specialty: "Terapia del Lenguaje", rating: 4.9, reviews: 127, experience: "8 años",  av: "AR", color: B.violet,  available: true,  price: 45, tags: ["Lenguaje", "Fonología"] },
  { id: 2, name: "Lic. Carlos Mendoza", specialty: "Terapia del Lenguaje", rating: 4.8, reviews: 98,  experience: "6 años",  av: "CM", color: B.teal,    available: true,  price: 50, tags: ["Comprensión", "Vocabulario"] },
  { id: 3, name: "Dra. María Torres",   specialty: "Terapia del Lenguaje", rating: 4.7, reviews: 84,  experience: "10 años", av: "MT", color: "#EC4899", available: false, price: 55, tags: ["Fluidez", "Pronunciación"] },
  { id: 4, name: "Lic. Pedro Sánchez",  specialty: "Terapia del Lenguaje", rating: 4.9, reviews: 156, experience: "12 años", av: "PS", color: B.orange,  available: true,  price: 48, tags: ["Articulación", "Habla"] },
  { id: 5, name: "Dra. Lucía Vargas",   specialty: "Terapia del Lenguaje", rating: 4.6, reviews: 72,  experience: "5 años",  av: "LV", color: "#06B6D4", available: true,  price: 42, tags: ["Lenguaje", "Comunicación"] },
  { id: 6, name: "Lic. Roberto Díaz",   specialty: "Terapia del Lenguaje", rating: 4.8, reviews: 110, experience: "9 años",  av: "RD", color: "#7C3AED", available: true,  price: 58, tags: ["Fonología", "Articulación"] },
];

export const appointments = [
  { id: 1, therapist: "Dra. Ana Ruiz",       child: "Mateo Gómez",  date: "30 Jul 2026", time: "10:00", type: "virtual",  status: "confirmada", specialty: "Lenguaje"  },
  { id: 2, therapist: "Lic. Carlos Mendoza", child: "Sofía Gómez",  date: "02 Ago 2026", time: "15:30", type: "virtual",  status: "pendiente",  specialty: "Comprensión" },
  { id: 3, therapist: "Dra. Ana Ruiz",       child: "Mateo Gómez",  date: "06 Ago 2026", time: "10:00", type: "virtual",  status: "confirmada", specialty: "Lenguaje"  },
];

export const kids = [
  { id: 1, name: "Mateo", age: 7, therapist: "Dra. Ana Ruiz",       sessions: 12, progress: 78, emoji: "🦊", bg: "#FEF3C7" },
  { id: 2, name: "Sofía", age: 5, therapist: "Lic. Carlos Mendoza", sessions: 6,  progress: 55, emoji: "🐰", bg: "#EDE9FE" },
];

export const chartData = [
  { mes: "Feb", citas: 42, ingresos: 2100 },
  { mes: "Mar", citas: 58, ingresos: 2900 },
  { mes: "Abr", citas: 51, ingresos: 2550 },
  { mes: "May", citas: 67, ingresos: 3350 },
  { mes: "Jun", citas: 73, ingresos: 3650 },
  { mes: "Jul", citas: 89, ingresos: 4450 },
];

export const pieData = [
  { name: "Fonología",    value: 34, fill: B.violet  },
  { name: "Comprensión",  value: 28, fill: B.teal    },
  { name: "Articulación", value: 22, fill: B.orange  },
  { name: "Fluidez",      value: 16, fill: "#EC4899" },
];

export const pieDataReportes = [
  { name: "Fonología-r",    value: 34, fill: B.violet  },
  { name: "Comprensión-r",  value: 28, fill: B.teal    },
  { name: "Articulación-r", value: 22, fill: B.orange  },
  { name: "Fluidez-r",      value: 16, fill: "#EC4899" },
];

export const adminUsers = [
  { id: 1, name: "Laura Gómez",      code: "P1234", role: "padre",     email: "laura@email.com",  status: "activo",   date: "15 Ene 2026" },
  { id: 2, name: "Dra. Ana Ruiz",    code: "T0021", role: "terapeuta", email: "ana@asha.com",      status: "activo",   date: "10 Oct 2025" },
  { id: 3, name: "Lic. C. Mendoza",  code: "T0035", role: "terapeuta", email: "carlos@asha.com",   status: "activo",   date: "22 Nov 2025" },
  { id: 4, name: "Jorge Pérez",      code: "P5678", role: "padre",     email: "jorge@email.com",   status: "inactivo", date: "03 Mar 2026" },
  { id: 5, name: "Admin Principal",  code: "A0001", role: "admin",     email: "admin@asha.com",    status: "activo",   date: "01 Ene 2025" },
];

export const msgs = [
  { id: 1, from: "Dra. Ana Ruiz", text: "¡Hola Laura! Mateo tuvo un excelente avance hoy con los trabalenguas. 🌟", time: "10:30", own: false, av: "AR", color: B.violet },
  { id: 2, from: "Tú",            text: "¡Qué buenas noticias! Él estaba muy emocionado de la sesión.",             time: "10:45", own: true,  av: "LG", color: B.orange },
  { id: 3, from: "Dra. Ana Ruiz", text: "Para la próxima sesión practicá estos ejercicios en casa 📄",              time: "10:47", own: false, av: "AR", color: B.violet },
  { id: 4, from: "Tú",            text: "Perfecto, ¿a qué hora es la próxima cita?",                               time: "11:05", own: true,  av: "LG", color: B.orange },
  { id: 5, from: "Dra. Ana Ruiz", text: "El miércoles 6 de agosto a las 10:00 AM. Te llegará confirmación. 📅",    time: "11:08", own: false, av: "AR", color: B.violet },
];

export type View =
  | "landing" | "login"
  | "padre" | "padre/agenda" | "padre/psicologos" | "padre/recompensas" | "padre/mensajes" | "padre/compras"
  | "padre/hijos" | "padre/progreso" | "padre/reportes" | "padre/config" | "padre/camino" | "padre/ayuda"
  | "terapeuta" | "terapeuta/agenda" | "terapeuta/pacientes" | "terapeuta/mensajes"
  | "terapeuta/reportes" | "terapeuta/analiticas" | "terapeuta/ingresos"
  | "terapeuta/valoraciones" | "terapeuta/config" | "terapeuta/datos-actividad"
  | "admin" | "admin/dashboard" | "admin/terapeutas" | "admin/operacion" | "admin/pagos"
  | "admin/contenido" | "admin/ml" | "admin/auditoria" | "admin/config"
  | "mundo-asha" | "mundo-asha/cuentos" | "mundo-asha/canciones" | "mundo-asha/trabalenguas"
  | "mundo-asha/adivinanzas" | "mundo-asha/juegos" | "mundo-asha/isla" | "mundo-asha/academia"
  | "mundo-asha/retos" | "mundo-asha/insignias" | "mundo-asha/perfil"
  | "session" | "session/prep" | "session/waiting" | "session/active"
  | "session/end" | "session/summary" | "session/rating" | "session/rewards"
  | "pay" | "pay/history" | "pay/wallet"
  | "public/especialistas" | "public/especialidades" | "public/mundo"
  | "public/recursos" | "public/ashi" | "public/historias" | "public/nosotros"
  | "public/planes" | "public/ayuda" | "public/contacto" | "public/trabaja"
  | "register" | "register/padre" | "register/verify" | "register/terapeuta" | "register/terapeuta/landing" | "register/terapeuta/success"
  | "onboarding"
  | "forgot-password"
  | "padre/recorrido" | "padre/consentimiento" | "padre/seguimiento" | "padre/evaluacion";

export type Role = "padre" | "terapeuta" | "admin" | null;

export function MobileTopBar({ title, onMenu, menuOpen }: { title: string; onMenu: () => void; menuOpen: boolean }) {
  return <header className="md:hidden shrink-0 bg-white pt-[env(safe-area-inset-top)]">
    <div className="grid h-14 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 px-3">
      <button type="button" onClick={onMenu} className="flex h-11 w-11 items-center justify-center rounded-xl text-[#7C6F9A] hover:bg-violet-50 focus-visible:ring-2 focus-visible:ring-violet-500" aria-label="Abrir menú de navegación" aria-expanded={menuOpen}><Menu size={19} /></button>
      <p className="min-w-0 truncate text-center text-sm font-bold text-[#7C6F9A]">{title}</p>
      <div className="flex h-11 w-11 items-center justify-center"><Isotipo size={34} /></div>
    </div>
  </header>;
}

// ─── Brand logo ────────────────────────────────────────────────────────────────
// Single source of truth for the AshaKids visual identity.
// variant="header"  → 44 px symbol, dark text (navbars, public header)
// variant="sidebar" → 48 px symbol, dark text (role sidebars)
// variant="auth"    → 80 px symbol, configurable text (auth panels)
// Below 32 px the original SVG mark is used as a temporary favicon stand-in.

export type LogoVariant = "header" | "sidebar" | "auth";

const LOGO_PX: Record<LogoVariant, number> = { header: 44, sidebar: 48, auth: 80 };
const LOGO_TEXT: Record<LogoVariant, string> = {
  header:  "text-xl font-extrabold tracking-tight",
  sidebar: "text-lg font-extrabold tracking-tight",
  auth:    "text-2xl font-black tracking-tight",
};

export function AshaKidsLogo({
  variant = "header",
  showText = true,
  textColor,
}: {
  variant?: LogoVariant;
  showText?: boolean;
  textColor?: string;
}) {
  const size = LOGO_PX[variant];
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={ashaKidsLogo}
        alt={showText ? "" : "Logo de AshaKids"}
        width={size}
        height={size}
        style={{ objectFit: "contain", display: "block", flexShrink: 0 }}
      />
      {showText && (
        <span className={LOGO_TEXT[variant]} style={{ color: textColor ?? "#1C1135" }}>
          AshaKids
        </span>
      )}
    </div>
  );
}

// Backward-compatible wrappers — always render the approved PNG.
// The old SVG fallback is permanently retired; callers must use size ≥ 36 px
// for readable display. For sub-36 px contexts prefer AshaKidsLogo or a
// dedicated favicon asset.

export function Isotipo({ size = 36 }: { size?: number }) {
  return (
    <img src={ashaKidsLogo} alt="" width={size} height={size}
      style={{ objectFit: "contain", display: "block", flexShrink: 0 }} />
  );
}

export function IsotipoWhite({ size = 36 }: { size?: number }) {
  // PNG has real transparency — reads cleanly on dark violet surfaces.
  return (
    <img src={ashaKidsLogo} alt="" width={size} height={size}
      style={{ objectFit: "contain", display: "block", flexShrink: 0 }} />
  );
}

// Hero illustration — family therapy scene
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

// Login panel illustration
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

// Decorative blob for sections
export function Blob({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M44.6,-73.1C56.4,-67.3,63.3,-52.5,70.2,-37.8C77.1,-23.1,84,-8.6,82.9,5.4C81.8,19.4,72.7,32.8,63.1,45.3C53.5,57.8,43.4,69.3,30.5,75.2C17.6,81.1,1.9,81.4,-13.1,78.5C-28.1,75.6,-42.4,69.5,-54.5,60C-66.6,50.5,-76.5,37.6,-79.8,22.9C-83.1,8.2,-79.8,-8.3,-74,-22.9C-68.2,-37.5,-59.9,-50.2,-48.2,-56.4C-36.5,-62.6,-21.4,-62.3,-5.1,-55.1C11.2,-47.9,32.8,-78.9,44.6,-73.1Z" fill="currentColor" />
    </svg>
  );
}

// ─── Shared UI components ───────────────────────────────────────────────────────

export function Btn({
  children, variant = "primary", size = "md", onClick, className = "", disabled = false, type = "button",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "cta" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void; className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  const base = "inline-flex items-center justify-center gap-1.5 font-bold rounded-2xl transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 select-none active:scale-[.97]";
  const sizes = { sm: "text-xs px-3.5 py-1.5", md: "text-sm px-5 py-2.5", lg: "text-base px-7 py-3.5" };
  const variantStyles: Record<string, string> = {
    primary:   "bg-violet-700 text-white hover:bg-violet-800 shadow-sm shadow-violet-200",
    secondary: "bg-violet-100 text-violet-700 hover:bg-violet-200",
    ghost:     "text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700",
    outline:   "border border-[#E8E5F4] bg-white text-[#1C1135] hover:bg-[#F5F3FF]",
    cta:       "bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-200",
    danger:    "bg-red-50 text-red-600 hover:bg-red-100",
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={`${base} ${sizes[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Bdg({ children, color = "violet" }: {
  children: React.ReactNode;
  color?: "violet" | "teal" | "orange" | "pink" | "red" | "gray" | "green";
}) {
  const c = {
    violet: "bg-violet-100 text-violet-700",
    teal:   "bg-teal-50 text-teal-700",
    orange: "bg-orange-50 text-orange-700",
    pink:   "bg-pink-50 text-pink-700",
    red:    "bg-red-50 text-red-600",
    gray:   "bg-slate-100 text-slate-600",
    green:  "bg-emerald-50 text-emerald-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${c[color]}`}>
      {children}
    </span>
  );
}

export function Av({ initials, color, size = "md" }: { initials: string; color: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const s = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" };
  return (
    <div className={`${s[size]} rounded-full flex items-center justify-center font-extrabold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}

export function Inp({ label, type = "text", placeholder, value, onChange, icon, hint, error }: {
  label?: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; icon?: React.ReactNode; hint?: string; error?: string;
}) {
  const [show, setShow] = useState(false);
  const t = type === "password" ? (show ? "text" : "password") : type;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-bold text-[#1C1135]">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]">{icon}</div>}
        <input type={t} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          className={`w-full rounded-2xl border ${error ? "border-red-400" : "border-[#E8E5F4]"} bg-[#F5F3FF] px-4 py-3 text-sm text-[#1C1135] placeholder-[#9E95B7] focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all font-medium ${icon ? "pl-11" : ""} ${type === "password" ? "pr-11" : ""}`} />
        {type === "password" && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7] hover:text-violet-600">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && !error && <p className="text-xs text-[#9E95B7] font-medium">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

export function Crd({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <div onClick={onClick} style={style} className={`bg-white rounded-3xl border border-[#E8E5F4] shadow-sm shadow-violet-50 transition-shadow duration-200 ${onClick ? "cursor-pointer hover:shadow-md hover:shadow-violet-100" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-r from-[#F0EEF8] via-[#E8E5F4] to-[#F0EEF8] animate-pulse ${className}`}
      style={{ backgroundSize: "200% 100%", animation: "skeleton-shimmer 1.5s ease-in-out infinite" }} />
  );
}

export function EmptyState({ icon, title, desc, action, onAction }: {
  icon: string; title: string; desc?: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5" style={{ background: "#F5F3FF" }}>{icon}</div>
      <h3 className="font-extrabold text-lg text-[#1C1135] mb-2">{title}</h3>
      {desc && <p className="text-sm text-[#7C6F9A] font-medium max-w-xs leading-relaxed mb-5">{desc}</p>}
      {action && onAction && (
        <button onClick={onAction} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-extrabold text-white transition-all active:scale-[.97] hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #5B21B6, #4C1D95)" }}>
          {action}
        </button>
      )}
    </div>
  );
}

export function StatCard({ icon, value, label, trend, color, bg }: {
  icon: React.ReactNode; value: string; label: string; trend?: string; color: string; bg: string;
}) {
  return (
    <Crd className="p-5 flex items-start gap-4 hover:shadow-md hover:shadow-violet-100 transition-shadow duration-200">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-[#1C1135] leading-none mb-0.5">{value}</p>
        <p className="text-sm text-[#7C6F9A] font-medium">{label}</p>
        {trend && <p className="text-xs font-extrabold mt-1" style={{ color: trend.startsWith("-") ? "#EF4444" : "#059669" }}>{trend}</p>}
      </div>
    </Crd>
  );
}

// Shared ASHI speech bubble — use this everywhere for consistency
export function AshiMsg({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl ${className}`} style={{ background: "#F5F3FF" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #0D9488, #7C3AED)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 2.3v4.4M21.2.1H16.8"/></svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-extrabold uppercase tracking-wider mb-1" style={{ color: "#7C3AED" }}>ASHI</p>
        <p className="text-sm text-[#1C1135] font-medium leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

// ASHI bear mascot SVG
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

// Confetti burst (CSS-only)
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

// Re-export recharts components used across modules
export { AreaChart, Area, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer };
