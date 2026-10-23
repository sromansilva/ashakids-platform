# ADR 0010 - Rol PostgreSQL exclusivo del backend

Fecha: 2026-10-09. Estado: aceptado por autorización explícita del responsable.
Repositorio: https://github.com/sromansilva/ashakids-platform . Rama: piero-dev.
Base: V21/e756e7b5865201c2a0bd311786746d20b940449f.

## Contexto

El backend usaba una cuenta con BYPASSRLS, CREATEDB y CREATEROLE. B02 propone separar
esa identidad técnica del propietario. ADMIN/PADRE/TERAPEUTA son roles de la aplicación;
sus funciones y comprobaciones por recurso permanecen en FastAPI. El responsable autorizó
crear ashakids_runtime, sus permisos/políticas y una cohorte AUDITORIA nueva, conservando
datos y permisos de identidades anteriores y prohibiendo borrados físicos.

## Decisión

Crear ashakids_runtime con LOGIN, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOREPLICATION,
NOBYPASSRLS y NOINHERIT. Sin pertenencia a otros roles ni propiedad de objetos.
Aplicar el inventario aprobado de 22 tablas, 58 combinaciones tabla/operación y USAGE
en 16 secuencias. No GRANT ALL, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN, setval,
propiedad, membresías administrativas ni cambios de ACL de otros destinatarios.

Mantener RLS activa y crear políticas exclusivamente TO ashakids_runtime:
SELECT/DELETE con USING true, INSERT con WITH CHECK true y UPDATE con ambas cláusulas.
Es una restricción de la cuenta técnica por operaciones; permite al backend acceder a
las filas necesarias y **no aísla familias dentro de PostgreSQL**. FastAPI sigue validando
la sesión y pertenencia de cada recurso. Sin Supabase Auth, políticas públicas ni
acceso directo del frontend a PostgreSQL.

Revisar primero permisos heredados de PUBLIC y funciones SECURITY DEFINER accesibles.
Conservar los defaults PUBLIC CONNECT/TEMP de la plataforma; no existe una denegación
por rol que anule esos grants. No revocar PUBLIC ni cambiar otros roles en este alcance.
El rol nuevo carece de CREATE en BD/schema public; TEMP permite objetos temporales,
no concede propiedad ni TRUNCATE sobre tablas compartidas.

## Aplicación y aceptación

El guion operacional aplica los cambios en una transacción y aborta si el rol existe;
no se ejecuta automáticamente al arrancar FastAPI. Guarda credenciales/verificador y
conexión anterior fuera de Git. Antes/después compara huellas de atributos de roles,
membresías existentes, propietarios, RLS y ACL excluyendo solo el destinatario nuevo.
Las membresías automáticas hacia el rol creado se distinguen de pertenencia del runtime
a otros roles. No versionar ni imprimir contraseñas, URL, tokens o verificadores SCRAM.

Verificar conexión real, atributos, permisos exactos y políticas con la credencial nueva.
Probar denegaciones sin ejecutar DML: EXPLAIN sin ANALYZE, lectura LIMIT 0 y currval
en secuencia sin privilegios. CREATE SCHEMA usa un nombre de ensayo nuevo y savepoint
siempre revertido; jamás ALTER/TRUNCATE/setval sobre las tablas clínicas.
Probar FastAPI en proceso ASGI con SQL real antes de sustituir la instancia habitual.
Tras el recorrido correcto, cambiar solo DATABASE_URL privada, recargar API8000 y
repetir el núcleo por HTTP real. Revertir a la conexión anterior si falla la adopción.
Mantener la cuenta propietaria separada para administración, sin quitarle permisos.

## Consecuencias y límites

ADMIN de AshaKids conserva sus funciones. Las conexiones nuevas del backend pierden
privilegios de administración PostgreSQL; las políticas quedan dirigidas al rol técnico.
Los clones del equipo necesitan configurar la credencial runtime por un canal privado;
un push no sustituye sus archivos .env ni despliega hosting público.
No se ensayan DELETE físicos ni restauraciones, y no se certifica aislamiento entre
familias a nivel de SQL. HTTPS, rotación de cuentas anteriores, backup/recuperación y
protección distribuida de login siguen pendientes independientes.

Referencias: [PostgreSQL CREATE ROLE](https://www.postgresql.org/docs/17/sql-createrole.html),
[CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html),
[Roles Supabase](https://supabase.com/docs/guides/database/postgres/roles).
