import { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Role } from "@/types/navigation";


export function useAshhiFloat({ role }: { role: Role }) {
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
return { role, ashiCSS, open, setOpen, ashiTriggerRef, closeAshi, tab, setTab, input, setInput, thinking, setThinking, btnBottom, setBtnBottom, draftStates, setDraftStates, isDragging, setIsDragging, dragData, hasMoved, onBtnPointerDown, onBtnPointerMove, onBtnPointerUp, onBtnClick, msgs, setMsgs, roleCtx, ctx, send, AshiAvatar };
}
