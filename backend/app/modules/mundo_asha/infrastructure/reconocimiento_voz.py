"""Servicio de reconocimiento de voz con faster-whisper.

Carga y reutilización del modelo durante la vida del servicio FastAPI,
ejecución no bloqueante en thread pool, validación de formato/tamaño/duración
y eliminación estricta de cualquier recurso temporal.
"""
import asyncio
import io
import os
import tempfile
import time
from typing import Optional, Tuple
from fastapi import HTTPException
from app.core.config import settings
from app.modules.mundo_asha.domain.voz_schemas import EstadoTranscripcion, TranscripcionRespuesta
from app.modules.mundo_asha.application.comparador_texto import comparar_frases

# Firmas de bytes mágicos para formatos de audio permitidos
MAGIC_SIGNATURES = {
    "audio/wav": lambda data: data[:4] == b"RIFF" and data[8:12] == b"WAVE",
    "audio/ogg": lambda data: data.startswith(b"OggS"),
    "audio/webm": lambda data: data.startswith(b"\x1a\x45\xdf\xa3") and (b"webm" in data[:4096] or b"matroska" in data[:4096]),
    "audio/mpeg": lambda data: data.startswith(b"ID3") or (len(data) >= 2 and data[0] == 255 and data[1] & 224 == 224),
}

_model_instance = None
_model_lock = asyncio.Lock()


def _cargar_modelo_sync():
    """Carga síncrona del modelo Whisper."""
    from faster_whisper import WhisperModel
    return WhisperModel(
        model_size_or_path=settings.WHISPER_MODEL_SIZE,
        device=settings.WHISPER_DEVICE,
        compute_type=settings.WHISPER_COMPUTE_TYPE,
    )


async def obtener_modelo():
    """Retorna la instancia global del modelo Whisper con inicialización única protegida por lock."""
    global _model_instance
    if _model_instance is not None:
        return _model_instance

    async with _model_lock:
        if _model_instance is None:
            # Ejecutar carga en thread pool para no bloquear el loop
            _model_instance = await asyncio.to_thread(_cargar_modelo_sync)
        return _model_instance


def validar_audio_bytes(data: bytes, filename: Optional[str] = None) -> Tuple[str, str]:
    """Valida tamaño, no vacío y formato mediante magic bytes.
    
    Retorna (formato_detectado, extension_sugerida).
    """
    if not data or len(data) < 128:
        raise HTTPException(status_code=400, detail="El audio está vacío o es demasiado corto.")

    if len(data) > settings.WHISPER_AUDIO_MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"El audio supera el tamaño máximo permitido de {settings.WHISPER_AUDIO_MAX_BYTES // (1024 * 1024)} MB."
        )

    # Identificar formato por magic bytes
    formato_detectado = None
    ext = ".webm"
    if MAGIC_SIGNATURES["audio/wav"](data):
        formato_detectado = "audio/wav"
        ext = ".wav"
    elif MAGIC_SIGNATURES["audio/webm"](data):
        formato_detectado = "audio/webm"
        ext = ".webm"
    elif MAGIC_SIGNATURES["audio/ogg"](data):
        formato_detectado = "audio/ogg"
        ext = ".ogg"
    elif MAGIC_SIGNATURES["audio/mpeg"](data):
        formato_detectado = "audio/mpeg"
        ext = ".mp3"

    # Si no detectó por magic bytes estricto pero el contenedor es WebM/EBML genérico
    if not formato_detectado and data.startswith(b"\x1a\x45\xdf\xa3"):
        formato_detectado = "audio/webm"
        ext = ".webm"

    if not formato_detectado:
        raise HTTPException(
            status_code=415,
            detail="Formato de audio no compatible. Se admite WebM (Opus), WAV u OGG."
        )

    return formato_detectado, ext


def _transcribir_sync(model, audio_bytes: bytes, extension: str) -> Tuple[str, float, float]:
    """Ejecuta la transcripción síncrona en un hilo separado con limpieza de temporales."""
    temp_path = None
    try:
        # Escribir a un archivo temporal cerrado para permitir que PyAV/FFmpeg lo decodifique
        with tempfile.NamedTemporaryFile(suffix=extension, delete=False) as tf:
            tf.write(audio_bytes)
            temp_path = tf.name

        t0 = time.time()
        # transcribe con language="es", beam_size=1 para velocidad en CPU
        segments, info = model.transcribe(
            temp_path,
            language="es",
            beam_size=1,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500),
        )
        texto = " ".join(seg.text for seg in segments).strip()
        duracion = float(info.duration) if hasattr(info, "duration") and info.duration else 0.0
        tiempo_proc = time.time() - t0
        return texto, duracion, tiempo_proc
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


async def procesar_audio(
    audio_bytes: bytes,
    nombre_archivo: Optional[str] = None,
    frase_esperada: Optional[str] = None
) -> TranscripcionRespuesta:
    """Procesa el archivo de audio recibido, ejecuta Whisper y compara con la frase objetivo si se proporciona."""
    _, ext = validar_audio_bytes(audio_bytes, nombre_archivo)
    model = await obtener_modelo()

    try:
        texto, duracion, tiempo_proc = await asyncio.to_thread(_transcribir_sync, model, audio_bytes, ext)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Error al procesar el reconocimiento de audio. Intenta grabar de nuevo."
        )

    if duracion > settings.WHISPER_AUDIO_MAX_SECONDS:
        raise HTTPException(
            status_code=400,
            detail=f"La duración del audio ({duracion:.1f}s) excede el máximo permitido de {settings.WHISPER_AUDIO_MAX_SECONDS}s."
        )

    if not texto:
        return TranscripcionRespuesta(
            estado=EstadoTranscripcion.AUDIO_VACIO,
            transcripcion="",
            duracion_audio_segundos=round(duracion, 2),
            tiempo_procesamiento_segundos=round(tiempo_proc, 2),
            mensaje="No se detectaron palabras en la grabación. Asegúrate de hablar claro y cerca del micrófono.",
            comparacion=comparar_frases(frase_esperada, "") if frase_esperada else None,
        )

    comparacion = comparar_frases(frase_esperada, texto) if frase_esperada else None

    return TranscripcionRespuesta(
        estado=EstadoTranscripcion.OK,
        transcripcion=texto,
        duracion_audio_segundos=round(duracion, 2),
        tiempo_procesamiento_segundos=round(tiempo_proc, 2),
        idioma_detectado="es",
        comparacion=comparacion,
        mensaje="Audio transcrito correctamente.",
    )
