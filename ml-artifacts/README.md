# Modelo predictivo de tratamientos

Esta carpeta admite únicamente artefactos preparados y revisados fuera de la solicitud HTTP. No se incluye un modelo clínico porque el repositorio no contiene una cohorte de entrenamiento y validación aprobada.

Para habilitar el pronóstico, monta aquí un archivo de artefacto confiable y treatment-manifest.json. El manifiesto debe declarar:

- status: APPROVED_FOR_CLINICAL_ASSISTANCE.
- version, model_path, model_sha256, las cinco feature_names en el orden definido por treatment_predictor.py y diagnosis_codebook con exactamente los códigos 0 a 3 y las etiquetas del catálogo institucional (ver «Catálogo diagnóstico preliminar»).
- La variable `nivel_colaboracion` usa una escala de 1 (requiere ayuda total) a 5 (participación autónoma); se deriva invirtiendo el nivel de ayuda del informe. El entrenamiento debe usar esta misma definición.
- validation.dataset_version, validation.report_path (ruta relativa al manifiesto), validation.report_sha256, validation.reviewed_by, validation.reviewed_at, validation.independent_cohort=true, validation.calibration_verified=true, validation.diagnosis_codebook_reviewed=true, validation.sample_count, validation.prediction_interval_90_sessions y validation.risk_thresholds con medium/high aprobados. El informe debe estar dentro del directorio del manifiesto; el servicio verifica el SHA-256 del archivo y rechaza rutas absolutas, rutas fuera de ese directorio, informes ausentes o hashes distintos.

El artefacto debe ser un paquete joblib confiable con feature_names en el orden exacto, un sklearn RandomForestRegressor para sesiones y un sklearn CalibratedClassifierCV que envuelva un RandomForestClassifier para riesgo. La confianza mostrada es la probabilidad calibrada de la clase de riesgo más probable, no una garantía de acierto del pronóstico de sesiones. El manifiesto debe fijar el SHA-256 exacto del artefacto. Una etiqueta pendiente, un manifiesto incompleto, un catálogo diagnóstico sin revisar o un hash distinto mantienen el endpoint predictivo cerrado con HTTP 503.

## Catálogo diagnóstico preliminar

El código diagnóstico es independiente del modelo: lo define el backend (`backend/src/modules/clinica/dtos/diagnosticoPreliminar.ts`, expuesto en `GET /api/v1/clinica/diagnosticos-preliminares`, siempre disponible para TERAPEUTA y ADMIN) y lo elige el terapeuta al crear el plan, con la etiqueta «Código diagnóstico preliminar asignado por el terapeuta». No es un diagnóstico clínico emitido por el sistema.

| Código | Etiqueta |
| --- | --- |
| 0 | Dislalia funcional |
| 1 | Retraso simple del habla |
| 2 | Trastorno del lenguaje (TEL) |
| 3 | Deglución atípica |

`diagnosis_codebook` del manifiesto (y el JSON de `--diagnosis-codebook` del entrenador) debe contener exactamente esos cuatro códigos con esas mismas etiquetas, como cadenas: `{"0": "Dislalia funcional", "1": "Retraso simple del habla", "2": "Trastorno del lenguaje (TEL)", "3": "Deglución atípica"}`. El backend compara códigos y etiquetas con el catálogo publicado por el modelo; si no coinciden, el pronóstico se considera no disponible (`GET /api/v1/clinica/tratamientos/pronostico-estado` devuelve `disponible: false`). Si el catálogo institucional cambia, hay que reentrenar y volver a aprobar el modelo.

## Transcriptor Wav2Vec 2.0

El servicio usa jonatasgrosman/wav2vec2-large-xlsr-53-spanish, fijado a la revisión 96d7e9b4e4a78af515a3c6d3cee7c0826045d276. El modelo se distribuye bajo Apache-2.0 y su ficha lo describe como ajustado con Common Voice 6.1. Esta transcripción experimental no es una evaluación clínica ni está validada para diagnóstico infantil.

