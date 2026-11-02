"""Clinical treatment predictor that only loads an explicitly validated artifact.

No synthetic training or deterministic fallback is allowed. A model manifest is
reviewed and supplied by the deployment operator after independent validation.
"""

from __future__ import annotations

import hashlib
import json
import math
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from pydantic import BaseModel, Field


FEATURE_NAMES = [
    "edad_meses",
    "codigo_diagnostico",
    "cantidad_fonemas_afectados",
    "nivel_colaboracion",
    "frecuencia_semanal",
]
MAX_RECOMMENDED_SESSIONS = 31


class TreatmentPredictionInput(BaseModel):
    edad_meses: int = Field(ge=24, le=180)
    codigo_diagnostico: int = Field(ge=1, le=5)
    cantidad_fonemas_afectados: int = Field(ge=1, le=5)
    nivel_colaboracion: int = Field(ge=1, le=5)
    frecuencia_semanal: int = Field(ge=1, le=3)


class TreatmentPredictionOutput(BaseModel):
    sesiones_estimadas: float
    rango_min: int
    rango_max: int
    riesgo_desercion: str
    probabilidad_desercion: float
    diagnostico_descripcion: str
    confianza: float
    advertencia_clinica: str
    version_modelo: str


class TreatmentPredictor:
    def __init__(self) -> None:
        self.manifest_path = os.getenv("TREATMENT_MODEL_MANIFEST", "").strip()
        self._manifest: Optional[dict[str, Any]] = None
        self._bundle: Optional[dict[str, Any]] = None
        self._load_error: Optional[str] = None

    @property
    def is_ready(self) -> bool:
        return self._bundle is not None

    def initialize(self) -> bool:
        if self._bundle is not None:
            return True
        if self._load_error:
            return False
        if not self.manifest_path:
            self._load_error = "No se configuró un artefacto predictivo validado."
            return False

        try:
            manifest_path = Path(self.manifest_path).expanduser().resolve(strict=True)
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            self._validate_manifest(manifest, manifest_path.parent)

            model_path = Path(manifest["model_path"])
            if not model_path.is_absolute():
                model_path = manifest_path.parent / model_path
            model_path = model_path.resolve(strict=True)
            expected_hash = manifest["model_sha256"].lower()
            actual_hash = hashlib.sha256(model_path.read_bytes()).hexdigest()
            if actual_hash != expected_hash:
                raise ValueError("El hash del artefacto no coincide con el manifiesto aprobado.")

            # The artifact path must be operator-controlled and hash-pinned in the
            # approved manifest. Never accept paths or manifests from a request.
            import joblib

            bundle = joblib.load(model_path)
            if not isinstance(bundle, dict) or bundle.get("feature_names") != FEATURE_NAMES:
                raise ValueError("El artefacto no cumple el contrato de variables requerido.")
            from sklearn.calibration import CalibratedClassifierCV
            from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

            if not isinstance(bundle.get("sessions_model"), RandomForestRegressor):
                raise ValueError("El modelo de sesiones debe ser un Random Forest Regressor.")
            dropout_model = bundle.get("dropout_model")
            if not isinstance(dropout_model, CalibratedClassifierCV):
                raise ValueError("El modelo de abandono debe ser un Random Forest calibrado.")
            base_estimator = getattr(dropout_model, "estimator", getattr(dropout_model, "base_estimator", None))
            if not isinstance(base_estimator, RandomForestClassifier):
                raise ValueError("El clasificador calibrado debe envolver un Random Forest Classifier.")
            classes = list(getattr(dropout_model, "classes_", []))
            if not {0, 1}.issubset(set(classes)):
                raise ValueError("El clasificador calibrado debe contener ambas clases de abandono.")
            if not callable(getattr(bundle.get("sessions_model"), "predict", None)):
                raise ValueError("Falta el estimador de sesiones del artefacto.")
            if not callable(getattr(bundle.get("dropout_model"), "predict_proba", None)):
                raise ValueError("Falta el estimador calibrado de riesgo del artefacto.")
            self._manifest = manifest
            self._bundle = bundle
            return True
        except Exception as exc:
            self._load_error = str(exc)
            return False

    @staticmethod
    def _validate_manifest(manifest: dict[str, Any], manifest_dir: Path) -> None:
        if manifest.get("status") != "APPROVED_FOR_CLINICAL_ASSISTANCE":
            raise ValueError("El modelo predictivo no cuenta con aprobación clínica registrada.")
        if manifest.get("feature_names") != FEATURE_NAMES:
            raise ValueError("El manifiesto declara variables incompatibles.")
        if (
            not isinstance(manifest.get("version"), str)
            or not manifest["version"].strip()
            or not isinstance(manifest.get("model_path"), str)
            or not manifest["model_path"].strip()
        ):
            raise ValueError("Faltan versión o ruta del modelo.")
        model_hash = manifest.get("model_sha256")
        if not isinstance(model_hash, str) or not re.fullmatch(r"[a-fA-F0-9]{64}", model_hash):
            raise ValueError("El manifiesto no contiene un SHA-256 válido.")

        codebook = manifest.get("diagnosis_codebook")
        expected_codes = {str(code) for code in range(1, 6)}
        if not isinstance(codebook, dict) or set(codebook) != expected_codes or any(not isinstance(label, str) or not label.strip() for label in codebook.values()):
            raise ValueError("El catálogo institucional de códigos diagnósticos está incompleto.")

        validation = manifest.get("validation")
        if not isinstance(validation, dict):
            raise ValueError("El expediente de validación clínica está incompleto.")
        text_fields = ("dataset_version", "report_path", "reviewed_by", "reviewed_at")
        if any(not isinstance(validation.get(field), str) or not validation[field].strip() for field in text_fields):
            raise ValueError("El expediente de validación clínica está incompleto: faltan versión de cohorte, ruta del informe, revisor o fecha.")
        if any(validation.get(field) is not True for field in (
            "independent_cohort",
            "calibration_verified",
            "diagnosis_codebook_reviewed",
        )):
            raise ValueError("El informe no acredita cohorte independiente, calibración y catálogo diagnóstico revisados.")

        sample_count = validation.get("sample_count")
        if type(sample_count) is not int or sample_count < 1:
            raise ValueError("El tamaño de la cohorte validada no es válido.")
        interval = validation.get("prediction_interval_90_sessions")
        if type(interval) is not int or interval < 0 or interval > 30:
            raise ValueError("El intervalo predictivo aprobado está fuera de rango.")

        report_hash_value = validation.get("report_sha256")
        if not isinstance(report_hash_value, str) or not re.fullmatch(r"[a-fA-F0-9]{64}", report_hash_value):
            raise ValueError("El hash del informe de validación no es válido.")
        report_path = Path(validation["report_path"])
        if report_path.is_absolute():
            raise ValueError("El informe de validación debe estar dentro del directorio del manifiesto.")
        resolved_manifest_dir = manifest_dir.resolve(strict=True)
        lexical_report_path = Path(os.path.abspath(resolved_manifest_dir / report_path))
        try:
            lexical_report_path.relative_to(resolved_manifest_dir)
        except ValueError as exc:
            raise ValueError("La ruta del informe de validación sale del directorio del manifiesto.") from exc
        try:
            resolved_report_path = (resolved_manifest_dir / report_path).resolve(strict=True)
        except (OSError, RuntimeError) as exc:
            raise ValueError("El informe de validación no existe o no se puede leer.") from exc
        try:
            resolved_report_path.relative_to(resolved_manifest_dir)
        except ValueError as exc:
            raise ValueError("La ruta del informe de validación sale del directorio del manifiesto.") from exc
        try:
            report_hash = hashlib.sha256(resolved_report_path.read_bytes()).hexdigest()
        except OSError as exc:
            raise ValueError("El informe de validación no existe o no se puede leer.") from exc
        if report_hash != report_hash_value.lower():
            raise ValueError("El hash del informe de validación no coincide con el manifiesto.")
        thresholds = validation["risk_thresholds"]
        if not isinstance(thresholds, dict):
            raise ValueError("Faltan los umbrales de riesgo aprobados.")
        medium_value = thresholds.get("medium")
        high_value = thresholds.get("high")
        if (
            isinstance(medium_value, bool)
            or not isinstance(medium_value, (int, float))
            or isinstance(high_value, bool)
            or not isinstance(high_value, (int, float))
        ):
            raise ValueError("Los umbrales de riesgo aprobados no son válidos.")
        medium = float(medium_value)
        high = float(high_value)
        if not math.isfinite(medium) or not math.isfinite(high) or not 0 <= medium < high <= 1:
            raise ValueError("Los umbrales de riesgo aprobados no son válidos.")
        try:
            reviewed_at = datetime.fromisoformat(validation["reviewed_at"].replace("Z", "+00:00"))
        except ValueError as exc:
            raise ValueError("La fecha de revisión del informe no es válida.") from exc
        if reviewed_at.utcoffset() is None:
            raise ValueError("La fecha de revisión del informe debe incluir zona horaria.")

    def predict(self, payload: TreatmentPredictionInput) -> TreatmentPredictionOutput:
        if not self.initialize() or self._bundle is None or self._manifest is None:
            raise RuntimeError(
                "El pronóstico está deshabilitado hasta instalar un modelo con validación clínica aprobada."
            )

        values = [[getattr(payload, name) for name in FEATURE_NAMES]]
        sessions = float(self._bundle["sessions_model"].predict(values)[0])
        probabilities = self._bundle["dropout_model"].predict_proba(values)[0]
        classes = list(self._bundle["dropout_model"].classes_)
        if not math.isfinite(sessions) or not 1 <= sessions <= MAX_RECOMMENDED_SESSIONS:
            raise RuntimeError("El modelo produjo una estimación fuera del rango permitido para un plan terapéutico.")
        normalized_probabilities = [float(value) for value in probabilities]
        if not classes or len(normalized_probabilities) != len(classes) or any(
            not math.isfinite(value) or value < 0 or value > 1 for value in normalized_probabilities
        ) or not math.isclose(sum(normalized_probabilities), 1.0, rel_tol=1e-3, abs_tol=1e-3):
            raise RuntimeError("El modelo devolvió probabilidades inválidas.")
        positive_index = classes.index(1) if 1 in classes else classes.index(True)
        dropout_probability = normalized_probabilities[positive_index]

        margin = int(self._manifest["validation"]["prediction_interval_90_sessions"])
        low = max(1, math.floor(sessions) - margin)
        high = min(MAX_RECOMMENDED_SESSIONS, math.ceil(sessions) + margin)
        thresholds = self._manifest["validation"]["risk_thresholds"]
        risk = "ALTO" if dropout_probability >= float(thresholds["high"]) else "MEDIO" if dropout_probability >= float(thresholds["medium"]) else "BAJO"
        return TreatmentPredictionOutput(
            sesiones_estimadas=round(sessions, 1),
            rango_min=low,
            rango_max=high,
            riesgo_desercion=risk,
            probabilidad_desercion=round(dropout_probability, 4),
            diagnostico_descripcion=str(self._manifest["diagnosis_codebook"][str(payload.codigo_diagnostico)]),
            confianza=round(max(normalized_probabilities), 4),
            advertencia_clinica=(
                "Estimación de apoyo basada en un modelo validado; requiere revisión y decisión del terapeuta. "
                "No constituye diagnóstico ni sustituye la evaluación clínica."
            ),
            version_modelo=str(self._manifest["version"]),
        )

    def catalog(self) -> dict[str, Any]:
        if not self.initialize() or self._manifest is None:
            raise RuntimeError("El catálogo requiere un modelo con validación clínica aprobada.")
        return {
            "version_modelo": str(self._manifest["version"]),
            "diagnosis_codes": [
                {"code": int(code), "label": self._manifest["diagnosis_codebook"][code]}
                for code in sorted(self._manifest["diagnosis_codebook"], key=int)
            ],
        }


treatment_predictor = TreatmentPredictor()
