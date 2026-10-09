

export type View =
  | "landing" | "login"
  | "padre" | "padre/agenda" | "padre/psicologos" | "padre/recompensas" | "padre/mensajes" | "padre/compras"
  | "padre/hijos" | "padre/progreso" | "padre/reportes" | "padre/config" | "padre/camino" | "padre/ayuda"
  | "padre/incidencias"
  | "terapeuta" | "terapeuta/agenda" | "terapeuta/pacientes" | "terapeuta/mensajes"
  | "terapeuta/reportes" | "terapeuta/analiticas" | "terapeuta/ingresos"
  | "terapeuta/valoraciones" | "terapeuta/config" | "terapeuta/datos-actividad"
  | "terapeuta/incidencias"
  | "admin" | "admin/dashboard" | "admin/cuentas" | "admin/terapeutas" | "admin/operacion" | "admin/pagos"
  | "admin/contenido" | "admin/ml" | "admin/auditoria" | "admin/config"
  | "admin/reportes" | "admin/usuarios" | "admin/pacientes" | "admin/citas" | "admin/sesiones"
  | "admin/analiticas" | "admin/mensajes" | "admin/moderacion" | "admin/solicitudes" | "admin/core"
  | "mundo-asha" | "mundo-asha/cuentos" | "mundo-asha/canciones" | "mundo-asha/trabalenguas"
  | "mundo-asha/adivinanzas" | "mundo-asha/juegos" | "mundo-asha/isla" | "mundo-asha/academia"
  | "mundo-asha/retos" | "mundo-asha/insignias" | "mundo-asha/perfil" | "mundo-asha/laberinto"
  | "session" | "session/prep" | "session/waiting" | "session/active"
  | "session/end" | "session/summary" | "session/rating" | "session/rewards"
  | "pay" | "pay/history" | "pay/wallet"
  | "public/especialistas" | "public/especialidades" | "public/mundo"
  | "public/recursos" | "public/ashi" | "public/historias" | "public/nosotros"
  | "public/planes" | "public/ayuda" | "public/contacto" | "public/trabaja"
  | "register" | "register/padre" | "register/verify" | "register/terapeuta" | "register/terapeuta/landing" | "register/terapeuta/success"
  | "onboarding"
  | "forgot-password"
  | "padre/recorrido" | "padre/consentimiento" | "padre/seguimiento" | "padre/evaluacion";

export type Role = "padre" | "terapeuta" | "admin" | null;
