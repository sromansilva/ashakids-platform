# Aceptación del núcleo, PDF y mensajes

Repositorio: https://github.com/sromansilva/ashakids-platform . Rama compartida: dev.
Guion: `backend/scripts/verify_delivery_journey.py` (V11, 8578ca9).
Evidencia: [auditoría07](../audits/auditoria-2026-10-09-07.md).

## Qué ya se repitió

Clon limpio de dev/e456294, Python3.13.7 con entorno virtual nuevo y requisitos publicados,
Node26.9.0/npm11.19.1 con npm ci. API del clon en8001; PostgreSQL17.6 existente en6544.
Dos bases nuevas: ashakids_test_accept07 y ashakids_test_accept07_repeat. Cada una pasó
el mismo recorrido de92 respuestas HTTP, con paciente/tratamiento/cita/sesión/reporte/chat
nuevos. El segundo añade prueba de sesión emitida en la BD indicada antes de escribir clínica.
Sin reset de ashakids_test_compat17 ni acceso a Supabase.

Esta reproducción la hizo el mismo agente en el mismo ordenador. Otro integrante/ordenador
necesita su propia comprobación. Tampoco sustituye aceptación real del frontend.

## Repetir el guion en otra base local

1. Actualizar dev por fast-forward, conservar .env ignorados. Seguir README para instalación;
   en backend instalar requirements-dev.txt para los guiones/pruebas; en frontend npm ci
   usa el lockfile. Un entorno virtual vacío y esas dependencias pasaron el corte07.
2. Usar PostgreSQL local compatible. La instalación de PostgreSQL en otro ordenador no se
   ensayó aquí; consultar los entornos01/02. El runtime requiere rol no superusuario; la
   réplica local usa ashakids_audit_runtime con BYPASSRLS y sin CREATEDB/CREATEROLE.
   El propietario local se usa para restaurar/preparar, nunca como conexión de FastAPI.
3. Crear una BD NUEVA con prefijo ashakids_test_accept07, por ejemplo
   ashakids_test_accept07_equipo. No reutilizar compat17, accept07 o accept07_repeat.
   Si un intento falla, conservarlo y crear otra nueva para la siguiente corrida.
4. Restaurar exclusivamente el SQL de estructura del corte02. Ese archivo crea public;
   una BD PostgreSQL vacía ya trae public. En una copia temporal, sustituir la única sentencia
   CREATE SCHEMA public; por CREATE SCHEMA IF NOT EXISTS public; antes de restaurar con
   psql -v ON_ERROR_STOP=1. No borrar esquemas ni modificar la estructura compartida.
5. Dar USAGE de public, SELECT/INSERT/UPDATE/DELETE en tablas y USAGE/SELECT en secuencias
   al runtime local; insertar roles ADMIN/PADRE/TERAPEUTA en la BD nueva. La estructura
   exportada no incluye esos registros ni grants. No usar estos privilegios como guía de producción.

Ejemplo de preparación una vez creada/restaurada la BD nueva (PowerShell, desde backend):

```powershell
$env:DATABASE_URL='postgresql+asyncpg://ashakids_audit_runtime@127.0.0.1:6544/ashakids_test_accept07_equipo'
$env:ASHAKIDS_TEST_DATABASE_URL=$env:DATABASE_URL
$env:ASHAKIDS_TEST_ADMIN_DATABASE_URL='postgresql+asyncpg://postgres@127.0.0.1:6544/ashakids_test_accept07_equipo'
.\.venv\Scripts\python.exe -m scripts.phase2_sandbox prepare
```

prepare hace TRUNCATE: ejecutar únicamente en esa BD nueva y vacía. Crea cinco cuentas
sintéticas, con contraseña pública definida en scripts/phase2_sandbox.py. No ejecutar sobre
la demo conservada, una BD compartida o filas reales. La suite completa también resetea su
fixture: usar una tercera BD local separada para regresión, como regress07 en este corte.

Arrancar FastAPI del mismo clon en8001 con DATABASE_URL idéntica, ENVIRONMENT=development,
cookie separada y CORS de5174; si8001 está ocupado, identificar/parar solo esa API de prueba.
No cerrar servicios ajenos ni cambiar el env habitual. En otra terminal con las mismas URL:

