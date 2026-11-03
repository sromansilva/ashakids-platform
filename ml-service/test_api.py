"""Local API checks with model loading disabled to prevent downloads."""

import unittest
import base64
import io
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient

from app import app, engine
from wav2vec_engine import MODEL_REVISION


class LocalAudioApiTests(unittest.TestCase):
    def test_phonetics_api_rejects_samples_outside_the_two_to_three_second_window(self):
        original_initialize = engine.initialize
        original_inference = engine.inferir_audio

        def fake_inference(audio_bytes):
            return {
                "transcripcion": "ratón",
                "duracion_segundos": 2.5,
                "motor_red_neuronal_activa": True,
            }

        def wav_bytes(duration_seconds):
            buffer = io.BytesIO()
            samples = np.zeros(int(16_000 * duration_seconds), dtype=np.float32)
            sf.write(buffer, samples, 16_000, format="WAV", subtype="PCM_16")
            return buffer.getvalue()

        engine.initialize = lambda: None
        engine.inferir_audio = fake_inference
        try:
            with TestClient(app) as client:
                short = client.post(
                    "/predict/phonetics",
                    files={"file": ("muestra.wav", wav_bytes(1.99), "audio/wav")},
                    data={"palabra_objetivo": "ratón", "fonema_objetivo": "/r/"},
                )
                self.assertEqual(short.status_code, 422)

                valid = client.post(
                    "/predict/phonetics",
                    files={"file": ("muestra.wav", wav_bytes(2.5), "audio/wav")},
                    data={"palabra_objetivo": "ratón", "fonema_objetivo": "/r/"},
                )
                self.assertEqual(valid.status_code, 200)
                self.assertEqual(valid.json()["duracion_segundos"], 2.5)
        finally:
            engine.initialize = original_initialize
            engine.inferir_audio = original_inference

    def test_phonetics_endpoint_accepts_json_and_wav_multipart_and_wipes_buffers(self):
        original_initialize = engine.initialize
        original_inference = engine.inferir_fonetica
        buffers = []

        def fake_inference(audio_bytes, palabra_objetivo=None, fonema_objetivo=None):
            buffers.append(audio_bytes)
            return {
                "transcripcion": "ratón",
                "duracion_segundos": 2.5,
                "palabra_objetivo": palabra_objetivo,
                "fonema_objetivo": fonema_objetivo,
                "motor_red_neuronal_activa": True,
            }

        engine.initialize = lambda: None
        engine.inferir_fonetica = fake_inference
        try:
            with TestClient(app) as client:
                json_result = client.post(
                    "/predict/phonetics",
                    json={
                        "audio_base64": base64.b64encode(b"json-audio").decode("ascii"),
                        "palabra_objetivo": "ratón",
                        "fonema_objetivo": "/r/",
                    },
                )
                self.assertEqual(json_result.status_code, 200)
                self.assertEqual(json_result.json()["transcripcion"], "ratón")
                self.assertEqual(buffers[0], bytearray(len(buffers[0])))

                multipart_result = client.post(
                    "/predict/phonetics",
                    files={"file": ("muestra.wav", b"wav-audio", "audio/wav")},
                    data={"palabra_objetivo": "ratón", "fonema_objetivo": "/r/"},
                )
                self.assertEqual(multipart_result.status_code, 200)
                self.assertEqual(buffers[1], bytearray(len(buffers[1])))

                oversized = client.post(
                    "/predict/phonetics",
                    files={"file": ("muestra.wav", b"x" * 512_001, "audio/wav")},
                    data={"palabra_objetivo": "ratón"},
                )
                self.assertEqual(oversized.status_code, 413)
        finally:
            engine.initialize = original_initialize
            engine.inferir_fonetica = original_inference

    def test_health_and_retired_transcript_endpoints_do_not_require_external_providers(self):
        original_initialize = engine.initialize
        engine.initialize = lambda: None
        try:
            with TestClient(app) as client:
                health = client.get("/health")
                self.assertEqual(health.status_code, 200)
                self.assertFalse(health.json()["modelo_listo"])
                self.assertEqual(health.json()["modelo_revision"], MODEL_REVISION)

                transcript = client.post(
                    "/analyze/session-transcript",
                    json={"texto": "Terapeuta (00:01): Hola.\nNombre (00:02): Buen día."},
                )
                self.assertEqual(transcript.status_code, 410)

                transcript_file = client.post(
                    "/analyze/session-transcript-file",
                    files={"file": ("sesion.txt", b"Terapeuta: Buen trabajo.\n", "text/plain")},
                )
                self.assertEqual(transcript_file.status_code, 410)

                old_route = client.post("/analyze/meet-transcript", json={"texto": "texto"})
                self.assertEqual(old_route.status_code, 404)

                plan_response = client.post(
                    "/predict/treatment-plan",
                    json={
                        "edad_meses": 72,
                        "codigo_diagnostico": 1,
                        "cantidad_fonemas_afectados": 2,
                        "nivel_colaboracion": 4,
                        "frecuencia_semanal": 2,
                    },
                )
                self.assertEqual(plan_response.status_code, 503)
        finally:
            engine.initialize = original_initialize


if __name__ == "__main__":
    unittest.main()
