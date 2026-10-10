# Evidencia de implementación V37 — Notificaciones profesionales

Fecha: 2026-10-10, America/Lima. Rama codex/2do-intento. Base V36/583de51;
consultar Git para SHA final V37. Repositorio: https://github.com/sromansilva/ashakids-platform .
Este registro de implementación no es una nueva auditoría académica.

## Entorno y comandos

PostgreSQL17.6 en127.0.0.1:6544, rol runtime ashakids_flujo_v33 sin superusuario ni
BYPASSRLS. Migración005 aplicada explícitamente por propietario local a la DB de pruebas
ashakids_test_flujo_v34_20261010 y a QA separada ashakids_test_flujo_qa_20261010.
Permisos/políticas del ensayo son locales; no representan adopción en Supabase.

Backend: `.venv313/Scripts/python.exe -m pytest tests -q`, con URLs de pruebas/propietario
apuntando a test V34, DATABASE_URL igual al runtime test, ENVIRONMENT=test y CA vacía
solo para loopback. LOGIN_IP_LIMIT=1000/LOGIN_PAIR_LIMIT=100 solo en pytest.
Resultado nuevo: **207 aprobadas,25 omitidas,19 avisos de deprecación,64.40s**.
Incluye seis casos nuevos con SQL real; no ejecutar pytest contra QA persistente.

Frontend: corrida completa `npm test`: **281 componentes/18 archivos y25 rutas aprobados**.
Después del ajuste final de espaciado móvil: tipos, tres casos notifications.test.tsx,
check:frontend337 archivos/máximo498 líneas y build2.75s correctos. Aviso DEP0205 del
toolchain conservado. Los tests jsdom/build no certifican todas las pantallas.
Graphify refresh2212 nodos/101 comunidades; mapa local excluido de Git.

## Comprobación real

API8002/Vite5175 con variables de proceso, sin editar .env. Proceso local de recordatorios
habilitado; generó el aviso para R4 dentro de la ventana previa. R5 reservado por HTTP
generó NUEVA_CITA para profesional2. Bandeja UI mostró ambos y dos sin leer.
Se marcó R5 como leído desde UI; quedó uno sin leer y persistió en consulta posterior.

Configuración UI guardó nueva_cita=false; recarga y GET confirmaron el valor. Reserva
R6 por HTTP seguía permitida y no aumentó las dos notificaciones. Al finalizar se restauró
nueva_cita=true desde UI con confirmación de guardado, lista para nuevas reservas.
Ver api-results.json y ui-results.json. Capturas desktop1280x720 y móvil390x844 revisadas.
En móvil se corrigió superposición de flotantes sobre switches/paginación y se recapturó.

## Incidencias y alcance

Expectativas iniciales corregidas: comparar instantes datetime, no cadenas Z/-05;
crear conversación retorna200 según contrato existente. Mock de fallo de reportes se
acotó a /sesiones para que la consulta nueva de bandeja no consumiera ese fallo.
ByRoleOptions de tests no acepta exact; selector Agenda sustituido por expresión anclada.
Helper QA abortó al consultar plan en ruta incorrecta; corregido a /sesiones/1/plan.

Avisos de cancelación/reprogramación/mensajes, lectura de todas, paginación, aislamiento,
rollback y concurrencia cubiertos por pruebas, no atribuidos a recorridos visuales nuevos.
Sin correo/push/SMS, sin backfill, sin nueva prueba HTTPS ni cobertura visual completa.
Sin integración dev/feat/piero-dev, sin escrituras compartidas ni nuevos datos reales.
Disponibilidad con siete días de anticipación y otros campos demo siguen pendientes.
