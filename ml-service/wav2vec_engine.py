"""Experimental speech transcription for therapist-reviewed audio fragments."""

import io
from typing import Any, Dict, Optional

import librosa
import numpy as np
import soundfile as sf
import torch
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor


MODEL_NAME = "jonatasgrosman/wav2vec2-large-xlsr-53-spanish"
MODEL_REVISION = "96d7e9b4e4a78af515a3c6d3cee7c0826045d276"
MIN_PHONETIC_SAMPLE_SECONDS = 2.0
MAX_PHONETIC_SAMPLE_SECONDS = 3.0


class Wav2VecPhoneticEngine:
    def __init__(self, model_name: str = MODEL_NAME, model_revision: str = MODEL_REVISION):
        self.model_name = model_name
        self.model_revision = model_revision
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.processor: Optional[Wav2Vec2Processor] = None
        self.model: Optional[Wav2Vec2ForCTC] = None
        self._is_ready = False
        self._is_loading = False

    def initialize(self):
        if self._is_ready or self._is_loading:
            return
        self._is_loading = True
        try:
            self.processor = Wav2Vec2Processor.from_pretrained(self.model_name, revision=self.model_revision)
            self.model = Wav2Vec2ForCTC.from_pretrained(self.model_name, revision=self.model_revision).to(self.device)
            self.model.eval()
            self._is_ready = True
        except Exception as error:
            # Keep the service unavailable for inference instead of fabricating a transcript.
            print(f"[ML-Engine] No se pudo cargar el modelo de transcripción: {error}")
        finally:
            self._is_loading = False

    @staticmethod
    def audio_bytes_to_tensor(audio_bytes: bytes) -> np.ndarray:
        if not audio_bytes:
            raise ValueError("El fragmento de audio está vacío.")
        buffer = io.BytesIO(audio_bytes)
        audio_array = None
        try:
            try:
                audio_array, sample_rate = sf.read(buffer, dtype="float32")
            except Exception:
                buffer.seek(0)
                try:
                    audio_array, sample_rate = librosa.load(buffer, sr=16000, mono=True)
                except Exception as error:
                    raise ValueError("No se pudo decodificar el fragmento de audio.") from error
                sample_rate = 16000
            if audio_array.ndim > 1:
                mono_audio = np.mean(audio_array, axis=1)
                audio_array.fill(0)
                audio_array = mono_audio
            if audio_array.size == 0 or not np.isfinite(audio_array).all():
                raise ValueError("El fragmento no contiene audio válido.")
            if sample_rate != 16000:
                resampled_audio = librosa.resample(audio_array, orig_sr=sample_rate, target_sr=16000)
                audio_array.fill(0)
                audio_array = resampled_audio
            if audio_array.size == 0:
                raise ValueError("El fragmento no contiene audio válido.")
            return audio_array.astype(np.float32)
        finally:
            if audio_array is not None:
                audio_array.fill(0)
            backing = None
            try:
                backing = buffer.getbuffer()
                backing[:] = b"\x00" * len(backing)
            except (BufferError, ValueError):
                pass
            finally:
                if backing is not None:
                    backing.release()
            buffer.close()

    def inferir_audio(self, audio_bytes: bytes) -> Dict[str, Any]:
        if not self._is_ready or self.processor is None or self.model is None:
            raise RuntimeError("El modelo de transcripción no está disponible.")

        waveform = self.audio_bytes_to_tensor(audio_bytes)
        inputs = None
        input_values = None
        logits = None
        predicted_ids = None
        try:
            inputs = self.processor(waveform, sampling_rate=16000, return_tensors="pt", padding=True)
            input_values = inputs.input_values.to(self.device)
            with torch.no_grad():
                logits = self.model(input_values).logits
            predicted_ids = torch.argmax(logits, dim=-1)
            raw_transcript = self.processor.batch_decode(predicted_ids)[0]
            transcript = " ".join(raw_transcript.strip().split())
            return {
                "transcripcion": transcript,
                "duracion_segundos": round(len(waveform) / 16000, 2),
                "motor_red_neuronal_activa": True,
            }
        finally:
            waveform.fill(0)
            if inputs is not None:
                for tensor_name in ("input_values", "attention_mask"):
                    tensor = getattr(inputs, tensor_name, None)
                    if tensor is not None:
                        tensor.zero_()
            if input_values is not None:
                input_values.zero_()
            if logits is not None:
                logits.zero_()
            if predicted_ids is not None:
                predicted_ids.zero_()

    def inferir_fonetica(
        self,
        audio_bytes: bytes,
        palabra_objetivo: Optional[str] = None,
        fonema_objetivo: Optional[str] = None,
    ) -> Dict[str, Any]:
        if not audio_bytes:
            raise ValueError("El fragmento de audio está vacío.")
        try:
            audio_info = sf.info(io.BytesIO(audio_bytes))
        except Exception as error:
            raise ValueError("No se pudo decodificar el fragmento de audio.") from error
        duration_seconds = audio_info.duration
        if not MIN_PHONETIC_SAMPLE_SECONDS <= duration_seconds <= MAX_PHONETIC_SAMPLE_SECONDS:
            raise ValueError("La muestra fonológica debe durar entre 2 y 3 segundos.")

        resultado_base = self.inferir_audio(audio_bytes=audio_bytes)
        transcript = resultado_base["transcripcion"].strip()
        if not transcript:
            raise ValueError("El modelo no generó una transcripción que el terapeuta pueda revisar.")
        return {
            "transcripcion": transcript,
            "duracion_segundos": resultado_base["duracion_segundos"],
            "palabra_objetivo": palabra_objetivo,
            "fonema_objetivo": fonema_objetivo,
            "motor_red_neuronal_activa": resultado_base["motor_red_neuronal_activa"],
            "estado_revision": "PENDIENTE_REVISION_TERAPEUTA",
            "aviso_clinico": "Transcripción automática preliminar. No mide articulación ni establece diagnóstico; el terapeuta debe revisarla.",
        }

engine = Wav2VecPhoneticEngine()
