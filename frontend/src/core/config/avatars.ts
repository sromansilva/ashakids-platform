/**
 * Catálogo centralizado de avatares infantiles para ASHAKids.
 * Coherente entre el backend (PACIENTES.avatar_nombre) y la interfaz de usuario.
 */

export interface AvatarOption {
  id: string; // Coincide con avatar_nombre en PostgreSQL (ej. 'zorro', 'oso')
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  svgPath: string;
  imagePath: string;
}

export const DEFAULT_AVATAR_ID = "zorro";

export const AVATAR_CATALOG: AvatarOption[] = [
  {
    id: "oso",
    name: "Oso Amigable",
    emoji: "🐻",
    color: "#B45309",
    bgColor: "#FEF3C7",
    svgPath: "/avatars/oso.svg",
    imagePath: "/avatar_paciente/oso.jpg",
  },
  {
    id: "zorro",
    name: "Zorro Astuto",
    emoji: "🦊",
    color: "#F97316",
    bgColor: "#FFEDD5",
    svgPath: "/avatars/zorro.svg",
    imagePath: "/avatar_paciente/zorro.jpg",
  },
  {
    id: "conejo",
    name: "Conejo Saltarín",
    emoji: "🐰",
    color: "#EC4899",
    bgColor: "#FCE7F3",
    svgPath: "/avatars/conejo.svg",
    imagePath: "/avatar_paciente/conejo.jpg",
  },
  {
    id: "panda",
    name: "Panda Curioso",
    emoji: "🐼",
    color: "#374151",
    bgColor: "#F3F4F6",
    svgPath: "/avatars/panda.svg",
    imagePath: "/avatar_paciente/panda.jpg",
  },
  {
    id: "leon",
    name: "León Valiente",
    emoji: "🦁",
    color: "#EAB308",
    bgColor: "#FEF9C3",
    svgPath: "/avatars/leon.svg",
    imagePath: "/avatar_paciente/leon.jpg",
  },
  {
    id: "koala",
    name: "Koala Tranquilo",
    emoji: "🐨",
    color: "#6B7280",
    bgColor: "#E5E7EB",
    svgPath: "/avatars/koala.svg",
    imagePath: "/avatar_paciente/koala.jpg",
  },
  {
    id: "tortuga",
    name: "Tortuga Sabia",
    emoji: "🐢",
    color: "#10B981",
    bgColor: "#D1FAE5",
    svgPath: "/avatars/tortuga.svg",
    imagePath: "/avatar_paciente/tortuga.jpg",
  },
  {
    id: "buho",
    name: "Búho Sabio",
    emoji: "🦉",
    color: "#8B5CF6",
    bgColor: "#EDE9FE",
    svgPath: "/avatars/buho.svg",
    imagePath: "/avatar_paciente/buho.jpg",
  },
  {
    id: "mono",
    name: "Mono Juguetón",
    emoji: "🐵",
    color: "#D97706",
    bgColor: "#FDE68A",
    svgPath: "/avatars/mono.svg",
    imagePath: "/avatar_paciente/mono.jpg",
  },
  {
    id: "pinguino",
    name: "Pingüino Feliz",
    emoji: "🐧",
    color: "#0EA5E9",
    bgColor: "#E0F2FE",
    svgPath: "/avatars/pinguino.svg",
    imagePath: "/avatar_paciente/pinguino.jpg",
  },
];

/**
 * Catálogo de los 8 avatares infantiles principales con sus imágenes JPG en /avatar_paciente/
 */
export const PACIENTE_AVATARES = AVATAR_CATALOG.slice(0, 8);

const AVATAR_MAP = new Map<string, AvatarOption>(
  AVATAR_CATALOG.map((a) => [a.id, a])
);

/**
 * Obtiene la información visual del avatar a partir de su identificador en base de datos.
 * Retorna 'zorro' como fallback seguro si el identificador no existe.
 */
export function getAvatarInfo(avatarId?: string | null): AvatarOption {
  if (!avatarId) return AVATAR_MAP.get(DEFAULT_AVATAR_ID)!;
  return AVATAR_MAP.get(avatarId.toLowerCase().trim()) || AVATAR_MAP.get(DEFAULT_AVATAR_ID)!;
}

/**
 * Retorna la ruta a la imagen JPG del avatar del paciente (/avatar_paciente/{id}.jpg).
 */
export function getPacienteAvatarImage(avatarId?: string | null): string {
  const av = getAvatarInfo(avatarId);
  return av.imagePath;
}
