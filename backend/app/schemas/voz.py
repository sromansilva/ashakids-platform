"""Esquemas Pydantic para el servicio de reconocimiento de voz y comparación textual."""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class EstadoTranscripcion(str, Enum):
    OK = "OK"
    AUDIO_VACIO = "AUDIO_VACIO"
    AUDIO_CORTO = "AUDIO_CORTO"
    ERROR = "ERROR"


class DetallePalabra(BaseModel):
    palabra: str
    estado: str = Field(description="correcta, omitida o adicional")


class ComparacionResultado(BaseModel):
    frase_esperada: str
    frase_obtenida: str
    porcentaje_coincidencia: float = Field(ge=0.0, le=100.0)
    palabras_esperadas: List[str]
    palabras_obtenidas: List[str]
    palabras_omitidas: List[str]
    palabras_adicionales: List[str]
    es_coincidente: bool
    desglose: List[DetallePalabra]
    aviso: str = Field(
        default="Esta coincidencia textual es una herramienta lúdica y no constituye una evaluación clínica de pronunciación ni diagnóstico fonoaudiológico."
    )


class TranscripcionRespuesta(BaseModel):
    estado: EstadoTranscripcion
    transcripcion: str
    duracion_audio_segundos: Optional[float] = None
    tiempo_procesamiento_segundos: Optional[float] = None
    idioma_detectado: Optional[str] = "es"
    comparacion: Optional[ComparacionResultado] = None
    mensaje: Optional[str] = None
    guardado: Optional[bool] = False
    id_intento: Optional[int] = None
    experiencia_otorgada: Optional[int] = 0
    resumen: Optional[dict] = None
