# ASHAKids — Entrega académica y evidencia

Plazo confirmado: **2026-10-09 18:00 America/Lima**.
Repositorio: https://github.com/sromansilva/ashakids-platform . Base común: dev.
El corte06 se desarrolló en dev, código V08_Mensajes_Familia_Terapeuta, 7fddd59;
evidencia/documentación V09_Auditoria_Mensajeria. Verificar PR/V10_Integracion_Mensajeria y
SHA remoto antes de preparar la entrega. El corte05 ya está integrado por PR105/1398e70.
Los apartados históricos conservan su estado de publicación original.

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

## Lista de salida

- [ ] SHA de entrega, commits con versiones y repositorio incluidos en informe.
- [ ] Arquitectura implementada y estructura backend respaldadas por archivos reales.
- [ ] Modelo físico/tablas/relaciones coherentes con la BD del entorno de demostración.
- [ ] Persistencia probada con lectura posterior; no solo respuesta HTTP de mutación.
- [ ] Tres roles y rechazo de acceso ajeno documentados con datos sintéticos.
- [ ] Validación de entrada, estados/conflictos y caída de API comunicados correctamente.
- [ ] Pruebas funcionales ejecutadas y resultados completos, incluidas omisiones/advertencias.
- [ ] Pruebas no funcionales seleccionadas: por ejemplo, concurrencia, aislamiento de
      permisos, errores DB/rollback y tiempos observados en un entorno declarado.
      Usar evidencia nueva o citar explícitamente la histórica; no llamar pentest o
      prueba de carga a estos casos acotados.
- [ ] Nueva auditoría PDF si hubo corte nuevo; fuente, índice y evidencia localizables.
- [ ] Guion de demostración reproducible; módulos fuera de alcance identificados.
- [ ] README y relevo actualizados; sin secretos ni datos reales en entregables.
- [ ] Paquete revisado y compartido por el equipo antes de la hora límite.

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
