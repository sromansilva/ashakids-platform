# AUDIT-2026-10-09-07 — Núcleo/PDF/mensajes y clon limpio

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama: dev.
App e456294cd7d13aea41dc5d00940b84aa782acbad (V10/PR106 integrado).
Guion y4 unidades:8578ca9cde56bac2ec04389a58ae282cc3fdc8e3 (V11).
Documento/evidencia V12; publicación efectiva en PR/historial de V13.

- runtime-and-reproduction.json:clon GitHub limpio, venv/npm instalados desde cero, versiones,
  estructuras/roles, bases/counters y límites. Mismo ordenador/agente y PG existente; no
  reproducción por otro compañero ni máquina. No copiar .env o tokens a este corte.
- backend-tests.xml/.txt:clon115 correctas/25 omitidas/19 avisos. backend-tests-final.xml/.txt:
 119 correctas/25 omitidas/19 avisos, con cuatro unidades de confirmación de destino. No sumar
 234 como casos distintos. regress07 separada permite TRUNCATE de fixtures locales.
- backend-asgi-evidence.json:combinaciones únicas método/ruta/status de pytest con ASGI y
  SQL real; no número de solicitudes de red ni nueva suite independiente.
- frontend-tests.xml:232 correctas en12 archivos, jsdom/fetch simulado. routing-tests.txt:25.
  typecheck/frontend-check/build correctos;318 fuentes, máximo495 líneas. Build292.83kB/
  gzip92.55kB. routing-first.txt:spawn EPERM inicial del sandbox, repetido con autorización.
- backend-install.txt/frontend-install.txt:instalaciones nuevas. npm ci180 paquetes/181
  auditados,0 vulnerabilidades reportadas; dependencia obsoleta y dos install scripts no
  cubiertos por allowScripts. No se aprobaron scripts manualmente; pruebas/build funcionaron.
- schema-local.json:READ ONLY en accept07,26 tablas/178 columnas/92 restricciones/71 índices;
 19 modelos/0 diferencias incluyendo mensajes. Esquema fuente02 histórico; sin nueva lectura
  de Supabase. schema-restore-first.txt:public ya existía; schema-restore.txt:restauración
  portable correcta. Solo CREATE SCHEMA public se hizo idempotente en una copia temporal.
- http-delivery-first.json y http-delivery-journey.json:92 respuestas cada una, con nuevas
  fixtures clínicas independientes. Final incorpora prueba de sesión/BD antes de clínica.
  Cada BD conserva6 cuentas,1 paciente/cita/sesión/reporte/chat y2 mensajes. Tiempo/estado
  ajustados por SQL solo en sus nuevos IDs; no modificaciones de demo ni reloj del sistema.
- reporte-sesion-primera-corrida.pdf / reporte-sesion-sintetica.pdf:PDFs nuevos de sus datos
  sintéticos, cotejados con campos JSON. La muestra final se renderizó e inspeccionó una página;
  no descarga/interacción de navegador nueva. Datos/IDs iguales no significan misma BD.
- restoration-and-target-guard.json:6 respuestas tras restaurar API8001 a compat17; reporte02
  y14 mensajes heredados leídos nuevamente. Comprobación SQL positiva del token emitido en
  BD correcta y negativa en otra; sin serializar token/hash y sin mutaciones clínicas.
- browser-limitation.json:intento5174 denegado tras indicación del usuario de acceso habilitado;
  inventario1/intento1, sin capturas/evasión. No confundir reinicio de API con cambio de permisos.
- attempts.json:fallos iniciales, omisiones, advertencias y repeticiones. knowledge-check.txt:
  mapa actual, AST local/code-only/no-label. Sin nuevo detector UI porque no cambió UI.
- pdf-qa.json/sanitized-secret-check.json/manifest.json:QA del PDF, revisión dirigida de secretos
  sin valores y hashes de evidencia/fuente. Ninguno certifica toda la plataforma o pentest.

Guion de reproducción y UI pendiente: docs/acceptance/CORE_PDF_MESSAGES.md. Una base nueva
de aceptación exige prefijo ashakids_test_accept07*; API loopback8001 y env de cliente/servidor
iguales. Usar otra base para pytest completo: sus fixtures resetean datos. No prepare/reset
sobre compat17 ni sobre una BD compartida. Las variables/procedimientos locales no son hosting.

Límites: UI desktop/móvil/teclado y recaptura PDF pendientes, no otro integrante, no producción/
carga/SLA. Incidencia01 revisada documentalmente y nueva contención local; su impacto histórico
necesita logs/baseline de equipo. No cuentas restauradas ni Supabase accedido en este corte.
