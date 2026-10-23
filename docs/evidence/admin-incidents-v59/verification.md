# Reforma del panel ADMIN — corte V59

Repositorio: https://github.com/sromansilva/ashakids-platform .
Base: codex/2do-intento, 498df42 (V58); origin/dev igual tras fetch.
Cambio funcional solicitado, no auditoría académica nueva. SHA de cierre: consultar Git.

Incidencias reales: formulario compartido PADRE/TERAPEUTA en orden tipo/título/
descripción; POST con validación y UUID de reintento, listado paginado exclusivamente
ADMIN y PATCH de lectura/resolución. Se eliminan ejemplos y sesiones simuladas de
Operación; etiqueta visible Incidencias, URL anterior conservada por compatibilidad.
Contenido y ML: Próximamente sin controles ficticios. Configuración: información
técnica, sin2FA ni parámetros editables inexistentes.

Auditoría conservada: ORM y GET/admin/auditoria ya existentes y tabla compartida
confirmada mediante lectura runtime LIMIT0. Sin nuevo historial inventado. Registro
transaccional existente en cuentas y determinadas operaciones de pacientes; no
equivale a registro de cada clic, login ni todas las operaciones clínicas. Se elimina
el aviso genérico amarillo en auditoría, incidencias y páginas informativas.

Comprobaciones nuevas:
- `npm --prefix frontend test`:25 rutas y287 pruebas de componentes/19 archivos correctos
  en el árbol de trabajo, que también contiene adjuntos locales anteriores.
- `npm --prefix frontend run typecheck`, `check:frontend` y `build`:correctos;
  check346archivos/máximo500líneas; build1905módulos. AvisoNodeDEP0205 heredado.
- `pytest backend/tests/test_incidencias.py -q`:6PASS con PostgreSQL aislado
  ashakids_test_incidencias_v59/127.0.0.1:6543: validación,401/403, persistencia,
  reintento, conflicto, listado/paginación y estados. No base compartida para fixtures.
- Detector Impeccable de las cinco UI principales:[]; revisión visual en navegador
  local con harness sin backend, escritorio1280x900 y formulario390x844. Capturas
  muestran configuración, Próximamente, formulario y errores de carga honestos.
  Franja amarilla superior de las capturas pertenece al harness de pruebas, no al
  producto. No certifican datos reales en navegador ni recorrido productivo completo.

Migración010 adoptada: respaldo180614bytes con SHA256/listado pg_restore verificados,
31tablas previas conservadas por comparación de fingerprints; RLS, tres políticas,
rolruntimeSELECT/INSERT/UPDATE, secuenciaUSAGE y DELETE denegado. Identidades públicas
sin grants. Planes EXPLAIN sin ejecución de INSERT/UPDATE y lectura runtimeLIMIT0;
evidencia `database-adoption.json`. Sin DML de prueba compartido ni credenciales en Git.

Errores corregidos: patch inicial con delete/add mismo archivo fue rechazado sin
aplicar; PostgreSQL local detenido/puerto6544 incorrecto, corregido levantando el
cluster existente en6543; fixture devolvía dos valores, no tres. Primer ensayo sin
URL aislada:5PASS/1omitida, después conexión fallida5PASS/1error y unpack5PASS/1fallo,
seguidos del resultado correcto. No ocultar los intentos fallidos.

Pendiente de aceptación humana: enviar incidencia con cuenta autorizada en Render,
abrirla con ADMIN y confirmar estados; no crear usuarios reales para probar. Adjuntos
anteriores preservados fuera del commitV59. Publicación y saludHTTPS se registran al cierre.

Verificación del índice Git exportado a tmp/v59-review (sin adjuntos locales):
6PASS backend contra la misma BD aislada;285PASS frontend/19archivos. La primera
ejecución sin DATABASE_URL explícita dio503 en el caso401; corregida configurando
solo URL local. El mock de screens omitía el nuevo contrato items/total:1fallo/284PASS,
corregido en setup; además UI maneja respuestas inválidas como error recuperable.
Typecheck y build del índice comprobados al cierre (1904módulos en primer build).
Comando npm inicial desde raíz sin package.json:ENOENT, corregido con --prefix.
Graphify2429nodos/122comunidades; checkvigente y diffcheck sin errores.
