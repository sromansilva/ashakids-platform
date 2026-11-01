"""Experimental speech transcription for therapist-reviewed audio fragments."""

import io
import re
import unicodedata
from typing import Any, Dict, Optional

import librosa
import numpy as np
import soundfile as sf
import torch
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor


MODEL_NAME = "jonatasgrosman/wav2vec2-large-xlsr-53-spanish"


class Wav2VecPhoneticEngine:
    def __init__(self, model_name: str = MODEL_NAME):
        self.model_name = model_name
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
            self.processor = Wav2Vec2Processor.from_pretrained(self.model_name)
            self.model = Wav2Vec2ForCTC.from_pretrained(self.model_name).to(self.device)
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
            audio_array = np.mean(audio_array, axis=1)
        if audio_array.size == 0 or not np.isfinite(audio_array).all():
            raise ValueError("El fragmento no contiene audio válido.")
        if sample_rate != 16000:
            audio_array = librosa.resample(audio_array, orig_sr=sample_rate, target_sr=16000)
        if audio_array.size == 0:
            raise ValueError("El fragmento no contiene audio válido.")
        return audio_array.astype(np.float32)

    def inferir_audio(self, audio_bytes: bytes) -> Dict[str, Any]:
        if not self._is_ready or self.processor is None or self.model is None:
            raise RuntimeError("El modelo de transcripción no está disponible.")

        waveform = self.audio_bytes_to_tensor(audio_bytes)
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

    def analizar_transcripcion_sesion(self, texto_transcripcion: str) -> Dict[str, Any]:
        """Split explicitly labelled turns without inferring a speaker's clinical role."""
        turn_pattern = re.compile(
            r"^([^:()]{1,60}?)(?:\s*\((\d{1,2}:\d{2}(?::\d{2})?)\))?:\s*(.+)$"
        )
        turnos = []
        for line in texto_transcripcion.splitlines():
            line = line.strip()
            if not line:
                continue
            match = turn_pattern.match(line)
            if not match:
                continue
            speaker = match.group(1).strip()
            normalized = unicodedata.normalize("NFD", speaker.lower())
            normalized = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
            if normalized in {"terapeuta", "profesional"}:
                role = "TERAPEUTA"
            elif normalized in {"paciente", "nino", "usuario"}:
                role = "PACIENTE"
            else:
                role = "HABLANTE"
            turnos.append({
                "hablante": role,
                "hablante_nombre": speaker,
                "timestamp": match.group(2) or "",
                "texto": match.group(3).strip(),
            })

        return {
            "estado": "PROCESADA",
            "texto_extraido": texto_transcripcion,
            "turnos_dialogo_count": len(turnos),
            "turnos_dialogo": turnos[:100],
        }


engine = Wav2VecPhoneticEngine()
