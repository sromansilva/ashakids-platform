"""Local API checks with model loading disabled to prevent downloads."""

import unittest
from fastapi.testclient import TestClient

from app import app, engine


class LocalAudioApiTests(unittest.TestCase):
    def test_health_and_transcript_endpoints_do_not_require_external_providers(self):
        original_initialize = engine.initialize
        engine.initialize = lambda: None
        try:
            with TestClient(app) as client:
                health = client.get("/health")
                self.assertEqual(health.status_code, 200)
                self.assertFalse(health.json()["modelo_listo"])

                transcript = client.post(
                    "/analyze/session-transcript",
                    json={"texto": "Terapeuta (00:01): Hola.\nNombre (00:02): Buen día."},
                )
                self.assertEqual(transcript.status_code, 200)
                self.assertEqual(transcript.json()["turnos_dialogo_count"], 2)
                self.assertEqual(transcript.json()["turnos_dialogo"][1]["hablante"], "HABLANTE")

                old_route = client.post("/analyze/meet-transcript", json={"texto": "texto"})
                self.assertEqual(old_route.status_code, 404)
        finally:
            engine.initialize = original_initialize


if __name__ == "__main__":
    unittest.main()
