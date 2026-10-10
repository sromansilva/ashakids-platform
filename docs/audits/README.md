# ASHAKids — Índice y protocolo de auditorías

Repositorio: https://github.com/sromansilva/ashakids-platform .
Toda auditoría nueva debe entregarse en PDF y conservar fuente/evidencias para el siguiente relevo.

## Índice

| Corte | Origen y versión | PDF | Fuente / evidencia | Estado |
| --- | --- | --- | --- | --- |
| 2026-10-09-17, backend final HTTPS | piero-dev V25/7fb3668; runtime V24/62905fc | [Backend final](../../output/pdf/Auditoria_Backend_AshaKids_2026-10-09-17.pdf) | [Word](../../output/auditoria-final-2026-10-09/Auditoria_Backend_AshaKids_2026-10-09-17.docx), [fuente](auditoria-2026-10-09-17.md), [evidencias](../evidence/audit-2026-10-09-17/) | 91/100;144 HTTPS esperados;52/54 positivos;138 unidades/19 avisos;TLS/ACL/modelos READ ONLY;0 auth nuevas |
| 2026-10-09-16, frontend final HTTPS | piero-dev V25/7fb3668; runtime V24/62905fc | [Frontend final](../../output/pdf/Auditoria_Frontend_AshaKids_2026-10-09-16.pdf) | [Word](../../output/auditoria-final-2026-10-09/Auditoria_Frontend_AshaKids_2026-10-09-16.docx), [fuente](auditoria-2026-10-09-16.md), [evidencias](../evidence/audit-2026-10-09-16/) | 91/100;282 pruebas;UI3 roles;mensaje persistente;editar reporte falla;contraste/login pendientes;sin nueva QA móvil |
| 2026-10-09-15, despliegue HTTPS Render | dev; V24/62905fc runtime; cierre V25 | [Despliegue HTTPS](../../output/pdf/Auditoria_Despliegue_AshaKids_2026-10-09-15.pdf) | [Fuente](auditoria-2026-10-09-15.md), [evidencias](../evidence/audit-2026-10-09-15/) | Live Free;101 HTTPS+8 smoke;persistencia y0 sesiones auth;TLS/SCRAM compatible;sin nota nueva |
| 2026-10-09-14, adopción B02 en Supabase | piero-dev; V22/dd71407 | [BD y permisos backend](../../output/pdf/Auditoria_BD_Permisos_AshaKids_2026-10-09-14.pdf) | [Fuente](auditoria-2026-10-09-14.md), [evidencias](../evidence/audit-2026-10-09-14/) | 86/100; B02 aplicado:22 tablas/58 políticas/16 secuencias;6 rechazos SQL;99 candidato+133 HTTP finales;114 backend;hosting/recuperación pendientes |
| 2026-10-09-13, corrección y auditoría backend real | piero-dev; V20/b76a34a | [Backend con Supabase](../../output/pdf/Auditoria_Backend_AshaKids_2026-10-09-13.pdf) | [Fuente](auditoria-2026-10-09-13.md), [evidencias](../evidence/audit-2026-10-09-13/) | 83/100; 114 backend sin BD; 133 HTTP esperados; 53/55 operaciones positivas; TLS y concurrencia real; B02/HTTPS/rotación/recuperación pendientes |
| 2026-10-09-12, corrección y auditoría frontend real | feat/sroman; V18/a60d671 | [Frontend con Supabase](../../output/pdf/Auditoria_Frontend_AshaKids_2026-10-09-12.pdf) | [Fuente](auditoria-2026-10-09-12.md), [evidencias](../evidence/audit-2026-10-09-12/) | 94/100; 257 componentes + 25 rutas; 28 HTTP/SQL real; 11 backend seleccionadas; hosting/aceptación exhaustiva pendientes |
| 2026-10-09 auditoría Supabase real | feat/sroman/a397c0f + CORS local | Word separados por solicitud del usuario | [Fuente y enlaces Word](auditoria-real-supabase-2026-10-09.md), output/auditoria-real-2026-10-09/evidence | Frontend76/100, backend73/100;103 HTTP corregidos,47/55 contratos;producción no certificada |
| 2026-10-09-08, aceptación núcleo/PDF/chat entorno independiente | Base b3f84bd; entorno independiente HailQueso PG18.4 | [Aceptación núcleo/PDF/mensajes](../../output/pdf/Auditoria_Aceptacion_Nucleo_PDF_Mensajes_AshaKids_2026-10-09-08.pdf) | [Fuente](auditoria-2026-10-09-08.md), [evidencias](../evidence/audit-2026-10-09-08/) | Backend 119/25/19; 232 frontend/25 rutas; 92 HTTP entrega OK; driver Playwright falló descarga; UI real/hosting pendientes |
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
