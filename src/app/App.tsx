import { useState, useRef, useEffect } from "react";
import {
  Home,
  Calendar,
  MessageCircle,
  Users,
  ShoppingBag,
  Star,
  LogOut,
  Search,
  Plus,
  Video,
  FileText,
  BarChart2,
  User,
  Clock,
  ChevronDown,
  X,
  Menu,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronRight,
  Heart,
  Upload,
  Eye,
  EyeOff,
  TrendingUp,
  CreditCard,
  Activity,
  Sparkles,
  PlayCircle,
  Edit,
  Trash2,
  UserPlus,
  Download,
  Send,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Stethoscope,
  RefreshCw,
  ChevronLeft,
  Paperclip,
  Bell,
  HelpCircle,
  TrendingDown,
  Settings,
  Zap,
  Database,
  Shield,
  Cpu,
  Server,
  Wifi,
  Lock,
  Bot,
  Layers,
  GitBranch,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  B,
  View,
  Role,
  Btn,
  Crd,
  Bdg,
  Av,
  StatCard,
  Skeleton,
  EmptyState,
  AshiMsg,
  Isotipo,
  IsotipoWhite,
  AshaKidsLogo,
  Inp,
  kids,
  therapists,
  adminUsers,
  msgs,
  appointments,
  HeroIllustration,
  LoginIllustration,
  Blob,
  Ashi,
  Confetti,
  MobileTopBar,
} from "./shared";
import {
  AdminPanel,
  AdminCuentas,
  AdminTerapeutas,
  AdminOperacion,
  AdminPagos,
  AdminContenido,
  AdminML,
  AdminAuditoria,
  AdminConfig,
} from "./views/Admin";
import {
  MiCaminoAsha,
  TerapeutaHome,
  TerapeutaPacientes,
  TerapeutaAgenda,
  TerapeutaReportes,
  TerapeutaAnaliticas,
  TerapeutaMensajes,
  TerapeutaIngresos,
  TerapeutaValoraciones,
  TerapeutaConfig,
} from "./views/Terapeuta";
import {
  AshaPayCheckout,
  AshaPayHistory,
  AshaPayWallet,
} from "./views/AshaPay";
import { MundoAshaHome } from "./views/Sessions";
import {
  MundoAshaCuentos,
  MundoAshaCanciones,
  MundoAshaTrabalenguas,
  MundoAshaAdivinanzas,
  MundoAshaIsla,
  MundoAshaLaberinto,
  MundoAshaAcademia,
  MundoAshaRetos,
  MundoAshaInsignias,
  MundoAshaPerfil,
} from "./views/SessionsGames";
import {
  TerapeutaDatosActividad,
  AshaSessionHome,
  AshaSessionPrep,
  AshaSessionWaiting,
  AshaSessionActive,
  AshaSessionEnd,
  AshaSessionSummary,
} from "./views/SessionsMeeting";
import { MundoAshaJuegos } from "./MundoAsha";
import {
  PublicEspecialistas,
  PublicEspecialidades,
  PublicMundo,
  PublicRecursos,
  PublicAshi,
  PublicHistorias,
  PublicNosotros,
  PublicPlanes,
  PublicAyuda,
  PublicContacto,
  PublicTrabaja,
  PublicNav,
  PublicFooter,
} from "./views/Public";
import {
  RegisterSelector,
  RegisterPadre,
  RegisterVerify,
  Onboarding,
  RegisterTerapeuta,
  RegisterTerapeutaSuccess,
  TerapeutaLanding,
  ForgotPassword,
} from "./views/Auth";
import {
  PadrePsicologos,
  PadreAgenda,
  PadreMensajes,
  PadreCompras,
  AppointmentRequest,
} from "./views/Padre";
import { EvaluacionInicial } from "./views/EvalInicial";

// ─── Sidebar ───────────────────────────────────────────────────────────────────

function PadreIncidencias({ go }: { go: (v: View) => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("Funcional");
  const [sent, setSent] = useState(false);
  const tipos = ["Funcional", "Visual / Diseño", "Carga / Rendimiento", "Error de datos", "Otro"];
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h2 className="text-xl font-black text-[#1C1135] mb-1">Reportar incidencia</h2>
      <p className="text-sm text-[#7C6F9A] mb-6">Describe el problema que encontraste para que el equipo pueda revisarlo.</p>
      {sent ? (
        <div className="rounded-2xl p-5 flex items-start gap-3" style={{ background: "#D1FAE5", border: "1.5px solid #6EE7B7" }}>
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-extrabold text-green-800">Reporte enviado</p>
            <p className="text-sm text-green-700 mt-1">Tu incidencia fue enviada a la administración. Gracias por ayudarnos a mejorar.</p>
            <button onClick={() => { setSent(false); setTitle(""); setDesc(""); setType("Funcional"); }} className="mt-3 text-xs font-bold text-green-700 underline">Enviar otro reporte</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Título del problema</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: El botón de guardar no responde" className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400" />
          </div>
          <div>
            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Descripción del problema</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5} placeholder="Describe con detalle qué ocurrió, en qué sección, y qué pasos seguiste antes del error..." className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400 resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Tipo de incidencia</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400 bg-white">
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button disabled={!title.trim() || !desc.trim()} onClick={() => setSent(true)} className="w-full py-3 rounded-2xl text-sm font-extrabold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#7C3AED" }}>
            Enviar a administración
          </button>
        </div>
      )}
    </div>
  );
}

function TerapeutaIncidencias({ go }: { go: (v: View) => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("Funcional");
  const [sent, setSent] = useState(false);
  const tipos = ["Funcional", "Visual / Diseño", "Carga / Rendimiento", "Error de datos", "Paciente / Agenda", "Otro"];
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h2 className="text-xl font-black text-[#1C1135] mb-1">Reportar incidencia</h2>
      <p className="text-sm text-[#7C6F9A] mb-6">Describe el problema que encontraste para que el equipo pueda revisarlo.</p>
      {sent ? (
        <div className="rounded-2xl p-5 flex items-start gap-3" style={{ background: "#D1FAE5", border: "1.5px solid #6EE7B7" }}>
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-extrabold text-green-800">Reporte enviado</p>
            <p className="text-sm text-green-700 mt-1">Tu incidencia fue enviada a la administración. Gracias por ayudarnos a mejorar.</p>
            <button onClick={() => { setSent(false); setTitle(""); setDesc(""); setType("Funcional"); }} className="mt-3 text-xs font-bold text-green-700 underline">Enviar otro reporte</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Título del problema</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: No puedo acceder al historial del paciente" className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400" />
          </div>
          <div>
            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Descripción del problema</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5} placeholder="Describe con detalle qué ocurrió, en qué sección, y qué pasos seguiste antes del error..." className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400 resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Tipo de incidencia</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400 bg-white">
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button disabled={!title.trim() || !desc.trim()} onClick={() => setSent(true)} className="w-full py-3 rounded-2xl text-sm font-extrabold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#0D9488" }}>
            Enviar a administración
          </button>
        </div>
      )}
    </div>
  );
}