```powershell
$env:ASHAKIDS_ALLOW_ISOLATED_LIVE_TESTS='1'
$env:ASHAKIDS_TEST_API_URL='http://127.0.0.1:8001/api/v1'
.\.venv\Scripts\python.exe -m scripts.verify_delivery_journey --output ..\docs\evidence\<nuevo-corte>
```

El guion exige tablas clínicas/chat vacías y cinco usuarios. Antes de crear paciente comprueba
que la cookie recién emitida exista activa en la BD indicada (solo compara hashes, sin guardar
tokens en evidencia). Una API con conexión diferente se rechaza. Login/logout sí crea/revoca
sesiones sintéticas; esa guarda evita escrituras clínicas, no esos eventos de autenticación.

La cita nueva primero está en futuro y rechaza iniciar. Una fixture SQL ajusta solo su ID
para verificar inicio/cierre, sin cambiar el reloj del equipo. Después finaliza/reactiva solo
su tratamiento y archiva solo su chat para comprobar lectura y rechazo de escritura reales.
Son ajustes del guion, no endpoints de edición de tratamiento/archivado añadidos al producto.

Al terminar, conservar datos/evidencia y restaurar la API original en8001 si se usó su puerto.
No reutilizar el archivo de auditoría anterior como resultado nuevo. Revisar resultados,
advertencias, fallos y límites; generar corte nuevo según docs/audits/README.md.

## Aceptación manual de la demo preservada

API8001/web5174/PG17.6 local6544, ashakids_test_compat17. Se restauró después de las pruebas.
Las cuentas sintéticas a90001, p90001, t90001, p90002 y t90002 proceden de cortes anteriores;
su contraseña está en el script de fixtures. No ejecutar prepare para obtenerlas nuevamente.

- ADMIN: ver cuentas/pacientes y asignaciones reales. Revisar cita/sesión/reporte; descargar
  la versión guardada del PDF. Mensajes administrativos informa campañas pendientes.
- PADRE p90001: Centro Familiar, seguimiento, agenda y Reportes deben conservar IDs/datos
  tras recarga. Abrir sesión1, leer el reporte02 y descargar PDF con los cuatro campos.
- Mensajes: abrir la pareja real, comprobar historial14; escribir un mensaje de aceptación
  identificado y registrar su ID. TERAPEUTA t90001 actualiza y responde; familia actualiza,
  vuelve a iniciar sesión y confirma el historial. Estos envíos serán nuevos y deben registrarse.
- PADRE p90002 / TERAPEUTA t90002: recursos ajenos sin acceso; no chats/contactos de esa
  pareja. No interpretar un404 esperado como módulo roto.
- Revisar teclado, foco, botones/textos y selección de chat en desktop1366 y móvil390;
  cargar anteriores y volver a lista. Confirmar que los controles flotantes no cubren formulario
  de mensajes ni nota/descarga PDF. Registrar pantalla/versión y resultado real.
- Error de API: conservar borrador, informar incertidumbre y actualizar antes de reenviar.
  No forzar automáticamente un segundo POST: el primero podría haberse guardado.

La automatización del navegador sigue denegada por una preferencia guardada para5174,
incluso tras la respuesta del usuario indicando que habilitó acceso. Debe retirarse el bloqueo
en los ajustes de sitios de Codex; no se elude por otro puerto/origen/herramienta.
Guía oficial consultada: https://help.openai.com/en/articles/20001277-using-the-built-in-browser-in-the-chatgpt-desktop-app .

## Cierre de equipo pendiente

Aceptar UI real/recaptura PDF y repetir por otro integrante. Revisar impacto de incidencia01
con logs/baseline del equipo: la guarda nueva contiene el problema de destino divergente,
pero no recupera cuentas anteriores ni demuestra ausencia de impacto histórico.
Preparar el paquete de rúbrica antes de18:00 Lima; hosting después de estabilidad comprobada.
Pagos excluidos, recursos diferidos, extensiones6 por confirmar y Mundo ASHA en etapa MA.
