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
