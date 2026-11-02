"""
Servidor FastAPI para el microservicio de Machine Learning de AshaKids.
Puerto por defecto: 8001
Incluye:
- Transcripción preliminar de voz (Wav2Vec 2.0); no calcula similitud acústica ni diagnostica.
- Análisis estructurado de transcripción de sesión.
- Modelo predictivo de sesiones y riesgo de deserción (Random Forest supervisado).
"""

import os
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

import base64
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from pydantic import BaseModel, Field

from transcript_service import analizar_transcripcion_sesion, extraer_texto_de_docx_o_bytes
from wav2vec_engine import engine
from audio_memory import (
    AudioBodySizeLimitMiddleware,
    AudioPayloadTooLarge,
    MAX_AUDIO_BYTES,
    clear_audio_buffer,
    decode_audio_base64,
)
from treatment_predictor import (
    treatment_predictor,
    TreatmentPredictionInput,
    TreatmentPredictionOutput,
)

app = FastAPI(
    title="AshaKids Phonetic and Predictive ML Service",
    description="Servicio clínico experimental para evaluación fonológica y pronóstico terapéutico asistido.",
    version="2.0.0"
)
app.add_middleware(AudioBodySizeLimitMiddleware)


async def _read_bounded_audio_upload(file: UploadFile) -> bytearray:
    audio_bytes = bytearray()
    while len(audio_bytes) <= MAX_AUDIO_BYTES:
        remaining_plus_one = MAX_AUDIO_BYTES + 1 - len(audio_bytes)
        chunk = await file.read(min(64 * 1024, remaining_plus_one))
        if not chunk:
            break
        audio_bytes.extend(chunk)
        chunk = b""
        if len(audio_bytes) > MAX_AUDIO_BYTES:
            clear_audio_buffer(audio_bytes)
            raise AudioPayloadTooLarge("El fragmento supera el tamaño permitido.")
    if not audio_bytes:
        raise ValueError("El fragmento de audio está vacío.")
    return audio_bytes

class AudioPredictionRequest(BaseModel):
    audio_base64: str = Field(..., description="Fragmento WAV PCM de 16 kHz preparado para revisión profesional")
    palabra_objetivo: Optional[str] = Field(None, description="Palabra o estímulo evaluado (ej. 'ratón')")
    fonema_objetivo: Optional[str] = Field(None, description="Fonema clínico en evaluación (ej. '/r/')")

@app.on_event("startup")
async def startup_event():
    print("[AshaKids ML] Cargando Wav2Vec 2.0 desde la caché local del disco...")
    engine.initialize()
    if treatment_predictor.initialize():
        print("[AshaKids ML] Artefacto predictivo validado disponible.")
    else:
        print("[AshaKids ML] Pronóstico terapéutico deshabilitado: no hay artefacto clínico aprobado.")
    print("[AshaKids ML] Servicio listo; cada capacidad informa su disponibilidad.")

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "AshaKids Phonetic Speech & Treatment AI",
        "dispositivo": engine.device,
        "modelo": engine.model_name,
        "modelo_listo": engine._is_ready,
        "predictor_listo": treatment_predictor.is_ready,
    }

