"""Fail-closed checks for the clinically validated treatment predictor."""

import hashlib
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from treatment_predictor import FEATURE_NAMES, TreatmentPredictionInput, TreatmentPredictor


class TreatmentPredictorReadinessTests(unittest.TestCase):
    @staticmethod
    def _approved_manifest(report_path="validation.json", report_hash=None):
        return {
            "status": "APPROVED_FOR_CLINICAL_ASSISTANCE",
            "version": "test",
            "model_path": "model.joblib",
            "model_sha256": "0" * 64,
            "feature_names": FEATURE_NAMES,
            "diagnosis_codebook": {str(code): f"Diagnosis {code}" for code in range(1, 6)},
            "validation": {
                "dataset_version": "cohort-test-1",
                "report_path": report_path,
                "report_sha256": report_hash or "1" * 64,
                "reviewed_by": "Independent reviewer",
                "reviewed_at": "2026-11-01T12:00:00Z",
                "independent_cohort": True,
                "calibration_verified": True,
                "sample_count": 40,
                "prediction_interval_90_sessions": 5,
                "risk_thresholds": {"medium": 0.3, "high": 0.7},
                "diagnosis_codebook_reviewed": True,
            },
        }

    def test_predictor_stays_disabled_without_an_approved_model_manifest(self):
        with patch.dict(os.environ, {"TREATMENT_MODEL_MANIFEST": ""}):
            predictor = TreatmentPredictor()

        self.assertFalse(predictor.initialize())
        self.assertFalse(predictor.is_ready)
        data = TreatmentPredictionInput(
            edad_meses=60,
            codigo_diagnostico=1,
            cantidad_fonemas_afectados=2,
            nivel_colaboracion=3,
            frecuencia_semanal=2,
        )
        with self.assertRaisesRegex(RuntimeError, "validación clínica aprobada"):
            predictor.predict(data)

    def test_prediction_inputs_are_range_checked(self):
        with self.assertRaises(ValueError):
            TreatmentPredictionInput(
                edad_meses=12,
                codigo_diagnostico=1,
                cantidad_fonemas_afectados=2,
                nivel_colaboracion=3,
                frecuencia_semanal=2,
            )

    def test_manifest_requires_a_reviewed_diagnosis_codebook(self):
        manifest = {
            "status": "APPROVED_FOR_CLINICAL_ASSISTANCE",
            "version": "test",
            "model_path": "model.joblib",
            "model_sha256": "0" * 64,
            "feature_names": FEATURE_NAMES,
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaisesRegex(ValueError, "catálogo institucional"):
                TreatmentPredictor._validate_manifest(manifest, Path(temp_dir))

    def test_manifest_requires_a_validation_report_path(self):
        manifest = self._approved_manifest()
        del manifest["validation"]["report_path"]

        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaisesRegex(ValueError, "expediente de validación clínica está incompleto"):
                TreatmentPredictor._validate_manifest(manifest, Path(temp_dir))

    def test_manifest_verifies_validation_report_hash_and_rejects_missing_or_external_reports(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            report = root / "validation.json"
            report.write_text('{"reviewed": true}', encoding="utf-8")
            expected_hash = hashlib.sha256(report.read_bytes()).hexdigest()
            manifest = self._approved_manifest(report_hash=expected_hash)

            TreatmentPredictor._validate_manifest(manifest, root)

            manifest["validation"]["diagnosis_codebook_reviewed"] = "no"
            with self.assertRaisesRegex(ValueError, "catálogo diagnóstico revisados"):
                TreatmentPredictor._validate_manifest(manifest, root)
            manifest["validation"]["diagnosis_codebook_reviewed"] = True

            manifest["validation"]["report_sha256"] = "0" * 64
            with self.assertRaisesRegex(ValueError, "no coincide con el manifiesto"):
                TreatmentPredictor._validate_manifest(manifest, root)

            manifest["validation"]["report_path"] = "../outside.json"
            with self.assertRaisesRegex(ValueError, "sale del directorio del manifiesto"):
                TreatmentPredictor._validate_manifest(manifest, root)

            manifest["validation"]["report_path"] = "missing.json"
            manifest_path = root / "manifest.json"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            with patch.dict(os.environ, {"TREATMENT_MODEL_MANIFEST": str(manifest_path)}):
                predictor = TreatmentPredictor()

            self.assertFalse(predictor.initialize())
            self.assertFalse(predictor.is_ready)

    def test_manifest_rejects_malformed_clinical_validation_field_types(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            report = root / "validation.json"
            report.write_text('{"reviewed": true}', encoding="utf-8")
            report_hash = hashlib.sha256(report.read_bytes()).hexdigest()
            invalid_cases = (
                ("dataset_version", 3),
                ("report_path", 12),
                ("sample_count", True),
                ("prediction_interval_90_sessions", True),
                ("reviewed_at", "2026-11-01T12:00:00"),
                ("risk_thresholds", {"medium": "0.3", "high": 0.7}),
            )

            for field, value in invalid_cases:
                with self.subTest(field=field):
                    manifest = self._approved_manifest(report_hash=report_hash)
                    manifest["validation"][field] = value
                    with self.assertRaises(ValueError):
                        TreatmentPredictor._validate_manifest(manifest, root)

    def test_prediction_range_never_exceeds_treatment_plan_limit(self):
        class SessionsModel:
            def predict(self, _values):
                return [31.0]

        class DropoutModel:
            classes_ = [0, 1]

            def predict_proba(self, _values):
                return [[0.1, 0.9]]

        predictor = TreatmentPredictor()
        predictor._bundle = {"sessions_model": SessionsModel(), "dropout_model": DropoutModel()}
        predictor._manifest = {
            "validation": {
                "prediction_interval_90_sessions": 5,
                "risk_thresholds": {"medium": 0.3, "high": 0.7},
            },
            "diagnosis_codebook": {"1": "Código revisado de prueba"},
            "version": "unit-test",
        }
        result = predictor.predict(TreatmentPredictionInput(
            edad_meses=60,
            codigo_diagnostico=1,
            cantidad_fonemas_afectados=2,
            nivel_colaboracion=3,
            frecuencia_semanal=2,
        ))

        self.assertEqual(result.sesiones_estimadas, 31.0)
        self.assertEqual(result.rango_min, 26)
        self.assertEqual(result.rango_max, 31)

    def test_prediction_interval_always_contains_fractional_estimate(self):
        class SessionsModel:
            def predict(self, _values):
                return [14.2]

        class DropoutModel:
            classes_ = [0, 1]

            def predict_proba(self, _values):
                return [[0.1, 0.9]]

        predictor = TreatmentPredictor()
        predictor._bundle = {"sessions_model": SessionsModel(), "dropout_model": DropoutModel()}
        predictor._manifest = {
            "validation": {"prediction_interval_90_sessions": 0, "risk_thresholds": {"medium": 0.3, "high": 0.7}},
            "diagnosis_codebook": {"1": "Código revisado de prueba"},
            "version": "unit-test",
        }
        result = predictor.predict(TreatmentPredictionInput(
            edad_meses=60,
            codigo_diagnostico=1,
            cantidad_fonemas_afectados=2,
            nivel_colaboracion=3,
            frecuencia_semanal=2,
        ))

        self.assertEqual(result.sesiones_estimadas, 14.2)
        self.assertEqual(result.rango_min, 14)
        self.assertEqual(result.rango_max, 15)

    def test_prediction_rejects_nonfinite_or_unpublishable_session_estimates(self):
        class SessionsModel:
            def predict(self, _values):
                return [float("nan")]

        class DropoutModel:
            classes_ = [0, 1]

            def predict_proba(self, _values):
                return [[0.1, 0.9]]

        predictor = TreatmentPredictor()
        predictor._bundle = {"sessions_model": SessionsModel(), "dropout_model": DropoutModel()}
        predictor._manifest = {
            "validation": {"prediction_interval_90_sessions": 5, "risk_thresholds": {"medium": 0.3, "high": 0.7}},
            "diagnosis_codebook": {"1": "Código revisado de prueba"},
            "version": "unit-test",
        }
        payload = TreatmentPredictionInput(
            edad_meses=60,
            codigo_diagnostico=1,
            cantidad_fonemas_afectados=2,
            nivel_colaboracion=3,
            frecuencia_semanal=2,
        )

        with self.assertRaisesRegex(RuntimeError, "fuera del rango permitido"):
            predictor.predict(payload)

        predictor._bundle["sessions_model"] = type("SessionsModel", (), {"predict": lambda self, _values: [40.0]})()
        with self.assertRaisesRegex(RuntimeError, "fuera del rango permitido"):
            predictor.predict(payload)


if __name__ == "__main__":
    unittest.main()
