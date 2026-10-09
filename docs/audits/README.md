# ASHAKids — Índice y protocolo de auditorías

Repositorio: https://github.com/sromansilva/ashakids-platform .
Toda auditoría nueva debe entregarse en PDF y conservar fuente/evidencias para el siguiente relevo.

## Índice

| Corte | Origen y versión | PDF | Fuente / evidencia | Estado |
| --- | --- | --- | --- | --- |
| 2026-10-09-07, aceptación núcleo/PDF/chat | App e456294; guion V11/8578ca9; evidencia V12_Auditoria_Nucleo_Integrado | [Núcleo integrado](../../output/pdf/Auditoria_Nucleo_Integrado_AshaKids_2026-10-09-07.pdf) | [Fuente](auditoria-2026-10-09-07.md), [evidencias](../evidence/audit-2026-10-09-07/), [guion](../acceptance/CORE_PDF_MESSAGES.md) | Clon115 backend/final119,25 skip/19 avisos;232 frontend/25 rutas;92 HTTP repetido en2 BD; UI real/equipo/impacto01 pendientes |
| 2026-10-09-06, F5-01/mensajes | V08_Mensajes_Familia_Terapeuta, 7fddd59; evidencia V09_Auditoria_Mensajeria | [Mensajería](../../output/pdf/Auditoria_Mensajeria_AshaKids_2026-10-09-06.pdf) | [Fuente](auditoria-2026-10-09-06.md), [evidencias](../evidence/audit-2026-10-09-06/) | 232 frontend/36 unitarias backend/25 rutas/53 HTTP + OpenAPI; persistencia local real, aceptación visual/conjunto pendiente |
| 2026-10-09-05, F5-01/PDF | V05_Reportes_Exportacion_PDF, a8df56f; evidencia V06_Auditoria_Reportes_PDF | [Reportes PDF](../../output/pdf/Auditoria_Reportes_PDF_AshaKids_2026-10-09-05.pdf) | [Fuente](auditoria-2026-10-09-05.md), [evidencias](../evidence/audit-2026-10-09-05/) | 216 frontend/11 unitarias backend/25 rutas/28 HTTP + OpenAPI; mensajes pendientes, última recaptura móvil bloqueada |
| 2026-10-09-04, fase 3 núcleo | V01_Fase3, 9a6b061; evidencia en V02_AuditoriaFase3 | [Coherencia y mundos](../../output/pdf/Auditoria_Fase3_AshaKids_2026-10-09-04.pdf) | [Fuente](auditoria-2026-10-09-04.md), [evidencias](../evidence/audit-2026-10-09-04/) | 198 componentes/25 rutas/35 HTTP + OpenAPI; fase3 núcleo cerrada, juegos completos en etapa propia |
| 2026-10-09-03, F3-01 | HEAD 82f868f + cambios locales sin commit | [Seguimiento familiar](../../output/pdf/Auditoria_Fase3_AshaKids_2026-10-09-03.pdf) | [Fuente](auditoria-2026-10-09-03.md), [evidencias](../evidence/audit-2026-10-09-03/) | Centro Familiar/Mi Camino: 165 componentes, 25 rutas, UI local desktop/móvil; otros módulos pendientes |
| 2026-10-09-02, compatibilidad | HEAD 82f868f + cambios locales sin commit | [Compatibilidad](../../output/pdf/Auditoria_Compatibilidad_AshaKids_2026-10-09-02.pdf) | [Fuente](auditoria-2026-10-09-02.md), [evidencias](../evidence/audit-2026-10-09-02/) | Supabase solo lectura; réplica PG17.6, 79 pruebas y 48 respuestas HTTP; fase 3 siguiente |
| 2026-10-09-01, fase 2 | HEAD 82f868f + cambios locales sin commit | [Auditoría fase 2](../../output/pdf/Auditoria_Fase2_AshaKids_2026-10-09-01.pdf) | [Fuente](auditoria-2026-10-09-01.md), [evidencias](../evidence/audit-2026-10-09-01/) | Núcleo local verificado; incidencia inicial y reproducción de equipo pendientes |
| 2026-10-08, referencia | PDF aportado por usuario; SHA de auditoría no declarado | [Referencia archivada](../evidence/backend-2026-10-08/Auditoria_Backend_AshaKids_2026-10-08.pdf) | [Informe Markdown relacionado](../auditoria-backend-2026-10-08.md), [evidencia existente](../evidence/backend-2026-10-08/) | Histórico; recibido y leído, sin reejecutar sus pruebas |

PDF original preservado byte a byte al incorporarlo. SHA256:
`065833cdd45d2f23b9a07d605684ed55490ae28e3d1aec0bd4f3899b9a56417c`.
El informe Markdown relacionado tiene las mismas secciones principales; no es garantía
de reproducción byte a byte del PDF ni de vigencia de todos sus contratos.

## Forma del próximo informe

Usar [AUDIT_TEMPLATE.md](AUDIT_TEMPLATE.md). Conservar las ocho secciones del PDF modelo:
dictamen; arquitectura; identidad/pacientes; citas/sesiones/sistema; faltantes; seguridad;
evidencia/límites; cierre. Añadir repositorio, rama y SHA al principio y matriz de rúbrica
dentro de evidencia. Adaptar filas al alcance real; pagos se registran como fuera de alcance,
no como un defecto pendiente de implementar pasarela/webhooks.

Presentación equivalente: A4 vertical; franja superior turquesa; título azul oscuro;
secciones numeradas turquesa; tablas con cabecera azul y filas alternadas suaves;
fecha en encabezado y páginas numeradas en pie. Texto seleccionable, legible y sin recortes.
No exigir ocho páginas exactas: la extensión depende de evidencia y hallazgos.

## Protocolo por corte

1. Definir ID `AAAA-MM-DD-NN`, alcance, rama/SHA y estado del árbol Git. Si hay cambios
   sin commit, documentarlos; un SHA solo no reproduce modificaciones locales.
2. Leer contexto, último informe y código/OpenAPI relevante. Confirmar diferencias.
3. Realizar únicamente verificaciones autorizadas; escrituras en entorno descartable.
   No habilitar pruebas de BD compartida por seguir este documento.
4. Registrar comandos/casos, entorno, resultados, fallos, advertencias y omitidos.
   Distinguir observación de código, HTTP, persistencia y E2E; no heredar un resultado como nuevo.
5. Guardar fuente `docs/audits/auditoria-AAAA-MM-DD-NN.md`, evidencia sanitizada en
   `docs/evidence/audit-AAAA-MM-DD-NN/` y PDF en
   `output/pdf/Auditoria_ASHAKids_AAAA-MM-DD_NN.pdf`.
6. Generar PDF con la skill PDF; renderizar e inspeccionar páginas/tablas y reparar errores.
7. Añadir fila al índice; actualizar contexto y relevo con siguiente tarea y enlace de entrega.
8. Entregar PDF al usuario; compartir fuente/evidencia por Git según autorización/flujo del equipo.

No sobrescribir cortes anteriores ni regenerar un histórico con cifras nuevas. En la referencia
el plazo menciona el 10 de octubre y pagos aparecen como pendientes: esas propuestas quedan
sustituidas por entrega del 9 a las 18:00 Lima y observación docente actual. Conservar el original.

Incorporar esta referencia es una revisión documental, no una auditoría técnica nueva;
por eso este turno no genera otro PDF con los mismos resultados atribuidos a una ejecución nueva.
