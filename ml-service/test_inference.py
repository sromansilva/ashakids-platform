"""Local, synthetic audio checks; no model download or clinical recording is used."""

import io
import unittest

import numpy as np
import soundfile as sf

from transcript_service import analizar_transcripcion_sesion
from wav2vec_engine import Wav2VecPhoneticEngine


class AudioReviewEngineTests(unittest.TestCase):
    def setUp(self):
        self.engine = Wav2VecPhoneticEngine()

    def test_decodes_and_resamples_synthetic_wav_to_mono_16k(self):
        sample_rate = 8000
        tone = np.full(sample_rate, 0.05, dtype=np.float32)
        stereo = np.column_stack((tone, -tone))
        buffer = io.BytesIO()
        sf.write(buffer, stereo, sample_rate, format="WAV")

        waveform = self.engine.audio_bytes_to_tensor(buffer.getvalue())

        self.assertEqual(waveform.dtype, np.float32)
        self.assertEqual(waveform.ndim, 1)
        self.assertEqual(len(waveform), 16000)
        self.assertTrue(np.isfinite(waveform).all())

    def test_invalid_audio_is_rejected_instead_of_replaced_with_silence(self):
        with self.assertRaisesRegex(ValueError, "decodificar"):
            self.engine.audio_bytes_to_tensor(b"not an audio file")

    def test_inference_stays_unavailable_without_loaded_model(self):
        with self.assertRaisesRegex(RuntimeError, "no está disponible"):
            self.engine.inferir_audio(b"audio")

    def test_transcript_does_not_assign_named_speakers_to_clinical_roles(self):
        result = analizar_transcripcion_sesion(
            "Terapeuta (00:01): Repite la palabra.\nCarlos (00:02): Casa.\n"
        )

        self.assertEqual(result["turnos_dialogo_count"], 2)
        self.assertEqual(result["turnos_dialogo"][0]["hablante"], "TERAPEUTA")
        self.assertEqual(result["turnos_dialogo"][1]["hablante"], "HABLANTE")


if __name__ == "__main__":
    unittest.main()
