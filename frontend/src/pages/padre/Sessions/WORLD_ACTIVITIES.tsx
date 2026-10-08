
export const WORLD_ACTIVITIES: Record<string, {
  name: string; icon: string; color: string; bg: string; desc: string;
  activities: { id: string; nombre: string; desc: string; nivel: string; maxEstrellas: number; icon: string }[];
}> = {
  bosque: {
    name: "Bosque de los Cuentos",
    icon: "🌲",
    color: "#059669",
    bg: "#D1FAE5",
    desc: "¡Adéntrate en el bosque y descubre historias llenas de magia y aprendizaje!",
    activities: [
      { id: "osito", nombre: "El osito viajero", desc: "Un cuento sobre un osito que viaja y aprende palabras nuevas.", nivel: "Básico", maxEstrellas: 15, icon: "🐻" },
      { id: "leon", nombre: "El León y el Ratón", desc: "Una fábula clásica sobre la amistad entre animales muy diferentes.", nivel: "Básico", maxEstrellas: 15, icon: "🦁" },
    ],
  },
  musical: {
    name: "Montaña Musical",
    icon: "🎵",
    color: "#7C3AED",
    bg: "#EDE9FE",
    desc: "¡Sube a la montaña y deja que la música te guíe en esta aventura sonora!",
    activities: [
      { id: "arcoiris", nombre: "La canción del arcoíris", desc: "Escucha, canta y responde preguntas sobre esta alegre canción.", nivel: "Básico", maxEstrellas: 12, icon: "🌈" },
    ],
  },
  adivinanzas: {
    name: "Valle de Adivinanzas",
    icon: "❓",
    color: "#D97706",
    bg: "#FEF3C7",
    desc: "¡Sé el mejor detective y resuelve todas las adivinanzas del valle!",
    activities: [
      { id: "animal", nombre: "¿Qué animal soy?", desc: "Adivina qué animal se describe en cada pista. ¿Puedes descubrirlo?", nivel: "Básico", maxEstrellas: 10, icon: "🦊" },
    ],
  },
  laberinto: {
    name: "Laberinto de Trabalenguas",
    icon: "🌀",
    color: "#7C3AED",
    bg: "#F5F0FF",
    desc: "¡Recorre el laberinto de palabras! Cada fragmento completado te acerca más a la salida.",
    activities: [
      { id: "trabalenguas2", nombre: "Trabalenguas nivel 2", desc: "Un trabalenguas desafiante dividido en etapas. ¡Recítalo con claridad!", nivel: "Intermedio", maxEstrellas: 20, icon: "🗣️" },
    ],
  },
  laboratorio: {
    name: "Laboratorio de Juegos",
    icon: "🔬",
    color: "#0891B2",
    bg: "#ECFEFF",
    desc: "¡Bienvenido al laboratorio! Aquí los juegos de voz son experimentos increíbles.",
    activities: [
      { id: "vozaventura", nombre: "Voz aventura", desc: "Una aventura de sonidos donde tu voz es la herramienta principal.", nivel: "Intermedio", maxEstrellas: 20, icon: "🎙️" },
    ],
  },
};
