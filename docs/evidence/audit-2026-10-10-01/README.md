# Corte 2026-10-10-01 - flujo Padre y tablas

Repositorio: https://github.com/sromansilva/ashakids-platform . Código auditado:
`piero-dev`, V29 `ae5875ba2173e1d656d058ea6918c63c21382456`.
Cambios previos: AGENTS.md/estado visual, preferencia de abrir revisión local.
Solo informe/evidencias/continuidad: ninguna modificación de aplicación o datos.

Texto de comparación: adjunto del usuario «Flujo completo de la Ashakids Platform»;
requisitos transcritos y comparados en el informe, sin persistir su ruta privada.
Fuente: [informe](../../audits/auditoria-2026-10-10-01.md).
PDF: [entrega](../../../output/pdf/Auditoria_Flujo_Padre_Tablas_AshaKids_2026-10-10-01.pdf).

## Comprobaciones nuevas y reproducción

```powershell
python tools/knowledge/manage.py check
python tools/knowledge/manage.py query 'FamilyTrackingPanel Reserva Perfil ResultadoNivel'
& backend/.venv313/Scripts/python.exe docs/evidence/audit-2026-10-10-01/inspect_parent_schema.py
```

Consulta graphify con presupuesto predeterminado 1500, truncada y contrastada leyendo
fuentes. SQL compartido: SET TRANSACTION READ ONLY, statement_timeout 15 s;
ninguna fila clínica, chat, credencial, login o escritura. Catálogo26/visible22;
PostgreSQL17.6; sin triggers de usuario en public;55 operaciones OpenAPI del clon.
Las cuatro tablas sin SELECT runtime son mensaje_adjuntos/mundos/niveles/objetivos.
FKs en pg_catalog confirman la dependencia pacientes->actividades->mundos->niveles.

Desde frontend:

```powershell
npx vitest run tests/family-tracking.test.tsx tests/messaging.test.tsx tests/frontend-remediation.test.tsx
```

3 archivos/55 pruebas correctas. Salida guardada frontend-tests.txt (HTTP simulado,
sin backend ni SQL). No repetir suites de integración/prepare que truncan datos.

PDF generado con Python empaquetado (reportlab), constructor existente
tools/reports/build_backend_audit_pdf.py, --date '10 OCT 2026', título Flujo Padre y tablas.
Marcador de operación PDF ejecutado una vez antes de autoría. Render con pdftoppm85dpi;
seis páginas finales inspeccionadas una por una, sin recortes/superposición/páginas vacías.
PNG temporales en tmp/pdfs/parent-flow-delivery-*.png, no se versionan.

Errores de herramienta corregidos: --budget no existe en manage.py; nombres supuestos
de algunos archivos y glob literal PowerShell inválidos; Python del sistema sin reportlab.
Se usaron rutas localizadas con rg, presupuesto predeterminado y runtime empaquetado.
Primer render8 páginas y revisión7 con continuaciones vacías; ajuste del informe a6 páginas.
No son fallos del producto. No se atribuye cobertura visual del sitio ni nueva aceptación
HTTP/SQL autenticada. Referencias a fuentes con líneas del V29, sin puntajes inventados.

## Continuación

U0 permanece terminada; U1.1 sigue pendiente. Esta revisión no inicia otro módulo.
Decisiones previas a implementar el texto: alta con Perfil, sincronización de conteos,
tratamiento opcional/primera consulta, asignación ADMIN vs terapeuta, reserva pendiente
ocupa horario o no, título derivado, mes por sesión vs fecha del reporte, catálogo global
vs actividad por paciente, adjuntos privados y reglas de desbloqueo en servidor.
No eliminar tablas por falta de uso; IA/pagos fuera de implementación vigente.

Cierre documental V30_Auditoria_Flujo_Padre_Tablas; SHA efectivo por git log.
Integración dev/personal se verifica al cierre sin force-push; no despliegue Render.

Checks finales nuevos:manage.py refresh AST/code-only/no-label completó1995 nodos/92
comunidades; check vigente. Aviso12 archivos sin símbolos, sin fallo. git diff --check
correcto. PDF reabierto con pypdf:6 páginas con contenido y8 secciones;JSON read_only=on
y catálogo26 confirmados. Revisión del diff solo documental/evidencia;sin secretos/filas.
