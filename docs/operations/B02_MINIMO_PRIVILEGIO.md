# B02 - Procedimiento revisable de mínimo privilegio

Repositorio: https://github.com/sromansilva/ashakids-platform . Base de revisión: piero-dev/V19/a1930df456aed94a727acfa4625ef32a7bc6385d, más correcciones del corte 2026-10-09-13.

Estado: propuesta preparada, **no aplicada ni validada como nuevo rol**. Supabase real: usuario actual no superusuario, con BYPASSRLS, CREATEDB y CREATEROLE. RLS habilitada y cero políticas públicas; pasar solamente a NOBYPASSRLS impediría el funcionamiento. El usuario prohíbe bases descartables en este chat. El responsable deberá aprobar el ensayo en un entorno permitido o autorizar una adopción controlada en Supabase; no se sustituye esa validación por mocks.

## Separación e inventario de operaciones

Identidad propuesta: `ashakids_runtime`, LOGIN, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOREPLICATION, NOBYPASSRLS, NOINHERIT. Sin membresía en postgres, roles Supabase, propietarios ni roles administrativos. Propietario/migraciones permanece separado y no se usa como DATABASE_URL de la API.

| Tablas públicas | Permisos de aplicación propuestos | Consumidor / motivo |
| --- | --- | --- |
| usuarios | SELECT, INSERT, UPDATE, DELETE | Auth, usuarios y administración; DELETE solo contrato administrativo protegido |
| usuario_roles, administradores, tutores, terapeutas | SELECT, INSERT, DELETE | Alta de cuentas/perfiles y eliminación protegida; DELETE por relaciones del ORM |
| tutores, terapeutas | UPDATE adicional | Edición administrativa de perfiles |
| roles | SELECT | Catálogo de roles existente; no alta de roles por API |
| sesiones_autenticacion | SELECT, INSERT, UPDATE, DELETE | Emitir/consultar/revocar sesiones; DELETE solo cascada/ORM al eliminar cuenta |
| pacientes, perfiles | SELECT, INSERT, UPDATE, DELETE | Alta/edición y eliminación física protegida del contrato de hijos |
| expedientes, tratamientos, reservas, sesiones, reportes_sesion | SELECT, INSERT, UPDATE | Núcleo clínico, sin eliminación de historial |
| conversaciones | SELECT, INSERT, UPDATE | Chat por participantes y última actividad |
| mensajes | SELECT, INSERT | Historial/envío; no editar ni borrar mensajes |
| auditoria_cambios | SELECT, INSERT | Trazabilidad y comprobación de dependencias; sin UPDATE/DELETE |
| logros, perfil_logros, actividades, resultados_nivel, evaluaciones_ia | SELECT | Relación de perfil y comprobaciones de dependencia; sin escrituras educativas nuevas |

Revisar los DELETE en cuentas contra los cascades reales antes de concederlos: la autorización actual de este chat **no permite ensayarlos físicamente**. Los permisos indicados conservan contratos publicados; no autoriza ejecutarlos contra personas existentes. No usar GRANT ALL ni GRANT sobre todas las tablas/secuencias del esquema, ni ALTER DEFAULT PRIVILEGES indiscriminado.

Secuencias: el inventario `database-readonly.json` obtiene cada dependencia mediante `pg_get_serial_sequence`, incluyendo columnas identity que no aparecen en information_schema.sequences. Conceder solamente USAGE sobre las secuencias dependientes de tablas con INSERT. No dar UPDATE (setval), permisos sobre secuencias de otros módulos ni permiso de reiniciar identidades. No usar TRUNCATE para verificarlo.

## Propuesta RLS, pendiente de aprobación específica

La autenticación es propia de FastAPI. `auth.uid()` no representa nuestras sesiones y no debe añadirse a estas políticas. React continúa sin acceso directo a PostgreSQL.

Para cada combinación tabla/operación aprobada, crear una política dirigida **exclusivamente TO ashakids_runtime**. SELECT/DELETE: USING (true); INSERT: WITH CHECK (true); UPDATE: USING (true) WITH CHECK (true). Esto permite al backend ejercer sus permisos sobre las filas de la tabla y conserva la autorización de familias/terapeutas en FastAPI; **no proporciona aislamiento de familias dentro de PostgreSQL**. Ese aislamiento necesitaría un diseño aparte de identidad transaccional y políticas por recurso, fuera de esta corrección. No crear políticas TO PUBLIC, anon, authenticated o service_role, ni deshabilitar RLS.

Ejemplo de sintaxis para revisar, no guion aplicado:

`CREATE ROLE ashakids_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT;`

`GRANT USAGE ON SCHEMA public TO ashakids_runtime;`

`GRANT SELECT ON public.roles TO ashakids_runtime;`

`CREATE POLICY ashakids_runtime_roles_read ON public.roles FOR SELECT TO ashakids_runtime USING (true);`

Fijar una contraseña aleatoria fuera de Git e informes por un canal seguro. Otorgar CONNECT exclusivamente a la BD configurada. No asignar propiedad de tablas/schema, CREATE en schema/BD, acceso a funciones SECURITY DEFINER ni membresías adicionales. Revisar privilegios heredados de PUBLIC y funciones existentes antes de aceptar el rol; no revocar PUBLIC globalmente por iniciativa propia porque afectaría otras aplicaciones de Supabase.

## Aplicación controlada y reversión

1. Responsable revisa inventario, políticas por operación, cascades, privilegios PUBLIC, identidad del destino y respaldo recuperable. Debe autorizar expresamente crear el rol, GRANT y políticas listados. La aprobación de registros AUDITORIA no sirve para este cambio.
2. Administrador aplica los cambios revisados en una transacción, sin modificar registros ni el rol actual. Registrar solo estado/hora y metadatos sanitizados.
3. Guardar credenciales nuevas fuera de Git. En conexión del rol nuevo verificar TLS, atributos del rol, ausencia de membresías, SELECT de cada modelo, secuencias autorizadas y rechazo de DDL/setval/TRUNCATE sobre un objeto de ensayo aprobado. No intentar DDL ni TRUNCATE sobre las tablas clínicas compartidas.
4. Autorizar una cohorte AUDITORIA nueva para probar núcleo, rollback, permisos por familia/terapeuta, revocación y concurrencia con el rol propuesto. No reutilizar las fixtures destructivas ni datos anteriores. DELETE físico sigue sin autorización actual.
5. Cambiar únicamente la conexión privada de la API habitual 8000 al rol comprobado; reiniciar el proceso y verificar readiness y recorrido de roles. Mantener cuenta de migraciones separada. No hay despliegue público realizado.
6. Si falla, volver a la conexión privada anterior y reiniciar API8000. Revertir políticas y rol nuevo solo con responsable y revisión de dependencias. No alterar privilegios del propietario ni borrar datos AUDITORIA.

Aceptación: conexión y núcleo correctos bajo el rol nuevo; sin BYPASSRLS/CREATEDB/CREATEROLE/superuser/propiedad/membresías; tabla y secuencia fuera del inventario denegadas; políticas solo del rol runtime; evidencia del rollback y revisión de PUBLIC. Hasta entonces B02 queda pendiente.

Referencias: [Roles PostgreSQL](https://www.postgresql.org/docs/current/user-manag.html), [CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html), [Secuencias](https://www.postgresql.org/docs/current/functions-sequence.html), [Supabase: conexión](https://supabase.com/docs/guides/database/connecting-to-postgres).
