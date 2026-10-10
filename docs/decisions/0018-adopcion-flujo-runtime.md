# ADR0018 — Adopción compartida del flujo y permisos mínimos runtime

Fecha: 2026-10-10. Estado: adoptado en PostgreSQL compartido y Render.
Fuente API/UI verificada: V43/4d2f0725566021824d1b8c20bba6dd8c241e21a0.
Repositorio: https://github.com/sromansilva/ashakids-platform . Cierre: V44, consultar Git.

## Decisión

Adoptar explícitamente las migraciones002–005 del flujo ensayado localmente, con
respaldo privado previo y sin DDL en el arranque. El código desplegado V42 requería
columnas ausentes en el esquema anterior; SELECT1 de readiness no detectaba ese
desfase y el login devolvía503. No se cambian contraseñas, IDs ni filas clínicas.

006 extiende el rol existente ashakids_runtime a las cuatro tablas nuevas:
turnos/bloqueos SELECT/INSERT/DELETE; preferencias/notificaciones SELECT/INSERT/UPDATE;
USAGE en tres secuencias identity. RLS permanece habilitada, con12 políticas para
las operaciones concedidas. Se retiran defaults de PUBLIC/anon/authenticated/service_role
solo en estos nuevos objetos; las ACL/políticas anteriores permanecen iguales.

Se mantiene el límite de B02: USING true del rol técnico no aísla familias en SQL.
FastAPI aplica identidad, destinatario, paciente y profesional autorizado. No crear
roles, Supabase Auth, credenciales nuevas ni acceso SQL desde React. El propietario
se usa solo para la adopción; Render conserva runtime restringido y TLS verificado.

## Operación y consecuencias

Adopción002–006 en una transacción explícita, lock_timeout5s/statement_timeout30s
y bloqueo asesor para evitar dos adopciones simultáneas. El archivo custom pg_dump
del esquema public incluye datos/DDL/ACL; permanece privado e ignorado. Se comprobó
su hash y listado pg_restore; no se ensayó una restauración en la BD compartida.
Hash de filas originales y ACL/políticas de26 tablas comprobados tras la adopción.

No inventar introducciones, sesiones de origen, horarios ni mundos para datos antiguos.
Los planes previos conservan origenNULL y las tablas nuevas empiezan vacías.
Cada terapeuta publica disponibilidad actual; no hay regla de anticipación semanal.
Notificaciones no reconstruyen eventos antiguos. Recordatorios activados en Render
después de adoptar tablas/permisos; dependen de que la instancia gratuita esté activa.

Render tiene Auto-Deploy activo observado, aunque la receta histórica decía Off.
No se modificó ese ajuste. El cambio de flag se guardó y desplegó en V43/44.8s.
Un rollback de código no debe eliminar tablas/planes/notificaciones ni restaurar
un dump sobre datos nuevos sin una operación separada y aprobada.

## Comprobaciones y límites

23 modelos SELECT LIMIT0, cero diferencias de columnas/tipos/nulabilidad observadas;
12 políticas nuevas, tres secuencias y ausencia de acceso externo comprobados con
runtime READONLY/TLS1.3. ADMIN login/GET/logout y cookie Secure/HttpOnly/Lax verificados
en HTTPS, además del panel en navegador. Pruebas backend157PASS/75omitidas/19avisos;
las75 integraciones requieren entorno descartable y no se ejecutaron en Supabase.
Tutor/terapeuta no se certifican por login ADMIN: sus credenciales actuales no son
las de prueba guardadas; confirmación de ingreso solicitada al usuario. El recorrido
completo sintético local es evidencia heredada V33–V37, no un ensayo clínico nuevo.
Readiness sigue comprobando conectividad; un deploy futuro necesita verificar esquema
además del healthcheck. Evidencia operativa en docs/evidence/deploy-v44/.
