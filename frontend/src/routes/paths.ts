/**
 * Mapeo bidireccional entre URLs del navegador y vistas internas de ASHAKids.
 */

import type { View } from "@/types/navigation";
import type { SemanticRole } from "@/types/auth";

/**
 * Convierte un identificador de vista interna a una URL real del navegador.
 */
export function viewToPath(v: View | string): string {
  if (!v || v === "landing") return "/";
  if (v === "login") return "/login";
  if (v === "forgot-password") return "/forgot-password";
  if (v === "onboarding") return "/onboarding";

  // Páginas públicas
  if (v === "public/especialistas") return "/especialistas";
  if (v === "public/especialidades") return "/especialidades";
  if (v === "public/mundo") return "/mundo-asha";
  if (v === "public/recursos") return "/recursos";
  if (v === "public/nosotros") return "/sobre-nosotros";
  if (v === "public/planes") return "/planes";
  if (v === "public/ayuda") return "/ayuda";
  if (v === "public/contacto") return "/contacto";
  if (v === "public/trabaja") return "/trabaja";
  if (v === "public/ashi") return "/ashi";
  if (v === "public/historias") return "/historias";

  if (v.startsWith("register")) {
    return `/${v}`;
  }

  // Rutas de rol y módulos específicos
  if (v.startsWith("/")) return v;
  return `/${v}`;
}

/**
 * Convierte la ruta de URL actual a la vista interna correspondiente.
 */
export function pathToView(pathname: string, userRole?: SemanticRole | null): View {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";

  // Rutas públicas exactas
  if (cleanPath === "/") return "landing";
  if (cleanPath === "/login") return "login";
  if (cleanPath === "/forgot-password") return "forgot-password";
  if (cleanPath === "/onboarding") return "onboarding";
  if (cleanPath.startsWith("/register")) return "register" as View;

  if (cleanPath === "/especialistas") return "public/especialistas";
  if (cleanPath === "/especialidades") return "public/especialidades";
  if (cleanPath === "/recursos") return "public/recursos";
  if (cleanPath === "/sobre-nosotros" || cleanPath === "/nosotros") return "public/nosotros";
  if (cleanPath === "/planes") return "public/planes";
  if (cleanPath === "/ayuda") return "public/ayuda";
  if (cleanPath === "/contacto") return "public/contacto";
  if (cleanPath === "/trabaja") return "public/trabaja";
  if (cleanPath === "/ashi") return "public/ashi";
  if (cleanPath === "/historias") return "public/historias";

  // Mundo ASHA público vs módulo familiar
  if (cleanPath === "/mundo-asha") {
    return userRole === "PADRE" ? "mundo-asha" : "public/mundo";
  }

  // Aliases amigables
  if (cleanPath === "/padre/pacientes") return "padre/hijos" as View;
  if (cleanPath === "/padre/dashboard") return "padre";
  if (cleanPath === "/padre/perfil") return "padre/config" as View;
  if (cleanPath === "/padre/mi-camino") return "padre/camino" as View;
  if (cleanPath === "/admin/dashboard") return "admin";

  const viewKey = cleanPath.slice(1);
  return viewKey as View;
}

/**
 * Determina qué rol semántico (PADRE, TERAPEUTA, ADMIN) es requerido para una ruta,
 * o null si la ruta es pública.
 */
export function getRequiredRoleForPath(pathname: string, userRole?: SemanticRole | null): SemanticRole | null {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";

  // Rutas públicas sin autenticación requerida
  if (
    cleanPath === "/" ||
    cleanPath === "/login" ||
    cleanPath === "/forgot-password" ||
    cleanPath === "/onboarding" ||
    cleanPath.startsWith("/register") ||
    cleanPath === "/especialistas" ||
    cleanPath === "/especialidades" ||
    cleanPath === "/recursos" ||
    cleanPath === "/sobre-nosotros" ||
    cleanPath === "/nosotros" ||
    cleanPath === "/planes" ||
    cleanPath === "/ayuda" ||
    cleanPath === "/contacto" ||
    cleanPath === "/trabaja" ||
    cleanPath === "/ashi" ||
    cleanPath === "/historias"
  ) {
    return null;
  }

  // Si no está autenticado como Padre, la ruta raíz /mundo-asha es informativa pública
  if (cleanPath === "/mundo-asha" && userRole !== "PADRE") {
    return null;
  }

  // Rutas del área PADRE
  if (
    cleanPath === "/padre" ||
    cleanPath.startsWith("/padre/") ||
    cleanPath.startsWith("/mundo-asha") ||
    cleanPath.startsWith("/session") ||
    cleanPath.startsWith("/pay")
  ) {
    return "PADRE";
  }

  // Rutas del área TERAPEUTA
  if (cleanPath === "/terapeuta" || cleanPath.startsWith("/terapeuta/")) {
    return "TERAPEUTA";
  }

  // Rutas del área ADMIN
  if (cleanPath === "/admin" || cleanPath.startsWith("/admin/")) {
    return "ADMIN";
  }

  return null;
}