function Sidebar({
  role,
  cur,
  go,
  logout,
  mobile = false,
  padreUserName = "Laura Gómez",
  padrePlan = "exploracion",
}: {
  role: Role;
  cur: View;
  go: (v: View) => void;
  logout: () => void;
  mobile?: boolean;
  padreUserName?: string;
  padrePlan?: "exploracion" | "familia";
}) {
  const nav =
    role === "padre"
      ? [
          {
            icon: Home,
            label: "Centro Familiar",
            view: "padre" as View,
          },
          {
            icon: Users,
            label: "Mi Camino ASHA",
            view: "padre/camino" as View,
          },
          {
            icon: Calendar,
            label: "Agenda y sesiones",
            view: "padre/agenda" as View,
          },
          {
            icon: UserPlus,
            label: "Terapeutas",
            view: "padre/psicologos" as View,
          },
          {
            icon: MessageCircle,
            label: "Mensajes",
            view: "padre/mensajes" as View,
          },
          {
            icon: FileText,
            label: "Reportes",
            view: "padre/reportes" as View,
          },
          {
            icon: Star,
            label: "Mundo ASHA",
            view: "mundo-asha" as View,
          },
          {
            icon: Settings,
            label: "Configuración",
            view: "padre/config" as View,
          },
          {
            icon: AlertTriangle,
            label: "Incidencias",
            view: "padre/incidencias" as View,
          },
        ]
      : role === "terapeuta"
        ? [
            {
              icon: Home,
              label: "Inicio",
              view: "terapeuta" as View,
            },
            {
              icon: Users,
              label: "Pacientes",
              view: "terapeuta/pacientes" as View,
            },
            {
              icon: Calendar,
              label: "Agenda",
              view: "terapeuta/agenda" as View,
            },
            {
              icon: FileText,
              label: "Reportes",
              view: "terapeuta/reportes" as View,
            },
            {
              icon: BarChart2,
              label: "Analíticas",
              view: "terapeuta/analiticas" as View,
            },
            {
              icon: MessageCircle,
              label: "Mensajes",
              view: "terapeuta/mensajes" as View,
            },
            {
              icon: Star,
              label: "Valoraciones",
              view: "terapeuta/valoraciones" as View,
            },
            {
              icon: Activity,
              label: "Datos de actividad",
              view: "terapeuta/datos-actividad" as View,
            },
            {
              icon: Settings,
              label: "Configuración",
              view: "terapeuta/config" as View,
            },
            {
              icon: AlertTriangle,
              label: "Incidencias",
              view: "terapeuta/incidencias" as View,
            },
          ]
        : [
            {
              icon: BarChart2,
              label: "Dashboard",
              view: "admin/dashboard" as View,
            },
            {
              icon: Users,
              label: "Cuentas",
              view: "admin/cuentas" as View,
            },
            {
              icon: Stethoscope,
              label: "Terapeutas",
              view: "admin/terapeutas" as View,
            },
            {
              icon: Activity,
              label: "Operación",
              view: "admin/operacion" as View,
            },
            {
              icon: Star,
              label: "Contenido",
              view: "admin/contenido" as View,
            },
            {
              icon: Cpu,
              label: "Machine Learning",
              view: "admin/ml" as View,
            },
            {
              icon: Shield,
              label: "Auditoría y seguridad",
              view: "admin/auditoria" as View,
            },
            {
              icon: Settings,
              label: "Configuración",
              view: "admin/config" as View,
            },
          ];

  const user =
    role === "padre"
      ? {
          name: padreUserName,
          sub: "",
          av: padreUserName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
          color: B.violet,
        }
      : role === "terapeuta"
        ? {
            name: "Dra. Ana Ruiz",
            sub: "Terapeuta",
            av: "AR",
            color: B.teal,
          }
        : {
            name: "Administrador",
            sub: "Admin",
            av: "AD",
            color: B.orange,
          };

  return (
    <aside
      className={`${mobile ? "flex flex-1 min-h-0 w-full static" : "hidden md:flex h-screen sticky top-0 border-r border-[#E8E5F4]"} flex-col bg-white overflow-y-auto flex-shrink-0${role === "padre" ? " family-sidebar" : ""}`}
      style={{ width: mobile ? "100%" : 240 }}
    >
      {!mobile && <div className="p-5 pb-4" style={{ position: "relative", zIndex: 1 }}>
        <div className="flex items-center gap-2.5"><Isotipo size={36} /><span className="font-extrabold text-[#1C1135] text-lg tracking-tight">AshaKids</span></div>
      </div>}

      <nav className={`flex-1 min-h-0 overflow-y-auto py-2 flex flex-col gap-0.5 px-3`} style={{ position: "relative", zIndex: 1 }}>
        {nav.map((item) => {
          const active = cur === item.view || (item.view === "admin/dashboard" && cur === "admin");
          return (
            <button
              key={item.view}
              onClick={() => go(item.view)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-150 w-full text-left active:scale-[.98]
                ${
                  active
                    ? "bg-violet-700 text-white shadow-sm shadow-violet-200"
                    : "text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700"
                }`}
            >
              <item.icon
                size={17}
                className={`flex-shrink-0 transition-colors ${active ? "text-white" : "text-[#9E95B7]"}`}
              />
              <span className="truncate">{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      <div className={`shrink-0 px-4 py-4 ${mobile ? "pb-[calc(1rem+env(safe-area-inset-bottom))]" : ""}`} style={{ position: "relative", zIndex: 1 }}>
        <div className="flex items-center gap-3 min-w-0">
          <Av initials={user.av} color={user.color} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1C1135] leading-snug truncate">{user.name}</p>
            {user.sub && <p className="text-xs font-extrabold truncate" style={{ color: user.color }}>{user.sub}</p>}
          </div>
          <button onClick={logout} className="shrink-0 h-11 px-3 inline-flex items-center gap-1.5 rounded-xl text-sm text-[#7C6F9A] hover:bg-red-50 hover:text-red-500 transition-colors font-medium" aria-label="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── ASHI Intelligence ────────────────────────────────────────────────────────

function AshhiFloat({ role }: { role: Role }) {
  const ashiCSS = `
    @keyframes ashi-breathe{0%,100%{box-shadow:0 0 18px rgba(13,148,136,.35)}50%{box-shadow:0 0 34px rgba(13,148,136,.6)}}
    @keyframes ashi-dot{0%,80%,100%{transform:scale(0);opacity:.3}40%{transform:scale(1);opacity:1}}
    @keyframes ashi-up{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes ashi-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    .ashi-breathe{animation:ashi-breathe 3s ease-in-out infinite}
    .ashi-up{animation:ashi-up .28s ease-out forwards}
    .ashi-float{animation:ashi-float 4s ease-in-out infinite}
    .ashi-dot1{animation:ashi-dot 1.4s .0s infinite}
    .ashi-dot2{animation:ashi-dot 1.4s .2s infinite}
    .ashi-dot3{animation:ashi-dot 1.4s .4s infinite}
    @media (prefers-reduced-motion: reduce){.ashi-breathe,.ashi-up,.ashi-float,.ashi-dot1,.ashi-dot2,.ashi-dot3{animation:none!important}}
  `;

  type Msg = {
    from: "ashi" | "user";
    text: string;
    time: string;
    draft?: { id: string; type: "reporte" | "objetivo" };
  };
  type DraftState = { content: string; status: "pendiente" | "aprobado"; editing: boolean };
  const [open, setOpen] = useState(false);
  const ashiTriggerRef = useRef<HTMLButtonElement>(null);
  const closeAshi = () => { setOpen(false); requestAnimationFrame(() => ashiTriggerRef.current?.focus()); };
  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") closeAshi(); };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open]);
  const [tab, setTab] = useState<"home" | "chat">("home");
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [btnBottom, setBtnBottom] = useState(24);
  const [draftStates, setDraftStates] = useState<Record<string, DraftState>>({});
  const [isDragging, setIsDragging] = useState(false);
  const dragData = useRef<{
    startY: number;
    startBottom: number;
  } | null>(null);
  const hasMoved = useRef(false);

  const onBtnPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
  ) => {
    if (open) return;
    hasMoved.current = false;
    dragData.current = {
      startY: e.clientY,
      startBottom: btnBottom,
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onBtnPointerMove = (
    e: React.PointerEvent<HTMLButtonElement>,
  ) => {
    if (!dragData.current) return;
    const dy = dragData.current.startY - e.clientY;
    if (Math.abs(dy) > 4) hasMoved.current = true;
    const next = Math.max(
      12,
      Math.min(
        window.innerHeight - 100,
        dragData.current.startBottom + dy,
      ),
    );
    setBtnBottom(next);
  };
  const onBtnPointerUp = () => {
    setIsDragging(false);
    dragData.current = null;
  };
  const onBtnClick = () => {
    if (!hasMoved.current) setOpen(true);
  };
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "ashi",
      text: "¡Hola! Soy ASHI, tu asistente inteligente en ASHAKids. Estoy aquí para ayudarte en cada paso. ¿En qué te puedo ayudar hoy?",
      time: "Ahora",
    },
  ]);

  const roleCtx = {
    padre: {
      name: "Laura",
      greeting: "¡Hola, Laura! ¿Cómo puedo ayudarte hoy?",
      proactive: [
        "Mateo tiene sesión mañana a las 09:00 con la Dra. Ana Ruiz",
        "Hay una nota disponible del terapeuta para revisar",
        "Encontré 3 actividades sugeridas para Mateo en Mundo ASHA",
      ],
      actions: [
        {
          icon: "❓",
          label: "Preguntas para el terapeuta",
          prompt:
            "¿Qué preguntas puedo hacer al terapeuta sobre el avance de Mateo?",
        },
        {
          icon: "🎮",
          label: "Actividades",
          prompt:
            "¿Qué actividades puedo hacer con Mateo esta semana?",
        },
        {
          icon: "📅",
          label: "Organizar agenda",
          prompt: "Muéstrame la agenda de la próxima semana",
        },
        {
          icon: "📊",
          label: "Ver progreso",
          prompt: "¿Cómo va evolucionando Mateo?",
        },
        {
          icon: "👩‍⚕️",
          label: "Buscar terapeuta",
          prompt: "Ayúdame a encontrar un especialista",
        },
        {
          icon: "💳",
          label: "Resolver pagos",
          prompt: "Tengo una duda sobre un pago",
        },
      ],
      chips: [
        "Preguntas para el terapeuta",
        "Próxima sesión",
        "Actividades para hoy",
        "Progreso de Mateo",
      ],
    },
    terapeuta: {
      name: "Dra. Ana",
      greeting: "¡Hola, Dra. Ana! Soy tu copiloto profesional.",
      proactive: [
        "Tienes 3 sesiones programadas para hoy",
        "Mateo Gómez no tiene reporte de la sesión anterior",
        "Borrador de objetivo pendiente de revisión para B.R.",
      ],
      actions: [
        {
          icon: "📝",
          label: "Crear borrador con ASHI",
          prompt:
            "Ayúdame a crear un borrador para el reporte de la sesión de hoy",
        },
        {
          icon: "🎯",
          label: "Crear borrador de objetivos",
          prompt:
            "Ayúdame a crear un borrador de objetivos terapéuticos",
        },
        {
          icon: "🔍",
          label: "Buscar actividades",
          prompt:
            "Busca actividades para terapia de lenguaje, nivel 2",
        },
        {
          icon: "📊",
          label: "Comparar avances",
          prompt:
            "Compara el progreso de mis pacientes del último mes",
        },
        {
          icon: "📅",
          label: "Preparar sesión",
          prompt:
            "Ayúdame a preparar la próxima sesión con Mateo",
        },
        {
          icon: "✏️",
          label: "Mejorar redacción",
          prompt:
            "Corrige y mejora la redacción de este texto clínico",
        },
      ],
      chips: [
        "Crear borrador de reporte",
        "Crear borrador de objetivos",
        "Buscar actividades",
        "Próxima sesión",
      ],
    },
    admin: {
      name: "Admin",
      greeting:
        "¡Hola! Analizo estados operativos y técnicos. No accedo a contenido clínico.",
      proactive: [
        "3 terapeutas nuevos pendientes de verificación",
        "Detecté un pico de cancelaciones los lunes por la mañana",
        "El módulo Mundo ASHA registró alta actividad esta semana",
      ],
      actions: [
        {
          icon: "📈",
          label: "Detectar tendencias",
          prompt:
            "¿Qué tendencias detectas en la plataforma este mes?",
        },
        {
          icon: "📄",
          label: "Resumen operativo",
          prompt: "Genera un resumen de métricas operativas de julio 2026",
        },
        {
          icon: "🔮",
          label: "Predecir demanda",
          prompt: "¿Cuántas sesiones estimamos para agosto?",
        },
        {
          icon: "⚠️",
          label: "Detectar problemas",
          prompt:
            "¿Hay algún problema operativo que deba atender?",
        },
        {
          icon: "📊",
          label: "Resumir estadísticas",
          prompt: "Resume las métricas clave de esta semana",
        },
        {
          icon: "💡",
          label: "Sugerir mejoras",
          prompt:
            "¿Qué mejoras recomiendas para la plataforma?",
        },
      ],
      chips: [
        "Resumen ejecutivo",
        "Detectar tendencias",
        "Predecir demanda",
        "Problemas operativos",
      ],
    },
  };

  const ctx =
    role === "terapeuta"
      ? roleCtx.terapeuta
      : role === "admin"
        ? roleCtx.admin
        : roleCtx.padre;

  const send = (text: string) => {
    if (!text.trim()) return;
    const t = text.trim();
    setMsgs((m) => [
      ...m,
      { from: "user", text: t, time: "Ahora" },
    ]);
    setInput("");
    setTab("chat");
    setThinking(true);

    const DRAFT_REPORT_CONTENT =
      "Sesión del [fecha]. Área: Articulación y Fonología.\n\nObjetivos trabajados:\n• Producción del sonido /r/ en posición inicial de palabra\n• Discriminación auditiva de pares mínimos\n\nActividades realizadas:\n• Lectura guiada con apoyo visual\n• Imitación fonética con espejo\n• Juego de rimas (nivel 2)\n\nObservaciones: [completar con datos de la sesión]\n\nPróximos pasos: [completar]\n\n⚠️ Contenido de demostración. Completar con datos reales antes de aprobar.";
    const DRAFT_OBJ_CONTENT =
      "Objetivo 1: El/la paciente producirá el sonido /r/ en posición inicial de palabra con ≥80% de precisión en 3 intentos consecutivos.\n\nObjetivo 2: El/la paciente completará secuencias narrativas de 3 pasos con apoyo visual.\n\nObjetivo 3: [Agregar objetivo específico]\n\n⚠️ Contenido de demostración. Revisar y adaptar al perfil del paciente antes de aprobar.";

    const draftTriggers: Record<string, { type: "reporte" | "objetivo"; content: string }> = {
      "Ayúdame a crear un borrador para el reporte de la sesión de hoy": { type: "reporte", content: DRAFT_REPORT_CONTENT },
      "Crear borrador de reporte": { type: "reporte", content: DRAFT_REPORT_CONTENT },
      "Ayúdame a crear un borrador de objetivos terapéuticos": { type: "objetivo", content: DRAFT_OBJ_CONTENT },
      "Crear borrador de objetivos": { type: "objetivo", content: DRAFT_OBJ_CONTENT },
    };

    const replies: Record<string, string> = {
      "¿Qué preguntas puedo hacer al terapeuta sobre el avance de Mateo?":
        "Sugerencia de navegación de ASHI: Preguntas útiles para tu próxima sesión: ¿Qué actividades refuerzan en casa lo trabajado? ¿Con qué frecuencia debería practicar Mateo? ¿Hay señales de progreso que deba observar? ¿Cuándo revisaremos los objetivos actuales? El terapeuta es quien interpreta el progreso clínico.",
      "¿Qué actividades puedo hacer con Mateo esta semana?":
        "Sugerencia de navegación de ASHI: Encontrarás las actividades asignadas por el terapeuta en Mundo ASHA → Actividades de Mateo. Si tienes dudas sobre cuáles hacer o cómo realizarlas, puedes preguntarle al terapeuta en tu próxima sesión.",
      "¿Cómo va evolucionando Mateo?":
        "Sugerencia de navegación de ASHI: Para revisar el avance de Mateo, consulta los reportes de sesión disponibles en tu panel. El análisis del progreso clínico corresponde únicamente al terapeuta. Si tienes preguntas, puedo ayudarte a prepararlas para tu próxima sesión.",
      "¿Qué tendencias detectas en la plataforma este mes?":
        "Detecté 3 tendencias operativas en julio: (1) Las sesiones virtuales crecieron un 18% vs. junio. (2) La hora pico de mayor demanda es entre 09:00 y 11:00 AM. (3) Los usuarios con 4+ sesiones tienen mayor continuidad. Recomiendo ampliar disponibilidad matutina.",
    };
    setTimeout(() => {
      setThinking(false);
      const draftSpec = draftTriggers[t];
      if (draftSpec) {
        const id = `draft-${Date.now()}`;
        setDraftStates((prev) => ({
          ...prev,
          [id]: { content: draftSpec.content, status: "pendiente", editing: false },
        }));
        setMsgs((m) => [
          ...m,
          { from: "ashi", text: "", time: "Ahora", draft: { id, type: draftSpec.type } },
        ]);
      } else {
        const reply =
          replies[t] ||
          "Entendido. Estoy procesando tu solicitud y preparando la mejor respuesta. Dame un momento más mientras analizo el contexto completo de tu pregunta.";
        setMsgs((m) => [
          ...m,
          { from: "ashi", text: reply, time: "Ahora" },
        ]);
      }
    }, 1400);
  };

  const AshiAvatar = ({ size = 36 }: { size?: number }) => (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #0D9488, #7C3AED)",
      }}
    >
      <Sparkles size={size * 0.44} color="white" />
    </div>
  );

  return (
    <>
      <style>{ashiCSS}</style>

      {/* ── Floating button ── */}
      {!open && (
        <>
        <a href="https://wa.me/51986309426?text=Hola%20AshaKids%2C%20necesito%20ayuda." target="_blank" rel="noreferrer" aria-label="Contactar a AshaKids por WhatsApp" className="fixed right-4 sm:right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2" style={{ bottom: `calc(${btnBottom}px + 72px + env(safe-area-inset-bottom))` }}>
          <MessageCircle size={22} fill="currentColor" />
        </a>
        <button
          ref={ashiTriggerRef}
          onPointerDown={onBtnPointerDown}
          onPointerMove={onBtnPointerMove}
          onPointerUp={onBtnPointerUp}
          onClick={onBtnClick}
          aria-label="Abrir asistente ASHI"
          className={`fixed right-4 sm:right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full ashi-breathe ${isDragging ? "" : "ashi-float"}`}
          style={{
            bottom: `calc(${btnBottom}px + env(safe-area-inset-bottom))`,
            background:
              "linear-gradient(135deg, #0a7a71, #5b21b6)",
            boxShadow: "0 8px 32px rgba(13,148,136,.4)",
            cursor: isDragging ? "grabbing" : "grab",
            transform: isDragging ? "scale(1.09)" : "scale(1)",
            transition: isDragging
              ? "transform 0.1s ease"
              : "transform 0.25s ease",
            userSelect: "none",
            touchAction: "none",
          }}
        >
          <div
            className="rounded-full flex items-center justify-center ring-2 ring-white/30"
            style={{
              width: 38,
              height: 38,
              background: "rgba(255,255,255,.15)",
            }}
          >
            <Sparkles size={18} color="white" />
          </div>
          <div className="hidden">
            <p className="text-sm font-black text-white leading-none">
              ASHI
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span
                className="text-xs font-medium"
                style={{ color: "rgba(255,255,255,.75)" }}
              >
                Disponible
              </span>
            </div>
          </div>
        </button>
        </>
      )}

      {/* ── Panel ── */}
      {open && (
        <>
        <button type="button" aria-label="Cerrar asistente ASHI" onClick={closeAshi} className="fixed inset-0 z-40 bg-black/20 sm:hidden" />
        <div
          className="ashi-up fixed inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] z-50 h-[min(65dvh,520px)] w-auto rounded-3xl overflow-hidden flex flex-col sm:inset-auto sm:right-6 sm:top-4 sm:bottom-4 sm:h-auto sm:w-96"
          style={{
            boxShadow:
              "0 24px 80px rgba(13,148,136,.22), 0 4px 24px rgba(0,0,0,.12)",
            background: "white",
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{
              background:
                "linear-gradient(135deg, #0a7a71, #5b21b6)",
            }}
          >
            <AshiAvatar size={40} />
            <div className="flex-1 min-w-0">
              <p className="font-black text-white text-sm leading-none">
                ASHI
              </p>
              <p
                className="text-xs font-medium mt-0.5"
                style={{ color: "rgba(255,255,255,.7)" }}
              >
                Asistente Inteligente · ASHAKids
              </p>
            </div>
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">
                En línea
              </span>
            </div>
            <button
              onClick={closeAshi}
              className="p-1.5 rounded-xl"
              style={{ background: "rgba(255,255,255,.15)" }}
            >
              <X size={15} color="white" />
            </button>
          </div>

          {/* Tabs */}
          <div
            className="flex border-b"
            style={{ borderColor: B.border }}
          >
            {(["home", "chat"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-xs font-extrabold transition-colors"
                style={{
                  color: tab === t ? B.teal : B.textMuted,
                  borderBottom:
                    tab === t
                      ? `2px solid ${B.teal}`
                      : "2px solid transparent",
                }}
              >
                {t === "home" ? "✦ Inicio" : "💬 Conversación"}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* ── HOME tab ── */}
            {tab === "home" && (
              <div className="p-4">
                {/* Greeting */}
                <div className="flex items-start gap-3 mb-4">
                  <AshiAvatar size={32} />
                  <div
                    className="rounded-2xl rounded-tl-sm px-3 py-2.5 flex-1"
                    style={{ background: "#F5F3FF" }}
                  >
                    <p className="text-sm font-bold text-[#1C1135] leading-snug">
                      {ctx.greeting}
                    </p>
                  </div>
                </div>

                {/* ASHI disclaimer */}
                <div className="rounded-2xl px-3 py-2.5 mb-4 border border-[#E8E5F4] flex items-start gap-2">
                  <span className="text-sm flex-shrink-0">ℹ️</span>
                  <p className="text-xs font-medium text-[#7C6F9A] leading-snug">
                    ASHI brinda orientación y apoyo operativo. <span className="font-extrabold text-[#1C1135]">No diagnostica, no prescribe y no sustituye el criterio profesional.</span>
                  </p>
                </div>

                {/* Proactive notifications */}
                <div
                  className="rounded-2xl p-3 mb-4"
                  style={{ background: B.tealLight }}
                >
                  <p
                    className="text-xs font-extrabold mb-2"
                    style={{ color: B.teal }}
                  >
                    ✦ ASHI notó…
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {ctx.proactive.map((n, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: B.teal }}
                        />
                        <p className="text-xs font-medium text-[#1C1135] leading-snug">
                          {n}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action cards */}
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">
                  ¿Qué deseas hacer hoy?
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {ctx.actions.map((a) => (
                    <button
                      key={a.label}
                      onClick={() => send(a.prompt)}
                      className="rounded-2xl p-3 text-left hover:scale-[1.02] transition-all cursor-pointer"
                      style={{
                        background: B.violetLight,
                        border: `1px solid ${B.violetMid}`,
                      }}
                    >
                      <span className="text-lg block mb-1">
                        {a.icon}
                      </span>
                      <span className="text-xs font-extrabold text-[#1C1135] leading-tight">
                        {a.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Quick chips */}
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">
                  Sugerencias rápidas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ctx.chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => send(c)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                      style={{
                        background: B.violetLight,
                        color: B.violet,
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── CHAT tab ── */}
            {tab === "chat" && (
              <div className="p-4 flex flex-col gap-3">
                {msgs.map((m, i) => {
                  /* ── Draft card ── */
                  if (m.draft) {
                    const ds = draftStates[m.draft.id];
                    if (!ds) return null;
                    const isReporte = m.draft.type === "reporte";
                    const approved = ds.status === "aprobado";
                    return (
                      <div key={i} className="flex gap-2.5">
                        <AshiAvatar size={28} />
                        <div
                          className="flex-1 rounded-2xl overflow-hidden"
                          style={{ border: `1.5px solid ${approved ? "#10b981" : B.violetMid}`, borderTopLeftRadius: 4 }}
                        >
                          {/* Draft header */}
                          <div
                            className="px-3 py-2 flex items-center gap-2"
                            style={{ background: approved ? "#d1fae5" : B.violetLight }}
                          >
                            <span className="text-base">{isReporte ? "📝" : "🎯"}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-extrabold text-[#1C1135] leading-none">
                                {isReporte ? "Borrador de reporte" : "Borrador de objetivos"}
                              </p>
                              {approved ? (
                                <p className="text-xs font-bold mt-0.5" style={{ color: "#059669" }}>
                                  ✔ Aprobado por profesional
                                </p>
                              ) : (
                                <p className="text-xs font-medium mt-0.5" style={{ color: B.violet }}>
                                  Borrador generado por ASHI · Requiere revisión profesional
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Draft content */}
                          <div className="px-3 py-2" style={{ background: "#FAFAFA" }}>
                            {ds.editing && !approved ? (
                              <textarea
                                className="w-full text-xs leading-relaxed rounded-xl p-2 resize-none border outline-none focus:ring-1"
                                style={{ minHeight: 120, borderColor: B.violetMid, color: "#1C1135" }}
                                value={ds.content}
                                onChange={(e) =>
                                  setDraftStates((prev) => ({
                                    ...prev,
                                    [m.draft!.id]: { ...prev[m.draft!.id], content: e.target.value },
                                  }))
                                }
                              />
                            ) : (
                              <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "#1C1135" }}>
                                {ds.content}
                              </p>
                            )}
                          </div>
                          {/* Draft actions */}
                          {!approved && (
                            <div className="px-3 py-2 flex gap-2 border-t" style={{ borderColor: B.border, background: "white" }}>
                              <button
                                onClick={() =>
                                  setDraftStates((prev) => ({
                                    ...prev,
                                    [m.draft!.id]: { ...prev[m.draft!.id], editing: !prev[m.draft!.id].editing },
                                  }))
                                }
                                className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all"
                                style={{ background: B.violetLight, color: B.violet, border: `1px solid ${B.violetMid}` }}
                              >
                                {ds.editing ? "Guardar cambios" : "Editar borrador"}
                              </button>
                              <button
                                onClick={() =>
                                  setDraftStates((prev) => ({
                                    ...prev,
                                    [m.draft!.id]: { ...prev[m.draft!.id], status: "aprobado", editing: false },
                                  }))
                                }
                                className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
                                style={{ background: "linear-gradient(135deg, #0D9488, #7C3AED)" }}
                              >
                                Aprobar y guardar
                              </button>
                            </div>
                          )}
                          <p className="text-xs opacity-40 text-right px-3 pb-2 pt-0" style={{ color: B.textMuted }}>
                            {m.time}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  /* ── Normal message ── */
                  return (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${m.from === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {m.from === "ashi" && (
                      <AshiAvatar size={28} />
                    )}
                    <div
                      className="max-w-[80%] rounded-2xl px-3.5 py-2.5"
                      style={
                        m.from === "ashi"
                          ? {
                              background: "#F5F3FF",
                              borderTopLeftRadius: 4,
                            }
                          : {
                              background:
                                "linear-gradient(135deg, #0D9488, #7C3AED)",
                              borderTopRightRadius: 4,
                            }
                      }
                    >
                      <p
                        className="text-xs font-medium leading-relaxed"
                        style={{
                          color:
                            m.from === "ashi"
                              ? "#1C1135"
                              : "white",
                        }}
                      >
                        {m.text}
                      </p>
                      <p
                        className="text-xs mt-1 opacity-50 text-right"
                        style={{
                          color:
                            m.from === "ashi"
                              ? B.textMuted
                              : "white",
                        }}
                      >
                        {m.time}
                      </p>
                    </div>
                  </div>
                  );
                })}

                {thinking && (
                  <div className="flex gap-2.5">
                    <AshiAvatar size={28} />
                    <div
                      className="rounded-2xl px-4 py-3"
                      style={{ background: "#F5F3FF" }}
                    >
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3].map((n) => (
                          <span
                            key={n}
                            className={`w-2 h-2 rounded-full ashi-dot${n}`}
                            style={{ background: B.teal }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick chips in chat */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ctx.chips.slice(0, 3).map((c) => (
                    <button
                      key={c}
                      onClick={() => send(c)}
                      className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: B.violetLight,
                        color: B.violet,
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div
            className="p-3 border-t flex-shrink-0"
            style={{ borderColor: B.border }}
          >
            <div
              className="flex items-end gap-2 rounded-2xl px-3 py-2"
              style={{
                background: B.bg,
                border: `1.5px solid ${B.border}`,
              }}
            >
              <input
                className="flex-1 bg-transparent text-sm font-medium text-[#1C1135] placeholder:text-[#9E95B7] focus:outline-none resize-none"
                placeholder="Pregúntale algo a ASHI…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <div className="flex items-center gap-1">
                <button
                  className="p-1.5 rounded-xl text-[#9E95B7] hover:text-violet-500 transition-colors"
                  title="Adjuntar archivo"
                >
                  <Paperclip size={14} />
                </button>
                <button
                  className="p-1.5 rounded-xl text-[#9E95B7] hover:text-violet-500 transition-colors"
                  title="Voz (próximamente)"
                >
                  <HelpCircle size={14} />
                </button>
                <button
                  onClick={() => send(input)}
                  className="p-1.5 rounded-xl text-white flex-shrink-0 disabled:opacity-40 transition-all"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, #0D9488, #7C3AED)"
                      : B.textMuted,
                  }}
                  disabled={!input.trim()}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
            <p
              className="text-center text-xs mt-1.5 font-medium"
              style={{ color: B.textMuted }}
            >
              ASHI puede cometer errores. Verifica información
              importante.
            </p>
          </div>
        </div>
        </>
      )}
    </>
  );
}

// ─── Persistent Role Sidebars ────────────────────────────────────────────────

function PadreSidebar({ go }: { go: (v: View) => void }) {
  const [activeChild, setActiveChild] = useState(0);
  const [showAddChild, setShowAddChild] = useState(false);
  const calDays: (number | null)[] = [
    null,
    null,
    null,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
  ];
  const apptDays = [30, 2, 6];
  const achievements = [
    { icon: "🏆", name: "1ra sesión", color: B.orange },
    { icon: "🔥", name: "Racha 7d", color: "#EF4444" },
    { icon: "⭐", name: "12 sesiones", color: B.violet },
    { icon: "🎯", name: "Meta ASHA", color: B.teal },
  ];
  return (
    <div
      className="flex flex-col gap-5 p-4 pb-10 overflow-y-auto h-full"
      style={{
        width: "296px",
        borderLeft: `1px solid ${B.border}`,
        background: B.bg,
      }}
    >
      {/* Mis Hijos */}
      <Crd
        className="p-5"
        style={{ background: "rgba(196,181,253,0.3)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-[#1C1135]">
            Mis Hijos
          </h3>
          <Btn
            size="sm"
            variant="secondary"
            onClick={() => setShowAddChild(true)}
          >
            <Plus size={13} /> Agregar
          </Btn>
        </div>
        <div className="flex flex-col gap-1.5">
          {kids.map((k, i) => (
            <button
              key={k.id}
              onClick={() => setActiveChild(i)}
              className={`flex items-center gap-3 p-3 rounded-2xl w-full text-left transition-all border
                ${activeChild === i ? "border-violet-200 bg-violet-50" : "border-transparent hover:bg-[#F5F3FF]"}`}
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: k.bg }}
              >
                {k.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[#1C1135] text-sm">
                  {k.name}
                </p>
                <p className="text-xs text-[#9E95B7] font-medium">
                  {k.age} años · {k.sessions} sesiones
                </p>
                <div
                  className="mt-1.5 h-1.5 rounded-full overflow-hidden"
                  style={{ background: B.violetLight }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${k.progress}%`,
                      background: B.violet,
                    }}
                  />
                </div>
              </div>
              <span
                className="text-xs font-black flex-shrink-0"
                style={{ color: B.violet }}
              >
                {k.progress}%
              </span>
            </button>
          ))}
        </div>
      </Crd>

      {/* Mini calendario */}
      <Crd
        className="p-5"
        style={{ background: "rgba(147,197,253,0.28)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-[#1C1135]">
            Agosto 2026
          </h3>
          <button
            onClick={() => go("padre/agenda")}
            className="text-xs font-bold text-violet-700 hover:underline flex items-center gap-1"
          >
            Agenda <ChevronRight size={11} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center mb-1.5">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div
              key={i}
              className="text-xs font-extrabold text-[#9E95B7] py-0.5"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {calDays.map((d, i) => {
            if (!d)
              return <div key={`e${i}`} className="h-7" />;
            const isToday = d === 30;
            const hasAppt = apptDays.includes(d);
            return (
              <button
                key={d}
                onClick={() => go("padre/agenda")}
                className={`h-7 w-7 mx-auto rounded-full flex items-center justify-center text-xs font-extrabold relative transition-all
                ${isToday ? "text-white" : hasAppt ? "text-violet-700 bg-violet-50 hover:bg-violet-100" : "text-[#7C6F9A] hover:bg-[#F5F3FF]"}`}
                style={isToday ? { background: B.violet } : {}}
              >
                {d}
                {hasAppt && !isToday && (
                  <span
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: B.orange }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Crd>

      {/* Mensajes */}
      <Crd
        className="p-5"
        style={{ background: "rgba(253,186,116,0.28)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-[#1C1135]">
            Mensajes
          </h3>
          <span className="text-xs font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
            2 nuevos
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {msgs.slice(0, 3).map((m) => (
            <button
              key={m.id}
              onClick={() => go("padre/mensajes")}
              className={`flex items-start gap-2.5 p-2.5 rounded-2xl w-full text-left hover:bg-violet-50 transition-colors ${!m.own ? "bg-white/60" : ""}`}
            >
              <Av initials={m.av} color={m.color} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-extrabold text-[#1C1135] truncate">
                    {m.from}
                  </p>
                  <span className="text-xs text-[#9E95B7] font-medium flex-shrink-0">
                    {m.time}
                  </span>
                </div>
                <p className="text-xs text-[#7C6F9A] font-medium truncate">
                  {m.text}
                </p>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => go("padre/mensajes")}
          className="mt-3 w-full py-2 rounded-2xl text-xs font-extrabold text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors flex items-center justify-center gap-1.5"
        >
          <MessageCircle size={13} /> Ver conversación
        </button>
      </Crd>

      {/* Pagos */}
      <button
        onClick={() => go("pay/wallet")}
        className="w-full text-left rounded-3xl overflow-hidden"
      >
        <div
          className="p-5 text-white"
          style={{
            background: `linear-gradient(135deg, ${B.violet} 0%, ${B.violetDark} 100%)`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-extrabold opacity-80">
              💳 Pagos
            </p>
            <CreditCard size={18} className="opacity-60" />
          </div>
          <p className="text-sm font-bold mb-0.5 opacity-90">
            Información de pagos
          </p>
          <p className="text-xs opacity-70 font-medium mb-3">
            Historial y estado de cuenta
          </p>
          <div className="flex justify-between text-xs border-t border-white/10 pt-3">
            <div>
              <p className="opacity-60 font-medium">
                Último pago
              </p>
              <p className="font-extrabold">24 Jul</p>
            </div>
            <div className="text-right">
              <p className="opacity-60 font-medium">
                Próx. factura
              </p>
              <p className="font-extrabold">6 Ago</p>
            </div>
          </div>
        </div>
      </button>

      {/* Últimos Logros */}
      <Crd
        className="p-5"
        style={{ background: "rgba(254,240,138,0.32)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-[#1C1135]">
            Últimos Logros
          </h3>
          <button
            onClick={() => go("mundo-asha/insignias")}
            className="text-xs font-bold text-violet-700 hover:underline"
          >
            Ver todos
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {achievements.map((a) => (
            <button
              key={a.name}
              onClick={() => go("mundo-asha/insignias")}
              className="text-center group"
            >
              <div
                className="w-11 h-11 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-1.5 border-2 border-[#F0EDF8] group-hover:scale-110 transition-transform"
                style={{ background: a.color + "15" }}
              >
                {a.icon}
              </div>
              <p className="text-xs text-[#9E95B7] font-bold leading-tight">
                {a.name}
              </p>
            </button>
          ))}
        </div>
      </Crd>

      {showAddChild && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowAddChild(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-extrabold text-[#1C1135] text-lg mb-4">
              Agregar hijo
            </h3>
            <p className="text-sm text-[#7C6F9A] font-medium mb-4">
              Ingresa el código ASHA de tu hijo para vincularlo.
            </p>
            <input
              placeholder="Código ASHA (ej: M-1234)"
              className="w-full px-4 py-3 rounded-2xl border text-sm font-bold outline-none focus:border-violet-400"
              style={{ borderColor: B.border }}
            />
            <div className="flex gap-2 mt-4">
              <Btn
                variant="secondary"
                className="flex-1 justify-center"
                onClick={() => setShowAddChild(false)}
              >
                Cancelar
              </Btn>
              <Btn
                variant="cta"
                className="flex-1 justify-center"
                onClick={() => setShowAddChild(false)}
              >
                Vincular
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TerapeutaSidebar({ go }: { go: (v: View) => void }) {
  const patients = [
    {
      name: "Mateo Gómez",
      progress: 78,
      av: "MG",
      color: B.violet,
    },
    {
      name: "Valentina López",
      progress: 55,
      av: "VL",
      color: B.teal,
    },
    {
      name: "Bruno Ríos",
      progress: 88,
      av: "BR",
      color: "#22C55E",
    },
    {
      name: "Fernanda Torres",
      progress: 32,
      av: "FT",
      color: B.orange,
    },
  ];
  const pending = [
    { text: "Firmar reporte de Mateo Gómez", urgent: true },
    { text: "Enviar actividades a Rosa López", urgent: false },
    {
      text: "Revisar solicitud de Fernanda Torres",
      urgent: false,
    },
  ];
  return (
    <div
      className="flex flex-col gap-4 p-4 pb-10 overflow-y-auto h-full"
      style={{
        width: "296px",
        borderLeft: `1px solid ${B.border}`,
        background: B.bg,
      }}
    >
      <Crd>
        <div className="p-5 border-b border-[#F5F3FF] flex items-center justify-between">
          <h3 className="font-extrabold text-[#1C1135]">
            Pacientes recientes
          </h3>
          <Bdg color="violet">{patients.length}</Bdg>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {patients.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-3 cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => go("terapeuta/pacientes")}
            >
              <Av initials={p.av} color={p.color} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-[#1C1135] truncate">
                  {p.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div
                    className="h-1.5 rounded-full flex-1"
                    style={{ background: B.violetLight }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${p.progress}%`,
                        backgroundColor: p.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#7C6F9A]">
                    {p.progress}%
                  </span>
                </div>
              </div>
            </div>
          ))}
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => go("terapeuta/pacientes")}
            className="mt-1 justify-center w-full"
          >
            Ver todos <ArrowRight size={12} />
          </Btn>
        </div>
      </Crd>
      <Crd>
        <div className="p-5 border-b border-[#F5F3FF] flex items-center justify-between">
          <h3 className="font-extrabold text-[#1C1135]">
            Pendientes
          </h3>
          <Bdg color="orange">3</Bdg>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {pending.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5"
                style={{
                  borderColor: item.urgent
                    ? B.orange
                    : "#C4B5FD",
                }}
              />
              <div>
                <p className="text-sm text-[#1C1135] font-medium leading-snug">
                  {item.text}
                </p>
                <span
                  className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: item.urgent
                      ? B.orangeLight
                      : B.violetLight,
                    color: item.urgent ? B.orange : B.violet,
                  }}
                >
                  {item.urgent ? "urgente" : "pendiente"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Crd>
    </div>
  );
}

function AdminSidebar({ go }: { go: (v: View) => void }) {
  const recentActivity = [
    {
      icon: "👤",
      text: "Nuevo usuario registrado: Jorge Vargas",
      time: "hace 5 min",
      color: B.violet,
    },
    {
      icon: "🎥",
      text: "Sesión iniciada: Dra. Ana Ruiz + Mateo Gómez",
      time: "hace 8 min",
      color: B.teal,
    },
    {
      icon: "💳",
      text: "Pago recibido: Laura Gómez · $720",
      time: "hace 12 min",
      color: "#059669",
    },
    {
      icon: "⭐",
      text: "Nueva valoración 5★: Andrés Ríos → Dra. Torres",
      time: "hace 18 min",
      color: "#D97706",
    },
    {
      icon: "📝",
      text: "Reporte firmado: Dra. Ana Ruiz → Mateo Gómez",
      time: "hace 25 min",
      color: "#8B5CF6",
    },
  ];
  return (
    <div
      className="flex flex-col gap-4 p-4 pb-10 overflow-y-auto h-full"
      style={{
        width: "296px",
        borderLeft: `1px solid ${B.border}`,
        background: B.bg,
      }}
    >
      <Crd>
        <div className="p-5 border-b border-[#F5F3FF]">
          <h3 className="font-extrabold text-[#1C1135]">
            Actividad reciente
          </h3>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: `${a.color}18` }}
              >
                {a.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#1C1135] font-medium leading-snug">
                  {a.text}
                </p>
                <p className="text-xs text-[#9E95B7] mt-0.5">
                  {a.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Crd>
      <div className="grid grid-cols-2 gap-2">
        {[
          { v: "18", l: "Sesiones hoy", c: B.violet },
          { v: "3",    l: "Pendientes",  c: B.orange },
          { v: "98%",  l: "Uptime",      c: B.teal },
          { v: "—",    l: "Pagos",       c: "#059669" },
        ].map((s) => (
          <div
            key={s.l}
            className="rounded-2xl p-3 text-center border border-[#E8E5F4]"
            style={{ background: B.bg }}
          >
            <p
              className="text-base font-black"
              style={{ color: s.c }}
            >
              {s.v}
            </p>
            <p className="text-xs text-[#9E95B7] font-medium">
              {s.l}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function DashLayout({
  role,
  cur,
  go,
  logout,
  children,
  title,
  padreUserName = "Laura Gómez",
  padrePlan = "exploracion",
}: {
  role: Role;
  cur: View;
  go: (v: View) => void;
  logout: () => void;
  children: React.ReactNode;
  title: string;
  padreUserName?: string;
  padrePlan?: "exploracion" | "familia";
}) {
  const [mob, setMob] = useState(false);
  const mobileMenuButton = useRef<HTMLButtonElement>(null);
  const closeMobileMenu = () => { setMob(false); requestAnimationFrame(() => mobileMenuButton.current?.focus()); };
  useEffect(() => {
    if (!mob) return;
    const previousOverflow = document.body.style.overflow;
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") closeMobileMenu(); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onEscape); };
  }, [mob]);
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: B.bg,
        fontFamily: '"Nunito", system-ui, sans-serif',
      }}
    >
      <Sidebar role={role} cur={cur} go={go} logout={logout} padreUserName={padreUserName} padrePlan={padrePlan} />

      {mob && (
        <div className="md:hidden fixed inset-0 z-40 flex bg-black/50 backdrop-blur-sm">
          <div className={`w-[84vw] max-w-none h-[100dvh] flex flex-col bg-white shadow-2xl flex-shrink-0 animate-in slide-in-from-left duration-200${role === "padre" ? " family-sidebar" : ""}`} style={{ position: "relative", isolation: "isolate", paddingTop: "max(59px, env(safe-area-inset-top))", paddingBottom: "env(safe-area-inset-bottom)" }}>
            <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-3" style={{ position: "relative", zIndex: 1 }}>
              <div className="flex items-center gap-2">
                <Isotipo size={38} />
                <span className="font-extrabold text-[#1C1135] text-sm">
                  AshaKids
                </span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="w-11 h-11 flex items-center justify-center hover:bg-violet-50 rounded-xl transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <Sidebar
              role={role}
              cur={cur}
              go={(v) => {
                go(v);
                closeMobileMenu();
              }}
              logout={logout}
              mobile
              padreUserName={padreUserName}
              padrePlan={padrePlan}
            />
          </div>
          <div
            className="flex-1"
            onClick={closeMobileMenu}
          />
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileTopBar title={title} onMenu={() => setMob(true)} menuOpen={mob} />
        <div className="flex-1 overflow-y-auto flex min-h-0">
          <div className="flex-1 min-w-0 overflow-x-hidden">
            {children}
          </div>

          {/* ── Right context panel (kept for xl screens without role sidebar) ── */}
          {false && (
            <aside className="hidden xl:flex flex-col w-72 flex-shrink-0 border-l border-[#E8E5F4] bg-white overflow-y-auto p-5 gap-5">
              {/* Próxima sesión */}
              <div>
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">
                  Próxima sesión
                </p>
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: `linear-gradient(135deg, ${B.violetDeep}, #4C1D95)`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Video size={14} color="white" />
                    <span className="text-xs font-bold text-white/80">
                      ASHA Session · Virtual
                    </span>
                  </div>
                  <p className="font-extrabold text-white text-sm mb-0.5">
                    {role === "terapeuta"
                      ? "Bruno Ríos"
                      : role === "admin"
                        ? "Revisión Q3"
                        : "Dra. Ana Ruiz"}
                  </p>
                  <p className="text-xs text-white/70 font-medium mb-3">
                    Mañana · 09:00 AM
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        go(
                          role === "terapeuta"
                            ? "terapeuta/agenda"
                            : role === "admin"
                              ? "admin/citas"
                              : "padre/agenda",
                        )
                      }
                      className="flex-1 rounded-xl py-1.5 text-xs font-extrabold text-white border border-white/30 hover:bg-white/10 active:scale-[.97] transition-all"
                    >
                      Ver detalles
                    </button>
                    <button
                      onClick={() => go("session")}
                      className="flex-1 rounded-xl py-1.5 text-xs font-extrabold bg-white hover:bg-white/90 active:scale-[.97] transition-all"
                      style={{ color: B.violet }}
                    >
                      Unirse
                    </button>
                  </div>
                </div>
              </div>

              {/* Actividad reciente */}
              <div>
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">
                  Actividad reciente
                </p>
                <div className="flex flex-col gap-2">
                  {(role === "admin"
                    ? [
                        {
                          icon: "👤",
                          text: "Nuevo terapeuta verificado",
                          time: "Hace 12 min",
                          color: B.teal,
                        },
                        {
                          icon: "💳",
                          text: "Pago procesado — $65.00",
                          time: "Hace 28 min",
                          color: B.success,
                        },
                        {
                          icon: "📅",
                          text: "Cita agendada — Sesión #25",
                          time: "Hace 1h",
                          color: B.violet,
                        },
                        {
                          icon: "⚠️",
                          text: "Reporte de moderación nuevo",
                          time: "Hace 2h",
                          color: B.warning,
                        },
                      ]
                    : role === "terapeuta"
                      ? [
                          {
                            icon: "📝",
                            text: "Reporte de Mateo enviado",
                            time: "Hace 5 min",
                            color: B.violet,
                          },
                          {
                            icon: "📅",
                            text: "Bruno agenda cita nueva",
                            time: "Hace 22 min",
                            color: B.teal,
                          },
                          {
                            icon: "💬",
                            text: "Mensaje de Laura Gómez",
                            time: "Hace 1h",
                            color: B.orange,
                          },
                          {
                            icon: "⭐",
                            text: "Nueva valoración 5★",
                            time: "Hace 3h",
                            color: "#F59E0B",
                          },
                        ]
                      : [
                          {
                            icon: "✅",
                            text: "Sesión #24 completada",
                            time: "Hace 2 días",
                            color: B.success,
                          },
                          {
                            icon: "📄",
                            text: "Nuevo reporte disponible",
                            time: "Hace 2 días",
                            color: B.violet,
                          },
                          {
                            icon: "🎮",
                            text: "Mateo ganó 50 XP en Mundo ASHA",
                            time: "Hace 3 días",
                            color: B.orange,
                          },
                          {
                            icon: "📅",
                            text: "Cita confirmada para mañana",
                            time: "Hace 4 días",
                            color: B.teal,
                          },
                        ]
                  ).map((a, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-violet-50/60 transition-colors cursor-pointer"
                    >
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: `${a.color}18` }}
                      >
                        {a.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#1C1135] leading-snug">
                          {a.text}
                        </p>
                        <p className="text-xs text-[#9E95B7] font-medium">
                          {a.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats rápidas */}
              <div>
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">
                  {role === "admin"
                    ? "Hoy en la plataforma"
                    : role === "terapeuta"
                      ? "Tu semana"
                      : "Progreso de Mateo"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(role === "admin"
                    ? [
                        { v: "18", l: "Sesiones", c: B.violet },
                        { v: "3", l: "Nuevos", c: B.teal },
                        { v: "98%", l: "Uptime", c: B.orange },
                        { v: "—", l: "Pagos", c: B.success },
                      ]
                    : role === "terapeuta"
                      ? [
                          {
                            v: "6",
                            l: "Sesiones",
                            c: B.violet,
                          },
                          {
                            v: "4.9★",
                            l: "Valoración",
                            c: "#F59E0B",
                          },
                          {
                            v: "12",
                            l: "Pacientes",
                            c: B.teal,
                          },
                          {
                            v: "—",
                            l: "Pagos",
                            c: B.success,
                          },
                        ]
                      : [
                          {
                            v: "78%",
                            l: "Progreso",
                            c: B.violet,
                          },
                          { v: "24", l: "Sesiones", c: B.teal },
                          {
                            v: "4.9★",
                            l: "Terapeuta",
                            c: "#F59E0B",
                          },
                          {
                            v: "320",
                            l: "XP ganados",
                            c: B.orange,
                          },
                        ]
                  ).map((s) => (
                    <div
                      key={s.l}
                      className="rounded-2xl p-3 text-center border border-[#E8E5F4]"
                    >
                      <p
                        className="text-base font-black"
                        style={{ color: s.c }}
                      >
                        {s.v}
                      </p>
                      <p className="text-xs text-[#9E95B7] font-medium">
                        {s.l}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ASHI sugerencia */}
              <div
                className="rounded-2xl p-4"
                style={{
                  background: `linear-gradient(135deg, #0a7a71, ${B.violetDeep})`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(255,255,255,.2)",
                    }}
                  >
                    <Sparkles size={11} color="white" />
                  </div>
                  <span className="text-xs font-extrabold text-white">
                    ASHI sugiere
                  </span>
                </div>
                <p
                  className="text-xs font-medium leading-relaxed"
                  style={{ color: "rgba(255,255,255,.8)" }}
                >
                  {role === "admin"
                    ? "Los lunes registran más cancelaciones. Considera enviar recordatorios el domingo por la tarde."
                    : role === "terapeuta"
                      ? "Bruno lleva 2 semanas sin sesión. Un mensaje de seguimiento podría ayudar a retomarlo."
                      : "Mateo tiene 3 actividades nuevas en Mundo ASHA recomendadas por la Dra. Ana. ¡Pruébenlas juntos!"}
                </p>
              </div>
            </aside>
          )}
        </div>
      </main>
      <AshhiFloat role={role} />
    </div>
  );
}

// ─── Landing Page ───────────────────────────────────────────────────────────────

function Landing({ go }: { go: (v: View) => void }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [email, setEmail] = useState("");

  const services = [
    {
      icon: "🗣️",
      title: "Terapia del Lenguaje",
      desc: "Mejora la comunicación verbal, pronunciación y comprensión lingüística desde los 3 años. Nuestros especialistas certificados diseñan planes personalizados para cada niño, integrando tecnología y actividades lúdicas que hacen del aprendizaje una aventura.",
      color: B.violet,
      bg: B.violetLight,
    },
  ];

  const steps = [
    {
      n: "01",
      icon: "📝",
      title: "Crea tu cuenta",
      desc: "Regístrate en minutos y recibe tu código ASHA para acceder a la plataforma.",
    },
    {
      n: "02",
      icon: "🔍",
      title: "Elige tu terapeuta",
      desc: "Explora perfiles de especialistas certificados y encuentra el ideal para tu hijo.",
    },
    {
      n: "03",
      icon: "🎯",
      title: "Reserva y conecta",
      desc: "Agenda sesiones virtuales. Comienza el camino hacia el desarrollo.",
    },
  ];

  const testimonials = [
    {
      name: "Valeria M.",
      child: "Mamá de Lucas, 6 años",
      text: "Poder agendar las sesiones desde el panel y ver las notas del terapeuta después de cada cita nos ayudó a mantenernos organizados y saber en qué actividades enfocarnos en casa.",
      av: "VM",
      color: B.violet,
    },
    {
      name: "Diego R.",
      child: "Papá de Emma, 4 años",
      text: "Las actividades del módulo Mundo ASHA le dan a Emma una rutina de práctica entre sesiones. Nos resulta útil poder comunicarnos con la terapeuta directamente por la plataforma.",
      av: "DR",
      color: B.teal,
    },
    {
      name: "Carolina P.",
      child: "Mamá de Nico, 8 años",
      text: "La agenda virtual nos facilita coordinar horarios sin llamadas de ida y vuelta. El historial de sesiones nos ayuda a recordar qué trabajó el terapeuta en cada cita.",
      av: "CP",
      color: "#EC4899",
    },
  ];

  const faqs = [
    {
      q: "¿A partir de qué edad atienden a los niños?",
      a: "Trabajamos con niños desde los 3 años. Nuestros especialistas adaptan cada terapia a la etapa del desarrollo de tu hijo.",
    },
    {
      q: "¿Cómo funcionan las sesiones virtuales?",
      a: "Las sesiones se realizan por Zoom. Al agendar recibís el enlace automáticamente. Solo necesitás internet y una cámara.",
    },
    {
      q: "¿Cuántas sesiones necesita mi hijo?",
      a: "En la evaluación inicial el terapeuta diseñará un plan personalizado con la frecuencia y duración recomendadas.",
    },
    {
      q: "¿Qué paquetes de horas están disponibles?",
      a: "Ofrecemos paquetes de 2, 6 y 10 horas con vigencia de 6 meses. Cada compra incluye factura PDF automática.",
    },
    {
      q: "¿Puedo ver el progreso de mi hijo?",
      a: "Sí. Tras cada sesión el terapeuta escribe notas clínicas visibles desde tu panel, con el historial completo.",
    },
  ];

  return (
    <div
      style={{
        fontFamily: '"Nunito", system-ui, sans-serif',
        backgroundColor: B.bg,
      }}
    >
      <PublicNav go={go} cur="landing" />

      {/* ── Hero (deep violet) ── */}
      <section
        style={{
          background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 60%, #1E1148 100%)`,
        }}
        className="relative overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
            style={{ background: B.violet }}
          />
          <div
            className="absolute top-20 -right-20 w-72 h-72 rounded-full opacity-10"
            style={{ background: "#9F67FA" }}
          />
          <div
            className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full opacity-5"
            style={{ background: "#DDD6FE" }}
          />
          {/* Dot grid */}
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white opacity-10"
              style={{
                top: 40 + Math.floor(i / 8) * 70,
                left: 40 + (i % 8) * 80,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-bold px-3.5 py-1.5 rounded-full mb-7 backdrop-blur-sm border border-white/20">
                <Sparkles size={12} /> Plataforma de apoyo para terapia de lenguaje infantil
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
                El apoyo que
                <br />
                tu hijo necesita,
                <br />
                <span style={{ color: "#FCA5A5" }}>
                  en un solo lugar
                </span>
              </h1>
              <p className="text-lg text-violet-200 leading-relaxed mb-9 max-w-md font-medium">
                Conecta con terapeutas certificados, agenda
                sesiones virtuales y acompaña el
                desarrollo de tu hijo desde cualquier lugar.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Btn
                  size="lg"
                  variant="cta"
                  onClick={() => go("login")}
                >
                  Iniciar sesión <ArrowRight size={18} />
                </Btn>
              </div>
              <div className="flex items-center gap-8">
                {[
                  ["🗣️", "Terapia del Lenguaje"],
                  ["🎯", "Sesiones personalizadas"],
                  ["🔒", "Privacidad y acompañamiento"],
                ].map(([val, lbl]) => (
                  <div key={lbl}>
                    <p className="text-2xl font-black text-white">
                      {val}
                    </p>
                    <p className="text-xs text-violet-300 font-medium">
                      {lbl}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex justify-end items-center">
              <HeroIllustration />
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z"
              fill={B.bg}
            />
          </svg>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-20" style={{ background: B.bg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <Bdg color="violet">Nuestros Servicios</Bdg>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black text-[#1C1135] tracking-tight leading-tight">
              Terapias especializadas
              <br />
              para cada niño
            </h2>
            <p className="mt-4 text-[#7C6F9A] max-w-xl mx-auto leading-relaxed font-medium">
              Cada niño es único. Nuestros especialistas diseñan
              planes personalizados para potenciar las
              fortalezas de tu hijo.
            </p>
          </div>
          <div>
            {services.map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-3xl border border-[#E8E5F4] p-8 sm:p-10"
              >
                <div className="flex items-center gap-5 mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                    style={{ backgroundColor: s.bg }}
                  >
                    {s.icon}
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#1C1135]">
                    {s.title}
                  </h3>
                </div>
                <p className="text-base text-[#7C6F9A] leading-relaxed font-medium mb-6 max-w-3xl">
                  {s.desc}
                </p>
                <Btn
                  variant="cta"
                  onClick={() => go("login")}
                >
                  Iniciar sesión <ChevronRight size={15} />
                </Btn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        className="py-20"
        style={{ background: B.violetLight }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <Bdg color="violet">¿Cómo funciona?</Bdg>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black text-[#1C1135] tracking-tight">
              Comenzar es muy sencillo
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className="relative text-center"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] right-0 h-px bg-violet-300 z-0" />
                )}
                <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white font-black text-violet-700 text-3xl mb-5 shadow-sm shadow-violet-100">
                  {step.icon}
                </div>
                <div className="text-xs font-black text-violet-400 mb-1 tracking-widest uppercase">
                  {step.n}
                </div>
                <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#7C6F9A] leading-relaxed max-w-xs mx-auto font-medium">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Therapists ── */}
      <section className="py-20" style={{ background: B.bg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <Bdg color="teal">Nuestro Equipo</Bdg>
              <h2 className="mt-3 text-3xl font-black text-[#1C1135] tracking-tight leading-tight">
                Terapeutas certificados
                <br />y comprometidos
              </h2>
            </div>
            <Btn
              variant="outline"
              onClick={() => go("login")}
              className="hidden md:inline-flex"
            >
              Ver todos <ArrowRight size={14} />
            </Btn>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto justify-items-center">
            {therapists.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="w-full max-w-sm bg-white rounded-3xl border border-[#E8E5F4] p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <Av
                      initials={t.av}
                      color={t.color}
                      size="lg"
                    />
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${t.available ? "bg-emerald-400" : "bg-slate-300"}`}
                    />
                  </div>
                  <div>
                    <p className="font-extrabold text-[#1C1135]">
                      {t.name}
                    </p>
                    <p className="text-xs text-[#7C6F9A] font-medium">
                      {t.specialty}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-5">
                  {t.tags.map((tag) => (
                    <Bdg key={tag} color="violet">
                      {tag}
                    </Bdg>
                  ))}
                  <Bdg color="gray">{t.experience}</Bdg>
                </div>
                <div className="flex items-center justify-end">
                  <Btn
                    size="sm"
                    variant={
                      t.available ? "primary" : "outline"
                    }
                    disabled={!t.available}
                    onClick={() => go("login")}
                  >
                    {t.available ? "Agendar" : "No disponible"}
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Historias ilustrativas ── */}
      <section
        className="py-20"
        style={{ background: "#F5F3FF" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Bdg color="orange">Historias ilustrativas</Bdg>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black text-[#1C1135] tracking-tight">
              Cómo una familia podría
              <br />
              usar la plataforma
            </h2>
            <p className="mt-3 text-sm text-[#9E95B7] font-medium italic">
              Ejemplos ficticios para el prototipo · No representan casos clínicos reales
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto justify-items-center">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="w-full max-w-sm bg-white rounded-3xl border border-[#E8E5F4] p-7 flex flex-col gap-4"
              >
                <p className="text-sm text-[#4B4869] leading-relaxed flex-1 font-medium italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E8E5F4]">
                  <Av
                    initials={t.av}
                    color={t.color}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-extrabold text-[#1C1135]">
                      {t.name}
                    </p>
                    <p className="text-xs text-[#9E95B7] font-medium">
                      {t.child}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20" style={{ background: B.bg }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <Bdg color="teal">FAQ</Bdg>
            <h2 className="mt-4 text-3xl font-black text-[#1C1135] tracking-tight">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#E8E5F4] overflow-hidden"
              >
                <button
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-extrabold text-[#1C1135] hover:bg-violet-50 transition-colors text-sm sm:text-base"
                  onClick={() =>
                    setFaqOpen(faqOpen === i ? null : i)
                  }
                >
                  {faq.q}
                  <ChevronDown
                    size={17}
                    className={`text-[#9E95B7] flex-shrink-0 transition-transform duration-200 ${faqOpen === i ? "rotate-180" : ""}`}
                  />
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-[#7C6F9A] leading-relaxed font-medium">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / Newsletter (orange) ── */}
      <section className="py-20" style={{ background: B.bg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className="relative rounded-3xl overflow-hidden px-8 sm:px-16 py-14 text-center text-white"
            style={{
              background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 60%, #6D28D9 100%)`,
            }}
          >
            {/* Decorative blobs */}
            <div
              className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"
              style={{
                background:
                  "radial-gradient(circle, #A78BFA, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-20 translate-x-1/3 translate-y-1/3"
              style={{
                background:
                  "radial-gradient(circle, #7C3AED, transparent 70%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-extrabold"
                style={{
                  background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.2)",
                }}
              >
                ✉️ Newsletter semanal · Gratis
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight leading-tight">
                Consejos de terapia
                <br />
                directamente en tu correo
              </h2>
              <p
                className="mb-8 max-w-md mx-auto leading-relaxed font-medium text-sm"
                style={{ color: "rgba(196,181,253,.9)" }}
              >
                Cada semana, ejercicios y tips de nuestros
                especialistas para estimular el desarrollo de tu
                hijo en casa.
              </p>

              {/* Input row — high contrast */}
              <div className="max-w-lg mx-auto">
                <div
                  className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,.15)",
                    border: "1.5px solid rgba(255,255,255,.3)",
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 bg-white rounded-xl px-4 py-3">
                    <Mail
                      size={16}
                      className="text-[#9E95B7] flex-shrink-0"
                    />
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="peer flex-1 bg-transparent text-sm font-bold text-[#1C1135] placeholder:text-[#9E95B7] caret-[#EA580C] focus:outline-none"
                    />
                    <span aria-hidden="true" className="hidden h-5 w-0.5 rounded-full bg-[#EA580C] animate-pulse peer-focus:block" />
                  </div>
                  <button
                    className="rounded-xl px-6 py-3 font-extrabold text-sm whitespace-nowrap transition-all hover:opacity-90"
                    style={{
                      background: `linear-gradient(135deg, ${B.orange}, #EA580C)`,
                      color: "white",
                    }}
                  >
                    Suscribirme gratis
                  </button>
                </div>
                <p
                  className="text-xs mt-3 font-medium"
                  style={{ color: "rgba(196,181,253,.6)" }}
                >
                  Sin spam. Cancela cuando quieras. Solo información relevante sobre terapia de lenguaje.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter go={go} />
    </div>
  );
}

// ─── Login ─────────────────────────────────────────────────────────────────────

function Login({
  go,
  onLogin,
}: {
  go: (v: View) => void;
  onLogin: (r: Role, v: View, plan?: "exploracion" | "familia") => void;
}) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const tryLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (email.startsWith("a")) onLogin("admin", "admin");
      else if (email.startsWith("t"))
        onLogin("terapeuta", "terapeuta");
      else onLogin("padre", "padre", "familia");
    }, 800);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[48%] flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #1a0b3b 0%, #2D1B69 40%, #4C1D95 75%, #6D28D9 100%)",
        }}
      >
        <style>{`
          @keyframes lf{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
          @keyframes ls{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          @keyframes lp{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.9;transform:scale(1.08)}}
          .lf{animation:lf 5s ease-in-out infinite}.ls{animation:ls 18s linear infinite}.lp{animation:lp 3s ease-in-out infinite}
        `}</style>
        <div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, #A78BFA, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, #7C3AED, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full opacity-10 ls"
          style={{ border: "1px dashed rgba(255,255,255,.4)" }}
        />
        {[
          [60, 90, "🌟", "0s"],
          [310, 60, "✨", "1.2s"],
          [50, 310, "💜", "0.6s"],
          [340, 290, "⭐", "1.8s"],
          [185, 380, "🎯", "2.4s"],
        ].map(([x, y, e, d], i) => (
          <div
            key={i}
            className="absolute text-lg select-none lf"
            style={{
              left: Number(x),
              top: Number(y),
              animationDelay: String(d),
            }}
          >
            {e}
          </div>
        ))}
        <div className="relative z-10 text-white text-center max-w-xs">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,.15)" }}
            >
              <IsotipoWhite size={30} />
            </div>
            <span className="font-black text-2xl tracking-tight">
              AshaKids
            </span>
          </div>
          <div className="lf relative mx-auto mb-8">
            <div
              className="rounded-3xl p-6"
              style={{
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.15)",
              }}
            >
              <LoginIllustration />
            </div>
            <div
              className="absolute -top-3 -right-3 rounded-2xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg,#10B981,#059669)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-white lp inline-block" />
              <span className="text-xs font-extrabold text-white">
                48 especialistas
              </span>
            </div>
            <div
              className="absolute -bottom-3 -left-3 rounded-2xl px-3 py-1.5 shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg,#F97316,#EA580C)",
              }}
            >
              <span className="text-xs font-extrabold text-white">
                ⭐ 4.9 — 1,200 familias
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-black mb-3 leading-snug">
            El acompañamiento
            <br />
            que tu hijo merece
          </h2>
          <p
            className="text-sm font-medium leading-relaxed mb-8"
            style={{ color: "rgba(196,181,253,.85)" }}
          >
            Conecta con los mejores especialistas y sigue el
            progreso de tu hijo en tiempo real.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: "🗣️", l: "Lenguaje" },
              { v: "🎯", l: "Seguimiento" },
              { v: "24/7", l: "Disponible" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl py-2.5 px-2"
                style={{
                  background: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.1)",
                }}
              >
                <p className="text-base font-black text-white">
                  {s.v}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: "rgba(196,181,253,.75)" }}
                >
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#FAFAF9] overflow-y-auto">
        <div className="w-full max-w-sm">
          <button
            onClick={() => go("landing")}
            className="flex items-center gap-1.5 text-sm font-bold text-[#7C6F9A] hover:text-violet-700 mb-8 transition-colors"
          >
            <ChevronLeft size={16} /> Volver al inicio
          </button>
          <div className="lg:hidden mb-6">
            <AshaKidsLogo variant="header" />
          </div>
          <h1 className="text-2xl font-black text-[#1C1135] mb-1">
            Bienvenido de vuelta 👋
          </h1>
          <p className="text-sm text-[#7C6F9A] font-medium mb-7">
            Inicia sesión para continuar tu experiencia.
          </p>

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-extrabold text-[#1C1135] mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-2xl border border-[#E8E5F4] bg-white pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400"
                />
              </div>
            </div>
            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-extrabold text-[#1C1135]">
                  Contraseña
                </label>
                <button
                  onClick={() => go("forgot-password")}
                  className="text-xs font-bold hover:underline"
                  style={{ color: B.violet }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]"
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-[#E8E5F4] bg-white pl-10 pr-10 py-3 text-sm font-medium focus:outline-none focus:border-violet-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]"
                >
                  {showPw ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
            </div>
            {/* Remember */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => setRemember((r) => !r)}
                className="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors"
                style={{
                  borderColor: remember ? B.violet : B.border,
                  background: remember ? B.violet : "white",
                }}
              >
                {remember && <Check size={11} color="white" />}
              </div>
              <span className="text-sm font-medium text-[#7C6F9A]">
                Recordarme
              </span>
            </label>

            <button
              onClick={tryLogin}
              disabled={loading}
              className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
              style={{
                background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})`,
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Ingresando…
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>

          </div>

          {/* Demo shortcuts */}
          <div className="mt-6 p-4 rounded-2xl border border-[#E8E5F4] bg-white">
            <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">
              Acceso rápido de demo
            </p>
            <div className="flex flex-col gap-1">
              {[
                {
                  label: "👨‍👩‍👧‍👦 Padre / Madre — Familia",
                  email: "familia@demo.com",
                  role: "padre" as Role,
                  view: "padre" as View,
                  color: B.violet,
                  plan: "familia" as const,
                },
                {
                  label: "👩‍⚕️ Terapeuta",
                  email: "terapeuta@demo.com",
                  role: "terapeuta" as Role,
                  view: "terapeuta" as View,
                  color: B.teal,
                  plan: "familia" as const,
                },
                {
                  label: "🛡️ Administrador",
                  email: "admin@demo.com",
                  role: "admin" as Role,
                  view: "admin" as View,
                  color: B.orange,
                  plan: "familia" as const,
                },
              ].map((d) => (
                <button
                  key={d.email}
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      onLogin(d.role, d.view, d.plan);
                    }, 600);
                  }}
                  className="flex items-center justify-between text-xs px-3 py-2.5 rounded-xl hover:bg-violet-50 border border-transparent hover:border-[#E8E5F4] transition-all"
                >
                  <span className="font-extrabold text-[#1C1135]">
                    {d.label}
                  </span>
                  <span className="font-bold text-[#9E95B7]">
                    {d.email}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-[#9E95B7] font-medium mt-5">
            El acceso es gestionado por tu administrador ASHA.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Child picker dropdown ──────────────────────────────────────────────────────

function ChildPicker({ activeChild, setActiveChild }: { activeChild: number; setActiveChild: (i: number, changed: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => { document.removeEventListener("mousedown", handleOutside); document.removeEventListener("keydown", handleEsc); };
  }, [open]);

  const current = kids[activeChild];

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Viendo a ${current.name}. Cambiar niño`}
        className="flex items-center gap-2 bg-[#F5F3FF] hover:bg-[#EDE9FE] border border-[#E8E5F4] rounded-2xl px-3 py-2 transition-colors"
        style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
      >
        <span className="text-lg leading-none" aria-hidden="true">{current.emoji}</span>
        <div className="leading-none text-left">
          <p className="text-[10px] text-[#9E95B7] font-bold uppercase tracking-wide leading-none mb-0.5">Viendo</p>
          <p className="text-sm font-extrabold text-[#1C1135] leading-none">{current.name}</p>
        </div>
        <ChevronDown size={14} className={`text-[#9E95B7] transition-transform duration-150 flex-shrink-0 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Seleccionar niño"
          className="absolute left-0 top-full mt-2 bg-white rounded-2xl border border-[#E8E5F4] py-1.5 z-50 min-w-[160px]"
          style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.13), 0 2px 8px rgba(0,0,0,0.07)", fontFamily: '"Nunito", system-ui, sans-serif' }}
        >
          {kids.map((k, i) => (
            <button
              key={k.id}
              role="option"
              aria-selected={activeChild === i}
              onClick={() => { setActiveChild(i, i !== activeChild); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${activeChild === i ? "bg-violet-50" : "hover:bg-[#F5F3FF]"}`}
            >
              <span className="text-lg leading-none" aria-hidden="true">{k.emoji}</span>
              <span className={`text-sm font-bold flex-1 ${activeChild === i ? "text-violet-700" : "text-[#1C1135]"}`}>{k.name}</span>
              {activeChild === i && <Check size={14} className="text-violet-600 flex-shrink-0" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Parent views ───────────────────────────────────────────────────────────────

type PadreNotif = { icon: string; title: string; time: string; color: string; bg: string };

function PadreHome({ go, padreUserName = "Laura Gómez", padrePlan = "exploracion", extraNotifs = [], onNotifsRead }: { go: (v: View) => void; padreUserName?: string; padrePlan?: "exploracion" | "familia"; extraNotifs?: PadreNotif[]; onNotifsRead?: () => void }) {
  const [activeChild, setActiveChild] = useState(0);
  const [childLoading, setChildLoading] = useState(false);
  const handleSetChild = (i: number, changed: boolean) => {
    if (changed) {
      setChildLoading(true);
      setTimeout(() => { setActiveChild(i); setChildLoading(false); }, 1000);
    } else {
      setActiveChild(i);
    }
  };
  const [searchVal, setSearchVal] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifsRead, setNotifsRead] = useState(false);
  const [showReprog, setShowReprog] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showArticle, setShowArticle] = useState<null | {
    icon: string;
    title: string;
    time: string;
  }>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("");
  const [addChildDone, setAddChildDone] = useState(false);
  const [homeToast, setHomeToast] = useState("");

  const staticNotifs: PadreNotif[] = [
    { icon: "📅", title: "Sesión mañana con Dra. Ruiz", time: "En 22 horas", color: B.violet, bg: B.violetLight },
    { icon: "✅", title: "Reporte de sesión disponible", time: "Hace 2 horas", color: B.success, bg: B.successLight },
    { icon: "🎯", title: "Mateo completó 3 actividades", time: "Hace 5 horas", color: B.orange, bg: B.orangeLight },
    { icon: "💬", title: "Mensaje de Dra. Ana Ruiz", time: "Ayer", color: "#2563EB", bg: "#DBEAFE" },
  ];
  const notifs = [...extraNotifs, ...staticNotifs];
  const hasUnread = extraNotifs.length > 0 && !notifsRead;

  const searchIndex: { label: string; view: View }[] = [
    { label: "Mi agenda", view: "padre/agenda" },
    { label: "Especialistas", view: "padre/psicologos" },
    { label: "Progreso", view: "padre/progreso" },
    { label: "Reportes", view: "padre/reportes" },
    { label: "Mensajes", view: "padre/mensajes" },
    { label: "Mundo ASHA", view: "mundo-asha" },
    { label: "Recompensas", view: "padre/recompensas" },
    { label: "Configuración", view: "padre/config" },
  ];
  const searchResults =
    searchVal.trim().length > 1
      ? searchIndex.filter((s) =>
          s.label
            .toLowerCase()
            .includes(searchVal.toLowerCase()),
        )
      : [];

  const child = kids[activeChild];

  const recommendations = [
    {
      world: "🌳",
      name: "Bosque de los Cuentos",
      reason: "Actividad asignada · Mundo ASHA",
      view: "mundo-asha/cuentos" as View,
      color: "#059669",
      bg: "#D1FAE5",
    },
    {
      world: "🎵",
      name: "Montaña Musical",
      reason: "Actividad asignada · Mundo ASHA",
      view: "mundo-asha/canciones" as View,
      color: B.violet,
      bg: B.violetLight,
    },
    {
      world: "🧩",
      name: "Valle de Adivinanzas",
      reason: "Actividad educativa · Mundo ASHA",
      view: "mundo-asha/adivinanzas" as View,
      color: B.orange,
      bg: B.orangeLight,
    },
  ];

  const achievements = [
    { icon: "🏆", name: "1ra sesión", color: B.orange },
    { icon: "🔥", name: "Racha 7d", color: "#EF4444" },
    { icon: "⭐", name: "12 sesiones", color: B.violet },
    { icon: "🎯", name: "Meta ASHA", color: B.teal },
  ];

  const wellnessArticles = [
    {
      icon: "💙",
      title: "Cómo apoyar la terapia en casa",
      time: "5 min",
      color: B.violet,
      bg: B.violetLight,
    },
    {
      icon: "🌿",
      title: "Rutinas que potencian el aprendizaje",
      time: "4 min",
      color: B.teal,
      bg: B.tealLight,
    },
    {
      icon: "🌞",
      title: "Manejo del estrés infantil",
      time: "3 min",
      color: B.orange,
      bg: B.orangeLight,
    },
  ];

  const calDays: (number | null)[] = [
    null,
    null,
    null,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
  ];
  const apptDays = [30, 2, 6];

  return (
    <div
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
      className="relative"
    >
      {childLoading && (
        <>
          <div className="absolute inset-0 z-50 backdrop-blur-sm bg-white/50 rounded-2xl" />
          <div className="fixed inset-0 z-[51] flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-3xl shadow-2xl border border-[#E8E5F4] px-10 py-8 flex flex-col items-center gap-4 pointer-events-auto">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#EDE9FE" }}>
                {kids[activeChild === 0 ? 1 : 0].emoji}
              </div>
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-sm font-extrabold text-[#1C1135]">Cargando datos…</p>
            </div>
          </div>
        </>
      )}
      {/* ─── Desktop Header ─── */}
      <div className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-[#E8E5F4] sticky top-0 z-20 gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black text-[#9E95B7] uppercase tracking-widest">
            Centro Familiar
          </p>
          <h1 className="text-lg font-black text-[#1C1135] leading-tight">
            Buenos días, {padreUserName.split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-[#9E95B7] font-medium">
            Hoy es un gran día para seguir aprendiendo.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Child selector — custom dropdown */}
          {padrePlan === "familia" && <ChildPicker activeChild={activeChild} setActiveChild={handleSetChild} />}

          {/* Search with results dropdown */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]"
            />
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onBlur={() =>
                setTimeout(() => setSearchVal(""), 150)
              }
              placeholder="Buscar en ASHAKids..."
              className="pl-9 pr-4 py-2.5 rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] text-sm text-[#1C1135] placeholder-[#C4BED8] focus:outline-none focus:ring-2 focus:ring-violet-300/30 w-52 font-medium transition-all"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl border border-[#E8E5F4] shadow-xl z-50 py-1 overflow-hidden">
                {searchResults.map((r) => (
                  <button
                    key={r.view}
                    onMouseDown={() => go(r.view)}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#1C1135] hover:bg-[#F5F3FF] flex items-center gap-2 transition-colors"
                  >
                    <Search
                      size={12}
                      className="text-[#9E95B7]"
                    />{" "}
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification bell with dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs((v) => !v);
                setNotifsRead(true);
                onNotifsRead?.();
              }}
              className="relative p-2.5 rounded-2xl border border-[#E8E5F4] bg-white hover:bg-[#F5F3FF] transition-colors"
            >
              <Bell size={17} className="text-[#7C6F9A]" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 border-2 border-white" />
              )}
            </button>
            {showNotifs && (
              <div
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-3xl border border-[#E8E5F4] shadow-2xl z-50 overflow-hidden"
                style={{
                  fontFamily: '"Nunito", system-ui, sans-serif',
                }}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E5F4]">
                  <p className="font-extrabold text-[#1C1135]">
                    Notificaciones
                  </p>
                  <button
                    onClick={() => setShowNotifs(false)}
                    className="text-[#9E95B7] hover:text-[#1C1135] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifs.map((n, i) => (
                    <button
                      key={i}
                      onClick={() => setShowNotifs(false)}
                      className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-[#FAFAF9] transition-colors border-b border-[#F5F3FF] last:border-0 text-left"
                    >
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: n.bg }}
                      >
                        {n.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1C1135] leading-snug">
                          {n.title}
                        </p>
                        <p className="text-xs text-[#9E95B7] font-medium mt-0.5">
                          {n.time}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-[#E8E5F4]">
                  <button
                    onClick={() => setShowNotifs(false)}
                    className="text-xs font-extrabold w-full text-center"
                    style={{ color: B.violet }}
                  >
                    Ver todo el historial
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help → public/ayuda */}
          <button
            onClick={() => go("padre/ayuda")}
            className="p-2.5 rounded-2xl border border-[#E8E5F4] bg-white hover:bg-[#F5F3FF] transition-colors"
            title="Centro de ayuda"
          >
            <HelpCircle size={17} className="text-[#7C6F9A]" />
          </button>

          {/* Avatar */}
          <button
            onClick={() => go("padre/config")}
            title="Mi configuración"
            className="rounded-2xl transition-opacity hover:opacity-75 active:scale-95"
          >
            <Av initials="LG" color={B.violet} size="md" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* ─── Hero Banner ─── */}
        <div
          className="relative rounded-3xl overflow-hidden p-6 sm:p-8 mb-6"
          style={{
            background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 55%, #5B21B6 100%)`,
          }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
            <div className="absolute -bottom-14 -left-14 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute top-3 right-1/3 w-1.5 h-1.5 rounded-full bg-white/30" />
            <div className="absolute bottom-5 right-1/4 w-2.5 h-2.5 rounded-full bg-orange-300/30" />
            <div className="absolute top-8 right-20 text-white/15 text-sm select-none">
              ✦
            </div>
            <div className="absolute bottom-8 right-56 text-white/10 text-xs select-none">
              ✦
            </div>
            <div className="absolute top-16 right-72 text-white/10 text-xs select-none">
              ✦
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-violet-300 text-sm font-bold mb-1.5">
                ¡Hola, {padreUserName.split(" ")[0]}! 🌈
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
                {child.name} tiene nuevas
                <br className="hidden sm:block" /> actividades
                para hoy
              </h2>
              <p className="text-violet-200 text-sm mb-5 font-medium max-w-sm">
                Gestiona la terapia, sigue el progreso y explora
                actividades asignadas por el terapeuta.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Btn
                  variant="cta"
                  onClick={() => go("session")}
                >
                  <Video size={15} /> Ir a sesión
                </Btn>
                <button
                  onClick={() => go("padre/recorrido")}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-white/75 hover:text-white transition-colors"
                >
                  <CheckCircle size={15} /> Mi Camino ASHA
                </button>
              </div>
            </div>
            <div className="hidden sm:flex flex-shrink-0 items-end">
              <Ashi size={110} mood="wave" />
            </div>
          </div>
        </div>

        {/* ─── Progreso terapéutico ─── */}
        <div className="mb-2">
          <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">
            Progreso terapéutico · ¡Pregunta a tu terapeuta cómo va tu progreso!
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-3">
          {[
            {
              icon: <Video size={18} />,
              label: "Sesiones",
              value: "12",
              sub: "este mes",
              color: B.violet,
              bg: B.violetLight,
              nav: "padre/reportes" as View,
              cardBg: "rgba(147,197,253,0.28)",
            },
            {
              icon: <CheckCircle size={18} />,
              label: "Objetivos terapéuticos",
              value: "8/10",
              sub: "informados por terapeuta",
              color: B.teal,
              bg: B.tealLight,
              nav: "padre/reportes" as View,
              cardBg: "rgba(167,243,208,0.32)",
            },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => go(s.nav)}
              className="rounded-3xl border border-[#E8E5F4] shadow-sm shadow-violet-50 p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left active:scale-[.97]"
              style={{ background: s.cardBg }}
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg }}
              >
                <div style={{ color: s.color }}>{s.icon}</div>
              </div>
              <div className="min-w-0">
                <p className="text-xl font-black text-[#1C1135] leading-none">
                  {s.value}
                </p>
                <p className="text-xs font-extrabold text-[#7C6F9A] mt-0.5">
                  {s.label}
                </p>
                <p className="text-xs text-[#9E95B7] font-medium">
                  {s.sub}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* ─── Participación en Mundo ASHA ─── */}
        <div className="mb-2 mt-2">
          <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">
            Participación en Mundo ASHA · Complemento educativo y recreativo
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            {
              icon: <Activity size={18} />,
              label: "Racha de participación",
              value: "7 🔥",
              sub: "días seguidos",
              color: "#EF4444",
              bg: "#FEE2E2",
              nav: "mundo-asha/insignias" as View,
              cardBg: "rgba(252,165,165,0.28)",
              note: "No mide progreso clínico",
            },
            {
              icon: <Star size={18} />,
              label: "Tiempo en Mundo ASHA",
              value: "3h 20m",
              sub: "esta semana",
              color: B.orange,
              bg: B.orangeLight,
              nav: "mundo-asha" as View,
              cardBg: "rgba(254,240,138,0.35)",
              note: "No sustituye el tratamiento",
            },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => go(s.nav)}
              className="rounded-3xl border border-[#E8E5F4] shadow-sm shadow-violet-50 p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left active:scale-[.97]"
              style={{ background: s.cardBg }}
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg }}
              >
                <div style={{ color: s.color }}>{s.icon}</div>
              </div>
              <div className="min-w-0">
                <p className="text-xl font-black text-[#1C1135] leading-none">
                  {s.value}
                </p>
                <p className="text-xs font-extrabold text-[#7C6F9A] mt-0.5">
                  {s.label}
                </p>
                <p className="text-xs text-[#9E95B7] font-medium">
                  {s.sub}
                </p>
                <p className="text-xs font-bold mt-0.5" style={{ color: "#D97706" }}>
                  {s.note}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* ─── Evaluación Inicial pendiente ─── */}
        <div className="mb-5">
          <button
            onClick={() => go("padre/evaluacion")}
            className="w-full rounded-3xl p-5 flex items-center gap-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-2"
            style={{ background: "linear-gradient(135deg, #FEF3C7, #FFFBEB)", borderColor: B.warning + "50" }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: B.warningLight }}>
              📊
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="font-black text-[#1C1135] text-sm">Evaluación Inicial ASHA</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: B.warningLight, color: B.warning }}>Pendiente</span>
              </div>
              <p className="text-xs font-medium text-[#7C6F9A] leading-snug">
                Identifica áreas de comunicación que podrían necesitar atención · 8–12 min
              </p>
            </div>
            <ChevronRight size={16} className="text-[#9E95B7] flex-shrink-0" />
          </button>
        </div>

        {/* ─── Mi Camino ASHA — Journey Stepper ─── */}
        <div className="mb-5">
          <Crd className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-[#1C1135]">Mi Camino ASHA</h3>
                <p className="text-xs text-[#9E95B7] font-medium">Recorrido principal · Paso 7 de 10</p>
              </div>
              <button onClick={() => go("padre/recorrido")} className="text-xs font-bold text-violet-600 hover:underline">Ver detalle →</button>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {[
                { label: "Cuenta",       icon: "👤", status: "completado",  view: "register/padre"     as View },
                { label: "Verificación", icon: "✉️", status: "completado",  view: "register/verify"    as View },
                { label: "Consentimiento",icon:"📋", status: "completado",  view: "padre/consentimiento" as View },
                { label: "Perfil niño",  icon: "🧒", status: "completado",  view: "padre/hijos"        as View },
                { label: "Evaluación",   icon: "📊", status: "pendiente",   view: "padre/evaluacion"   as View },
                { label: "Terapeuta",    icon: "👩‍⚕️",status: "completado",  view: "padre/psicologos"   as View },
                { label: "Vinculación",  icon: "🤝", status: "completado",  view: "padre/psicologos"   as View },
                { label: "Reserva",      icon: "📅", status: "completado",  view: "padre/agenda"       as View },
                { label: "Sesión",       icon: "🎥", status: "en proceso",  view: "session"            as View },
                { label: "Seguimiento",  icon: "📊", status: "pendiente",   view: "padre/seguimiento"  as View },
              ].map((step, i, arr) => {
                const done = step.status === "completado";
                const active = step.status === "en proceso";
                return (
                  <div key={step.label} className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => go(step.view)}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all"
                        style={{
                          background: done ? B.violet : active ? B.teal : "#E8E5F4",
                          boxShadow: active ? `0 0 0 3px ${B.tealLight}` : "none",
                        }}>
                        {done ? <CheckCircle size={16} color="white" /> : <span>{step.icon}</span>}
                      </div>
                      <span className="text-xs font-bold leading-tight text-center whitespace-nowrap"
                        style={{ color: done ? B.violet : active ? B.teal : "#9E95B7" }}>
                        {step.label}
                      </span>
                    </button>
                    {i < arr.length - 1 && (
                      <div className="w-5 h-0.5 flex-shrink-0 rounded-full mb-4"
                        style={{ background: done ? B.violet : "#E8E5F4" }} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full" style={{ background: B.violetLight }}>
                <div className="h-full rounded-full transition-all" style={{ width: "60%", background: B.violet }} />
              </div>
              <span className="text-xs font-extrabold text-[#7C6F9A] whitespace-nowrap">6/10 completados</span>
              <Btn size="sm" variant="primary" onClick={() => go("session")}>
                <Video size={12} /> Ir a sesión
              </Btn>
            </div>
          </Crd>
        </div>

        <div className="flex flex-col gap-5">
          {/* Next session premium card */}
          <Crd
            className="p-5 sm:p-6"
            style={{ background: "rgba(186,230,253,0.35)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-[#1C1135] text-base">
                Próxima Sesión
              </h3>
              <Bdg color="green">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />{" "}
                Confirmada
              </Bdg>
            </div>
            <div className="flex items-start gap-4">
              <Av initials="AR" color={B.violet} size="xl" />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[#1C1135] text-lg leading-tight">
                  Dra. Ana Ruiz
                </p>
                <p className="text-sm text-[#7C6F9A] font-medium mb-3">
                  Terapia del Lenguaje · Mateo
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    ["📅", "Fecha", "30 Jul 2026"],
                    ["🕙", "Hora", "10:00 AM"],
                    ["⏱️", "Duración", "45 min"],
                    ["🎥", "Tipo", "Virtual"],
                  ].map(([icon, lbl, val]) => (
                    <div
                      key={lbl}
                      className="rounded-2xl p-2.5 border border-[#F0EDF8]"
                      style={{ background: B.bg }}
                    >
                      <p className="text-xs text-[#9E95B7] font-bold mb-0.5">
                        {icon} {lbl}
                      </p>
                      <p className="text-sm font-extrabold text-[#1C1135]">
                        {val}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Countdown pill */}
                <div
                  className="rounded-2xl p-3 flex items-center gap-3 mb-4"
                  style={{ background: B.violetLight }}
                >
                  <Clock
                    size={16}
                    style={{ color: B.violet }}
                    className="flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs text-[#7C6F9A] font-bold">
                      La sesión comienza en
                    </p>
                    <p
                      className="text-xl font-black"
                      style={{ color: B.violet }}
                    >
                      08:12:43
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-[#9E95B7] font-medium">
                      Objetivo del día
                    </p>
                    <p className="text-xs font-extrabold text-[#1C1135]">
                      Pronunciación de la R
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Btn
                    variant="cta"
                    size="sm"
                    onClick={() => go("session")}
                  >
                    <Video size={13} /> Entrar
                  </Btn>
                  <Btn
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowReprog(true)}
                  >
                    <RefreshCw size={13} /> Reprogramar
                  </Btn>
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(true)}
                  >
                    <Eye size={13} /> Ver detalles
                  </Btn>
                </div>
              </div>
            </div>
          </Crd>

          {/* Progress card — pure CSS, no recharts */}
          <Crd
            className="p-5 sm:p-6"
            style={{ background: "rgba(254,252,192,0.55)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-[#1C1135]">
                  Progreso de {child.name}
                </h3>
                <p className="text-xs text-[#9E95B7] font-medium">
                  Comparativo mensual · 2026
                </p>
              </div>
              <Bdg color="green">
                <TrendingUp size={11} /> +23% este mes
              </Bdg>
            </div>
            {/* CSS bar chart */}
            {(() => {
              const barData = [
                { mes: "Feb", val: 42 },
                { mes: "Mar", val: 58 },
                { mes: "Abr", val: 51 },
                { mes: "May", val: 67 },
                { mes: "Jun", val: 73 },
                { mes: "Jul", val: 89 },
              ];
              const maxVal = 89;
              const BAR_MAX = 72;
              return (
                <div className="flex items-end gap-2 mb-1" style={{ height: 104 }}>
                  {barData.map((d, idx) => {
                    const barH = Math.max(4, Math.round((d.val / maxVal) * BAR_MAX));
                    const isLast = idx === barData.length - 1;
                    return (
                      <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold" style={{ color: isLast ? B.violet : B.textMuted }}>{d.val}</span>
                        <div className="w-full rounded-t-lg transition-all" style={{ height: barH, background: isLast ? B.violet : B.violetLight }} />
                        <span className="text-xs font-bold" style={{ color: isLast ? B.violet : B.textMuted }}>{d.mes}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#F5F3FF]">
              {[
                { label: "Sesiones", value: "12", icon: "✅" },
                {
                  label: "Objetivos",
                  value: "8 / 10",
                  icon: "🎯",
                },
                {
                  label: "Progreso",
                  value: `${child.progress}%`,
                  icon: "📈",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center p-2 rounded-2xl hover:bg-[#F5F3FF] transition-colors cursor-default"
                >
                  <p className="text-lg font-black text-[#1C1135]">
                    {s.icon} {s.value}
                  </p>
                  <p className="text-xs text-[#9E95B7] font-medium">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Crd>

          {/* Therapist-assigned activities */}
          <div
            className="rounded-3xl p-5 border border-[#d1fae5]"
            style={{ background: "rgba(167,243,208,0.22)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#D1FAE5" }}>
                <FileText size={18} style={{ color: "#059669" }} />
              </div>
              <div>
                <h3 className="font-extrabold text-[#1C1135]">
                  Actividades asignadas por el terapeuta
                </h3>
                <p className="text-xs text-[#9E95B7] font-medium">
                  Dra. Ana Ruiz · Terapia del Lenguaje · Complemento educativo
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {recommendations.map((r) => (
                <button
                  key={r.name}
                  onClick={() => go(r.view)}
                  className="rounded-3xl p-4 text-left border border-[#E8E5F4] bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 group"
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110"
                    style={{ background: r.bg }}
                  >
                    {r.world}
                  </div>
                  <p className="font-extrabold text-[#1C1135] text-sm mb-1 leading-tight">
                    {r.name}
                  </p>
                  <p
                    className="text-xs font-bold mb-2"
                    style={{ color: r.color }}
                  >
                    {r.reason}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-[#9E95B7] font-bold">
                    Explorar <ChevronRight size={11} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Centro de Bienestar */}
          <div
            className="rounded-3xl p-5 border border-[#fed7aa]"
            style={{ background: "rgba(253,186,116,0.18)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-extrabold text-[#1C1135]">
                  Centro de Bienestar
                </h3>
                <p className="text-xs text-[#9E95B7] font-medium">
                  Recursos y artículos para padres
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {wellnessArticles.map((a) => (
                <button
                  key={a.title}
                  onClick={() => setShowArticle(a)}
                  className="bg-white rounded-3xl border border-[#E8E5F4] shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left w-full group active:scale-[.98]"
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: a.bg }}
                  >
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-[#1C1135] text-sm leading-tight">
                      {a.title}
                    </p>
                    <p
                      className="text-xs font-bold mt-0.5"
                      style={{ color: a.color }}
                    >
                      {a.time} de lectura
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-[#C8C2DC] flex-shrink-0 group-hover:text-violet-500 transition-colors"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── ASHI personalized recommendation ─── */}
        <div
          className="mt-5 rounded-3xl p-5 flex items-start gap-4 border border-violet-100"
          style={{ background: B.violetLight }}
        >
          <div className="flex-shrink-0">
            <Ashi size={64} mood="happy" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-[#1C1135] mb-1">
              Sugerencia de navegación de ASHI
            </p>
            <p className="text-sm text-[#7C6F9A] font-medium mb-3 max-w-lg">
              El terapeuta asignó actividades para reforzar en casa. Puedes explorarlas en el Bosque de los Cuentos. Si tienes dudas sobre cuáles realizar, consúltalo en tu próxima sesión.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Btn
                variant="secondary"
                size="sm"
                onClick={() => go("mundo-asha/cuentos")}
              >
                <Star size={13} /> Ir a la actividad
              </Btn>
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => go("padre/mensajes")}
              >
                <MessageCircle size={13} /> Preguntar a la
                terapeuta
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PadreHome Modals ─── */}

      {/* Toast */}
      {homeToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold"
          style={{
            background:
              "linear-gradient(135deg, #059669, #0D9488)",
            fontFamily: '"Nunito", system-ui, sans-serif',
          }}
        >
          <CheckCircle size={16} /> {homeToast}
          <button
            onClick={() => setHomeToast("")}
            className="ml-1 opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Reprogramar */}
      {showReprog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            fontFamily: '"Nunito", system-ui, sans-serif',
          }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowReprog(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135] text-lg">
                Reprogramar sesión
              </h2>
              <button
                onClick={() => setShowReprog(false)}
                className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#7C6F9A] font-medium mb-5">
                Selecciona una nueva fecha para tu sesión con{" "}
                <strong className="text-[#1C1135]">
                  Dra. Ana Ruiz
                </strong>
                .
              </p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  "Mar 5 Ago · 09:00",
                  "Mié 6 Ago · 10:00",
                  "Jue 7 Ago · 11:00",
                  "Vie 8 Ago · 14:00",
                ].map((d) => (
                  <button
                    key={d}
                    className="py-3 rounded-2xl border-2 text-sm font-bold transition-all hover:border-violet-400 hover:bg-violet-50"
                    style={{ borderColor: B.border }}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <Btn
                variant="primary"
                className="w-full justify-center"
                onClick={() => {
                  setShowReprog(false);
                  setHomeToast(
                    "Sesión reprogramada exitosamente",
                  );
                }}
              >
                <RefreshCw size={14} /> Confirmar reprogramación
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Ver detalles */}
      {showDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            fontFamily: '"Nunito", system-ui, sans-serif',
          }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135] text-lg">
                Detalles de la sesión
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <Av initials="AR" color={B.violet} size="xl" />
                <div>
                  <p className="font-extrabold text-xl text-[#1C1135]">
                    Dra. Ana Ruiz
                  </p>
                  <p className="text-sm text-[#7C6F9A] font-medium">
                    Terapia del Lenguaje
                  </p>
                </div>
              </div>
              {[
                ["Paciente", "Mateo"],
                ["Fecha", "30 Jul 2026"],
                ["Hora", "10:00 AM"],
                ["Duración", "45 minutos"],
                ["Modalidad", "Virtual"],
                ["Estado", "Confirmada"],
                ["Objetivo", "Pronunciación de la R"],
              ].map(([l, v]) => (
                <div
                  key={l}
                  className="flex justify-between py-2.5 border-b border-[#F5F3FF] last:border-0"
                >
                  <span className="text-sm font-bold text-[#9E95B7]">
                    {l}
                  </span>
                  <span className="text-sm font-extrabold text-[#1C1135]">
                    {v}
                  </span>
                </div>
              ))}
              <div className="flex gap-3 mt-5">
                <Btn
                  variant="outline"
                  className="flex-1 justify-center"
                  onClick={() => setShowDetails(false)}
                >
                  Cerrar
                </Btn>
                <Btn
                  variant="cta"
                  className="flex-1 justify-center"
                  onClick={() => {
                    setShowDetails(false);
                    go("session");
                  }}
                >
                  <Video size={14} /> Unirse
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article modal */}
      {showArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            fontFamily: '"Nunito", system-ui, sans-serif',
          }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowArticle(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135] text-lg">
                {showArticle.title}
              </h2>
              <button
                onClick={() => setShowArticle(null)}
                className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: B.violetLight,
                    color: B.violet,
                  }}
                >
                  {showArticle.time} de lectura
                </span>
                <span className="text-xs text-[#9E95B7] font-medium">
                  Por el equipo de ASHI · Centro de Bienestar
                </span>
              </div>
              <p className="text-sm text-[#1C1135] font-medium leading-relaxed mb-4">
                El bienestar de tu hijo es una prioridad. Este
                artículo fue preparado por nuestro equipo
                clínico para ayudarte a complementar el trabajo
                terapéutico desde casa.
              </p>
              <p className="text-sm text-[#7C6F9A] font-medium leading-relaxed mb-4">
                Las sesiones de terapia son fundamentales, pero
                el progreso más significativo ocurre cuando los
                aprendizajes se refuerzan en el hogar. Pequeñas
                rutinas diarias pueden marcar una gran
                diferencia en el desarrollo de tu hijo.
              </p>
              <div
                className="rounded-2xl p-4 mb-5"
                style={{ background: B.violetLight }}
              >
                <p
                  className="text-xs font-extrabold uppercase tracking-wider mb-2"
                  style={{ color: B.violet }}
                >
                  Orientación de navegación · ASHI
                </p>
                <ul className="flex flex-col gap-2">
                  {[
                    "Dedica tiempo a las actividades asignadas por el terapeuta",
                    "Consulta con el terapeuta cualquier duda sobre el avance",
                    "El progreso clínico lo interpreta únicamente el terapeuta",
                  ].map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-2 text-sm font-medium text-[#1C1135]"
                    >
                      <CheckCircle
                        size={14}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: B.teal }}
                      />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <Btn
                variant="secondary"
                className="w-full justify-center"
                onClick={() => {
                  setShowArticle(null);
                  go("mundo-asha");
                }}
              >
                <Star size={14} /> Explorar actividades
                relacionadas
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Add child modal */}
      {showAddChild && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            fontFamily: '"Nunito", system-ui, sans-serif',
          }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddChild(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135] text-lg">
                {addChildDone
                  ? "¡Hijo agregado!"
                  : "Agregar hijo"}
              </h2>
              <button
                onClick={() => {
                  setShowAddChild(false);
                  setAddChildDone(false);
                  setNewChildName("");
                  setNewChildAge("");
                }}
                className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              {!addChildDone ? (
                <>
                  <p className="text-sm text-[#7C6F9A] font-medium mb-5">
                    Ingresa los datos de tu hijo/a para comenzar
                    a personalizar su experiencia.
                  </p>
                  <div className="flex flex-col gap-4 mb-5">
                    <Inp
                      label="Nombre del niño/a"
                      placeholder="Ej. Lucas"
                      value={newChildName}
                      onChange={setNewChildName}
                    />
                    <Inp
                      label="Edad"
                      placeholder="Ej. 5"
                      value={newChildAge}
                      onChange={setNewChildAge}
                    />
                    <div>
                      <label className="block text-sm font-bold text-[#1C1135] mb-2">
                        Área de apoyo principal
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Lenguaje",
                          "Articulación",
                          "Fonología",
                          "Comprensión",
                          "Fluidez",
                        ].map((a) => (
                          <button
                            key={a}
                            className="px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all hover:border-violet-400 hover:bg-violet-50"
                            style={{ borderColor: B.border }}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Btn
                    variant="primary"
                    className="w-full justify-center"
                    disabled={!newChildName || !newChildAge}
                    onClick={() => setAddChildDone(true)}
                  >
                    <Plus size={14} /> Agregar hijo
                  </Btn>
                </>
              ) : (
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4"
                    style={{ background: B.successLight }}
                  >
                    🎉
                  </div>
                  <p className="font-extrabold text-xl text-[#1C1135] mb-2">
                    {newChildName} fue agregado
                  </p>
                  <p className="text-sm text-[#7C6F9A] font-medium mb-5">
                    ASHI personalizará las recomendaciones
                    basadas en el perfil de {newChildName}.
                  </p>
                  <Btn
                    variant="primary"
                    className="w-full justify-center"
                    onClick={() => {
                      setShowAddChild(false);
                      setAddChildDone(false);
                      setNewChildName("");
                      setNewChildAge("");
                      setHomeToast(
                        `${newChildName} agregado exitosamente`,
                      );
                    }}
                  >
                    <Check size={14} /> Listo
                  </Btn>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Padre Recorrido (Journey overview) ────────────────────────────────────────

function PadreRecorrido({ go }: { go: (v: View) => void }) {
  const steps = [
    { label: "Cuenta familiar",    icon: "👤", status: "completado",  desc: "Cuenta creada y verificada.",                            view: "register/padre"      as View },
    { label: "Verificación",       icon: "✉️", status: "completado",  desc: "Correo electrónico verificado.",                          view: "register/verify"     as View },
    { label: "Consentimiento",     icon: "📋", status: "completado",  desc: "Consentimiento básico aceptado.",                         view: "padre/consentimiento" as View },
    { label: "Perfil del niño",    icon: "🧒", status: "completado",  desc: "Perfil mínimo creado. El niño no es usuario autónomo.",   view: "padre/hijos"         as View },
    { label: "Evaluación Inicial", icon: "📊", status: "pendiente",   desc: "Cuestionario orientativo de comunicación · 8–12 min.",    view: "padre/evaluacion"    as View },
    { label: "Elegir terapeuta",   icon: "👩‍⚕️",status: "completado",  desc: "Terapeuta aprobado seleccionado del catálogo.",           view: "padre/psicologos"    as View },
    { label: "Vinculación",        icon: "🤝", status: "completado",  desc: "Solicitud aceptada · acceso compartido habilitado.",      view: "padre/psicologos"    as View },
    { label: "Primera reserva",    icon: "📅", status: "completado",  desc: "Cita confirmada con fecha, hora y terapeuta.",            view: "padre/agenda"        as View },
    { label: "Sesión",             icon: "🎥", status: "en proceso",  desc: "Sesión virtual en curso con la Dra. Ana Ruiz.",           view: "session"             as View },
    { label: "Seguimiento",        icon: "📊", status: "pendiente",   desc: "Resumen compartido, actividades asignadas y próxima acción.", view: "padre/seguimiento" as View },
  ];
  const colorMap: Record<string, string> = { completado: "#059669", "en proceso": B.teal, pendiente: "#9E95B7" };
  const bgMap: Record<string, string> = { completado: "#D1FAE5", "en proceso": B.tealLight, pendiente: "#F5F3FF" };
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => go("padre")} className="p-2 rounded-2xl border border-[#E8E5F4] hover:bg-[#F5F3FF] transition-colors">
          <ArrowLeft size={16} className="text-[#7C6F9A]" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-[#1C1135]">Mi Camino ASHA</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Recorrido principal · Datos simulados para demostración</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <button key={step.label} onClick={() => go(step.view)}
            className="flex items-center gap-4 p-4 rounded-2xl border text-left hover:shadow-sm transition-all"
            style={{ background: bgMap[step.status], borderColor: colorMap[step.status] + "40" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
              style={{ background: step.status === "completado" ? "#059669" : step.status === "en proceso" ? B.teal : "#E8E5F4" }}>
              {step.status === "completado" ? <CheckCircle size={18} color="white" /> : step.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-extrabold text-sm text-[#1C1135]">
                  {i + 1}. {step.label}
                </p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: colorMap[step.status] + "20", color: colorMap[step.status] }}>
                  {step.status}
                </span>
              </div>
              <p className="text-xs text-[#7C6F9A] font-medium">{step.desc}</p>
            </div>
            <ChevronRight size={16} className="text-[#9E95B7] flex-shrink-0" />
          </button>
        ))}
      </div>
      <div className="mt-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-3 rounded-full" style={{ background: B.violetLight }}>
            <div className="h-full rounded-full" style={{ width: "60%", background: `linear-gradient(90deg, ${B.violet}, ${B.teal})` }} />
          </div>
          <span className="text-sm font-extrabold text-[#1C1135] whitespace-nowrap">6/10</span>
        </div>
        <p className="text-xs text-center text-[#9E95B7] font-medium">60% del recorrido completado</p>
      </div>
    </div>
  );
}

// ─── Padre Consentimiento (granular) ───────────────────────────────────────────

function PadreConsentimiento({ go }: { go: (v: View) => void }) {
  const [step, setStep] = useState<"representative" | "consents" | "summary" | "done">("representative");

  // Representative declaration
  const [repRelation, setRepRelation] = useState("");
  const [repAuthority, setRepAuthority] = useState(false);

  // Per-consent state
  const [consents, setConsents] = useState({
    dataPerfil: false,     // OBLIGATORIO
    compartirTerapeuta: false, // OBLIGATORIO para atención
    camaraSessiones: false,  // Contextual
    vozActividades: false,   // OPCIONAL
  });

  const toggleConsent = (k: keyof typeof consents) => {
    setConsents(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const mandatoryDone = consents.dataPerfil && consents.compartirTerapeuta;

  const consentItems = [
    {
      key: "dataPerfil" as const,
      required: true,
      icon: "📋",
      label: "Tratamiento de datos para perfil infantil",
      desc: "Permite crear y gestionar el perfil del niño en la plataforma. Necesario para usar el servicio.",
      badge: "OBLIGATORIO",
      badgeColor: "#DC2626",
      badgeBg: "#FEF2F2",
      legal: "Contenido legal pendiente de aprobación",
    },
    {
      key: "compartirTerapeuta" as const,
      required: true,
      icon: "🤝",
      label: "Compartir información con el terapeuta vinculado",
      desc: "El terapeuta aprobado y vinculado accede al expediente clínico durante la vinculación activa. Necesario para la atención terapéutica.",
      badge: "OBLIGATORIO PARA ATENCIÓN",
      badgeColor: "#DC2626",
      badgeBg: "#FEF2F2",
      legal: "Contenido legal pendiente de aprobación",
    },
    {
      key: "camaraSessiones" as const,
      required: false,
      icon: "🎥",
      label: "Cámara y micrófono para sesiones virtuales",
      desc: "Solicitud contextual: se pedirá permiso antes de cada sesión. Puedes gestionar esto desde el dispositivo en cualquier momento.",
      badge: "SOLICITUD CONTEXTUAL",
      badgeColor: "#D97706",
      badgeBg: "#FFFBEB",
      legal: null,
    },
    {
      key: "vozActividades" as const,
      required: false,
      icon: "🎤",
      label: "Uso de voz en actividades de Mundo ASHA",
      desc: "Permite que actividades educativas y recreativas usen el micrófono. Opcional: la mayoría de actividades tienen alternativa sin micrófono.",
      badge: "OPCIONAL",
      badgeColor: "#059669",
      badgeBg: "#D1FAE5",
      legal: null,
    },
  ];

  if (step === "done") return (
    <div className="p-6 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#D1FAE5" }}>
        <CheckCircle size={32} className="text-emerald-600" />
      </div>
      <h2 className="text-2xl font-black text-[#1C1135] mb-2">Preferencias registradas</h2>
      <p className="text-sm text-[#7C6F9A] font-medium mb-2 leading-relaxed">
        Tus consentimientos han quedado registrados. Puedes gestionarlos en cualquier momento desde Configuración → Privacidad.
      </p>
      <div className="rounded-2xl p-3 mb-5 text-left w-full" style={{ background: B.tealLight, border: `1px solid ${B.teal}30` }}>
        <p className="text-xs font-bold text-[#1C1135] mb-1">Resumen · Versión 1.0-demo · {new Date().toLocaleDateString("es", { day:"2-digit", month:"short", year:"numeric" })}</p>
        <div className="flex flex-col gap-1">
          {consentItems.map(c => (
            <div key={c.key} className="flex items-center gap-2 text-xs font-medium text-[#4B4869]">
              <span>{consents[c.key] ? "✅" : "⬜"}</span>
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 w-full">
        <Btn variant="outline" className="flex-1 justify-center" onClick={() => setStep("consents")}>
          Gestionar preferencias
        </Btn>
        <Btn variant="primary" className="flex-1 justify-center" onClick={() => go("padre/hijos")}>
          <ArrowRight size={14} /> Crear perfil del niño
        </Btn>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step === "representative" ? go("padre/recorrido") : setStep(step === "consents" ? "representative" : "consents")}
          className="p-2 rounded-2xl border border-[#E8E5F4] hover:bg-[#F5F3FF]">
          <ArrowLeft size={16} className="text-[#7C6F9A]" />
        </button>
        <div>
          <h2 className="text-xl font-black text-[#1C1135]">Preferencias y consentimientos</h2>
          <p className="text-xs text-[#9E95B7] font-medium">Paso 3 de 9 · Datos simulados para demostración</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {(["representative", "consents", "summary"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
              style={{
                background: step === s ? B.violet : (["representative","consents","summary"].indexOf(step) > i ? "#059669" : "#E8E5F4"),
                color: step === s || ["representative","consents","summary"].indexOf(step) > i ? "white" : "#9E95B7",
              }}>
              {["representative","consents","summary"].indexOf(step) > i ? "✓" : i + 1}
            </div>
            <span className="text-xs font-bold" style={{ color: step === s ? B.violet : "#9E95B7" }}>
              {["Representante", "Consentimientos", "Resumen"][i]}
            </span>
            {i < 2 && <div className="w-6 h-0.5 rounded-full" style={{ background: "#E8E5F4" }} />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Representative Declaration ── */}
      {step === "representative" && (
        <div className="flex flex-col gap-4">
          <Crd className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: B.violetLight }}>
                <User size={18} style={{ color: B.violet }} />
              </div>
              <div>
                <p className="font-extrabold text-[#1C1135]">Declaración del representante</p>
                <p className="text-xs text-[#9E95B7] font-medium">El niño no es un usuario autónomo</p>
              </div>
            </div>
            <div className="rounded-2xl p-3 mb-4" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <p className="text-xs font-bold text-[#92400E]">
                ℹ️ El representante (padre, madre o tutor legal) actúa en nombre del niño. No se implementan múltiples representantes en esta versión; esta función está marcada como pendiente.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wider block mb-1.5">
                  Relación con el niño *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Madre", "Padre", "Tutor legal", "Otro representante autorizado"].map(rel => (
                    <button key={rel}
                      onClick={() => setRepRelation(rel)}
                      className="p-3 rounded-xl text-sm font-bold text-left border transition-all"
                      style={{
                        borderColor: repRelation === rel ? B.violet : "#E8E5F4",
                        background: repRelation === rel ? B.violetLight : "white",
                        color: repRelation === rel ? B.violet : "#4B4869",
                      }}>
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors"
                style={{ borderColor: repAuthority ? B.violet : "#E8E5F4", background: repAuthority ? B.violetLight : "white" }}>
                <input type="checkbox" checked={repAuthority} onChange={e => setRepAuthority(e.target.checked)}
                  className="mt-0.5 accent-violet-600 w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium text-[#1C1135] leading-snug">
                  Confirmo tener autoridad legal para representar al niño, registrarlo en la plataforma y autorizar la compartición de su información con el terapeuta asignado.
                </span>
              </label>
            </div>
          </Crd>
          <Btn variant="primary" className="w-full justify-center"
            disabled={!repRelation || !repAuthority}
            onClick={() => setStep("consents")}>
            Continuar a consentimientos <ArrowRight size={14} />
          </Btn>
        </div>
      )}

      {/* ── Step 2: Granular Consents ── */}
      {step === "consents" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-3" style={{ background: B.tealLight, border: `1px solid ${B.teal}30` }}>
            <p className="text-xs font-bold text-[#065F46]">
              Los consentimientos obligatorios son necesarios para usar el servicio. Los opcionales pueden modificarse en cualquier momento desde Configuración → Privacidad.
            </p>
          </div>
          {consentItems.map(item => (
            <div key={item.key} className="rounded-2xl border p-4 transition-all"
              style={{ borderColor: consents[item.key] ? B.violet : "#E8E5F4", background: consents[item.key] ? B.violetLight : "white" }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-extrabold text-sm text-[#1C1135]">{item.label}</p>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background: item.badgeBg, color: item.badgeColor }}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#7C6F9A] font-medium leading-relaxed mb-2">{item.desc}</p>
                  {item.legal && (
                    <p className="text-xs italic text-[#9E95B7]">⚖️ {item.legal}</p>
                  )}
                </div>
                <button onClick={() => toggleConsent(item.key)}
                  className="w-10 h-6 rounded-full flex items-center px-0.5 transition-all flex-shrink-0 ml-2"
                  style={{
                    background: consents[item.key] ? B.violet : "#D1D5DB",
                    justifyContent: consents[item.key] ? "flex-end" : "flex-start",
                  }}>
                  <span className="w-5 h-5 bg-white rounded-full shadow-sm block" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setStep("representative")}>
              Volver
            </Btn>
            <Btn variant="primary" className="flex-1 justify-center"
              disabled={!mandatoryDone}
              onClick={() => setStep("summary")}>
              Ver resumen <ArrowRight size={14} />
            </Btn>
          </div>
          {!mandatoryDone && (
            <p className="text-xs text-center font-bold" style={{ color: "#DC2626" }}>
              Debes activar los consentimientos obligatorios para continuar.
            </p>
          )}
        </div>
      )}

      {/* ── Step 3: Summary ── */}
      {step === "summary" && (
        <div className="flex flex-col gap-4">
          <Crd className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: B.tealLight }}>
                <FileText size={18} style={{ color: B.teal }} />
              </div>
              <div>
                <p className="font-extrabold text-[#1C1135]">Resumen de consentimientos</p>
                <p className="text-xs text-[#9E95B7] font-medium">Versión 1.0-demo · {new Date().toLocaleDateString("es", { day:"2-digit", month:"long", year:"numeric" })}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {consentItems.map(item => (
                <div key={item.key} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: consents[item.key] ? "#D1FAE5" : "#F5F3FF" }}>
                  <span className="text-lg flex-shrink-0">{consents[item.key] ? "✅" : "⬜"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-[#1C1135]">{item.label}</p>
                    <p className="text-xs font-medium" style={{ color: consents[item.key] ? "#059669" : "#9E95B7" }}>
                      {consents[item.key] ? "Activado" : "No activado"} · {item.badge}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <p className="text-xs font-bold text-[#92400E]">
                Representante: {repRelation} · Autoridad declarada: Sí
              </p>
              <p className="text-xs font-medium text-[#92400E] mt-1">
                Política de retención y detalle jurídico: pendiente de aprobación.
              </p>
            </div>
          </Crd>
          <div className="flex gap-3">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setStep("consents")}>
              Gestionar preferencias
            </Btn>
            <Btn variant="primary" className="flex-1 justify-center" onClick={() => setStep("done")}>
              <CheckCircle size={14} /> Confirmar y continuar
            </Btn>
          </div>
          <p className="text-xs text-center text-[#9E95B7] font-medium italic">
            Los términos legales definitivos se revisarán antes del lanzamiento. Los consentimientos opcionales pueden revocarse en cualquier momento.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Padre Seguimiento (post-session follow-up) ────────────────────────────────

function PadreSeguimiento({ go }: { go: (v: View) => void }) {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => go("padre")} className="p-2 rounded-2xl border border-[#E8E5F4] hover:bg-[#F5F3FF]">
          <ArrowLeft size={16} className="text-[#7C6F9A]" />
        </button>
        <div>
          <h2 className="text-xl font-black text-[#1C1135]">Seguimiento familiar</h2>
          <p className="text-xs text-[#9E95B7] font-medium">Paso 9 de 9 · Datos simulados para demostración</p>
        </div>
      </div>
      {/* Summary shared by therapist */}
      <Crd className="p-5 mb-4" style={{ background: "rgba(186,230,253,0.3)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Av initials="AR" color={B.violet} size="sm" />
          <div>
            <p className="font-extrabold text-sm text-[#1C1135]">Dra. Ana Ruiz</p>
            <p className="text-xs text-[#9E95B7] font-medium">Resumen compartido · Sesión del 30 Jul 2026</p>
          </div>
          <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>Compartido</span>
        </div>
        <p className="text-sm text-[#4B4869] font-medium leading-relaxed mb-3">
          La sesión se centró en ejercicios de articulación de sílabas iniciales. Mateo mostró buena concentración y participó activamente. Se trabajaron los sonidos de la R en posición inicial y media.
        </p>
        <p className="text-xs text-[#9E95B7] italic">Este resumen fue preparado por la terapeuta. Las notas clínicas completas son de acceso exclusivo del profesional.</p>
      </Crd>
      {/* Assigned activities */}
      <Crd className="p-5 mb-4">
        <h4 className="font-extrabold text-[#1C1135] mb-3">🎯 Actividades asignadas para casa</h4>
        <div className="flex flex-col gap-2">
          {[
            { title: "Trabalenguas con R",          world: "Bosque de los Cuentos",  time: "5 min",  view: "mundo-asha/trabalenguas" as View },
            { title: "Canción de los sonidos",       world: "Montaña Musical",        time: "3 min",  view: "mundo-asha/canciones"    as View },
            { title: "Adivinanzas de animales",      world: "Valle de Adivinanzas",   time: "4 min",  view: "mundo-asha/adivinanzas"  as View },
          ].map(a => (
            <button key={a.title} onClick={() => go(a.view)}
              className="flex items-center gap-3 p-3 rounded-2xl border border-[#E8E5F4] hover:bg-[#F5F3FF] transition-colors text-left">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ background: B.violetLight }}>🎮</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-[#1C1135]">{a.title}</p>
                <p className="text-xs text-[#9E95B7] font-medium">{a.world} · {a.time}</p>
              </div>
              <ChevronRight size={14} className="text-[#9E95B7]" />
            </button>
          ))}
        </div>
        <p className="text-xs text-[#9E95B7] italic mt-3">Las actividades son de apoyo educativo. No reemplazan la intervención del terapeuta.</p>
      </Crd>
      {/* Next step */}
      <Crd className="p-5">
        <h4 className="font-extrabold text-[#1C1135] mb-3">📅 Próxima acción</h4>
        <div className="flex items-center gap-4 p-3 rounded-2xl border border-[#E8E5F4]" style={{ background: B.violetLight }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: B.violet }}>
            <Calendar size={18} color="white" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-sm text-[#1C1135]">Próxima sesión: 6 Ago 2026 · 10:00 AM</p>
            <p className="text-xs text-[#7C6F9A] font-medium">Dra. Ana Ruiz · Virtual · 45 min</p>
          </div>
          <Btn size="sm" variant="primary" onClick={() => go("padre/agenda")}>Ver agenda</Btn>
        </div>
        <div className="flex gap-2 mt-3">
          <Btn variant="outline" className="flex-1 justify-center" size="sm" onClick={() => go("padre/mensajes")}>
            <MessageCircle size={13} /> Escribir al terapeuta
          </Btn>
          <Btn variant="ghost" className="flex-1 justify-center" size="sm" onClick={() => go("padre/camino")}>
            <TrendingUp size={13} /> Ver progreso
          </Btn>
        </div>
      </Crd>
    </div>
  );
}

// ─── Padre Reportes ────────────────────────────────────────────────────────────

function PadreReportes() {
  const [tab, setTab] = useState<"sesiones" | "progreso">(
    "sesiones",
  );
  const [toast, setToast] = useState("");
  const [openSession, setOpenSession] = useState<number | null>(
    null,
  );
  const [reportViewId, setReportViewId] = useState<
    number | null
  >(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const sessions = [
    {
      id: 1,
      date: "30 Jul 2026",
      time: "10:00 AM",
      duration: "45 min",
      therapist: "Dra. Ana Ruiz",
      type: "virtual",
      goals: ["Pronunciación R", "Comprensión verbal"],
      notes:
        "Excelente progreso en R inicial. Se recomienda repetir ejercicios en casa.",
    },
    {
      id: 2,
      date: "23 Jul 2026",
      time: "10:00 AM",
      duration: "45 min",
      therapist: "Dra. Ana Ruiz",
      type: "virtual",
      goals: ["Vocabulario", "Lenguaje expresivo"],
      notes:
        "Amplió vocabulario a 12 nuevas palabras. Participó activamente.",
    },
    {
      id: 3,
      date: "16 Jul 2026",
      time: "10:30 AM",
      duration: "40 min",
      therapist: "Dra. Ana Ruiz",
      type: "virtual",
      goals: ["Atención sostenida", "Comprensión"],
      notes:
        "Mejoró 15% en tiempo de atención sostenida. Excelente concentración.",
    },
    {
      id: 4,
      date: "9 Jul 2026",
      time: "10:00 AM",
      duration: "45 min",
      therapist: "Dra. Ana Ruiz",
      type: "virtual",
      goals: ["Pronunciación R", "Lectura"],
      notes:
        "Leyó su primer cuento completo. Gran logro emocional para la familia.",
    },
    {
      id: 5,
      date: "2 Jul 2026",
      time: "10:00 AM",
      duration: "45 min",
      therapist: "Dra. Ana Ruiz",
      type: "virtual",
      goals: ["Vocabulario", "Comprensión verbal"],
      notes:
        "Trabajó con tarjetas de imágenes. Identificó 20 nuevas palabras.",
    },
    {
      id: 6,
      date: "25 Jun 2026",
      time: "10:30 AM",
      duration: "40 min",
      therapist: "Dra. Ana Ruiz",
      type: "virtual",
      goals: ["Lenguaje expresivo", "Frases"],
      notes:
        "Construyó frases de 5-6 palabras con estructura correcta.",
    },
  ];

  const reports = [
    {
      id: 1,
      title: "Informe Mensual — Julio 2026",
      date: "31 Jul 2026",
      therapist: "Dra. Ana Ruiz",
      status: "completado",
      summary:
        "Avance significativo en pronunciación y comprensión verbal. Racha de 7 días activos en Mundo ASHA.",
      fav: true,
    },
    {
      id: 2,
      title: "Informe Mensual — Junio 2026",
      date: "30 Jun 2026",
      therapist: "Dra. Ana Ruiz",
      status: "completado",
      summary:
        "Vocabulario expresivo alcanzó el 90%. Se completó el objetivo de lenguaje receptivo del plan mensual.",
      fav: false,
    },
    {
      id: 3,
      title: "Evaluación Inicial — Enero 2026",
      date: "15 Ene 2026",
      therapist: "Dra. Ana Ruiz",
      status: "completado",
      summary:
        "Diagnóstico funcional de inicio. Línea base establecida para plan terapéutico individualizado.",
      fav: true,
    },
    {
      id: 4,
      title: "Plan Terapéutico Q3 2026",
      date: "1 Jul 2026",
      therapist: "Dra. Ana Ruiz",
      status: "activo",
      summary:
        "Objetivos para el tercer trimestre: pronunciación avanzada, comprensión verbal y lenguaje expresivo.",
      fav: false,
    },
  ];

  const selectedReport =
    reportViewId !== null
      ? (reports.find((r) => r.id === reportViewId) ?? null)
      : null;
  const downloadPdf = (filename: string, title: string, lines: string[]) => {
    const safe = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[\\()]/g, "\\$&");
    const body = ["BT", "/F1 18 Tf", "50 790 Td", `(${safe(title)}) Tj`, "/F1 10 Tf",
      ...lines.slice(0, 40).flatMap(l => ["0 -20 Td", `(${safe(l)}) Tj`]), "ET"].join("\n");
    const objs = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      `<< /Length ${body.length} >>\nstream\n${body}\nendstream`];
    const offsets: number[] = []; let pdf = "%PDF-1.4\n";
    objs.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map(o => `${String(o).padStart(10, "0")} 00000 n \n`).join("") +
      `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const a = document.createElement("a");
    const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadReport = (r: (typeof reports)[0]) => {
    downloadPdf(`informe-${r.id}.pdf`, r.title, [
      `Fecha: ${r.date}`, `Terapeuta: ${r.therapist}`, `Estado: ${r.status}`,
      `Paciente: Mateo Gomez  7 anos`, "", "Resumen:", r.summary, "",
      "Objetivos del periodo:", "  - Pronunciacion y articulacion", "  - Comprension verbal y vocabulario",
      "  - Lenguaje expresivo funcional", "", "Observaciones:", "  Avance consistente segun plan terapeutico.",
      "  Se recomienda continuar con actividades en Mundo ASHA.", "", "Firma digital: Dra. Ana Ruiz - ASHAKids",
    ]);
    showToast(`Descargando "${r.title}"...`);
  };

  return (
    <div
      className="p-4 sm:p-6 max-w-3xl"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold"
          style={{
            background:
              "linear-gradient(135deg,#059669,#0D9488)",
          }}
        >
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Report modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5F4] flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg,#6D28D9,#0D9488)",
              }}
            >
              <div>
                <p
                  className="text-[11px] font-black uppercase tracking-widest mb-0.5"
                  style={{ color: "rgba(255,255,255,.7)" }}
                >
                  Informe completo · ASHAKids
                </p>
                <h2 className="font-extrabold text-white text-lg leading-tight">
                  {selectedReport.title}
                </h2>
                <p
                  className="text-sm font-medium mt-0.5"
                  style={{ color: "rgba(255,255,255,.75)" }}
                >
                  {selectedReport.date} ·{" "}
                  {selectedReport.therapist}
                </p>
              </div>
              <button
                onClick={() => setReportViewId(null)}
                className="p-2 rounded-xl flex-shrink-0"
                style={{ background: "rgba(255,255,255,.15)" }}
              >
                <X size={17} color="white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-xs font-bold text-[#9E95B7] uppercase tracking-wider">
                Paciente: Mateo Gómez · 7 años · Terapia del
                Lenguaje
              </p>
              {[
                {
                  title: "Resumen Ejecutivo",
                  content: selectedReport.summary,
                },
                {
                  title: "Objetivos Trabajados",
                  content:
                    "Pronunciación de la R en posición inicial e intervocálica. Comprensión verbal con imágenes secuenciales. Vocabulario temático: animales y colores.",
                },
                {
                  title: "Observaciones Clínicas",
                  content:
                    "Mateo mostró alta motivación durante las actividades lúdicas. Se observó mayor tiempo de atención sostenida (hasta 8 min vs 5 min inicial). La racha de 7 días en Mundo ASHA correlaciona positivamente con el avance fonológico.",
                },
                {
                  title: "Recomendaciones para Casa",
                  content:
                    "Practicar 10–15 minutos diarios de lectura en voz alta. Usar los cuentos del Bosque ASHA. Celebrar cada pequeño logro para reforzar la autoconfianza.",
                },
              ].map((s) => (
                <div
                  key={s.title}
                  className="rounded-2xl p-4"
                  style={{ background: B.bg }}
                >
                  <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-1.5">
                    {s.title}
                  </p>
                  <p className="text-sm font-medium text-[#4B4264] leading-relaxed">
                    {s.content}
                  </p>
                </div>
              ))}
              <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-1.5">
                  Firma Digital
                </p>
                <p className="text-sm font-medium text-[#1C1135]">
                  Firmado por:{" "}
                  <strong>{selectedReport.therapist}</strong>
                </p>
                <p className="text-xs text-[#9E95B7] font-medium mt-0.5">
                  Matrícula profesional: TP-2847 ·{" "}
                  {selectedReport.date}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E8E5F4] flex gap-3 flex-shrink-0">
              <button
                onClick={() => setReportViewId(null)}
                className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-violet-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => downloadReport(selectedReport)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-colors"
                style={{ background: B.violet }}
              >
                <Download size={14} /> Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1C1135]">
          Reportes de Mateo
        </h1>
        <p className="text-sm text-[#7C6F9A] font-medium">
          Historial de sesiones e informes mensuales de la Dra.
          Ana Ruiz.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { v: "24", l: "Sesiones totales" },
          { v: "78%", l: "Progreso general" },
          { v: "4.9★", l: "Valoración terapeuta" },
        ].map((s) => (
          <div
            key={s.l}
            className="bg-white rounded-2xl p-4 border border-[#E8E5F4] text-center"
          >
            <p
              className="text-xl font-black"
              style={{ color: B.violet }}
            >
              {s.v}
            </p>
            <p className="text-xs text-[#7C6F9A] font-medium">
              {s.l}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 bg-white border border-[#E8E5F4] rounded-2xl p-1">
        {(
          [
            ["sesiones", "🎥 Sesiones"],
            ["progreso", "📊 Progreso Mensual"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 py-2 rounded-xl text-sm font-extrabold transition-all"
            style={{
              background: tab === id ? B.violet : "transparent",
              color: tab === id ? "white" : B.textMid,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sesiones tab */}
      {tab === "sesiones" && (
        <div className="flex flex-col gap-3">
          {sessions.map((s, i) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-[#E8E5F4] overflow-hidden"
            >
              <button
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-violet-50/40 transition-colors"
                onClick={() =>
                  setOpenSession(openSession === i ? null : i)
                }
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background:
                      s.type === "virtual"
                        ? B.violetLight
                        : B.tealLight,
                  }}
                >
                  {s.type === "virtual" ? "🎥" : "🏥"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          s.type === "virtual"
                            ? B.violetLight
                            : B.tealLight,
                        color:
                          s.type === "virtual"
                            ? B.violet
                            : B.teal,
                      }}
                    >
                      {s.type}
                    </span>
                    <span className="text-xs text-[#9E95B7] font-medium">
                      {s.duration}
                    </span>
                  </div>
                  <p className="font-extrabold text-sm text-[#1C1135]">
                    {s.date} · {s.time}
                  </p>
                  <p className="text-xs text-[#7C6F9A] font-medium">
                    {s.therapist}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-[#9E95B7] flex-shrink-0"
                  style={{
                    transform:
                      openSession === i
                        ? "rotate(90deg)"
                        : "none",
                    transition: "transform .2s",
                  }}
                />
              </button>
              {openSession === i && (
                <div className="px-4 pb-4 border-t border-[#E8E5F4]">
                  <div className="mt-3 mb-3">
                    <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">
                      Objetivos trabajados
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.goals.map((g) => (
                        <span
                          key={g}
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{
                            background: B.violetLight,
                            color: B.violet,
                          }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    className="rounded-2xl p-3 mb-3"
                    style={{ background: B.bg }}
                  >
                    <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-1">
                      Notas clínicas
                    </p>
                    <p className="text-sm text-[#4B4264] font-medium leading-relaxed">
                      {s.notes}
                    </p>
                  </div>
                  <Btn
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      downloadPdf(`sesion-${s.id}.pdf`, `Sesion ${s.date}`, [
                        `Fecha: ${s.date}  Hora: ${s.time}  Duracion: ${s.duration}`,
                        `Terapeuta: ${s.therapist}`,
                        `Modalidad: Virtual`,
                        "", "Objetivos trabajados:",
                        ...s.goals.map((g: string) => `  - ${g}`),
                        "", "Notas clinicas:",
                        `  ${s.notes}`,
                        "", "ASHAKids - Plataforma de terapia infantil",
                      ]);
                      showToast("Descargando notas de sesión...");
                    }}
                  >
                    <Download size={12} /> Descargar notas
                  </Btn>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Progreso Mensual tab */}
      {tab === "progreso" && (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-[#E8E5F4] p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: B.violetLight }}
                >
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-extrabold text-[#1C1135] text-sm leading-tight">
                      {r.title}
                    </p>
                    {r.fav && (
                      <span className="text-yellow-400 flex-shrink-0">
                        ⭐
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9E95B7] font-medium mt-0.5">
                    {r.date} · {r.therapist}
                  </p>
                  <div className="mt-1">
                    <span
                      className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          r.status === "activo"
                            ? B.orangeLight
                            : B.successLight,
                        color:
                          r.status === "activo"
                            ? B.orange
                            : B.success,
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#7C6F9A] font-medium mt-2 leading-relaxed">
                    {r.summary}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#F5F3FF] flex gap-2">
                <button
                  onClick={() => setReportViewId(r.id)}
                  className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-[#E8E5F4] text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  <Eye size={12} /> Ver
                </button>
                <button
                  onClick={() => downloadReport(r)}
                  className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-[#E8E5F4] text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  <Download size={12} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Padre Config ───────────────────────────────────────────────────────────────

function PadreConfig({ onNameChange, padrePlan = "exploracion", go: configGo }: { onNameChange?: (n: string) => void; padrePlan?: "exploracion" | "familia"; go?: (v: View) => void }) {
  const [tab, setTab] = useState<
    | "cuenta"
    | "hijos"
    | "notificaciones"
    | "privacidad"
    | "seguridad"
  >("cuenta");
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Cuenta
  const [nombre, setNombre] = useState("Laura Gómez");
  const [email, setEmail] = useState("laura.gomez@email.com");
  const [tel, setTel] = useState("+1 (555) 987-6543");
  const [ciudad, setCiudad] = useState("Ciudad de México");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("👤");
  const userAvatarOptions = ["👤", "🦊", "🐻", "🐰", "🦁", "🐼", "🐨", "🐸", "🦋", "🌟", "🎭", "🌺"];

  // Password confirm before save
  const [showPwConfirmModal, setShowPwConfirmModal] = useState(false);
  const [pwConfirmInput, setPwConfirmInput] = useState("");

  // Hijos
  const [childList, setChildList] = useState(kids);
  const [showAddChildModal, setShowAddChildModal] =
    useState(false);
  const [showPlanUpgradeModal, setShowPlanUpgradeModal] = useState(false);
  const [editChild, setEditChild] = useState<
    (typeof kids)[0] | null
  >(null);
  const [deleteChild, setDeleteChild] = useState<
    (typeof kids)[0] | null
  >(null);
  const [newCN, setNewCN] = useState("");
  const [newCA, setNewCA] = useState("");
  const [newCS, setNewCS] = useState("Lenguaje");
  const [newBirth, setNewBirth] = useState("");
  const [newAvatar, setNewAvatar] = useState("🐻");
  const avatarOptions = [
    "🐻",
    "🦊",
    "🐼",
    "🐨",
    "🐸",
    "🦁",
    "🐙",
    "🦋",
    "🐬",
    "🦄",
    "🐧",
    "🐺",
    "🦝",
    "🐱",
    "🐶",
    "🐹",
    "🐰",
    "🦔",
    "🦜",
    "🐳",
  ];

  // Notificaciones
  const [notifs, setNotifs] = useState({
    citas: true,
    recordatorios: true,
    reportes: true,
    mensajes: true,
    progreso: true,
    promo: false,
  });
  const toggleN = (k: keyof typeof notifs) =>
    setNotifs((n) => ({ ...n, [k]: !n[k] }));

  // Privacidad / Consentimientos
  const [consentsPriv, setConsentsPriv] = useState({
    dataPerfil: true,       // OBLIGATORIO - ya aceptado
    compartirTerapeuta: true, // OBLIGATORIO - ya aceptado
    camaraSessiones: true,  // Contextual - activo
    vozActividades: false,  // OPCIONAL - no activo
    mlInvestigacion: false, // OPCIONAL ML - desactivado por defecto
  });
  const toggleConsentsPriv = (k: keyof typeof consentsPriv) => {
    if (k === "dataPerfil" || k === "compartirTerapeuta") return; // obligatorios no se pueden revocar aquí
    setConsentsPriv(prev => ({ ...prev, [k]: !prev[k] }));
  };
  const [showRevokeOptional, setShowRevokeOptional] = useState(false);
  const [showDownloadModal, setShowDownloadModal] =
    useState(false);
  const [downloadSent, setDownloadSent] = useState(false);
  // Account state demo
  const [accountStatus, setAccountStatus] = useState<"activa" | "desactivada">("activa");
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showReactivateFlow, setShowReactivateFlow] = useState(false);
  const [reactivateCode, setReactivateCode] = useState("");

  // Seguridad
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [twoFADone, setTwoFADone] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] =
    useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const tabs = [
    { key: "cuenta" as const, label: "Mi cuenta", icon: "👤" },
    { key: "hijos" as const, label: "Mis hijos", icon: "👧" },
    {
      key: "notificaciones" as const,
      label: "Notificaciones",
      icon: "🔔",
    },
    {
      key: "privacidad" as const,
      label: "Privacidad",
      icon: "🛡️",
    },
    {
      key: "seguridad" as const,
      label: "Seguridad",
      icon: "🔐",
    },
  ];

  return (
    <div
      className="p-4 sm:p-6 max-w-4xl"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold"
          style={{
            background:
              "linear-gradient(135deg,#059669,#0D9488)",
          }}
        >
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Avatar picker modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPhotoModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135]">
                Elige tu avatar
              </h2>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-2 rounded-xl hover:bg-violet-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center gap-4 mb-5">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl border-2 border-violet-300 shadow-md"
                  style={{ background: B.violetLight }}
                >
                  {selectedAvatar}
                </div>
                <p className="text-xs font-bold text-[#7C6F9A]">Avatar seleccionado</p>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {userAvatarOptions.map((a) => (
                  <button
                    key={a}
                    onClick={() => setSelectedAvatar(a)}
                    className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all hover:scale-110 ${selectedAvatar === a ? "ring-2 ring-violet-500 scale-110" : ""}`}
                    style={{ background: selectedAvatar === a ? B.violetLight : "#F9F8FE" }}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowPhotoModal(false);
                  showToast("Avatar actualizado");
                }}
                className="mt-5 w-full py-3 rounded-2xl text-sm font-extrabold text-white transition-colors"
                style={{ background: B.violet }}
              >
                Confirmar selección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password confirmation modal */}
      {showPwConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setShowPwConfirmModal(false); setPwConfirmInput(""); }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135]">Confirmar identidad</h2>
              <button
                onClick={() => { setShowPwConfirmModal(false); setPwConfirmInput(""); }}
                className="p-2 rounded-xl hover:bg-violet-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-[#7C6F9A] font-medium">
                Por seguridad, ingresa tu contraseña actual para guardar los cambios.
              </p>
              <div>
                <label className="block text-sm font-bold text-[#1C1135] mb-2">Contraseña actual</label>
                <input
                  type="password"
                  value={pwConfirmInput}
                  onChange={(e) => setPwConfirmInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-bold text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                  style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowPwConfirmModal(false); setPwConfirmInput(""); }}
                  className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-violet-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  disabled={!pwConfirmInput}
                  onClick={() => {
                    setShowPwConfirmModal(false);
                    setPwConfirmInput("");
                    onNameChange?.(nombre);
                    showToast("Cambios guardados correctamente");
                  }}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white transition-colors disabled:opacity-40"
                  style={{ background: B.violet }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan upgrade modal */}
      {showPlanUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPlanUpgradeModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135]">Añade más perfiles con el Plan Familia</h2>
              <button onClick={() => setShowPlanUpgradeModal(false)} className="p-2 rounded-xl hover:bg-violet-50"><X size={18} /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#7C6F9A] font-medium mb-5 leading-relaxed">
                Tu Plan Exploración permite administrar un perfil infantil. Con el Plan Familia puedes añadir hijos ilimitados y acceder a más herramientas de acompañamiento.
              </p>
              <div className="rounded-2xl p-4 mb-5" style={{ background: B.violetLight }}>
                <p className="text-xs font-extrabold text-violet-700 mb-3">✨ Plan Familia incluye:</p>
                {["Hijos ilimitados", "Mundo ASHA completo", "Reportes completos", "Prioridad en agenda", "Todas las funcionalidades familiares disponibles"].map(f => (
                  <div key={f} className="flex items-center gap-2 mb-2">
                    <CheckCircle size={13} style={{ color: B.violet }} />
                    <span className="text-xs font-medium text-[#7C6F9A]">{f}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center font-medium mb-4" style={{ color: B.textMuted }}>Datos simulados para demostración · Precios: Por definir</p>
              <Btn variant="cta" className="w-full justify-center" onClick={() => { setShowPlanUpgradeModal(false); if (configGo) configGo("public/planes"); }}>
                Conocer Plan Familia
              </Btn>
              <button onClick={() => setShowPlanUpgradeModal(false)} className="w-full mt-2 text-xs font-bold text-[#9E95B7] py-2 hover:text-[#7C6F9A] transition-colors">
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add child modal */}
      {showAddChildModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddChildModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4] flex-shrink-0">
              <h2 className="font-extrabold text-[#1C1135]">
                Añadir hijo
              </h2>
              <button
                onClick={() => {
                  setShowAddChildModal(false);
                  setNewCN("");
                  setNewBirth("");
                  setNewAvatar("🐻");
                }}
                className="p-2 rounded-xl hover:bg-violet-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">
              {/* Avatar picker */}
              <div>
                <label className="block text-sm font-bold text-[#1C1135] mb-3">
                  Avatar
                </label>
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl border-2 border-violet-300 shadow-md"
                    style={{ background: B.violetLight }}
                  >
                    {newAvatar}
                  </div>
                  <div className="grid grid-cols-10 gap-1.5 w-full">
                    {avatarOptions.map((a) => (
                      <button
                        key={a}
                        onClick={() => setNewAvatar(a)}
                        className={`w-full aspect-square rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110 ${newAvatar === a ? "ring-2 ring-violet-500 scale-110" : ""}`}
                        style={{
                          background:
                            newAvatar === a
                              ? B.violetLight
                              : "#F9F8FE",
                        }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Name */}
              <Inp
                label="Nombre completo"
                placeholder="Ej. Lucía Gómez"
                value={newCN}
                onChange={setNewCN}
              />
              {/* Birth date */}
              <div>
                <label className="block text-sm font-bold text-[#1C1135] mb-2">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={newBirth}
                  onChange={(e) => {
                    setNewBirth(e.target.value);
                    if (e.target.value) {
                      const age = Math.floor(
                        (Date.now() -
                          new Date(e.target.value).getTime()) /
                          31557600000,
                      );
                      setNewCA(String(age));
                    }
                  }}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-bold text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                  style={{
                    fontFamily:
                      '"Nunito", system-ui, sans-serif',
                  }}
                />
                {newCA && (
                  <p className="mt-1.5 text-xs font-bold text-violet-600">
                    📅 {newCA} años
                  </p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E8E5F4] flex-shrink-0">
              <Btn
                variant="primary"
                className="w-full justify-center"
                disabled={!newCN || !newBirth}
                onClick={() => {
                  const colors = [
                    B.violet,
                    B.teal,
                    B.orange,
                    "#F472B6",
                  ];
                  setChildList((prev) => [
                    ...prev,
                    {
                      id: Date.now(),
                      name: newCN,
                      age: `${newCA} años`,
                      specialty: "Lenguaje",
                      av: newAvatar,
                      color:
                        colors[prev.length % colors.length],
                      progress: 0,
                      lastSession: "Sin sesiones",
                      nextSession: "Por agendar",
                    },
                  ]);
                  setShowAddChildModal(false);
                  setNewCN("");
                  setNewBirth("");
                  setNewAvatar("🐻");
                  setNewCA("");
                  showToast(`${newCN} agregado exitosamente`);
                }}
              >
                <Plus size={14} /> Agregar hijo
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Edit child modal */}
      {editChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditChild(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135]">
                Editar a {editChild.name}
              </h2>
              <button
                onClick={() => setEditChild(null)}
                className="p-2 rounded-xl hover:bg-violet-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <Inp
                label="Nombre"
                value={editChild.name}
                onChange={(v) =>
                  setEditChild((ec) =>
                    ec ? { ...ec, name: v } : null,
                  )
                }
              />
              <div>
                <label className="block text-sm font-bold text-[#1C1135] mb-2">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={(editChild as any).birthdate || ""}
                  onChange={(e) =>
                    setEditChild((ec) =>
                      ec ? { ...ec, birthdate: e.target.value, age: e.target.value ? `${Math.floor((Date.now() - new Date(e.target.value).getTime()) / 31557600000)} años` : (ec as any).age } as any : null
                    )
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-bold text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                  style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
                />
                {(editChild as any).birthdate && (
                  <p className="mt-1.5 text-xs font-bold text-violet-600">
                    📅 {Math.floor((Date.now() - new Date((editChild as any).birthdate).getTime()) / 31557600000)} años
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Btn
                  variant="secondary"
                  className="flex-1 justify-center"
                  onClick={() => setEditChild(null)}
                >
                  Cancelar
                </Btn>
                <Btn
                  variant="primary"
                  className="flex-1 justify-center"
                  onClick={() => {
                    setChildList((prev) =>
                      prev.map((c) =>
                        c.id === editChild!.id ? editChild! : c,
                      ),
                    );
                    setEditChild(null);
                    showToast("Cambios guardados");
                  }}
                >
                  Guardar
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete child confirm */}
      {deleteChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteChild(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                style={{ background: "#FEF2F2" }}
              >
                ⚠️
              </div>
              <h2 className="font-extrabold text-center text-[#1C1135] text-lg mb-2">
                Eliminar a {deleteChild.name}
              </h2>
              <p className="text-sm text-center text-[#7C6F9A] font-medium mb-5">
                Esta acción eliminará el perfil y todo el
                historial asociado. No puede deshacerse.
              </p>
              <div className="flex gap-3">
                <Btn
                  variant="secondary"
                  className="flex-1 justify-center"
                  onClick={() => setDeleteChild(null)}
                >
                  Cancelar
                </Btn>
                <Btn
                  variant="danger"
                  className="flex-1 justify-center"
                  onClick={() => {
                    setChildList((prev) =>
                      prev.filter(
                        (c) => c.id !== deleteChild!.id,
                      ),
                    );
                    setDeleteChild(null);
                    showToast(
                      `Perfil de ${deleteChild!.name} eliminado`,
                    );
                  }}
                >
                  Eliminar
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download data modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowDownloadModal(false);
              setDownloadSent(false);
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            {!downloadSent ? (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: B.violetLight }}
                >
                  📦
                </div>
                <h2 className="font-extrabold text-[#1C1135] text-lg mb-2">
                  Solicitar mis datos
                </h2>
                <p className="text-sm text-[#7C6F9A] font-medium mb-5">
                  Recibirás un enlace de descarga en{" "}
                  <strong>laura.gomez@email.com</strong> en un
                  plazo de 72 horas.
                </p>
                <Btn
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => setDownloadSent(true)}
                >
                  <Download size={14} /> Confirmar solicitud
                </Btn>
              </>
            ) : (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: B.successLight }}
                >
                  ✅
                </div>
                <h2 className="font-extrabold text-[#1C1135] text-lg mb-2">
                  Solicitud enviada
                </h2>
                <p className="text-sm text-[#7C6F9A] font-medium mb-5">
                  Recibirás un correo en hasta 72 horas con el
                  enlace para descargar tus datos.
                </p>
                <Btn
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => {
                    setShowDownloadModal(false);
                    setDownloadSent(false);
                  }}
                >
                  Entendido
                </Btn>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2FA modal */}
      {show2FA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShow2FA(false);
              setTwoFADone(false);
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            {!twoFADone ? (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: B.violetLight }}
                >
                  🔐
                </div>
                <h2 className="font-extrabold text-[#1C1135] text-lg mb-2">
                  Activar autenticación 2FA
                </h2>
                <p className="text-sm text-[#7C6F9A] font-medium mb-4">
                  Escanea este código QR con una app de
                  autenticación como Google Authenticator o
                  Authy.
                </p>
                <div
                  className="w-32 h-32 mx-auto rounded-2xl border-2 border-[#E8E5F4] flex items-center justify-center mb-5"
                  style={{ background: "#F5F3FF" }}
                >
                  <div className="grid grid-cols-5 gap-0.5">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-sm"
                        style={{
                          background:
                            Math.random() > 0.5
                              ? "#7C3AED"
                              : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs font-bold text-[#7C6F9A] mb-5">
                  Código manual:{" "}
                  <strong className="text-[#1C1135]">
                    ASHA-2FA-X9K2
                  </strong>
                </p>
                <Btn
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => setTwoFADone(true)}
                >
                  <Shield size={14} /> Confirmar activación
                </Btn>
              </>
            ) : (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: B.successLight }}
                >
                  ✅
                </div>
                <h2 className="font-extrabold text-[#1C1135] text-lg mb-2">
                  2FA activado
                </h2>
                <p className="text-sm text-[#7C6F9A] font-medium mb-5">
                  Tu cuenta ahora está protegida con
                  autenticación de dos factores.
                </p>
                <Btn
                  variant="cta"
                  className="w-full justify-center"
                  onClick={() => {
                    setShow2FA(false);
                    setTwoFADone(false);
                    showToast("Autenticación 2FA activada");
                  }}
                >
                  <CheckCircle size={14} /> Listo
                </Btn>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete account confirm */}
      {showDeleteAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteAccount(false);
              setDeleteConfirm("");
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: "#FEF2F2" }}
            >
              ⚠️
            </div>
            <h2 className="font-extrabold text-center text-red-700 text-lg mb-2">
              Eliminar cuenta
            </h2>
            <p className="text-sm text-center text-[#7C6F9A] font-medium mb-4">
              Esta acción es{" "}
              <strong className="text-red-600">
                permanente e irreversible
              </strong>
              . Perderás todos tus datos.
            </p>
            <div className="mb-4">
              <Inp
                label='Escribe "ELIMINAR" para confirmar'
                placeholder="ELIMINAR"
                value={deleteConfirm}
                onChange={setDeleteConfirm}
              />
            </div>
            <div className="flex gap-3">
              <Btn
                variant="secondary"
                className="flex-1 justify-center"
                onClick={() => {
                  setShowDeleteAccount(false);
                  setDeleteConfirm("");
                }}
              >
                Cancelar
              </Btn>
              <Btn
                variant="danger"
                className="flex-1 justify-center"
                disabled={deleteConfirm !== "ELIMINAR"}
                onClick={() =>
                  showToast("Solicitud de eliminación enviada")
                }
              >
                Eliminar cuenta
              </Btn>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1C1135]">
          Configuración
        </h1>
        <p className="text-sm text-[#7C6F9A] font-medium">
          Gestiona tu cuenta y preferencias.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="flex lg:flex-col gap-2 flex-wrap lg:flex-nowrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-bold transition-all text-left"
              style={{
                background: tab === t.key ? B.violet : "white",
                color: tab === t.key ? "white" : B.textMid,
                border: `1.5px solid ${tab === t.key ? B.violet : B.border}`,
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <Crd className="p-6">
            {/* ── Cuenta ── */}
            {tab === "cuenta" && (
              <div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">
                  Datos de la cuenta
                </h2>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ background: B.violetLight }}
                    onClick={() => setShowPhotoModal(true)}
                  >
                    {selectedAvatar}
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-[#1C1135]">
                      {nombre}
                    </p>
                    <p className="text-xs text-[#7C6F9A] font-medium mb-2">
                      Avatar de perfil
                    </p>
                    <Btn
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowPhotoModal(true)}
                    >
                      <Upload size={12} /> Cambiar foto
                    </Btn>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Inp
                    label="Nombre completo"
                    value={nombre}
                    onChange={setNombre}
                  />
                  <Inp
                    label="Correo electrónico"
                    value={email}
                    onChange={setEmail}
                  />
                  <Inp
                    label="Teléfono"
                    value={tel}
                    onChange={setTel}
                  />
                  <Inp
                    label="Ciudad"
                    value={ciudad}
                    onChange={setCiudad}
                  />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">
                    Código de acceso
                  </p>
                  <div className="flex items-center gap-3 bg-violet-50 rounded-2xl px-4 py-3">
                    <span className="font-extrabold text-[#1C1135]">
                      P1234
                    </span>
                    <span className="text-xs text-[#7C6F9A] font-medium">
                      — Comparte con tu terapeuta para vincular
                      tu cuenta
                    </span>
                    <button
                      className="ml-auto text-xs font-bold hover:underline"
                      style={{ color: B.violet }}
                      onClick={() =>
                        showToast(
                          "Código copiado al portapapeles",
                        )
                      }
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Btn
                    variant="cta"
                    onClick={() => setShowPwConfirmModal(true)}
                  >
                    <CheckCircle size={14} /> Guardar cambios
                  </Btn>
                </div>
              </div>
            )}

            {/* ── Hijos ── */}
            {tab === "hijos" && (
              <div className="flex flex-col gap-5">
                {padrePlan === "exploracion" && (
                  <div className="rounded-2xl p-4 flex items-start gap-3 border" style={{ background: B.warningLight, borderColor: B.warning + "40" }}>
                    <span className="text-lg flex-shrink-0">ℹ️</span>
                    <div>
                      <p className="text-sm font-extrabold" style={{ color: B.warning }}>Plan Exploración — 1 perfil infantil</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: "#92400E" }}>Con el Plan Familia puedes añadir perfiles ilimitados y acceder a todas las funciones.</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-[#1C1135] text-lg">
                    Mis hijos ({childList.length})
                  </h2>
                  <Btn variant="secondary" size="sm" onClick={() => padrePlan === "exploracion" ? setShowPlanUpgradeModal(true) : setShowAddChildModal(true)}>
                    <Plus size={13} /> Añadir hijo
                  </Btn>
                </div>
                {childList.length === 0 ? (
                  <EmptyState
                    icon="👧"
                    title="Sin hijos registrados"
                    desc="Agrega el perfil de tu hijo para comenzar."
                    action="Agregar hijo"
                    onAction={() => setShowAddChildModal(true)}
                  />
                ) : (
                  (padrePlan === "exploracion" ? childList.slice(0, 1) : childList).map((k) => (
                    <div
                      key={k.id}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-[#E8E5F4] bg-white"
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: (k as any).color || B.violetLight }}
                      >
                        {(k as any).av || (k as any).emoji || k.name.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-[#1C1135]">
                          {k.name}
                        </p>
                        <p className="text-xs text-[#7C6F9A] font-medium">
                          {(k as any).age || ""} {(k as any).specialty ? `· ${(k as any).specialty}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-xl"
                          style={{
                            background: B.successLight,
                            color: B.success,
                          }}
                        >
                          Activo
                        </span>
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditChild(k)}
                        >
                          <Edit size={12} /> Editar
                        </Btn>
                        <button
                          onClick={() => setDeleteChild(k)}
                          className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Notificaciones ── */}
            {tab === "notificaciones" && (
              <div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">
                  Notificaciones
                </h2>
                <div className="flex flex-col gap-3">
                  {(
                    [
                      {
                        key: "citas",
                        label: "Confirmación de citas",
                        desc: "Cuando se confirma o cambia una cita",
                      },
                      {
                        key: "recordatorios",
                        label: "Recordatorios de sesión",
                        desc: "30 minutos antes de cada sesión",
                      },
                      {
                        key: "reportes",
                        label: "Nuevo reporte disponible",
                        desc: "Cuando la terapeuta sube un reporte clínico",
                      },
                      {
                        key: "mensajes",
                        label: "Nuevos mensajes",
                        desc: "Mensajes de la terapeuta o del equipo ASHAKids",
                      },
                      {
                        key: "progreso",
                        label: "Actualizaciones de progreso",
                        desc: "Logros e hitos alcanzados por tu hijo",
                      },
                      {
                        key: "promo",
                        label: "Promociones y novedades",
                        desc: "Ofertas especiales y nuevas funcionalidades",
                      },
                    ] as {
                      key: keyof typeof notifs;
                      label: string;
                      desc: string;
                    }[]
                  ).map((n) => (
                    <div
                      key={n.key}
                      className="flex items-center justify-between p-4 rounded-2xl border border-[#E8E5F4]"
                    >
                      <div>
                        <p className="font-extrabold text-sm text-[#1C1135]">
                          {n.label}
                        </p>
                        <p className="text-xs text-[#7C6F9A] font-medium">
                          {n.desc}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleN(n.key)}
                        className="w-10 h-6 rounded-full flex items-center px-0.5 transition-all flex-shrink-0 ml-4"
                        style={{
                          background: notifs[n.key]
                            ? B.violet
                            : "#D1D5DB",
                          justifyContent: notifs[n.key]
                            ? "flex-end"
                            : "flex-start",
                        }}
                      >
                        <span className="w-5 h-5 bg-white rounded-full shadow-sm block transition-all" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Btn
                    variant="cta"
                    onClick={() =>
                      showToast(
                        "Preferencias de notificación guardadas",
                      )
                    }
                  >
                    <CheckCircle size={14} /> Guardar
                    preferencias
                  </Btn>
                </div>
              </div>
            )}

            {/* ── Privacidad ── */}
            {tab === "privacidad" && (
              <div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">
                  Privacidad y consentimientos
                </h2>

                {/* Consent summary */}
                <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-extrabold text-sm text-[#1C1135]">Estado de consentimientos</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>
                      Versión 1.0-demo
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 mb-3">
                    {([
                      { key: "dataPerfil" as const, icon: "📋", label: "Tratamiento de datos · Perfil infantil", badge: "OBLIGATORIO", badgeColor: "#DC2626", badgeBg: "#FEF2F2" },
                      { key: "compartirTerapeuta" as const, icon: "🤝", label: "Compartir con terapeuta vinculado", badge: "OBLIGATORIO", badgeColor: "#DC2626", badgeBg: "#FEF2F2" },
                      { key: "camaraSessiones" as const, icon: "🎥", label: "Cámara y micrófono · Sesiones", badge: "CONTEXTUAL", badgeColor: "#D97706", badgeBg: "#FFFBEB" },
                      { key: "vozActividades" as const, icon: "🎤", label: "Voz en actividades de Mundo ASHA", badge: "OPCIONAL", badgeColor: "#059669", badgeBg: "#D1FAE5" },
                      { key: "mlInvestigacion" as const, icon: "🔬", label: "Datos pseudonimizados para modelos de IA · Investigación futura", badge: "OPCIONAL ML", badgeColor: "#7C3AED", badgeBg: "#EDE9FE" },
                    ]).map(c => (
                      <div key={c.key} className="flex items-center gap-3">
                        <span className="text-base flex-shrink-0">{c.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1C1135] leading-snug">{c.label}</p>
                          <span className="text-xs font-black px-1.5 py-0.5 rounded-md" style={{ background: c.badgeBg, color: c.badgeColor }}>{c.badge}</span>
                        </div>
                        {(c.key === "dataPerfil" || c.key === "compartirTerapeuta") ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>Activo · Requerido</span>
                        ) : (
                          <button onClick={() => { toggleConsentsPriv(c.key); showToast("Preferencia actualizada"); }}
                            className="w-10 h-6 rounded-full flex items-center px-0.5 transition-all flex-shrink-0"
                            style={{ background: consentsPriv[c.key] ? B.violet : "#D1D5DB", justifyContent: consentsPriv[c.key] ? "flex-end" : "flex-start" }}>
                            <span className="w-5 h-5 bg-white rounded-full shadow-sm block" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Btn variant="secondary" size="sm" onClick={() => { setConsentsPriv(prev => ({ ...prev, camaraSessiones: false, vozActividades: false, mlInvestigacion: false })); showToast("Consentimientos opcionales revocados"); }}>
                      Revocar opcionales
                    </Btn>
                    <Btn variant="outline" size="sm" onClick={() => showToast("Preferencias guardadas")}>
                      <CheckCircle size={12} /> Guardar preferencias
                    </Btn>
                  </div>
                </div>

                {/* Access log */}
                <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                  <p className="font-extrabold text-sm text-[#1C1135] mb-1">Registro de accesos</p>
                  <p className="text-xs text-[#9E95B7] font-medium mb-3">Datos operativos simulados · Sin contenido clínico</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { actor: "Dra. Ana Ruiz · Terapeuta", accion: "Lectura de expediente clínico", fecha: "30 Jul 2026 · 10:14", resultado: "Autorizado", motivo: "Vinculación activa" },
                      { actor: "Laura Gómez · Representante", accion: "Acceso a resumen compartido", fecha: "30 Jul 2026 · 09:45", resultado: "Autorizado", motivo: "Acceso propio" },
                      { actor: "Sistema ASHI", accion: "Lectura de datos de perfil", fecha: "29 Jul 2026 · 08:00", resultado: "Autorizado", motivo: "Contextual · mínimo necesario" },
                      { actor: "Admin plataforma", accion: "Verificación de estado de cuenta", fecha: "27 Jul 2026 · 15:30", resultado: "Autorizado", motivo: "Soporte operativo" },
                    ].map((entry, i) => (
                      <div key={i} className="rounded-xl p-3 text-xs" style={{ background: "#F5F3FF" }}>
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                          <span className="font-extrabold text-[#1C1135]">{entry.actor}</span>
                          <span className="font-bold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>{entry.resultado}</span>
                        </div>
                        <p className="font-medium text-[#4B4869] mb-0.5">{entry.accion}</p>
                        <p className="text-[#9E95B7]">{entry.fecha} · Motivo: {entry.motivo}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account status */}
                <div className="rounded-2xl p-4 border" style={{ borderColor: accountStatus === "activa" ? "#D1FAE5" : "#FEE2E2" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-extrabold text-sm text-[#1C1135]">Estado de cuenta</p>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background: accountStatus === "activa" ? "#D1FAE5" : "#FEE2E2", color: accountStatus === "activa" ? "#059669" : "#DC2626" }}>
                      {accountStatus === "activa" ? "✅ Activa" : "⚠️ Desactivada"}
                    </span>
                  </div>
                  {accountStatus === "activa" ? (
                    <>
                      <p className="text-xs text-[#7C6F9A] font-medium mb-3">
                        Cuenta activa. Tras 3 meses sin iniciar sesión se enviará un aviso y la cuenta se desactivará automáticamente sin borrar datos ni historial. Plazos exactos y canales de notificación por definir.
                      </p>
                      <Btn variant="danger" size="sm" onClick={() => setShowDeactivateConfirm(true)}>
                        Desactivar cuenta temporalmente
                      </Btn>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-[#7C6F9A] font-medium mb-3">
                        Cuenta desactivada. Los datos e historial se conservan. Para reactivar debes verificar tu identidad.
                      </p>
                      <Btn variant="primary" size="sm" onClick={() => setShowReactivateFlow(true)}>
                        Reactivar cuenta
                      </Btn>
                    </>
                  )}
                </div>

                {/* Legal notice */}
                <div className="rounded-2xl p-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                  <p className="text-xs font-bold text-[#92400E]">
                    ⚖️ Política de retención de datos y detalle jurídico: pendiente de aprobación. No se solicitan datos reales en esta demostración.
                  </p>
                </div>

                {/* Download data */}
                <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                  <p className="font-extrabold text-sm text-[#1C1135] mb-1">Descargar mis datos</p>
                  <p className="text-xs text-[#7C6F9A] font-medium mb-3">Descarga todos los datos de tu cuenta. Formato y plazos por definir.</p>
                  <Btn variant="secondary" size="sm" onClick={() => setShowDownloadModal(true)}>
                    <Download size={12} /> Solicitar descarga
                  </Btn>
                </div>

                {/* Deactivate confirm modal */}
                {showDeactivateConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeactivateConfirm(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
                      <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">Desactivar cuenta</h3>
                      <p className="text-sm text-[#7C6F9A] font-medium mb-4 leading-relaxed">
                        La cuenta se desactivará temporalmente. Los datos e historial se conservan. Para reactivar necesitarás verificar tu identidad. ¿Confirmas?
                      </p>
                      <div className="flex gap-3">
                        <Btn variant="secondary" className="flex-1 justify-center" onClick={() => setShowDeactivateConfirm(false)}>Cancelar</Btn>
                        <Btn variant="danger" className="flex-1 justify-center" onClick={() => { setAccountStatus("desactivada"); setShowDeactivateConfirm(false); showToast("Cuenta desactivada"); }}>
                          Confirmar desactivación
                        </Btn>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reactivate flow modal */}
                {showReactivateFlow && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReactivateFlow(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
                      <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">Verificar identidad</h3>
                      <p className="text-sm text-[#7C6F9A] font-medium mb-4">Ingresa el código enviado a tu correo para reactivar la cuenta.</p>
                      <Inp label="Código de verificación" placeholder="000000 (demo: cualquier valor)"
                        value={reactivateCode} onChange={setReactivateCode} />
                      <div className="flex gap-3 mt-4">
                        <Btn variant="secondary" className="flex-1 justify-center" onClick={() => setShowReactivateFlow(false)}>Cancelar</Btn>
                        <Btn variant="primary" className="flex-1 justify-center" disabled={!reactivateCode}
                          onClick={() => { setAccountStatus("activa"); setShowReactivateFlow(false); setReactivateCode(""); showToast("Cuenta reactivada exitosamente"); }}>
                          <CheckCircle size={14} /> Reactivar
                        </Btn>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Seguridad ── */}
            {tab === "seguridad" && (
              <div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">
                  Seguridad
                </h2>
                <div className="flex flex-col gap-4">
                  <Inp
                    label="Contraseña actual"
                    type="password"
                    placeholder="Tu contraseña actual"
                    value={pwCurrent}
                    onChange={setPwCurrent}
                  />
                  <Inp
                    label="Nueva contraseña"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={pwNew}
                    onChange={setPwNew}
                  />
                  <Inp
                    label="Confirmar contraseña"
                    type="password"
                    placeholder="Repite la nueva contraseña"
                    value={pwConfirm}
                    onChange={setPwConfirm}
                  />
                  {pwNew &&
                    pwConfirm &&
                    pwNew !== pwConfirm && (
                      <p className="text-xs font-bold text-red-500">
                        Las contraseñas no coinciden.
                      </p>
                    )}
                </div>
                <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-sm text-[#1C1135] mb-0.5">
                        Autenticación en dos pasos
                      </p>
                      <p className="text-xs text-[#7C6F9A] font-medium">
                        Protege tu cuenta con un código
                        adicional al iniciar sesión.
                      </p>
                    </div>
                    <Btn
                      variant="secondary"
                      size="sm"
                      onClick={() => setShow2FA(true)}
                    >
                      <Lock size={12} /> Activar 2FA
                    </Btn>
                  </div>
                </div>
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-sm text-red-700 mb-0.5">
                        Eliminar cuenta
                      </p>
                      <p className="text-xs text-red-600 font-medium">
                        Esta acción es permanente e
                        irreversible.
                      </p>
                    </div>
                    <Btn
                      variant="danger"
                      size="sm"
                      onClick={() => setShowDeleteAccount(true)}
                    >
                      <Trash2 size={12} /> Eliminar
                    </Btn>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Btn
                    variant="cta"
                    disabled={
                      !pwCurrent ||
                      !pwNew ||
                      !pwConfirm ||
                      pwNew !== pwConfirm
                    }
                    onClick={() => {
                      setPwCurrent("");
                      setPwNew("");
                      setPwConfirm("");
                      showToast(
                        "Contraseña actualizada correctamente",
                      );
                    }}
                  >
                    <Lock size={14} /> Cambiar contraseña
                  </Btn>
                </div>
              </div>
            )}
          </Crd>
        </div>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

function PadreAyuda({ go }: { go: (v: View) => void }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    ["¿Cómo funcionan las terapias virtuales?", "El padre agenda y acompaña al paciente; el terapeuta conduce la sesión virtual y comparte el seguimiento desde AshaKids."],
    ["¿Dónde veo mis próximas sesiones?", "En Agenda y sesiones encontrarás horarios, enlaces de acceso y opciones para revisar cada cita."],
    ["¿Cómo reviso el progreso de mi hijo?", "Mi Camino ASHA reúne los reportes y avances que el terapeuta comparte con tu familia."],
  ];
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <section className="rounded-3xl p-6 sm:p-8 text-white overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${B.violetDeep}, #5B21B6)` }}>
        <div className="relative z-10 max-w-2xl"><p className="text-violet-200 text-xs font-extrabold uppercase tracking-[.16em] mb-2">Centro Familiar</p><h1 className="text-2xl sm:text-3xl font-black mb-3">¿Cómo podemos ayudarte?</h1><p className="text-sm sm:text-base font-medium text-violet-100 leading-relaxed">Encuentra orientación para usar tu dashboard sin salir de tu espacio familiar.</p></div>
        <HelpCircle className="absolute -right-5 -bottom-6 text-white/10" size={150} />
      </section>
      <div className="grid lg:grid-cols-[1.35fr_.65fr] gap-5 mt-6">
        <section className="bg-white rounded-3xl border border-[#E8E5F4] p-5 sm:p-6"><h2 className="font-black text-xl text-[#1C1135] mb-4">Preguntas frecuentes</h2><div className="divide-y divide-[#E8E5F4]">{items.map(([question, answer], index) => <div key={question}><button onClick={() => setOpen(open === index ? null : index)} className="w-full flex justify-between items-center text-left py-4 gap-4 font-extrabold text-sm text-[#1C1135]">{question}<ChevronDown size={17} className={`shrink-0 text-violet-600 transition-transform ${open === index ? "rotate-180" : ""}`} /></button>{open === index && <p className="pb-4 text-sm font-medium leading-relaxed text-[#7C6F9A]">{answer}</p>}</div>)}</div></section>
        <aside className="bg-[#F5F3FF] rounded-3xl border border-[#E8E5F4] p-5 sm:p-6"><span className="text-3xl">💬</span><h2 className="font-black text-lg text-[#1C1135] mt-3 mb-2">Accesos rápidos</h2><p className="text-sm text-[#7C6F9A] font-medium leading-relaxed mb-5">Ve directamente a la sección que necesitas.</p><div className="flex flex-col gap-2"><Btn variant="primary" onClick={() => go("padre/agenda")} className="justify-center">Ver agenda</Btn><Btn variant="outline" onClick={() => go("padre/mensajes")} className="justify-center">Abrir mensajes</Btn></div></aside>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [role, setRole] = useState<Role>(null);
  const [padreUserName, setPadreUserName] = useState("Laura Gómez");
  const [padrePlan, setPadrePlan] = useState<"exploracion" | "familia">("exploracion");
  const [parentAppointments, setParentAppointments] = useState<AppointmentRequest[]>(() => appointments.map((appointment) => ({
    ...appointment,
    status: "confirmada",
    paymentStatus: "pendiente",
  })) as AppointmentRequest[]);
  const addParentAppointment = (appointment: AppointmentRequest) => setParentAppointments((current) => current.some((item) => item.id === appointment.id) ? current : [...current, appointment]);

  const [padreExtraNotifs, setPadreExtraNotifs] = useState<PadreNotif[]>([]);

  const handleTerapeutaRequestUpdate = (id: number, status: "confirmada" | "rechazada") => {
    setParentAppointments(current => {
      const apt = current.find(a => a.id === id);
      if (apt && status === "confirmada") {
        const label = apt.type === "presencial" ? "Presencial · Jr. Ricardo Treneman 252" : "Virtual · ASHA Session";
        setPadreExtraNotifs(prev => [{
          icon: "✅",
          title: `Cita confirmada con ${apt.therapist}`,
          time: `${apt.date} · ${apt.time} · ${label}`,
          color: B.success,
          bg: B.successLight,
        }, ...prev]);
      }
      return current.map(a => a.id === id ? { ...a, status, ...(status === "confirmada" ? { paymentStatus: "pendiente" as const } : {}) } : a);
    });
  };

  const bookedSlots = parentAppointments
    .filter(a => a.status === "por confirmar" || a.status === "confirmada")
    .map(a => ({ therapist: a.therapist, date: a.date, time: a.time }));

  const handleLogin = (r: Role, v: View, plan: "exploracion" | "familia" = "familia") => {
    setRole(r);
    setView(v);
    if (r === "padre") setPadrePlan(plan);
  };
  const handleLogout = () => {
    setRole(null);
    setView("landing");
  };
  const go = (v: View) => setView(v);

  if (view === "landing") return <Landing go={go} />;
  if (view === "login")
    return <Login go={go} onLogin={handleLogin} />;
  if (view === "register" || view === "register/padre" || view === "register/verify" ||
      view === "register/terapeuta" || view === "register/terapeuta/landing" || view === "register/terapeuta/success")
    return <Login go={go} onLogin={handleLogin} />;
  if (view === "onboarding") return <Onboarding go={go} onComplete={() => { setRole("padre"); setView("padre"); }} />;
  if (view === "forgot-password")
    return <ForgotPassword go={go} />;
  if (view === "session/waiting")
    return <AshaSessionWaiting go={go} />;
  if (view === "session/active")
    return <AshaSessionActive go={go} />;
  if (view === "session/end") return <AshaSessionEnd go={go} />;

  // Public pages (unauthenticated)
  if (view === "public/especialistas")
    return <PublicEspecialistas go={go} />;
  if (view === "public/especialidades")
    return <PublicEspecialidades go={go} />;
  if (view === "public/mundo") return <PublicMundo go={go} />;
  if (view === "public/recursos")
    return <PublicRecursos go={go} />;
  if (view === "public/ashi") return <PublicAshi go={go} />;
  if (view === "public/historias")
    return <PublicHistorias go={go} />;
  if (view === "public/nosotros")
    return <PublicNosotros go={go} />;
  if (view === "public/planes") return <PublicPlanes go={go} />;
  if (view === "public/ayuda") return <PublicAyuda go={go} />;
  if (view === "public/contacto")
    return <PublicContacto go={go} />;
  if (view === "public/trabaja")
    return <PublicTrabaja go={go} />;

  const titles: Partial<Record<View, string>> = {
    padre: "Inicio",
    "padre/agenda": "Agenda",
    "padre/psicologos": "Terapeutas",
    "padre/compras": "Compras",
    "padre/recompensas": "Mundo ASHA",
    "padre/mensajes": "Mensajes",
    "padre/hijos": "Mis Hijos",
    "padre/progreso": "Progreso",
    "padre/reportes": "Reportes",
    "padre/config": "Configuración",
    "padre/camino": "Mi Camino ASHA",
    "padre/ayuda": "Centro de ayuda",
    "padre/recorrido": "Mi Camino ASHA",
    "padre/consentimiento": "Consentimiento",
    "padre/seguimiento": "Seguimiento",
    "padre/evaluacion": "Evaluación Inicial",
    "padre/incidencias": "Incidencias",
    "terapeuta/incidencias": "Incidencias",
    terapeuta: "Inicio",
    "terapeuta/agenda": "Agenda",
    "terapeuta/pacientes": "Pacientes",
    "terapeuta/mensajes": "Mensajes",
    "terapeuta/reportes": "Reportes",
    "terapeuta/analiticas": "Analíticas",
    "terapeuta/ingresos": "Pagos",
    "terapeuta/valoraciones": "Valoraciones",
    "terapeuta/config": "Configuración",
    "terapeuta/datos-actividad": "Datos de actividad",
    admin: "Dashboard",
    "admin/dashboard": "Dashboard",
    "admin/cuentas": "Gestión de Cuentas",
    "admin/terapeutas": "Terapeutas",
    "admin/operacion": "Operación",
    "admin/pagos": "Pagos",
    "admin/contenido": "Contenido",
    "admin/ml": "Machine Learning",
    "admin/auditoria": "Auditoría y seguridad",
    "admin/config": "Configuración",
    "mundo-asha": "Mundo ASHA",
    "mundo-asha/cuentos": "Cuentos",
    "mundo-asha/canciones": "Canciones",
    "mundo-asha/trabalenguas": "Trabalenguas",
    "mundo-asha/adivinanzas": "Adivinanzas",
    "mundo-asha/juegos": "Laboratorio",
    "mundo-asha/isla": "Isla Creativa",
    "mundo-asha/laberinto": "Laberinto de Trabalenguas",
    "mundo-asha/academia": "Academia",
    "mundo-asha/retos": "Retos",
    "mundo-asha/insignias": "Insignias",
    "mundo-asha/perfil": "Mi Perfil",
    session: "ASHA Session",
    "session/prep": "Preparación",
    "session/waiting": "Sala de espera",
    "session/active": "En sesión",
    "session/end": "Sesión finalizada",
    "session/summary": "Resumen",
    "session/rating": "Calificar",
    "session/rewards": "Recompensas",
    pay: "Pagos",
    "pay/history": "Historial de Pagos",
    "pay/wallet": "Pagos",
  };

  const renderView = () => {
    switch (view) {
      case "padre":
        return <PadreHome go={go} padreUserName={padreUserName} padrePlan={padrePlan} extraNotifs={padreExtraNotifs} onNotifsRead={()=>setPadreExtraNotifs([])} />;
      case "padre/camino":
        return <MiCaminoAsha go={go} padrePlan={padrePlan} />;
      case "padre/ayuda":
        return <PadreAyuda go={go} />;
      case "padre/recorrido":
        return <PadreRecorrido go={go} />;
      case "padre/consentimiento":
        return <PadreConsentimiento go={go} />;
      case "padre/seguimiento":
        return <PadreSeguimiento go={go} />;
      case "padre/evaluacion":
        return <EvaluacionInicial go={go} />;
      case "padre/hijos":
        return <MiCaminoAsha go={go} padrePlan={padrePlan} />;
      case "padre/progreso":
        return <MiCaminoAsha go={go} padrePlan={padrePlan} />;
      case "padre/reportes":
        return <PadreReportes />;
      case "padre/config":
        return <PadreConfig onNameChange={setPadreUserName} padrePlan={padrePlan} go={go} />;
      case "padre/psicologos":
        return <PadrePsicologos go={go} onRequest={addParentAppointment} bookedSlots={bookedSlots} />;
      case "padre/agenda":
        return <PadreAgenda go={go} appointments={parentAppointments} onAppointmentsChange={setParentAppointments} />;
      case "padre/mensajes":
        return <PadreMensajes />;
      case "padre/compras":
        return <PadreCompras go={go} appointments={parentAppointments} onAppointmentsChange={setParentAppointments} />;
      case "padre/recompensas":
        return <MundoAshaHome go={go} padrePlan={padrePlan} />;
      case "padre/incidencias":
        return <PadreIncidencias go={go} />;
      case "mundo-asha":
        return <MundoAshaHome go={go} padrePlan={padrePlan} />;
      case "mundo-asha/cuentos":
        return <MundoAshaCuentos go={go} />;
      case "mundo-asha/canciones":
        return <MundoAshaCanciones go={go} />;
      case "mundo-asha/trabalenguas":
        return <MundoAshaTrabalenguas go={go} />;
      case "mundo-asha/adivinanzas":
        return <MundoAshaAdivinanzas go={go} />;
      case "mundo-asha/juegos":
        return <MundoAshaJuegos go={go} />;
      case "mundo-asha/laberinto":
        return <MundoAshaLaberinto go={go} />;
      case "mundo-asha/isla":
        return <MundoAshaIsla go={go} />;
      case "mundo-asha/academia":
        return <MundoAshaAcademia go={go} />;
      case "mundo-asha/retos":
        return <MundoAshaRetos go={go} />;
      case "mundo-asha/insignias":
        return <MundoAshaInsignias go={go} />;
      case "mundo-asha/perfil":
        return <MundoAshaPerfil go={go} />;
      case "terapeuta":
        return <TerapeutaHome go={go} />;
      case "terapeuta/agenda":
        return <TerapeutaAgenda go={go} requests={parentAppointments} onRequestUpdate={handleTerapeutaRequestUpdate} />;
      case "terapeuta/pacientes":
        return <TerapeutaPacientes go={go} />;
      case "terapeuta/mensajes":
        return <TerapeutaMensajes />;
      case "terapeuta/reportes":
        return <TerapeutaReportes go={go} />;
      case "terapeuta/analiticas":
        return <TerapeutaAnaliticas />;
      case "terapeuta/ingresos":
        return <TerapeutaIngresos />;
      case "terapeuta/valoraciones":
        return <TerapeutaValoraciones />;
      case "terapeuta/config":
        return <TerapeutaConfig />;
      case "terapeuta/datos-actividad":
        return <TerapeutaDatosActividad go={go} />;
      case "terapeuta/incidencias":
        return <TerapeutaIncidencias go={go} />;
      case "pay":
        return <AshaPayCheckout go={go} />;
      case "pay/history":
        return <AshaPayHistory go={go} />;
      case "pay/wallet":
        return <AshaPayWallet go={go} />;
      case "session":
        return <AshaSessionHome go={go} />;
      case "session/prep":
        return <AshaSessionPrep go={go} />;
      case "session/summary":
        return <AshaSessionSummary go={go} />;
      case "session/rating":
        return <AshaSessionSummary go={go} />;
      case "session/rewards":
        return <AshaSessionSummary go={go} />;
      case "admin":
      case "admin/dashboard":
        return <AdminPanel go={go} />;
      case "admin/cuentas":
        return <AdminCuentas go={go} />;
      case "admin/terapeutas":
        return <AdminTerapeutas go={go} />;
      case "admin/operacion":
        return <AdminOperacion go={go} />;
      case "admin/pagos":
        return <AdminPagos go={go} />;
      case "admin/contenido":
        return <AdminContenido go={go} />;
      case "admin/ml":
        return <AdminML go={go} />;
      case "admin/auditoria":
        return <AdminAuditoria go={go} />;
      case "admin/config":
        return <AdminConfig />;
      default:
        return <PadreHome go={go} padreUserName={padreUserName} padrePlan={padrePlan} extraNotifs={padreExtraNotifs} onNotifsRead={()=>setPadreExtraNotifs([])} />;
    }
  };

  return (
    <DashLayout
      role={role}
      cur={view}
      go={go}
      logout={handleLogout}
      title={titles[view] || ""}
      padreUserName={padreUserName}
      padrePlan={padrePlan}
    >
      {renderView()}
    </DashLayout>
  );
}