@app.post("/predict/phonetics")
async def predict_phonetics(request: Request):
    """
    Recibe WAV multipart (flujo principal) o base64 JSON (compatibilidad).
    El cuerpo se limita antes del parser y la muestra se procesa en memoria.
    """
    raw_b64 = ""
    payload = None
    audio_bytes = None
    form = None
    try:
        content_type = request.headers.get("content-type", "").lower()
        if content_type.startswith("application/json"):
            try:
                payload = AudioPredictionRequest.model_validate(await request.json())
            except Exception as exc:
                raise HTTPException(status_code=422, detail="Los datos de la muestra no tienen un formato válido.") from exc
            raw_b64 = payload.audio_base64
            audio_bytes = decode_audio_base64(raw_b64)
            palabra_objetivo = payload.palabra_objetivo
            fonema_objetivo = payload.fonema_objetivo
        elif content_type.startswith("multipart/form-data"):
            form = await request.form()
            file = form.get("file") or form.get("audio")
            if not hasattr(file, "read"):
                raise HTTPException(status_code=422, detail="Adjunta una muestra WAV para analizarla.")
            if getattr(file, "content_type", "") not in {"audio/wav", "audio/x-wav", "audio/wave"}:
                raise HTTPException(status_code=415, detail="Envía una muestra WAV mono de 16 kHz.")
            palabra_objetivo = form.get("palabra_objetivo")
            fonema_objetivo = form.get("fonema_objetivo")
            if not isinstance(palabra_objetivo, str) or not palabra_objetivo.strip() or len(palabra_objetivo) > 80:
                raise HTTPException(status_code=422, detail="Indica una palabra objetivo válida.")
            audio_bytes = await _read_bounded_audio_upload(file)
        else:
            raise HTTPException(status_code=415, detail="Envía audio como WAV multipart o JSON base64.")

        resultado = engine.inferir_fonetica(
            audio_bytes=audio_bytes,
            palabra_objetivo=palabra_objetivo,
            fonema_objetivo=fonema_objetivo,
        )
        return resultado
    except AudioPayloadTooLarge as exc:
        raise HTTPException(status_code=413, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error en inferencia fonética: {str(exc)}")
    finally:
        clear_audio_buffer(audio_bytes)
        if payload is not None:
            payload.audio_base64 = ""
        if form is not None:
            for _, value in form.multi_items():
                close = getattr(value, "close", None)
                if close is not None:
                    await close()
        if hasattr(request, "_body"):
            request._body = b""
        raw_b64 = ""

@app.post("/predict/file")
async def predict_phonetics_file(
    file: UploadFile = File(...),
    palabra_objetivo: Optional[str] = Form(None),
    fonema_objetivo: Optional[str] = Form(None),
):
    """
    Recibe un archivo directo de audio (multipart/form-data).
    Procesamiento volátil en memoria RAM; no almacena audio en disco.
    """
    audio_bytes = bytearray()
    try:
        chunk = await _read_bounded_audio_upload(file)
        audio_bytes.extend(chunk)
        clear_audio_buffer(chunk)
        resultado = engine.inferir_fonetica(
            audio_bytes=audio_bytes,
            palabra_objetivo=palabra_objetivo,
            fonema_objetivo=fonema_objetivo,
        )
        return resultado
    except AudioPayloadTooLarge as exc:
        raise HTTPException(status_code=413, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error procesando archivo de audio: {str(exc)}")
    finally:
        clear_audio_buffer(audio_bytes)
        await file.close()

@app.post("/predict/treatment-plan", response_model=TreatmentPredictionOutput)
async def predict_treatment_plan(payload: TreatmentPredictionInput):
    """
    Estima el número óptimo de sesiones y riesgo de deserción mediante Random Forest.
    Asiste al especialista en la Consulta Introductoria (elimina valores fijos arbitrarios).
    """
    try:
        return treatment_predictor.predict(payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error en pronóstico de tratamiento: {str(exc)}")

@app.get("/predict/treatment-plan/catalog")
def treatment_prediction_catalog():
    try:
        return treatment_predictor.catalog()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"No se pudo cargar el catálogo clínico: {str(exc)}")

class TranscriptAnalysisRequest(BaseModel):
    texto: Optional[str] = Field(None, description="Texto de la transcripción de una sesión")
    archivo_base64: Optional[str] = Field(None, description="Contenido de archivo .docx o .txt en base64")
    nombre_archivo: Optional[str] = Field(None, description="Nombre del archivo cargado")

@app.post("/analyze/session-transcript")
async def analyze_session_transcript_json(payload: TranscriptAnalysisRequest):
    """
    Organiza el texto de una transcripción local sin inferir roles no declarados.
    """
    try:
        texto = payload.texto or ""
        if payload.archivo_base64:
            raw_b64 = payload.archivo_base64
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",", 1)[1]
            raw_bytes = base64.b64decode(raw_b64)
            texto_extraido = extraer_texto_de_docx_o_bytes(raw_bytes)
            if texto_extraido and len(texto_extraido.strip()) > 10:
                texto = texto_extraido

        resultado = analizar_transcripcion_sesion(texto_transcripcion=texto)
        resultado["texto_extraido"] = texto
        if payload.nombre_archivo:
            resultado["nombre_archivo"] = payload.nombre_archivo
        return resultado
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error analizando la transcripción: {str(exc)}")

@app.post("/analyze/session-transcript-file")
async def analyze_session_transcript_file(file: UploadFile = File(...)):
    """
    Recibe una transcripción local en .docx o .txt.
    """
    try:
        raw_bytes = await file.read()
        texto = extraer_texto_de_docx_o_bytes(raw_bytes)
        resultado = analizar_transcripcion_sesion(texto_transcripcion=texto)
        return resultado
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error analizando el archivo de transcripción: {str(exc)}")
