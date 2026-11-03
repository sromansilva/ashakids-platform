"""Local, synthetic audio checks; no model download or clinical recording is used."""

import io
import unittest
from types import SimpleNamespace
from unittest.mock import patch

import numpy as np
import soundfile as sf
import torch

from wav2vec_engine import MODEL_REVISION, Wav2VecPhoneticEngine


class AudioReviewEngineTests(unittest.TestCase):
    def setUp(self):
        self.engine = Wav2VecPhoneticEngine()

    def test_model_revision_is_pinned_to_a_full_commit_hash(self):
        self.assertRegex(MODEL_REVISION, r"^[a-f0-9]{40}$")
        self.assertEqual(self.engine.model_revision, MODEL_REVISION)

    def test_initialization_loads_both_components_from_the_pinned_revision(self):
        class ModelStub:
            def to(self, _device):
                return self

            def eval(self):
                return None

        with patch("wav2vec_engine.Wav2Vec2Processor.from_pretrained", return_value=object()) as processor_loader, patch("wav2vec_engine.Wav2Vec2ForCTC.from_pretrained", return_value=ModelStub()) as model_loader:
            self.engine.initialize()

        processor_loader.assert_called_once_with(self.engine.model_name, revision=MODEL_REVISION)
        model_loader.assert_called_once_with(self.engine.model_name, revision=MODEL_REVISION)
        self.assertTrue(self.engine._is_ready)

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

    def test_phonetic_inference_accepts_only_two_to_three_second_samples(self):
        def wav_bytes(duration_seconds):
            buffer = io.BytesIO()
            samples = np.zeros(int(16_000 * duration_seconds), dtype=np.float32)
            sf.write(buffer, samples, 16_000, format="WAV", subtype="PCM_16")
            return buffer.getvalue()

        self.engine.inferir_audio = lambda **_kwargs: {
            "transcripcion": "ratón",
            "duracion_segundos": 2.5,
            "motor_red_neuronal_activa": True,
        }

        with self.assertRaisesRegex(ValueError, "entre 2 y 3 segundos"):
            self.engine.inferir_fonetica(wav_bytes(1.99), "ratón", "/r/")
        with self.assertRaisesRegex(ValueError, "entre 2 y 3 segundos"):
            self.engine.inferir_fonetica(wav_bytes(3.01), "ratón", "/r/")

        result = self.engine.inferir_fonetica(wav_bytes(2.5), "ratón", "/r/")
        self.assertEqual(result["duracion_segundos"], 2.5)

    def test_empty_transcript_is_rejected_instead_of_marked_reviewable(self):
        buffer = io.BytesIO()
        samples = np.zeros(40_000, dtype=np.float32)
        sf.write(buffer, samples, 16_000, format="WAV", subtype="PCM_16")
        self.engine.inferir_audio = lambda **_kwargs: {
            "transcripcion": "  ",
            "duracion_segundos": 2.5,
            "motor_red_neuronal_activa": True,
        }

        with self.assertRaisesRegex(ValueError, "no generó una transcripción"):
            self.engine.inferir_fonetica(buffer.getvalue(), "ratón", "/r/")

    def test_inference_stays_unavailable_without_loaded_model(self):
        with self.assertRaisesRegex(RuntimeError, "no está disponible"):
            self.engine.inferir_audio(b"audio")

    def test_inference_wipes_waveform_processor_tensors_and_logits(self):
        waveform = np.ones(32_000, dtype=np.float32)

        class SyntheticProcessor:
            def __init__(self):
                self.input_values = torch.ones((1, 32_000))
                self.attention_mask = torch.ones((1, 32_000), dtype=torch.long)

            def __call__(self, *_args, **_kwargs):
                return SimpleNamespace(input_values=self.input_values, attention_mask=self.attention_mask)

            def batch_decode(self, _predicted_ids):
                return ["ratón"]

        class SyntheticModel:
            def __init__(self):
                self.logits = torch.ones((1, 2, 3))

            def __call__(self, _input_values):
                return SimpleNamespace(logits=self.logits)

        processor = SyntheticProcessor()
        model = SyntheticModel()
        self.engine.device = "cpu"
        self.engine.processor = processor
        self.engine.model = model
        self.engine._is_ready = True
        self.engine.audio_bytes_to_tensor = lambda _audio: waveform

        result = self.engine.inferir_audio(b"synthetic-audio")

        self.assertEqual(result["transcripcion"], "ratón")
        self.assertEqual(np.count_nonzero(waveform), 0)
        self.assertEqual(torch.count_nonzero(processor.input_values).item(), 0)
        self.assertEqual(torch.count_nonzero(processor.attention_mask).item(), 0)
        self.assertEqual(torch.count_nonzero(model.logits).item(), 0)

if __name__ == "__main__":
    unittest.main()
