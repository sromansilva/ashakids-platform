import { StationId } from "@/pages/padre/EvalInicial/types";
import { ParentAnswer } from "@/pages/padre/EvalInicial/types";

export const STATIONS = [
  { id: 1 as StationId, name: "Jardín de las Palabras", icon: "🌻", color: "#22C55E", bg: "#F0FDF4", desc: "Vocabulario y palabras" },
  { id: 2 as StationId, name: "Cueva de los Sonidos", icon: "🦇", color: "#8B5CF6", bg: "#F5F3FF", desc: "Sonidos y discriminación" },
  { id: 3 as StationId, name: "Río de las Instrucciones", icon: "🌊", color: "#0EA5E9", bg: "#F0F9FF", desc: "Comprensión de instrucciones" },
  { id: 4 as StationId, name: "Bosque de las Historias", icon: "🌲", color: "#D97706", bg: "#FFFBEB", desc: "Secuencia narrativa" },
  { id: 5 as StationId, name: "Plaza de las Emociones", icon: "🌟", color: "#EC4899", bg: "#FDF2F8", desc: "Comunicación social" },
] as const;

export const PARENT_QUESTIONS = [
  { id: "pq1", text: "¿Cómo se comunica habitualmente tu hijo en casa?" },
  { id: "pq2", text: "¿Comprende instrucciones cotidianas con facilidad?" },
  { id: "pq3", text: "¿Cómo expresa sus necesidades o emociones?" },
  { id: "pq4", text: "¿Ha observado cambios en su comunicación recientemente?" },
  { id: "pq5", text: "¿En qué situaciones necesita más apoyo para comunicarse?" },
];

export const PARENT_ANSWERS: ParentAnswer[] = ["Frecuentemente", "Algunas veces", "Todavía no", "No estoy seguro"];
