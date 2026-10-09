# ADR 0009 - Transporte y protección de acceso del backend

Fecha: 2026-10-09. Estado: adoptado en código del corte13; producción y rol mínimo pendientes.

## Contexto

La auditoría real publicada en V19 identificó TLS sin verificar identidad, configuración de desarrollo, ausencia de límite de login y contratos divergentes. La aplicación conserva React -> HTTP -> FastAPI -> SQLAlchemy/asyncpg -> PostgreSQL en Supabase, autenticación propia y autorización por recurso. No hay despliegue público.

## Decisión

Toda conexión PostgreSQL remota del runtime recibe un SSLContext con CERT_REQUIRED y check_hostname=True. DB_SSL_CA_FILE apunta fuera de Git a una CA del responsable. ssl=require en URL se convierte a contexto verificable, no a cifrado sin autenticación. No se reconecta con política inferior si falla. Loopback de desarrollo admite PostgreSQL local sin TLS; en este chat no se crean ni ejecutan bases descartables.

Python3.13 activa VERIFY_X509_STRICT; el certificado Supabase Root2021 aportado carece de keyUsage y falla con código92. DB_SSL_LEGACY_CA=true es una excepción explícita de formato X.509 cuando existe CA configurada; por defecto es false. Conserva validación de cadena, vigencia y nombre. La conexión real y rechazo sin trust store se verifican en evidencia13. Sustituir por CA compatible del proveedor y retirar esta excepción cuando esté disponible.

Producción exige ENVIRONMENT exacto, BD configurada y CORS HTTPS explícitos sin comodines. Escrituras HTTP inseguras reciben403; cookies de sesión son Secure/HttpOnly/SameSite=Lax. Proxy del mismo sitio HTTPS y confianza limitada del servidor ASGI son requisitos de despliegue. No activar Secure indiscriminadamente en HTTP local.

Login usa ventana fija configurable por IP y pareja IP/código, con respuesta429 y Retry-After genéricos. Peticiones rechazadas no prolongan la ventana; otra IP no bloquea globalmente una cuenta. Contar todas las solicitudes válidas de login evita depender de si el usuario existe. Estado en memoria y tamaño acotado, sin persistencia ni DDL. El presupuesto está protegido por mutex. Cuando se agota capacidad, rechaza nuevos intentos hasta expirar una ventana.

La solución se limita a UN proceso. WEB_CONCURRENCY=1 es una guarda de configuración, no una detección de flags --workers ni de otras réplicas. Reinicios vacían el presupuesto; un atacante distribuido puede superar límites por IP. Antes de múltiples procesos o réplicas se requiere gateway con límite compartido o almacenamiento compartido revisado. No declarar protección distribuida.

Servicios administrativos se separan por lectura, creación, estado, eliminación y auditoría; admin_service conserva imports públicos y edición de cuenta. Serialización de pacientes se separa de consultas. Los cuerpos de las27 funciones originales se conservaron iguales mediante comparación AST.

Los bloqueos FOR UPDATE usan populate_existing para no reutilizar estado viejo del identity map. Commit previo al éxito y rollback se conservan; si también falla rollback, se preserva el error inicial. Deadlock/serialización fallida se informa409; conexión y timeout503. No se añaden tablas, migraciones, restricciones ni reintentos automáticos de escrituras.

## Consecuencias y límites

Contraseñas nuevas comparten12..128; login de cuentas existentes no recibe ese mínimo. Escritura de sexo normaliza ambos vocabularios a Masculino/Femenino/Otro; lectura preserva valores existentes sin migrar filas. Fecha de nacimiento futura y nombres vacíos se rechazan por ambas rutas. No se impone límite de edad al editar datos antiguos. Null explícito en edición de hijos se rechaza para evitar fallos de integridad.

Rol de ejecución sigue con BYPASSRLS/CREATEDB/CREATEROLE. La propuesta B02 requiere aprobación y verificación propia; ninguna política ni permiso compartido se cambió. TLS no resuelve privilegios ni autorización. Backups, restauración, HTTPS público y rotación de cuentas existentes permanecen fuera de la verificación actual.

Referencias: https://docs.python.org/3.13/library/ssl.html ; https://supabase.com/docs/guides/database/connecting-to-postgres ; https://www.postgresql.org/docs/current/explicit-locking.html .
