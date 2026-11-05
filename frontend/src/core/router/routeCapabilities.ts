// Capability metadata; modules without a data source render empty states.
const persisted = new Set([
  "/padre", "/padre/welcome", "/padre/dashboard", "/padre/camino", "/padre/mi-camino", "/padre/recorrido", "/padre/seguimiento",
  "/padre/hijos", "/padre/pacientes", "/padre/progreso", "/padre/config", "/padre/perfil", "/padre/agenda", "/padre/reportes", "/padre/psicologos",
  "/padre/mensajes", "/terapeuta/mensajes", "/terapeuta/valoraciones",
  "/terapeuta/analiticas", "/terapeuta/datos-actividad", "/terapeuta", "/terapeuta/agenda", "/terapeuta/pacientes", "/terapeuta/reportes",
  "/admin/cuentas", "/admin/solicitudes", "/admin/operacion", "/admin/auditoria", "/admin/config", "/admin/contenido", "/admin/ml", "/padre/incidencias", "/terapeuta/incidencias",
  "/admin", "/admin/dashboard", "/admin/usuarios", "/admin/pacientes", "/admin/citas", "/admin/sesiones",
]);
export function capabilityNotice(path: string) {
  if (/^\/(terapeuta|admin)\/sesion\/\d+$/.test(path)) return null;
  if (path === '/terapeuta/config') return 'Tu perfil, disponibilidad y preferencias de notificaciones se consultan en el servidor. La disponibilidad se guarda al publicar.';
  if (persisted.has(path) || path.startsWith("/register") || path === "/onboarding" || path === "/forgot-password" || path === "/padre/consentimiento") return null;
  if (['/mundo-asha', '/mundo-asha/insignias', '/mundo-asha/perfil'].includes(path)) return 'Actividades básicas de simulación con intentos, experiencia y medallas guardados por niño. No miden progreso clínico.';
  if (path.startsWith("/mundo-asha") || path === "/padre/recompensas") return "Mundo ASHA está en preparación. Los juegos actuales son prototipos; sus resultados no guardan avance por hijo ni validan pronunciación.";
  return 'Próximamente';
}

export function isUpcomingModule(path: string) {
  return path.startsWith('/mundo-asha/') && !['/mundo-asha/insignias', '/mundo-asha/perfil'].includes(path);
}
