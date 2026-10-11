// Capability metadata; modules without a data source render empty states.
const persisted = new Set([
  "/padre", "/padre/dashboard", "/padre/camino", "/padre/mi-camino", "/padre/recorrido", "/padre/seguimiento",
  "/padre/hijos", "/padre/pacientes", "/padre/progreso", "/padre/config", "/padre/perfil", "/padre/agenda", "/padre/reportes", "/padre/psicologos",
  "/padre/mensajes", "/terapeuta/mensajes", "/terapeuta/valoraciones",
  "/terapeuta/analiticas", "/terapeuta", "/terapeuta/agenda", "/terapeuta/pacientes", "/terapeuta/reportes",
  "/admin/cuentas", "/admin/operacion", "/admin/auditoria", "/admin/config", "/admin/contenido", "/admin/ml", "/padre/incidencias", "/terapeuta/incidencias",
  "/admin", "/admin/dashboard", "/admin/usuarios", "/admin/pacientes", "/admin/citas", "/admin/sesiones", "/admin/reportes",
]);
export function capabilityNotice(path: string) {
  if (path === '/admin/reportes') return 'Indicadores operativos ilustrativos, no calculados desde la BD. Los reportes clínicos reales se consultan y descargan desde Sesiones. Pagos no están incluidos en el alcance.';
  if (path === '/terapeuta/config') return 'Tu perfil, disponibilidad y preferencias de notificaciones se consultan en el servidor. La disponibilidad se guarda al publicar.';
  if (persisted.has(path) || path.startsWith("/register") || path === "/onboarding" || path === "/forgot-password" || path === "/padre/consentimiento") return null;
  if (['/mundo-asha', '/mundo-asha/insignias', '/mundo-asha/perfil'].includes(path)) return 'Actividades básicas de simulación con intentos, experiencia y medallas guardados por niño. No miden progreso clínico.';
  if (path.startsWith("/mundo-asha") || path === "/padre/recompensas") return "Mundo ASHA está en preparación. Los juegos actuales son prototipos; sus resultados no guardan avance por hijo ni validan pronunciación.";
  if (path === "/session" || path.startsWith("/session/")) return "Demostración de sesión virtual. Esta vista no conecta una videollamada ni registra una sesión clínica. Consulta las sesiones y reportes desde la agenda.";
  return 'Próximamente';
}

export function isUpcomingModule(path: string) {
  if (path.startsWith('/session')) return true;
  if (path.startsWith('/mundo-asha/')) return !['/mundo-asha/insignias', '/mundo-asha/perfil'].includes(path);
  return ['/terapeuta/ingresos', '/terapeuta/datos-actividad', '/admin/analiticas', '/admin/mensajes', '/admin/moderacion', '/admin/solicitudes', '/admin/core', '/admin/reportes'].includes(path);
}
