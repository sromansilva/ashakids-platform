"""Clinical Guardrails & Medical Governance Auditor (Human-in-the-Loop)."""

from typing import Any, Dict
from pydantic import ValidationError

from treatment_predictor import (
    TreatmentPredictor,
    TreatmentPredictionInput,
)
from harness.acoustic_benchmark import generate_test_wav
from wav2vec_engine import Wav2VecPhoneticEngine


class ClinicalGuardrailsAuditor:
    """Verifies that AI models never bypass human specialist oversight."""

    def __init__(self, engine: Wav2VecPhoneticEngine | None = None):
        self.engine = engine or Wav2VecPhoneticEngine()
        if not self.engine._is_ready:
            self.engine.initialize()
        self.predictor = TreatmentPredictor()

    def run(self) -> Dict[str, Any]:
        results: Dict[str, Any] = {
            "name": "Clinical Guardrails & Human-in-the-Loop Governance",
            "passed": True,
            "tests": [],
        }

        # 1. Acoustic Output Notice: Must always label output as tentative and pending therapist review
        wav_bytes = generate_test_wav(2.5)
        # Temporarily mock the inner inferir_audio to return sample transcript for schema inspection
        orig_inferir_audio = self.engine.inferir_audio
        try:
            self.engine.inferir_audio = lambda **_kw: {
                "transcripcion": "carro",
                "duracion_segundos": 2.5,
                "motor_red_neuronal_activa": True,
            }
            transcription = self.engine.inferir_fonetica(wav_bytes, "carro", "/rr/")
        finally:
            self.engine.inferir_audio = orig_inferir_audio

        has_notice = bool(
            transcription.get("aviso_clinico")
            and "terapeuta" in transcription["aviso_clinico"].lower()
            and transcription.get("estado_revision") == "PENDIENTE_REVISION_TERAPEUTA"
        )
        results["tests"].append({
            "test": "acoustic_tentative_disclaimer_mandatory",
            "passed": has_notice,
            "detail": f"Notice verified: '{transcription.get('aviso_clinico')}' [Status: {transcription.get('estado_revision')}]"
            if has_notice
            else "Failed: Output lacks explicit tentative clinical disclaimer or pending therapist review status.",
        })
        if not has_notice:
            results["passed"] = False

        # 2. Acoustic Output: Must NOT emit autonomous diagnosis
        has_auto_diagnosis = "diagnostico_automatico" in transcription or "diagnostico_definitivo" in transcription
        results["tests"].append({
            "test": "no_autonomous_diagnosis_in_acoustic_output",
            "passed": not has_auto_diagnosis,
            "detail": "Verified: Acoustic output does not formulate autonomous diagnoses."
            if not has_auto_diagnosis
            else "Failed: Autonomous diagnosis field detected in acoustic output.",
        })
        if has_auto_diagnosis:
            results["passed"] = False

        # 3. Treatment Predictor: Must reject execution while unapproved (No fake 12 sessions)
        valid_input = TreatmentPredictionInput(
            edad_meses=60,
            codigo_diagnostico=2,
            cantidad_fonemas_afectados=3,
            nivel_colaboracion=4,
            frecuencia_semanal=2,
        )

        try:
            self.predictor.predict(valid_input)
            results["tests"].append({
                "test": "unapproved_predictor_fails_closed (No fake 12 sessions)",
                "passed": False,
                "detail": "Failed: Predictor issued forecast without an approved clinical validation package.",
            })
            results["passed"] = False
        except RuntimeError as err:
            rejection_detail = str(err)
            results["tests"].append({
                "test": "unapproved_predictor_fails_closed (No fake 12 sessions)",
                "passed": True,
                "detail": f"Verified: Correctly fails closed (Human-in-the-Loop): {rejection_detail}",
            })
        except Exception as exc:
            results["tests"].append({
                "test": "unapproved_predictor_fails_closed (No fake 12 sessions)",
                "passed": False,
                "detail": f"Unexpected error: {exc}",
            })
            results["passed"] = False

        # 4. Input Boundary Validation: Reject invalid clinical vectors
        invalid_inputs = [
            {"edad_meses": 5, "desc": "edad < 24 meses"},
            {"edad_meses": 250, "desc": "edad > 180 meses"},
            {"frecuencia_semanal": 5, "desc": "frecuencia > 3 por semana"},
            {"nivel_colaboracion": 0, "desc": "colaboración < 1"},
        ]

        bounds_passed = True
        for inv in invalid_inputs:
            base = {
                "edad_meses": 60,
                "codigo_diagnostico": 1,
                "cantidad_fonemas_afectados": 2,
                "nivel_colaboracion": 3,
                "frecuencia_semanal": 2,
            }
            base.update(inv)
            desc = base.pop("desc")
            try:
                TreatmentPredictionInput(**base)
                bounds_passed = False
                results["tests"].append({
                    "test": f"input_guard_{desc}",
                    "passed": False,
                    "detail": f"Failed: Accepted out-of-range clinical value for {desc}.",
                })
            except ValidationError:
                results["tests"].append({
                    "test": f"input_guard_{desc}",
                    "passed": True,
                    "detail": f"Verified: Out-of-range value rejected for {desc}.",
                })

        if not bounds_passed:
            results["passed"] = False

        return results