Los pesos no se guardan en Git ni se copian a la imagen Docker. Compose conserva la caché en el volumen ashakids-ml-cache; en un entorno nuevo se necesita acceso de red confiable para descargar el modelo. Para preparar la caché antes de iniciar el servicio, ejecuta: docker compose run --rm ml-service python download_model.py. El comando usa la misma revisión fijada por el motor y persiste los archivos en el volumen. Las muestras de audio se envían al microservicio local; el servicio no las sube a Hugging Face.

## Procedimiento para entrenar con una cohorte real

El pronóstico permanece deshabilitado (HTTP 503) hasta que un humano apruebe un modelo. Nada de este procedimiento lo habilita automáticamente.

1. **Exportar (solo lectura)**: `node scripts/export_treatment_cohort.mjs --split-date YYYY-MM-DD --output-dir <dir-fuera-de-git>`. Usa una transacción READ ONLY y produce `train.csv` y `validation.csv` sin identificadores (cohorte temporal independiente). Lee `tratamiento_variables_modelo` (variables que el servidor calcula al publicar cada plan, sin depender de ningún modelo) y el desenlace `ALTA` o `ABANDONO` fijado por el terapeuta con `PATCH /api/v1/clinica/tratamientos/:id/desenlace`; `sesiones_hasta_alta` cuenta sesiones finalizadas con asistencia. Cada expediente aporta una sola fila (su primer tratamiento con desenlace) para que ningún paciente quede en ambas cohortes, y se omiten las filas con variables fuera de rango o con sesiones fuera de 1 a 31. La conexión exige DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD sin valores por defecto, y con DB_SSL_ENABLED=true verifica el certificado (DB_SSL_CA_FILE opcional). **Hay que acumular una cohorte real:** solo cuentan los planes publicados desde que existe la captura y cerrados con desenlace; los planes anteriores no tienen variables registradas y no se exportan, y no se inventan ni se importan datos sintéticos. Con menos filas que `--min-rows` (300 por defecto) el script termina con error sin exportar. El catálogo diagnóstico para el entrenador es el de la sección anterior (códigos 0 a 3).
2. **Entrenar**: `ml-service/.venv/Scripts/python.exe ml-service/train_predictive_model.py --train-csv train.csv --validation-csv validation.csv --output-dir ml-artifacts/<corrida> --dataset-version <version> --diagnosis-codebook codebook.json`. Valida rangos, nulos, clases, mínimos de muestras (incluidas filas de alta, `--min-completed`), columnas de identificación, CSV distintos por SHA-256 y que la fracción de filas de validación idénticas a entrenamiento no supere `--max-shared-fraction` (0.5; las coincidencias parciales son normales con variables discretas y se registran en el informe). `sesiones_hasta_alta` en filas de abandono es un conteo truncado: solo se usan filas de alta para entrenar y evaluar el regresor de sesiones; si algo falla no escribe nada. El directorio de salida debe estar vacío.
3. **Resultado (solo borrador)**: `treatment_predictor.joblib`, `validation-report.json`, `validation-report.md`, `SHA256SUMS.txt` y `treatment-manifest.draft.json` con `status: PENDING_CLINICAL_REVIEW`, `reviewed_by`/`reviewed_at` vacíos y las tres atestaciones (`independent_cohort`, `calibration_verified`, `diagnosis_codebook_reviewed`) en `false`. El predictor rechaza este borrador. Las métricas se calculan solo con la cohorte independiente; los umbrales de riesgo son una sugerencia heurística.
4. **Revisión clínica**: el revisor humano valida cohorte, calibración, catálogo diagnóstico, intervalo y umbrales, y comprueba los SHA-256.
5. **Aprobación**: el revisor crea y firma manualmente `treatment-manifest.json` (copiando el borrador, completando revisor y fecha con zona horaria, las atestaciones verificadas y el estado de aprobación definido arriba) en el mismo directorio que el modelo y el informe, sin modificar ninguno de los dos (los hashes deben coincidir). Luego se apunta `TREATMENT_MODEL_MANIFEST` a ese archivo. Los scripts de este repositorio nunca generan el manifiesto aprobado.

Los CSV de cohorte y todo el contenido de `ml-artifacts/` salvo este README están en `.gitignore`: no se versionan datos clínicos ni modelos.
