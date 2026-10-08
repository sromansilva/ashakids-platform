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
}

export const DEFAULT_AVATAR_ID = "zorro";

export const AVATAR_CATALOG: AvatarOption[] = [
  {
    id: "zorro",
    name: "Zorro Astuto",
    emoji: "🦊",
    color: "#F97316",
    bgColor: "#FFEDD5",
    svgPath: "/avatars/zorro.svg",
  },
  {
    id: "oso",
    name: "Oso Amigable",
    emoji: "🐻",
    color: "#B45309",
    bgColor: "#FEF3C7",
    svgPath: "/avatars/oso.svg",
  },
  {
    id: "conejo",
    name: "Conejo Saltarín",
    emoji: "🐰",
    color: "#EC4899",
    bgColor: "#FCE7F3",
    svgPath: "/avatars/conejo.svg",
  },
  {
    id: "panda",
    name: "Panda Curioso",
    emoji: "🐼",
    color: "#374151",
    bgColor: "#F3F4F6",
    svgPath: "/avatars/panda.svg",
  },
  {
    id: "leon",
    name: "León Valiente",
    emoji: "🦁",
    color: "#EAB308",
    bgColor: "#FEF9C3",
    svgPath: "/avatars/leon.svg",
  },
  {
    id: "koala",
    name: "Koala Tranquilo",
    emoji: "🐨",
    color: "#6B7280",
    bgColor: "#E5E7EB",
    svgPath: "/avatars/koala.svg",
  },
  {
    id: "tortuga",
    name: "Tortuga Sabia",
    emoji: "🐢",
    color: "#10B981",
    bgColor: "#D1FAE5",
    svgPath: "/avatars/tortuga.svg",
  },
  {
    id: "buho",
    name: "Búho Sabio",
    emoji: "🦉",
    color: "#8B5CF6",
    bgColor: "#EDE9FE",
    svgPath: "/avatars/buho.svg",
  },
  {
    id: "mono",
    name: "Mono Juguetón",
    emoji: "🐵",
    color: "#D97706",
    bgColor: "#FDE68A",
    svgPath: "/avatars/mono.svg",
  },
  {
    id: "pinguino",
    name: "Pingüino Feliz",
    emoji: "🐧",
    color: "#0EA5E9",
    bgColor: "#E0F2FE",
    svgPath: "/avatars/pinguino.svg",
  },
];

const AVATAR_MAP = new Map<string, AvatarOption>(
  AVATAR_CATALOG.map((a) => [a.id, a])
);

/**
 * Obtiene la información visual del avatar a partir de su identificador en base de datos.
 * Retorna 'zorro' como fallback seguro si el identificador no existe.
 */
export function getAvatarInfo(avatarId?: string | null): AvatarOption {
  if (!avatarId) return AVATAR_MAP.get(DEFAULT_AVATAR_ID)!;
  return AVATAR_MAP.get(avatarId.toLowerCase()) || AVATAR_MAP.get(DEFAULT_AVATAR_ID)!;
}
