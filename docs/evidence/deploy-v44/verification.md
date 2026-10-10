## Confirmación de despliegue y acceso — V45 / 2026-10-10

Render V44/1fc19b36598cf96cbc89d36a85fb9ca6c062eda3 confirmado Live, deploy
dep-db57tms9v7es738s1aa0, Auto-Deploy48.2s. dev/codex/2do-intento sincronizados.
12 respuestas ADMIN HTTPS repetidas después de ese despliegue, correctas; cookie
segura y revocación verificadas. No se ampliaron lógica, datos ni UI en este cierre.
El usuario confirmó crear un padre desde ADMIN e ingresar correctamente en Render;
esto es confirmación humana, no una nueva creación ni prueba automatizada del agente.
Se aclaró el supuesto pendiente de alta terapeuta: ya existe en Cuentas → pestaña
Terapeutas → Nueva cuenta. Formulario vacío abierto en producción, código automático,
DNI inicial y cambio obligatorio; fuente confirma POST/admin/cuentas/terapeutas.
No se envió ese formulario ni se creó una cuenta para probar. Queda verificar su alta,
activación e ingreso con credenciales vigentes; no afirmar que falta implementar el alta.
Imagen recortada al diálogo para excluir datos privados del listado: therapist-create-form.png.
Fuentes verificadas: AdminCuentas.tsx/handleCrear, AdminCuentasCrearModal.tsx,
adminService.ts y backend/app/services/admin_cuentas_creacion.py/crear_terapeuta.
V45 solo documenta aceptación, ubicación de la función y evidencia final de V44.
Siguiente: alta/activación terapeuta por ADMIN, publicar horarios y probar el recorrido
con cuentas autorizadas; después pulir inconsistencias visuales y responsive diferido.

# Cierre operativo V44

Repositorio https://github.com/sromansilva/ashakids-platform ; fuente API/UI
V43/4d2f0725566021824d1b8c20bba6dd8c241e21a0, rama codex/2do-intento/dev.
No nueva auditoría académica: diagnóstico/adopción autorizada del despliegue existente.
Comandos reales: backend/.venv313/Scripts/python.exe tmp/adopt_flow_current.py --backup,
luego --apply; tmp/verify_adopted_models.py; tmp/verify_deployed_current.py.
Scripts operativos privados permanecen ignorados; SQL006 e inventario se versionan.
Manifiestos sanitizados adjuntos; los hashes migrations del apply son de la serialización
JSON del SQL. migration-files-sha256.json da hashes de bytes de los archivos de trabajo.
Backup custom/public134561bytes; pg_restore--list verificado, sin restauración real.
Adopción atómica002–006, filas/ACL anteriores preservadas; sin clínica/cuentas nuevas.
READONLY23modelos,0diferencias;12políticas/3secuencias nuevas, roles externos sin acceso.
HTTP12casos ADMIN esperados; chat403 por diseño, login/logout200 y me401 tras revocar.
Cookie Secure/HttpOnly/Lax, admin-live.png demuestra acceso y conteos en web.
No certifica ingreso tutor/terapeuta ni todo el flujo clínico; credenciales actuales desconocidas.
Disponibilidad sin horarios, requiere publicación por profesionales; no anticipación semanal.
Recordatorios true persistido y deploy44.8s live; no ensayo de emisión con cita real.
Tests backend157PASS/75omitidas/19avisos6.06s; Graphify2219/106 vigente. UI/test/buildV43
son evidencia heredada. SQLAlchemy advirtió ciclo FK reservas/sesiones/tratamientos al
ordenar metadatos; SELECT0 y constraints PostgreSQL vigentes, sin DDL automático.
Fallos de guion: esperaba chat ADMIN200/correcto403; login tutor401 por credenciales
de prueba distintas; comandos de rutas corregidos. Un login inicial sin logout por abortar
el guion dejó una sesión hasta expiración normal; las pruebas finales revocaron sus sesiones.
La sesión de navegador queda abierta como entrega visible del acceso restaurado.
Supabase changelog.md consultado actual antes de operar; TLS nunca se deshabilitó.
