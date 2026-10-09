# B02 - Procedimiento revisable de mínimo privilegio

Repositorio: https://github.com/sromansilva/ashakids-platform . Base de revisión: piero-dev/V19/a1930df456aed94a727acfa4625ef32a7bc6385d, más correcciones del corte 2026-10-09-13.

Estado vigente: **aplicado y adoptado el 2026-10-09**, corte14. El candidato pasó
99 respuestas ASGI con SQL real; API8000 pasó 133 respuestas HTTP (99 núcleo,
29 complemento y 5 sistema), sin fallos. Ambas cohortes persistieron y terminaron
con cero sesiones auth nuevas activas. Se comprobaron 58 políticas, 16 secuencias,
ACL exactas y seis denegaciones 42501. .env privada ya usa ashakids_runtime.
La propuesta histórica del corte13 sigue abajo. La identidad propietaria conserva sus
permisos; ashakids_runtime es una identidad nueva. RLS sigue activa y las políticas se
dirigen exclusivamente al runtime. No se usan bases descartables, borrados físicos ni
modificaciones a datos preexistentes. Registrar el resultado final de adopción en el
contexto y la auditoría14; no confundir creación del rol con aceptación del backend.

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

## Políticas RLS autorizadas

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

Aceptación: conexión y núcleo correctos bajo el rol nuevo; sin BYPASSRLS/CREATEDB/CREATEROLE/superuser/propiedad/pertenencia a otros roles; tabla y secuencia fuera del inventario denegadas; políticas solo del rol runtime; evidencia del rollback y revisión de PUBLIC. Consultar auditoría14 para el estado efectivo.

## Guiones operacionales y revisión de PUBLIC

Desde backend, con la cuenta propietaria configurada en privado:
`python -m scripts.apply_b02_runtime_role --execute-authorized --output ../tmp/b02-application.json`.
Aborta si el rol existe; no es una migración automática ni un guion para rotar contraseñas.
El inventario preciso vive en scripts/b02_role_inventory.py; aplica 22 tablas, 58 políticas
y USAGE en las 16 secuencias dependientes de tablas con INSERT. Guarda conexión anterior,
runtime y contraseña aleatoria solo en tmp/b02-runtime-private.json ignorado.

`python -m scripts.verify_b02_runtime_role --private ../tmp/b02-runtime-private.json --output ../tmp/b02-verification.json`
verifica atributos, ausencia de propiedad/pertenencia, ACL exactas, RLS y TLS. Pruebas
denegadas: LIMIT 0 sobre tabla no concedida, EXPLAIN sin ANALYZE de operaciones no
concedidas, currval de secuencia no concedida y CREATE SCHEMA AUDITORIA_B02_DENIED
con savepoint siempre revertido. No ejecutar TRUNCATE, setval, ALTER ni DELETE físicos
sobre tablas compartidas para demostrar una denegación: consultar sus privilegios.

`python -m scripts.verify_b02_journey --execute-authorized --private ../tmp/b02-runtime-private.json --output ../tmp/b02-candidate/journey.json`
usa FastAPI ASGI en proceso y SQL real con el rol candidato, antes de cambiar API8000.
No abre puerto8001 ni sustituye .env. El recorrido HTTP habitual se repite solo después
de que este ensayo pase y se recargue la API con la conexión aprobada.

PUBLIC conserva CONNECT/TEMP en la BD y USAGE en public. No permite CREATE en BD ni
en public. No hay grants públicos de tablas/secuencias; las funciones SECURITY DEFINER
con EXECUTE público en graphql no son alcanzables por el runtime sin USAGE de ese
schema. Verificar ambas condiciones juntas, no solo has_function_privilege. NOINHERIT
no elimina derechos de PUBLIC; no se alteran esos defaults ni identidades anteriores.
Por ello no afirmar prohibición absoluta de conexiones/objetos temporales. La cuenta
propietaria queda fuera del runtime para administración y reversión.

Referencias: [Roles PostgreSQL](https://www.postgresql.org/docs/current/user-manag.html), [CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html), [Secuencias](https://www.postgresql.org/docs/current/functions-sequence.html), [Supabase: conexión](https://supabase.com/docs/guides/database/connecting-to-postgres).
