"""
Servidor FastAPI para el microservicio de Machine Learning de AshaKids.
Puerto por defecto: 8001
"""

import os
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

import base64
from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from wav2vec_engine import engine

app = FastAPI(
    title="AshaKids Audio Review Service",
    description="Servicio experimental de reconocimiento de voz para fragmentos de audio revisados por profesionales.",
    version="1.0.0"
)

# Permitir CORS desde cualquier origen y navegador local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AudioPredictionRequest(BaseModel):
    audio_base64: str = Field(..., description="Fragmento WAV PCM de 16 kHz preparado para revisión profesional")

@app.on_event("startup")
async def startup_event():
    print("[AshaKids ML] Cargando Wav2Vec 2.0 desde la caché local del disco...")
    engine.initialize()
    print("[AshaKids ML] Servicio listo para solicitudes de audio seleccionadas por un profesional.")

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "AshaKids Phonetic Speech AI",
        "dispositivo": engine.device,
        "modelo": engine.model_name,
        "modelo_listo": engine._is_ready
    }

@app.post("/predict/phonetics")
async def predict_phonetics_json(payload: AudioPredictionRequest):
    """
    Recibe audio en base64 desde el backend de Node.js o frontend.
    """
    try:
        raw_b64 = payload.audio_base64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",", 1)[1]
        
        audio_bytes = base64.b64decode(raw_b64)
        resultado = engine.inferir_audio(audio_bytes=audio_bytes)
        return resultado
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error en inferencia fonética: {str(exc)}")

@app.post("/predict/file")
async def predict_phonetics_file(
    file: UploadFile = File(...),
):
    """
    Recibe un archivo directo de audio (multipart/form-data).
    """
    try:
        audio_bytes = await file.read()
        resultado = engine.inferir_audio(audio_bytes=audio_bytes)
        return resultado
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error procesando archivo de audio: {str(exc)}")


import io
import zipfile
import xml.etree.ElementTree as ET

def extraer_texto_de_docx_o_bytes(raw_bytes: bytes) -> str:
    if raw_bytes.startswith(b'PK\x03\x04'):
        try:
            with zipfile.ZipFile(io.BytesIO(raw_bytes)) as z:
                if 'word/document.xml' in z.namelist():
                    xml_content = z.read('word/document.xml')
                    tree = ET.fromstring(xml_content)
                    paragraphs = []
                    for p in tree.iter():
                        if p.tag.endswith('}p'):
                            p_texts = [node.text for node in p.iter() if node.tag.endswith('}t') and node.text]
                            if p_texts:
                                paragraphs.append(''.join(p_texts))
                    if paragraphs:
                        return '\n'.join(paragraphs)
        except Exception as e:
            print(f"[Docx Parser Warning]: {e}")
    try:
        return raw_bytes.decode('utf-8')
    except UnicodeDecodeError:
        return raw_bytes.decode('latin-1', errors='replace')


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

        resultado = engine.analizar_transcripcion_sesion(texto_transcripcion=texto)
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
        resultado = engine.analizar_transcripcion_sesion(texto_transcripcion=texto)
        return resultado
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error analizando el archivo de transcripción: {str(exc)}")
