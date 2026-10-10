# ADR0016 — Mundos demo y enlace externo de reunión

Fecha:2026-10-10. Rama codex/2do-intento; base V35/7faa666.

El usuario eligió demostración rotulada para la primera entrega educativa. La asignación
de mundos FLUIDEZ/HABLA/LENGUAJE permanece en el plan profesional persistido por la API.
Cada mundo ofrece tres niveles mínimos: pista, respuesta/orden, comprobación, completar,
desbloquear siguiente nivel, finalizar mundo y repetir sin aumentar el conteo.

Solo el avance demo se guarda en sessionStorage, separado por usuario/niño/mundo/versión.
Recargar o reingresar en esa pestaña puede conservarlo; cerrar la pestaña, otro dispositivo
o almacenamiento bloqueado no garantiza continuidad. No hay escrituras educativas en BD,
evaluación de pronunciación ni métricas clínicas derivadas. Las tablas educativas legadas
no se rellenan. Los antiguos prototipos siguen rotulados y no son el catálogo asignado.

Reserva.zoom_join_url ya existe: PUT /citas/{id}/reunion permite al profesional propio
o ADMIN compartir/retirar un enlace HTTPS de zoom.us/subdominios, sin usuario/clave ni
puerto alternativo. Solo citas virtuales no canceladas. Familia y contexto autorizado
consultan; el enlace abre servicio externo, sin crear reuniones ni registrar asistencia.
La asistencia se registra exclusivamente mediante la sesión clínica. No hay migración.

Los paneles usan citas futuras, atenciones propias ASISTIO y sesiones EN_CURSO; analíticas
filtra mes/año de Lima. La agenda familiar comparte selección del niño y mantiene citas
completadas/canceladas para consulta. No inventa pacientes, dirección ni reunión interna.

Reversión: conservar planes/reportes/asignaciones y retirar el reproductor demo o enlace
de navegación si fuera necesario. Borrar progreso local no cambia registros clínicos.
La persistencia educativa y la integración automática de Zoom quedan diferidas.
