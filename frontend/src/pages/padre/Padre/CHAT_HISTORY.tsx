import { B } from "@/theme/brand/B";
import { msgs } from "@/mocks/demo";

// ─── Shared micro components ──────────────────────────────────────────────────
import { Msg } from "@/pages/padre/Padre/Msg";

export const CHAT_HISTORY: Record<number, Msg[]> = {
  1: msgs as Msg[],
  2: [
    { id: 1, from: "Lic. C. Mendoza", text: "Buenos días, el reporte de Mateo del mes de junio ya está disponible.", time: "Lun 9:00", own: false, av: "CM", color: "#2563EB" },
    { id: 2, from: "Yo", text: "Muchas gracias, lo revisaré hoy mismo.", time: "Lun 9:15", own: true, av: "LG", color: B.violet },
    { id: 3, from: "Lic. C. Mendoza", text: "El reporte está listo para revisar.", time: "Lun 9:16", own: false, av: "CM", color: "#2563EB" },
  ],
  3: [
    { id: 1, from: "Lic. Patricia V.", text: "Hola Sergio, ¿cómo le fue a Sofía esta semana con los ejercicios en casa?", time: "Mar 11:00", own: false, av: "PV", color: B.teal },
    { id: 2, from: "Yo", text: "¡Muy bien! Estuvo practicando todos los días. Le encantó el cuento de los animales.", time: "Mar 11:30", own: true, av: "LG", color: B.violet },
  ],
};
