// Only reviewed, server-backed entries omit the prototype notice. Unknown modules stay explicit.
const persisted = new Set([
  "/padre", "/padre/dashboard", "/padre/camino", "/padre/mi-camino", "/padre/recorrido", "/padre/seguimiento",
  "/padre/hijos", "/padre/pacientes", "/padre/progreso", "/padre/config", "/padre/perfil", "/padre/agenda", "/padre/reportes", "/padre/psicologos",
  "/padre/mensajes", "/terapeuta/mensajes",
  "/terapeuta/analiticas", "/terapeuta", "/terapeuta/agenda", "/terapeuta/pacientes", "/terapeuta/reportes",
  "/admin/cuentas",
  "/admin", "/admin/dashboard", "/admin/usuarios", "/admin/pacientes", "/admin/citas", "/admin/sesiones", "/admin/reportes",
]);
export function capabilityNotice(path: string) {
  if (path === '/admin/reportes') return 'Indicadores operativos ilustrativos, no calculados desde la BD. Los reportes clínicos reales se consultan y descargan desde Sesiones. Pagos no están incluidos en el alcance.';
  if (path === '/terapeuta/config') return 'Tu perfil, disponibilidad y preferencias de notificaciones se consultan en el servidor. La disponibilidad se guarda al publicar. Foto, 2FA y solicitudes siguen siendo demostrativas.';
  if (persisted.has(path) || path.startsWith("/register") || path === "/onboarding" || path === "/forgot-password" || path === "/padre/consentimiento") return null;
  if (path === '/mundo-asha') return 'Mundos asignados desde el plan real. Progresión de demostración por niño en esta pestaña, sin guardado educativo en el servidor ni medición clínica.';
  if (path.startsWith("/mundo-asha") || path === "/padre/recompensas") return "Mundo ASHA está en preparación. Los juegos actuales son prototipos; sus resultados no guardan avance por hijo ni validan pronunciación.";
  if (path === "/session" || path.startsWith("/session/")) return "Demostración de sesión virtual. Esta vista no conecta una videollamada ni registra una sesión clínica. Consulta las sesiones y reportes desde la agenda.";
  return "Módulo de demostración: sus acciones y datos pueden ser ilustrativos. El núcleo de usuarios, pacientes, tratamientos, citas, sesiones y reportes se consulta en sus secciones correspondientes.";
}
