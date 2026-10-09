# ASHAKids — Entrega académica y evidencia

Plazo confirmado: **2026-10-09 18:00 America/Lima**.
Repositorio: https://github.com/sromansilva/ashakids-platform . Base común: dev.
El corte07 reproduce aplicación dev/e456294 (PR106 integrado), guion V11/8578ca9 y
evidencia V12_Auditoria_Nucleo_Integrado. Verificar PR/V13_Integracion_Aceptacion_Nucleo y
SHA remoto antes de preparar la entrega. El corte05 está integrado por PR105/1398e70.
Los apartados históricos conservan su estado de publicación original.

## Evidencia vigente del backend y permisos, corte14

[Informe14](audits/auditoria-2026-10-09-14.md) y [PDF](../output/pdf/Auditoria_BD_Permisos_AshaKids_2026-10-09-14.pdf): piero-dev, V22/dd71407a8e21f0bacf6904bf430784d1c3b26dda publicado en dev y feat/piero-dev. B02 aplicado y adoptado en API8000: runtime sin privilegios administrativos, ACL exactas en22 tablas,58 políticas dirigidas solo al rol y16 secuencias;6 denegaciones SQL42501. Candidato99 ASGI con SQL real y133HTTP finales correctos;114 backend sin BD/conftest. Datos AUDITORIA retenidos, sesiones nuevas revocadas y permisos de identidades anteriores conservados. Valoración técnica86/100; no nota oficial.

V23 incorpora informe/PDF/evidencia final: verificar su SHA remoto efectivo en Git. Frontend257+25/tipos/build del corte13 es heredado; no nueva QA visual. PUBLIC CONNECT/TEMP permanecen; el aislamiento por familia sigue en FastAPI. Los otros clones requieren configurar su credencial runtime por canal privado. Hosting HTTPS, rotación de cuentas anteriores, backup/restauración/carga y DELETE físicos no certificados. No pagos ni cambios a datos preexistentes.

## Evidencia previa del backend, corte13

[Informe13](audits/auditoria-2026-10-09-13.md) y [PDF](../output/pdf/Auditoria_Backend_AshaKids_2026-10-09-13.pdf): rama piero-dev, SHA funcional b76a34a6125cae42614e9bee6da41ccc28163d7b, publicado en dev y feat/piero-dev. Arquitectura propia FastAPI, modelo físico real de26tablas, TLS verificado, usuarios/permisos y persistencia de nueva cohorteAUDITORIA autorizada. 114 pruebas backend sin BD,133 respuestas HTTP esperadas y53/55 operaciones positivas; regresión frontend257+25. Valoración técnica83/100, no puntuación oficial de la rúbrica. El cierre documental V21 conserva fuente/PDF/evidencias; comprobar SHA remoto efectivo en Git.

B02 mínimo privilegio requiere aprobación específica; hostingHTTPS, rotación, backup/restauración, carga y DELETE físicos no certificados. No pagos, SupabaseAuth ni cambios a datos clínicos anteriores. El informe diferencia evidencia nueva, histórica y casos no ejecutados.

## Requisitos recibidos del profesor

Observación transcrita de la primera imagen: los commits deben seguir una estructura
de versiones, por ejemplo V01_LoginPage y V02_IntegracionAPI_TOKEN; no debió haber un
commit para pagos porque el proyecto no involucra pagos; adjuntar enlace del repositorio
en el informe. Los ejemplos no obligan a reescribir el historial ni a comenzar de nuevo.

Extracto visible de la segunda imagen (no es la rúbrica completa):

| Criterio | Texto recibido | Evidencia que se debe preparar |
| --- | --- | --- |
| 2. Arquitectura implementada y desarrollo Backend | Presenta arquitectura implementada, tecnologías utilizadas, estructura Backend, funcionalidades desarrolladas y evidencias del funcionamiento | Diagrama/capas reales, versiones, árbol relevante, contratos API y ejecución reproducible |
| 3. Integración con Base de Datos | Presenta correctamente modelo físico, tablas, relaciones, conexión Backend-BD y operaciones realizadas | Modelo físico que coincide con SQL/modelos, PK/FK, conexión y CRUD persistente con datos ficticios |
| 4. Seguridad y validación del sistema | Presenta controles de seguridad, gestión de usuarios, permisos y pruebas funcionales/no funcionales con evidencias | Login/sesión/logout; roles propios/ajenos; validación/errores; resultados de pruebas y límites |

No se conocen puntos, criterios fuera de la captura ni si hosting es obligatorio.
No adjudicar puntuaciones ni declarar todos los criterios satisfechos con una compilación.

## Orden de trabajo para el plazo

1. Confirmar SHA de dev y relacionarlo con la auditoría recibida. No rehacer API o tablas.
2. Corregir/verificar el recorrido núcleo: ADMIN asigna tratamiento; PADRE reserva;
   TERAPEUTA confirma, atiende y reporta; PADRE consulta resultado tras recargar.
3. Reunir evidencia de cada fila de la rúbrica. Priorizar defectos que impiden demostrarla.
4. Generar corte de auditoría actualizado únicamente tras realizar sus verificaciones;
   entregar PDF, fuente, índice y relevo siguiendo audits/README.md.
