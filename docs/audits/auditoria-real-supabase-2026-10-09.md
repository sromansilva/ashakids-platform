# Auditoría general frontend y backend con Supabase real

Fecha: 2026-10-09. Rama: `feat/sroman`. SHA: `a397c0f30d143662c3b5299bb61ddf19163ec213`.
Repositorio: https://github.com/sromansilva/ashakids-platform.

## Dictamen

Puntajes técnicos propios: frontend **76/100**, backend **73/100**. El núcleo tiene persistencia real,
pero no se certifica producción pública, cobertura del 100%, cumplimiento sanitario ni toda la navegación.
Los Word separados desarrollan el criterio, dimensiones, resultados y límites:

- [Frontend](../../output/auditoria-real-2026-10-09/Auditoria_Frontend_AshaKids.docx).
- [Backend](../../output/auditoria-real-2026-10-09/Auditoria_Backend_AshaKids.docx).

El usuario autorizó expresamente registros AUDITORIA en la BD compartida. No se alteraron registros
clínicos ni cuentas preexistentes. No se hizo pull, commit, push ni implementación funcional.
Se preservaron los ajustes locales anteriores de CORS.

## Entorno y evidencia nueva

Web localhost5174, FastAPI8000, configuración `backend/.env`, PostgreSQL17.6 en Supabase.
La sesión emitida por API se verificó en la BD configurada antes de escribir clínica.
No se usó8001 ni una BD local para el recorrido real de esta auditoría.

Los guiones corregidos aprobaron **69 + 34 = 103** respuestas esperadas. La corrida inicial tuvo
errores de método/ruta y un horario demasiado próximo; se conserva por trazabilidad y no se cuenta
como fallo del producto. Sus altas correctas son evidencia adicional de creación de usuarios,
paciente y tratamiento. Hay **47 de55 contratos** con respuesta esperada específica registrada;
el inventario completo y los ocho sin prueba HTTP específica aparecen en el Word backend.

Metadatos en READ ONLY:26 tablas,178 columnas,92 constraints,71 índices,19 tablas ORM,
0 diferencias de columnas/tipos/nulabilidad/longitudes. RLS habilitado,0 políticas públicas.
El usuario de ejecución tiene BYPASSRLS, CREATEDB y CREATEROLE. El cliente negocia TLS1.3,
pero no verifica el certificado. `pg_stat_ssl=false` describe el tramo visto por PostgreSQL,
no significa que el cliente al pooler esté sin cifrado.

Pruebas complementarias frontend: tipos, build,25 rutas y232 componentes correctos;
check:frontend318 archivos/máximo495 líneas. Bundle principal292.85kB/gzip92.55kB.
Auditoría npm de dependencias de producción:0 vulnerabilidades conocidas.
Backend:63 pruebas seleccionadas aprobadas,2 omitidas;144 recolectadas, no ejecutadas todas.
Se instaló la dependencia de desarrollo pypdf declarada; pip check correcto.
No se ejecutaron fixtures TRUNCATE sobre Supabase.

## Matriz de capacidades y evidencia

| API o capacidad | Pantalla o acción | Evidencia real |
| --- | --- | --- |
| /auth/login, /auth/me, /auth/logout | Acceso por rol y sesión | HTTP y navegador; recuperación tras recarga |
| /admin/me, /padres/me, /terapeutas/me | Identidad del panel | HTTP de tres roles; paneles navegables |
| /usuarios y /admin/cuentas | Cuentas y búsqueda administrativa | Alta de cuatro cuentas AUDITORIA; edición, suspensión y activación HTTP; lectura UI |
| /pacientes, /padres/hijos | Hijos y pacientes administrativos | Registro85 y edición HTTP; edición UI y recarga; baja/reactivación sintéticas |
| /tratamientos y /pacientes/{id}/tratamientos | Asignación administrativa | Tratamiento5, perfil profesional14; detalle visible en modal UI |
| /citas | Agenda | Reserva2, conflicto409 y confirmación; agendas navegables |
| /sesiones, /iniciar, /cerrar | Sesión profesional | Sesión1 FINALIZADA con asistencia por HTTP |
| /sesiones/{id}/reporte y /reporte/pdf | Reporte familiar y detalle | Cuatro campos reales; lectura por rol; PDF físico descargado en navegador |
| /conversaciones y /mensajes | Mensajes familia/profesional | Conversación1; dos mensajes HTTP y uno UI; persistencia tras recarga |
| /health, /health/ready, OpenAPI | Diagnóstico | Respuestas200; conexión BD comprobada |

Otros usuarios reciben404 sobre los recursos clínicos ajenos. Admin recibe403 en chat privado.
Se probaron401 sin sesión,403 rol/origen,404 recursos ajenos,409 conflictos y422 validación.
CORS permite localhost5174 con credenciales. Las pruebas no equivalen a pentest ni carga.

## Hallazgos

- Alta: /terapeuta/reportes sigue simulado con firma e historia ficticias y sin aviso de demo.
- Alta: destino local8000 frente a proxy de vite.config.ts8001; build local no publicable sin configuración final.
- Alta: TLS sin validación de certificado y usuario de BD privilegiado.
- Alta para exposición pública: cuentas conocidas de desarrollo y cookie sin Secure en development.
- Media: vocabulario de sexo M/F/OTRO frente a Masculino/Femenino/Otro; precarga incorrecta observada.
- Media: ASHI anuncia contexto de ejemplo no vinculado a la cuenta conectada.
- Media: texto de exclusividad clínica para padre/terapeuta contradice el acceso administrativo permitido.
- Media: contratos administrativos duplicados con políticas de contraseña distintas.
- Media: no se encontró limitación de intentos de login; carga, backups y concurrencia no certificados.
- Baja: /admin/cuentas real muestra aviso genérico de demostración.
- Mantenimiento: pacientes_service.py501 líneas, admin_service.py847 líneas.

## Límites y alcance conservado

Mundo ASHA y juegos son prototipos; pagos, incidencias, analíticas, preferencias y sesiones virtuales
demostrativas no se consideran operaciones persistentes. Mensajería sí funciona y no es un faltante.
Pagos y WebRTC nativo están diferidos por el alcance académico; no se agregaron endpoints.
Faltan APIs completas de progreso educativo, voz, consentimiento, firma clínica, registro público,
recuperación de contraseña y servicios externos de ASHI.

Navegador real: padre, terapeuta y admin; edición sintética, lectura posterior, PDF, mensajes,
denegación de /admin al padre y ruta desconocida. Móvil390x844: menú, panel familiar e incidencias.
Sin recorrido de cada ruta, todos los modales, navegación histórica completa, falla de red real,
expiración real, concurrencia bajo carga ni ciclo clínico íntegro ejecutado desde formularios.

## Registros conservados

Cuentas46–49, paciente85, tratamiento5, citas1(cancelada) y2(completada), sesión1, conversación1.
Tres mensajes sintéticos tras la prueba UI. Las cuentas y registros permanecen; excluirlos de métricas.
No se borró ningún registro compartido. Los guiones contienen credenciales temporales sintéticas,
no las credenciales de infraestructura; no deben publicarse como accesos de producción.

## Entrega y presentación

Los dos DOCX se renderizaron con Word nativo, porque el renderer empaquetado no encontró LibreOffice.
Se revisaron las imágenes de cada página. PDF e imágenes en qa son intermediarios de verificación,
no entregables solicitados. Evidencias sanitizadas en `output/auditoria-real-2026-10-09/evidence`.
Los JSON HTTP registran códigos/tiempos/IDs sintéticos, no tokens, contraseñas ni historias reales.
