# ADR 0013 — Activación obligatoria y alta familiar transaccional

Fecha: 2026-10-10. Estado: implementado en rama de trabajo; adopción compartida pendiente.
Repositorio: https://github.com/sromansilva/ashakids-platform .
Base: codex/2do-intento, V32/ebb8632d3023338b1d19721122504092a58db2f6.

El flujo actualizado requiere que el asesor registre padre e hijos y que el usuario sustituya
su contraseña inicial antes de operar. La autenticación de V26 no distinguía cuentas pendientes.

Se añade usuarios.password_change_required, booleano obligatorio con default false para
conservar el acceso de las cuentas existentes. Todos los caminos HTTP de creación marcan
cuentas nuevas pendientes. La dependencia de negocio exige cuenta activada; únicamente
login, consulta de identidad, logout y activación permiten esa sesión inicial.

POST /admin/familias recibe DNI de ocho dígitos y uno o varios hijos. Usa el DNI únicamente
para generar el hash Argon2id; no guarda el documento en otra columna ni lo devuelve/audita.
El alta completa usa una transacción, sin tratamiento o introducción ficticios. Mantiene correo,
nombres/apellidos obligatorios y contacto/parentesco opcionales: contrato mínimo actual, no
se declara cerrada la depuración futura de datos del adulto.

POST /auth/activate verifica la contraseña inicial, exige nueva clave de 12–128 caracteres,
bloquea la fila del usuario, revoca todas sus sesiones y emite una nueva cookie. Login bloquea
esa fila hasta emitir sesión para serializarse con la activación. La actividad de sesión se
persiste al finalizar la transacción, evitando bloquearla antes del usuario en la activación.

Los códigos generados se muestran en mayúsculas A/P/T y cinco dígitos. Se aceptan códigos
anteriores en ambas cajas; índice único upper(codigo_usuario) evita identidades ambiguas.
La generación se serializa con advisory lock por rol, conserva los IDs y rechaza agotamiento
de la serie. El limitador normaliza la caja y separa el contador de activación del de login.

Compatibilidad: los endpoints administrativos anteriores conservan el campo password y
admiten contraseñas iniciales largas, además del DNI en alta de padre/terapeuta. Todas quedan
pendientes de activación. El formulario de Cuentas usa exclusivamente DNI para nuevas altas.
La pantalla alternativa Usuarios conserva su contrato técnico anterior; su adaptación al
registro institucional es un pendiente explícito, no un segundo recorrido aceptado.

Migración explícita 002, sin DDL al arranque. Ensayada solo en BD local nueva; no se aplicó
en Supabase ni se cambió hosting/permisos compartidos. Revisar duplicados por caja, respaldo,
ACL y despliegue coordinado antes de adoptar: V26 sin migración no admite este nuevo runtime.
La reversión no debe eliminar el bloqueo si hay cuentas pendientes; requiere tratamiento
previo de esas cuentas. No integrar dev/piero-dev sin aprobación humana.