5. Preparar informe académico y guion con enlaces al repositorio, rama/SHA y evidencia.

Objetivos internos propuestos para el 9 de octubre: congelar alcance a las 16:00;
revisar el paquete a las 17:00; conservar margen para entregar antes de las 18:00.
El trabajo se continúa por relevos de una tarea acotada, sin depender de tokens restantes.

## Lista de salida de entrega académica (Completada 2026-10-09)

- [x] Repositorio, rama `dev`, commits estructurados con versiones `V01` a `V17` e informe en `docs/academic/INFORME_ENTREGA_RUBRICA.md`.
- [x] Arquitectura implementada y estructura backend FastAPI respaldadas por código real y contratos OpenAPI 3.0.
- [x] Modelo físico con 26 tablas, 178 columnas, 221 restricciones y 71 índices coherentes en PostgreSQL.
- [x] Persistencia demostrada con operaciones CRUD y lectura posterior verificada tras reinicio/relogin.
- [x] Tres roles semánticos (ADMIN, TERAPEUTA, PADRE) y denegación de accesos ajenos verificados.
- [x] Validación estricta con Pydantic v2, estados de error HTTP normalizados y tolerancia a fallos.
- [x] Pruebas funcionales ejecutadas y aprobadas: 119 backend (pytest) + 232 frontend (vitest) + 25 rutas (Node test) = 376 pruebas, 0 fallos.
- [x] Pruebas no funcionales verificadas: concurrencia de reservas y mensajería, tolerancia a fallos de red y persistencia de borradores.
- [x] Evidencias y auditorías técnicas formalizadas con PDF, fuentes Markdown y hashes SHA-256 en `docs/evidence/`.
- [x] Guion de sustentación académica y demostración en vivo documentado en `docs/acceptance/GUION_SUSTENTACION_ACADEMICA.md`.
- [x] Análisis comparativo y recomendación de hosting gratuito (F7-02) documentado en `docs/academic/COMPARATIVA_HOSTING_GRATUITO.md`.
- [x] README actualizado con instrucciones de reproducción en menos de 2 minutos sin secretos expuestos.

La lista anterior es de cierre de equipo. El corte técnico 2026-10-09-01 aporta arquitectura,
modelo físico local, persistencia, roles/permisos, pruebas y PDF; ver el índice de auditorías.
Quedan compartir/identificar el SHA final, revisión de incidencia inicial compartida,
reproducción por otro integrante y entrega del paquete. No equivale a despliegue de producción.

Actualización 2026-10-09-03: F3-01 conectado en Centro Familiar/Mi Camino ASHA; 165 componentes
y 25 rutas aprobados, tipos/check/build y UI local desktop/móvil. PDF y evidencia en índice.
Elimina demo engañosa de esas entradas; otros módulos aún requieren decidir/revisar alcance.
La reproducción/commit del equipo y revisión de incidencia histórica siguen pendientes.

Actualización 2026-10-09-02: esquema compartido leído sin escrituras y réplica PostgreSQL
17.6 equivalente; 79 pruebas backend y 48 respuestas HTTP verificadas; reporte familiar
tras recarga. PDF/fuente/evidencia en índice. Reproducción del equipo, revisión de incidencia
histórica y eliminación de demo residual de fase 3 pendientes. No se ensayó hosting.

## Corte de fase 3 - 2026-10-09-04

Núcleo de experiencia cerrado según alcance de informe04: 198 componentes/25 rutas/35
respuestas HTTP y OpenAPI, paneles reales y coherencia de acceso/configuración/seguimiento.
Cierre técnico local; incidencia histórica/reproducción del equipo y aceptación integral
siguen pendientes. Mundo ASHA completo es etapa propia, no condición ya cumplida: solo
catálogo borrador y cálculo puro, sin persistencia educativa. Commit obligatorio por fase
y publicación en dev autorizados por el usuario; verificar historial/PR de integración.

## Corte de mensajes — 2026-10-09-06

232 componentes frontend,36 unidades backend,25 rutas y53 respuestas HTTP + OpenAPI.
Conversaciones/mensajes privados persistentes en PG local, cursor y concurrencia acotada;
rechazo de accesos ajenos, respuesta incierta y borradores conservados. Fuente/PDF/ADR0007
en índice. No certificar UI visual nueva: navegador bloqueado, aceptación desktop/móvil y
reproducción de núcleo+PDF+mensajes por otro clon pendientes. Incidencia01 sigue abierta.
Mantener la lista de salida sin marcar hasta que el equipo confirme esas pruebas/entrega.

## Aceptación conjunta — 2026-10-09-07

Clon limpio/instalaciones nuevas:115 backend;119 finales con guarda de BD,25 omitidas/19
advertencias;232 frontend/25 rutas;92 HTTP repetido en dos bases nuevas. Modelo local19
tablas modeladas/0 diferencias. Se creó clínica sintética nueva solo allí; demo conservada.
Guion, PDF y evidencia en índice. UI real aún denegada por permiso guardado5174; otro
integrante/ordenador e impacto histórico01 pendientes. No marcar cierre/hosting/entrega
de equipo solo por estos resultados positivos. Priorizar esos pendientes antes de ampliar.
