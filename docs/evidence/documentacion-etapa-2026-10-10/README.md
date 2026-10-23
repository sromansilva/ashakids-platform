# Evidencia de síntesis documental V46

Fecha: 2026-10-10, America/Lima. Repositorio https://github.com/sromansilva/ashakids-platform .
Rama examinada codex/2do-intento/dev, base V45 `62048038b70d2411234fb681284e327cf142d1b7`.
El commit de cierre V46 se identifica por Git; no se autoconsigna un SHA aún inexistente.

Este corte es revisión documental y lectura de metadatos, **no una auditoría técnica nueva**.
No se ejecutaron suites funcionales, fixtures ni operaciones clínicas/administrativas de escritura.
No se crearon cuentas ni se cambiaron contraseñas, tablas, .env, UI o permisos.

## Fuentes y comandos

- PDF del usuario `AVANCE DEL PROYECTO FINAL 2.pdf`: cinco páginas extraídas con pdfplumber,
  renderizadas e inspeccionadas; hash en manifest.json. El PDF original conserva su ubicación
  privada del usuario; requisitos-pdf-extraidos.txt conserva su estructura sin datos clínicos.
- `python tools/knowledge/manage.py check`: vigente; query de iniciar/cerrar/publicar/reporte
  con presupuesto inicial1500, confirmado leyendo los servicios y componentes relevantes.
- Lectura SQL **SET TRANSACTION READ ONLY** exclusivamente de pg_class/pg_attribute/
  pg_constraint/pg_indexes/pg_policies. Catálogo public completo, sin filas de aplicación,
  credenciales ni logs. La consulta inicial de mapeos importó solo models/__init__,12tablas;
  se corrigió importando clínica/agenda/mensajería/notificaciones: **23 modelos**, no se
  atribuye diferencia de esquema a una importación incompleta.
- Char internos del catálogo llegaron como bytes; se normalizaron antes del JSON final.
  El primer generador contó cero FK por ese formato, corregido y regenerado: **41 FK**.
  Salida final:30tablas/207columnas/113pg_constraint/87índices/70políticas/23ORM.
  NOT NULL se contabiliza en columnas, no en pg_constraint; no usar cifras históricas221
  como si provinieran de este método.
- GET HTTPS públicos `/openapi.json`, `/health`, `/health/ready`:200. **OpenAPI3.1.0,
  API0.1.0,69operaciones**. No login ni lectura clínica nueva para esta documentación.
- Generación: `tools/reports/build_stage_documentation_pdf.py` con ReportLab y fuentes Arial.
  Exports en output/pdf; PDFs renderizados con pdfplumber/PDFium y revisados en hojas
  de contacto completas y páginas a resolución mayor. Geometría/texto en pdf-validation.json.
  Comando marcador de operación PDF ejecutado una vez, antes de autoría, para dos salidas.

Incidencias de herramientas: pymupdf no disponible, se usó pdfplumber instalado; impresión
de texto PDF en consola cp1252 falló por flecha, extracción UTF8 y renders ya guardados
se leyeron con Get-Content. Búsquedas con src inexistente/glob Windows y nombres supuestos
se sustituyeron por rg --files y las rutas reales. No hubo escrituras de negocio por esos fallos.

## Procedencia funcional

El usuario confirmó personalmente en Render alta/acceso de padre y terapeuta, publicación
de disponibilidad, consulta familiar, reserva y enlace Zoom guardado/visible. No se guarda
su identidad, DNI, credencial, cita ni URL privada en estos artefactos. No se atribuye al agente
ese recorrido ni se inventan capturas. Aceptación humana del cierre/reporte/plan/continuidad
en Render pendiente. La implementación y pruebas locales V33–V37 se citan como heredadas.
V44–V45 aporta adopción/HTTPS, no una llamada Zoom ni toda la clínica en producción.

Hallazgos documentados: Zoom no cambia estado; reporte/plan permiten EN_CURSO; nueva terapia
exige intro FINALIZADA/ASISTIO con reporte y plan; mundos leen plan ACTIVO aunque todavía
esté EN_CURSO; plan nuevo finaliza anterior, historia permanece pero material jugable no acumula.
Config profesional dice8, APIexige12; PATCH propia no verifica actual; guardado reporte backend
no excluye NO_ASISTIO como sí hace UI. Pendientes, sin correcciones funcionales en este corte.

## Archivos

- catalogo-public-sanitizado.json: metadatos actuales,23mapeos; no contiene filas clínicas.
- openapi-publico.json: contrato público observado, sin credenciales/ejemplos de pacientes reales.
- manifest.json: hash PDF fuente, alcance y conteos/comprobaciones actuales.
- requisitos-pdf-extraidos.txt: estructura de referencia del Avance2.
- pdf-validation.json: PDFs/páginas y revisión geométrica; no resultados funcionales.

Las dos fuentes editables son docs/DOCUMENTACION_MAESTRA_ETAPA_ACTUAL.md y
docs/GUIA_FLUJO_ESTADO_Y_PENDIENTES.md. Sus porcentajes son índice documental con
denominadores explícitos, no nota oficial ni porcentaje de aceptación Render.

Por solicitud posterior del usuario se añade REGISTRO_INCONSISTENCIAS_Y_CRITERIOS.md,
con12fichas (9inconsistencias y3criterios de producto), todas abiertas. Se confirmó por
lectura la diferenciaUI/API y mensajes de éxito local, sin manipular cuentas, activar2FA,
cambiar contraseña ni enviar solicitudes. Casos de aceptación propuestos no ejecutados.
