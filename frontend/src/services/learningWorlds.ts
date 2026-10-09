import type { View } from "@/types/navigation";

export type LearningLevel = { id: string; title: string; validation: "objective" | "professional" };
export type LearningWorld = { id: string; name: string; skill: string; difficulty: string; color: string; bg: string; version: string; levels: LearningLevel[] };
const levels = (world: string, titles: string[], validation: LearningLevel["validation"] = "objective"): LearningLevel[] => titles.map((title, index) => ({ id: `${world}-${index + 1}`, title, validation }));
/** Draft curriculum, not a clinical assignment or published game catalogue. */
export const LEARNING_WORLDS: LearningWorld[] = [
  { id: "fonologia", name: "Bosque de los sonidos", skill: "Conciencia fonológica", difficulty: "Inicial", color: "#166534", bg: "#DCFCE7", version: "draft-1", levels: levels("fonologia", ["Escuchar y distinguir", "Reconocer rimas", "Encontrar sílabas", "Comparar sonidos", "Identificar el sonido inicial", "Combinar sonidos"]) },
  { id: "roticas", name: "Aventura de la R", skill: "Producción de sonidos róticos", difficulty: "Práctica guiada", color: "#6D28D9", bg: "#EDE9FE", version: "draft-1", levels: levels("roticas", ["Escuchar modelos", "Distinguir sonidos", "Explorar la producción", "Practicar sílabas", "Practicar palabras", "Construir frases", "Usar en un relato", "Repasar con el profesional"], "professional") },
  { id: "vocabulario", name: "Valle de las palabras", skill: "Vocabulario y relaciones de significado", difficulty: "Intermedio", color: "#92400E", bg: "#FEF3C7", version: "draft-1", levels: levels("vocabulario", ["Nombrar objetos", "Encontrar categorías", "Relacionar palabras", "Comprender descripciones", "Elegir según el contexto"]) },
  { id: "relatos", name: "Isla de las historias", skill: "Comprensión y expresión narrativa", difficulty: "Integración", color: "#075985", bg: "#E0F2FE", version: "draft-1", levels: levels("relatos", ["Ordenar escenas", "Comprender personajes", "Comprender secuencias", "Contar una historia", "Crear otro final"], "professional") },
];
export const LEARNING_PROTOTYPES: { title: string; view: View }[] = [
  { title: "Cuentos", view: "mundo-asha/cuentos" }, { title: "Canciones", view: "mundo-asha/canciones" },
  { title: "Adivinanzas", view: "mundo-asha/adivinanzas" }, { title: "Trabalenguas", view: "mundo-asha/trabalenguas" },
  { title: "Laberinto", view: "mundo-asha/laberinto" }, { title: "Juegos de voz", view: "mundo-asha/juegos" },
];
/** Future server contract. Never accepted from a prototype's click, timer or microphone volume. */
export type VerifiedLearningAttempt = { id: string; patientId: number; worldId: string; levelId: string; version: string; passed: boolean; verifiedBy: "server" | "professional" };
export function deriveWorldProgress(world: LearningWorld, patientId: number, attempts: VerifiedLearningAttempt[] | null) {
  if (attempts === null) return { connected: false as const, completed: null, total: world.levels.length, percent: null, levels: [] };
  const unique = new Map<string, VerifiedLearningAttempt>();
  const conflicting = new Set<string>();
  for (const attempt of attempts) {
    if (attempt.patientId !== patientId || attempt.worldId !== world.id || attempt.version !== world.version) continue;
    // Conflicting duplicates cannot contribute to completion until the server resolves them.
    if (conflicting.has(attempt.id)) continue;
    if (!unique.has(attempt.id)) unique.set(attempt.id, attempt);
    else {
      const first = unique.get(attempt.id)!;
      if (first.levelId !== attempt.levelId || first.passed !== attempt.passed || first.verifiedBy !== attempt.verifiedBy) { unique.delete(attempt.id); conflicting.add(attempt.id); }
    }
  }
  const rows: { level: LearningLevel; state: "completed" | "available" | "locked" }[] = [];
  let previousComplete = true;
  for (const level of world.levels) {
    const passed = [...unique.values()].some(a => a.levelId === level.id && a.passed && (level.validation === "objective" || a.verifiedBy === "professional"));
    const completed = previousComplete && passed;
    rows.push({ level, state: completed ? "completed" : previousComplete ? "available" : "locked" });
    previousComplete = completed;
  }
  const completed = rows.filter(row => row.state === "completed").length;
  return { connected: true as const, completed, total: rows.length, percent: rows.length ? Math.round(completed / rows.length * 100) : 0, levels: rows };
}
