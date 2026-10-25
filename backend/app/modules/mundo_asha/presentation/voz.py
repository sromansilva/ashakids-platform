from uuid import UUID
from typing import Optional
from fastapi import APIRouter, File, Form, UploadFile
from app.shared.presentation.contracts import DB, Identity
from app.modules.mundo_asha.domain.juegos_schemas import IntentoCrear
from app.modules.mundo_asha.domain.voz_schemas import EstadoTranscripcion, TranscripcionRespuesta
from app.modules.mundo_asha.application import juegos
from app.modules.mundo_asha.infrastructure import reconocimiento_voz
from app.modules.mundo_asha.application.juegos_catalogo import MUNDOS

router = APIRouter(prefix="/educacion/voz", tags=["Educación - Reconocimiento de Voz"])


@router.post(
    "/transcribir",
    response_model=TranscripcionRespuesta,
    summary="Transcribe audio de actividades de habla en español y calcula similitud textual",
    description="Recibe un archivo de audio (WebM/Opus, WAV u OGG), lo transcribe con Whisper, compara con la frase esperada y opcionalmente persiste el intento."
)
async def transcribir_voz(
    identity: Identity,
    db: DB,
    audio: UploadFile = File(..., description="Archivo de audio grabado por el usuario"),
    frase_esperada: Optional[str] = Form(None, description="Frase objetivo para comparar la transcripción"),
    id_paciente: Optional[int] = Form(None, description="ID del paciente para persistencia en RESULTADOS_NIVEL"),
    nivel: Optional[int] = Form(None, description="Número de nivel en VOZ (1 a 5)"),
    clave_intento: Optional[UUID] = Form(None, description="Clave única UUID para idempotencia"),
    duracion_segundos: Optional[int] = Form(None, description="Duración de la actividad en segundos"),
    ayudas_usadas: Optional[int] = Form(0, description="Pistas utilizadas durante el intento"),
) -> TranscripcionRespuesta:
    # Si se especifica el nivel de VOZ, la frase esperada se deriva directamente del catálogo del servidor
    if nivel is not None and 1 <= nivel <= len(MUNDOS["VOZ"]["levels"]):
        level_item = MUNDOS["VOZ"]["levels"][nivel - 1]
        frase_esperada = level_item["answer"][0] if isinstance(level_item["answer"], list) else level_item["answer"]

    audio_bytes = await audio.read()
    resultado = await reconocimiento_voz.procesar_audio(
        audio_bytes=audio_bytes,
        nombre_archivo=audio.filename,
        frase_esperada=frase_esperada,
    )

    # Si se solicitaron datos de persistencia y el audio tiene contenido reconocible
    if (
        resultado.estado == EstadoTranscripcion.OK
        and id_paciente is not None
        and nivel is not None
        and clave_intento is not None
    ):
        intento_data = IntentoCrear(
            clave_intento=clave_intento,
            version="basica-1",
            nivel=nivel,
            respuestas=[resultado.transcripcion] if resultado.transcripcion else [""],
            duracion_segundos=duracion_segundos or max(1, int(resultado.duracion_audio_segundos or 5)),
            ayudas_usadas=ayudas_usadas or 0,
        )
        reg = await juegos.registrar(db, identity, id_paciente, "VOZ", intento_data)
        resultado.guardado = True
        resultado.id_intento = reg.get("id_intento")
        resultado.experiencia_otorgada = reg.get("experiencia_otorgada", 0)
        resultado.resumen = reg.get("resumen")

    return resultado
