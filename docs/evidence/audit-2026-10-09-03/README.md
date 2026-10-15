# Evidencia AUDIT-2026-10-09-03 - F3-01

Repositorio https://github.com/sromansilva/ashakids-platform . Rama piero-dev, HEAD
82f868fd4a1b7e7d40a636651c13d9add472c71f más cambios sin commit/push. Fecha 09/10/2026 Lima.

## Resultado y límites

Centro Familiar/Mi Camino ASHA consumen registros guardados sin niños ficticios, cifras,
recomendaciones, hitos o firmas inventados. 165 componentes (12 casos nuevos), 25 rutas;
tipos/check/build correctos. Las pruebas de componentes usan fetch simulado, no SQL.

Navegador real: API 8001 + frontend 5174 + PG 17.6 local 6544/ashakids_test_compat17. Dos hijos
sintéticos con mismo nombre y distintas IDs; cambio de hijo, navegación y recarga conservan
selección sin mezclar datos. Familia p90002 vacía no recibe niños de respaldo. Reporte leído
es el ya guardado en auditoría 02; no se creó ni cerró otra sesión en este corte.

Script de preparación añadió un hermano y cita futura sobre fixture02, sin TRUNCATE:
7 respuestas HTTP verificadas. Conteos clínicos: 5 usuarios, 2 pacientes, 1 tratamiento,
2 citas, 1 sesión y 1 reporte. En este corte no se consultó ni escribió Supabase.

14 observaciones manuales están en browser-observations.json, con contexto/límites; no
son una suite automática E2E ni número de endpoints. Screenshots capturan porciones visibles
de un contenedor con scroll, no todas las pantallas. Mocks cubren errores/carga/reintento;
no se cortó la red del navegador real. No hosting, Linux, carga ni pentest.

## Archivos

- frontend-tests.xml: suite final de 165 componentes con resultados y nombres.
- routing-tests.txt / typecheck.txt / frontend-check.txt / build.txt: controles finales.
- typecheck-before-test-fix.txt: dos opciones exact de Testing Library inválidas; corregidas.
- routing-sandbox-block.txt: bloqueo spawn EPERM inicial; no es ejecución de 25 casos.
- attempts.json: errores iniciales/alcance compartido y correcciones del corte.
- local-fixture.json: respuestas HTTP de preparación local y IDs sintéticos.
- local-final-inspection.json: conteos/restricciones después de ampliar fixture.
- browser-observations.json: observaciones reales en UI, incluidas identidad/vacíos/recarga.
- home-desktop.png / home-report-desktop.png: vista inicial y sección persistente de Home.
- journey-report-desktop.png / sibling-reload-desktop.png: Mi Camino, reporte y hermano vacío.
- journey-mobile.png: inspección inicial; home-mobile.png es captura tras ajuste de legibilidad.
- sibling-mobile-reload.png / empty-family-mobile.png: selección persistente y familia vacía.
- design-detector.json: dos advertencias de paleta violeta heredada, conservada sin rediseño.
- knowledge-check.txt / pdf-qa.json / manifest.json: mapa, presentación y huellas de fuentes.

## Comandos para repetir en otro equipo

Desde frontend, dependencias de package-lock instaladas:

```powershell
npm run test:components
npm run test:routing
npm run typecheck
npm run check:frontend
npm run build
```

Si el sandbox bloquea esbuild/Node con EPERM, ejecutar con el permiso local necesario;
no contar el fallo de arranque como aprobación ni ocultarlo. No requiere abrir una conexión BD.

Navegador: conservar fixture del corte 02 o reproducir su guion en una BD local descartable
identificada, con versión/esquema documentados. **prepare y pytest truncan datos**: no repetirlos
contra la demostración que se quiera conservar, ni contra Supabase.

Desde backend, API 8001 debe estar comprobada con DATABASE_URL del runtime local:

```powershell
$env:ASHAKIDS_TEST_DATABASE_URL='postgresql+asyncpg://ashakids_audit_runtime@127.0.0.1:6544/ashakids_test_compat17'
$env:DATABASE_URL=$env:ASHAKIDS_TEST_DATABASE_URL
$env:ASHAKIDS_ALLOW_ISOLATED_LIVE_TESTS='1'
$env:ASHAKIDS_TEST_API_URL='http://127.0.0.1:8001/api/v1'
./.venv313/Scripts/python.exe -m scripts.phase3_tracking_fixture --output ../tmp/phase3-reproduction.json
```

Script presupone fixture02 existente y es idempotente mientras existan el hermano/cita
futura. Guarda evidencia nueva en tmp; no sobrescribir archivos del corte histórico.
Las guardas del cliente no descubren por sí mismas la BD interna de un servidor arbitrario.
API habitual 8000/frontend 5173 permanecen separados. Esta fixture usa password pública
sintética Auditoria-Sintetica-2026! para p90001/p90002; no son cuentas compartidas reales.

Comprobar 1366x900 y 390x844: Home por paciente, futuro pendiente, hijo2 sin registros,
Mi Camino/Tratamientos/Reportes, recarga y familia vacía tras logout/login. Restaurar viewport
al terminar. En esta reproducción no afirmar cobertura de todas las pantallas por build.

## Continuación

F3-01 verificado en dos entradas; otros módulos/promesas de recuperación/consentimiento
requieren revisión. Definir mínimos de F5-01 con equipo antes de ampliarlos. Incidencia01,
reproducción por otro integrante y commit compartido pendientes. Señal de relevo acordada
en AGENTS.md: tokens bajos dejar todo listo para siguiente desarollador. No se recibió aquí;
cambios aún locales. Hosting solo se comparará al comprobar estabilidad del alcance.
