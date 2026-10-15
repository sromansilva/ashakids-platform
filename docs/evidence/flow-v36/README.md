# V36 — Paneles, agenda por niño, mundos demo y enlace externo

Fecha:2026-10-10. Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama exclusiva codex/2do-intento, base V35/7faa66682fc1b03d57b23aa96f196a35dddfcc31.
Identificar el SHA final de V36 con Git. Evidencia de implementación; no nueva auditoría
académica, puntuación, despliegue ni adopción en dev/Supabase.

## Comprobaciones nuevas

- Backend: `.venv313/Scripts/python.exe -m pytest tests -q`, desde backend,201 aprobadas,
  25 omitidas,19 deprecaciones,54.76s. URL test y admin apuntan SOLO a PostgreSQL17.6
  loopback6544/ashakids_test_flujo_v34_20261010; LOGIN_PAIR_LIMIT100/IP1000 en ese proceso.
  Dos casos nuevos: pertenencia y lectura del enlace, HTTPS/dominio/credenciales/puerto,
  quitar enlace, cita cancelada y modalidad presencial. No cambia límites del producto.
- Frontend final: `npm run test`,278 componentes/17 archivos y25 rutas aprobadas.
  `npm run typecheck`, `npm run check:frontend`333 archivos/máximo498 y build3.03s correctos.
  Aviso DEP0205 del entorno Node. Ocho casos nuevos: completar/repetir/aislar demo y cuenta;
  hermanos e historial, próximas vs EN_CURSO, agenda completada/teclado, analíticas y
  error/éxito real de enlace. Jsdom no acredita aceptación visual integrada.
- HTTP QA:22 respuestas con estado esperado en requests.json; introducción cerrada por HTTP,
  Ana habilitada/Luis pendiente, contexto profesional autorizado, escritura ajena404,
  reingreso/PDF/enlace persistido. Este JSON conserva el corte previo a recuperar navegador.
- Navegador recuperado: reserva familiar R4 con profesional2, lectura de reporte1 sin editor,
  reporte2 y sesión2 FINALIZADA/ASISTIO cerrados mediante confirmación dentro de la app.
  Plan1 previo conserva su autor. Familia reingresa, ve ambos reportes y enlace R4 de lectura.
- Lenguaje: respuesta incorrecta/reintento, completar tres niveles, desbloquear, mundo3/3,
  repetir sin inflar conteo, recarga y logout/reingreso en la misma pestaña conservan demo.
  Luis sin mundos asignados, introducción independiente pendiente. Asesor ADMIN abre alta
  institucional; reapertura sin autocompletado de credenciales del login. Vistas1280x720 y
 390x844 inspeccionadas y capturadas. Casos/procedencia en ui-results.json.
- PDF real de Ana obtenido de API local y PDF de segunda atención descargado desde UI,
  renderizados con Poppler e inspeccionados: una página cada uno, campos legibles sin recorte.
  Reporte_Sintetico_Ana_Flujo_V36.pdf y qa-snapshot.json conservan EN_CURSO inicial;
  Reporte_Sintetico_Ana_Flujo_V36_Finalizado.pdf conserva cierre HTTP de introducción;
  Reporte_Continuidad_Sintetico_Flujo_V36.pdf acredita contenido de descarga UI de sesión2.
  Las distintas descargas pueden tener metadatos PDF distintos; no se afirma igualdad binaria.

## Incidencias y límites

La confirmación nativa antigua «¿Finalizar la sesión?» detuvo IAB; getJsDialog y recuperar
otras pestañas no permitieron cerrarla. Se solicitó al usuario cerrar el aviso y en esta
continuación el navegador respondió. La confirmación dentro de la vista cerró sesión2
correctamente. Núcleo local demostrado, sin certificar todas las pantallas ni hosting.
Alta familiar/guarda de activación UI heredadas V33, disponibilidad/reprogramación V34,
creación de reporte1/plan1 V35. Envío de nueva contraseña ensayado por API local; no se
introdujo nueva credencial desde navegador. Primera introducción cerrada por HTTP.

Durante adaptación: test inicial1/273 falló por dos opciones del mismo niño (agenda/modal),
corregido consultando el diálogo. Otro selector de test demasiado amplio y una importación
X retirada por error se corrigieron antes del resultado final. Las primeras expectativas
de mundos antiguos y el resumen clínico se alinearon al contrato nuevo; no se relajó API.
Harness QA abortó por apellido sintético sin tilde, parámetro dia en vez de fecha y expectativa
403 en escritura ajena que correctamente responde404. La repetición agotó5 logins/300s y
recibió429; no se desactivó el limitador. Ver resultado final independiente del harness.

## Entorno de continuación

API8002/Vite5175 y QA persistente ashakids_test_flujo_qa_20261010 separada de los tests.
No ejecutar pytest contra QA. R1/Ana, sesión1, reporte1 y plan1 se guardaron desde UI en V35;
Luis tiene introducción propia pendiente. El cierre posterior por HTTP se registra aparte:
no atribuirlo a UI. Sesión2/reporte2/cierre y reserva R4 se operaron desde UI en V36.
Solo datos sintéticos, sin credenciales/cookies en los artefactos.
No se abrió ni comprobó una llamada de Zoom. Pagos/extensiones siguen fuera del núcleo.
