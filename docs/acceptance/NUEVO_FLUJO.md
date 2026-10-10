# Continuación y aceptación del flujo actualizado

Fecha: 2026-10-10. Repositorio: https://github.com/sromansilva/ashakids-platform .
Rama de trabajo exclusiva: codex/2do-intento. Base V32/ebb8632.

El equipo adapta la maqueta y el código actuales al maestro, conservando React → HTTP →
FastAPI → SQLAlchemy/PostgreSQL, permisos por recurso y su estilo. No retomar V27–V30.
El objetivo termina cuando el recorrido acordado se vea en la app y funcione con datos y
permisos coherentes. Publicar avances de esta rama no autoriza integración en dev/piero-dev
ni migraciones/datos compartidos. Juegos: demostración rotulada primero, elección del usuario.

## Avance de registro y activación

Migración propuesta: backend/scripts/migrations/002_activacion_cuentas.sql.
En este clon solo se aplicó en BD nueva local ashakids_test_flujo_v33_20261010, puerto6544.
Se restauró estructura histórica02 sin filas y se adaptó CREATE SCHEMA para public existente.
Rol local ashakids_flujo_v33 sin superuser/CREATEDB/CREATEROLE/BYPASSRLS; políticas permisivas
exclusivas de ensayo, autorización de familia en FastAPI. No son los GRANT exactos del runtime
compartido ni prueba de su adopción. Limpieza de fixture usa propietario local separado.

Comando desde backend, con ASHAKIDS_TEST_DATABASE_URL y ASHAKIDS_TEST_ADMIN_DATABASE_URL
apuntando exclusivamente a esa BD local: `.venv313/Scripts/python.exe -m pytest tests -q`.
En la corrida masiva LOGIN_IP_LIMIT=1000 y LOGIN_PAIR_LIMIT=100 solo en el proceso de pruebas;
limitador productivo mantiene30/5 y sus pruebas unitarias específicas. Resultado191/25/19.
Casos nuevos: alta con dos hijos, campos inválidos sin filas, rollback ante fallo posterior
al primer hijo, bloqueo de rutas directas, clave corta/incorrecta, sesión anterior revocada,
reingreso con nueva clave, aislamiento y generación/activación concurrentes. Sin pruebas HTTPS
nuevas ni nueva calificación/auditoría. Los resultados históricos conservan sus cortes.

Frontend final:267 componentes aprobados,25 rutas, tipos, check:frontend323 archivos
(máximo498) y build de producción aprobado (avisoDEP0205). Incluye10 casos nuevos en
family-activation.test.tsx; los257 anteriores se reejecutaron en esa corrida final.
Estos casos jsdom no equivalen a aceptación visual de todas las pantallas.

Errores iniciales corregidos: opción --budget no admitida por manage.py; fake SQL sin soporte
para comparación de códigos sin distinguir caja; emails de ensayo .invalid rechazados por
EmailStr; contador de login agotado por suites en un proceso. Un parche sin contexto correcto
fue rechazado antes de aplicar. Detector UI avisó texto gris en fondo violeta y se ajustó.

Entorno UI separado: API8002/Vite5175 mediante variables de proceso, sin editar .env.
VITE_API_BASE_URL=/api/v1 y VITE_DEV_API_TARGET=http://127.0.0.1:8002. API usa DATABASE_URL
local, ENVIRONMENT=test, DB_SSL_CA_FILE vacío y DB_SSL_LEGACY_CA=false solo para loopback.
Primer arranque heredó URL frontend/CA remota y falló; corregido en variables del proceso.
Los servicios habituales y su configuración no se cambian.

UI real1280x720: asesor ingresó y registró P90003/Ana/Luis, con confirmación visible.
Ingreso familiar muestra activación antes del panel; vista inspeccionada también a390x844
efectivos, sin desbordamientos. Envío de clave ensayado por HTTP/SQL, sin nueva credencial
operada en navegador. Capturas sanitizadas en docs/evidence/flow-v33/. Primer intento de fechas
no sincronizaba estado; se añadieron eventos input/change y regresión de conservar fecha al
añadir hijo. Segunda alta guardada correctamente. No cubre todas las pantallas.

## Recorrido aún por implementar y aceptar

1. Asesor registra padre/dos hijos; familia cambia contraseña inicial.
2. Cada hijo requiere introducción propia; terapeuta publica disponibilidad semanal y bloqueos.
3. Reserva45min confirmada al guardar; fin calculado, calendario disponible y colisión rechazada.
4. Terapeuta atiende, registra asistencia, reporte y plan; familia ve historial/PDF y mundos.
5. Otro terapeuta disponible atiende con contexto autorizado y autoría conservada.
6. Cancelación/reprogramación coherentes; familia/profesional ajenos sin acceso.
7. Juegos demo permiten completar/desbloquear/repetir sin aparentar evaluación clínica.
8. Verificación desktop/móvil del recorrido integrado y evidencia sanitizada.

Precisiones del maestro siguen explícitas: jornada/días, transición de pacientes V26,
cierre introductorio, versiones de plan y vigencia profesional, sedes/enlaceZoom/extensiones.
Cerrar decisiones técnicas del mínimo al implementar; no inventar introducciones de pacientes
existentes ni declarar integraciónZoom por un botón. Pagos y extensiones de soporte/reseñas
no condicionan el núcleo.
