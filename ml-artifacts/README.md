# Modelo predictivo de tratamientos

Esta carpeta admite únicamente artefactos preparados y revisados fuera de la solicitud HTTP. No se incluye un modelo clínico porque el repositorio no contiene una cohorte de entrenamiento y validación aprobada.

Para habilitar el pronóstico, monta aquí un archivo de artefacto confiable y treatment-manifest.json. El manifiesto debe declarar:

- status: APPROVED_FOR_CLINICAL_ASSISTANCE.
- version, model_path, model_sha256, las cinco feature_names en el orden definido por treatment_predictor.py y diagnosis_codebook con etiquetas institucionales para los códigos 1 a 5.
- La variable `nivel_colaboracion` usa una escala de 1 (requiere ayuda total) a 5 (participación autónoma); se deriva invirtiendo el nivel de ayuda del informe. El entrenamiento debe usar esta misma definición.
- validation.dataset_version, validation.report_path (ruta relativa al manifiesto), validation.report_sha256, validation.reviewed_by, validation.reviewed_at, validation.independent_cohort=true, validation.calibration_verified=true, validation.diagnosis_codebook_reviewed=true, validation.sample_count, validation.prediction_interval_90_sessions y validation.risk_thresholds con medium/high aprobados. El informe debe estar dentro del directorio del manifiesto; el servicio verifica el SHA-256 del archivo y rechaza rutas absolutas, rutas fuera de ese directorio, informes ausentes o hashes distintos.

El artefacto debe ser un paquete joblib confiable con feature_names en el orden exacto, un sklearn RandomForestRegressor para sesiones y un sklearn CalibratedClassifierCV que envuelva un RandomForestClassifier para riesgo. La confianza mostrada es la probabilidad calibrada de la clase de riesgo más probable, no una garantía de acierto del pronóstico de sesiones. El manifiesto debe fijar el SHA-256 exacto del artefacto. Una etiqueta pendiente, un manifiesto incompleto, un catálogo diagnóstico sin revisar o un hash distinto mantienen el endpoint predictivo cerrado con HTTP 503.

## Transcriptor Wav2Vec 2.0

El servicio usa jonatasgrosman/wav2vec2-large-xlsr-53-spanish, fijado a la revisión 96d7e9b4e4a78af515a3c6d3cee7c0826045d276. El modelo se distribuye bajo Apache-2.0 y su ficha lo describe como ajustado con Common Voice 6.1. Esta transcripción experimental no es una evaluación clínica ni está validada para diagnóstico infantil.

Los pesos no se guardan en Git ni se copian a la imagen Docker. Compose conserva la caché en el volumen ashakids-ml-cache; en un entorno nuevo se necesita acceso de red confiable para descargar el modelo. Para preparar la caché antes de iniciar el servicio, ejecuta: docker compose run --rm ml-service python download_model.py. El comando usa la misma revisión fijada por el motor y persiste los archivos en el volumen. Las muestras de audio se envían al microservicio local; el servicio no las sube a Hugging Face.
