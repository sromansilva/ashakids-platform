"""Pruebas unitarias y de integración para reconocimiento de voz y comparación textual."""
import io
import wave
import numpy as np
import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import HTTPException
from app.main import app
from app.api.deps import get_current_user
from app.models.auth import Usuario
from app.schemas.voz import EstadoTranscripcion
from app.services.comparador_texto import comparar_frases, normalizar_texto, tokenizar
from app.services.reconocimiento_voz import validar_audio_bytes, procesar_audio


def generar_audio_wav_sintetico(duracion: float = 1.0, frecuencia: float = 440.0) -> bytes:
    """Genera en memoria un archivo WAV PCM válido de 16 kHz."""
    sample_rate = 16000
    num_samples = int(sample_rate * duracion)
    t = np.linspace(0, duracion, num_samples, endpoint=False)
    samples = (np.sin(2 * np.pi * frecuencia * t) * 0.1 * 32767).astype(np.int16)

    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(samples.tobytes())
    return buf.getvalue()


# ============================================================================
# 1. PRUEBAS DEL COMPARADOR TEXTUAL
# ============================================================================

def test_normalizar_texto():
    assert normalizar_texto("¡Hola, Mundo!") == "hola mundo"
    assert normalizar_texto("El GATO duerme...") == "el gato duerme"
    assert normalizar_texto("  Canción  con   tildes  ") == "cancion con tildes"
    assert normalizar_texto("") == ""


def test_tokenizar():
    assert tokenizar("El gato duerme") == ["el", "gato", "duerme"]
    assert tokenizar("¡Hola! ¿Cómo estás?") == ["hola", "como", "estas"]
    assert tokenizar("") == []


def test_comparar_frase_exacta():
    res = comparar_frases("El gato duerme", "El gato duerme")
    assert res.es_coincidente is True
    assert res.porcentaje_coincidencia == 100.0
    assert res.palabras_omitidas == []
    assert res.palabras_adicionales == []
    assert len(res.desglose) == 3
    assert all(d.estado == "correcta" for d in res.desglose)


def test_comparar_frase_con_palabra_omitida():
    res = comparar_frases("El gato duerme", "El gato")
    assert "duerme" in res.palabras_omitidas
    assert res.porcentaje_coincidencia < 100.0
    assert any(d.palabra == "duerme" and d.estado == "omitida" for d in res.desglose)


def test_comparar_frase_con_palabra_adicional():
    res = comparar_frases("El gato duerme", "El gato negro duerme")
    assert "negro" in res.palabras_adicionales


def test_comparar_frase_vacia():
    res = comparar_frases("El gato duerme", "")
    assert res.es_coincidente is False
    assert res.porcentaje_coincidencia == 0.0
    assert len(res.palabras_omitidas) == 3


def test_comparar_frases_tolerante_a_mayusculas_y_puntuacion():
    res = comparar_frases("«El gato duerme.»", "el gato duerme")
    assert res.es_coincidente is True
    assert res.porcentaje_coincidencia == 100.0


# ============================================================================
# 2. PRUEBAS DE VALIDACIÓN DE AUDIO
# ============================================================================

def test_validar_audio_bytes_wav_valido():
    wav_bytes = generar_audio_wav_sintetico(duracion=0.5)
    fmt, ext = validar_audio_bytes(wav_bytes, "test.wav")
    assert fmt == "audio/wav"
    assert ext == ".wav"


def test_validar_audio_bytes_webm_valido():
    # Encabezado EBML de WebM
    webm_fake = b"\x1a\x45\xdf\xa3" + b"\x00" * 200 + b"webm" + b"\x00" * 100
    fmt, ext = validar_audio_bytes(webm_fake, "test.webm")
    assert fmt == "audio/webm"
    assert ext == ".webm"


def test_validar_audio_bytes_vacio_o_pequeno():
    with pytest.raises(HTTPException) as exc:
        validar_audio_bytes(b"corto", "test.wav")
    assert exc.value.status_code == 400


def test_validar_audio_bytes_formato_no_admitido():
    with pytest.raises(HTTPException) as exc:
        validar_audio_bytes(b"A" * 500, "test.txt")
    assert exc.value.status_code == 415


# ============================================================================
# 3. PRUEBAS DE PROCESAMIENTO CON MOCK DEL MODELO
# ============================================================================

@pytest.mark.asyncio
async def test_procesar_audio_con_mock(monkeypatch):
    class FakeSegment:
        text = "el gato duerme"

    class FakeInfo:
        duration = 2.5
        language = "es"

    class FakeModel:
        def transcribe(self, *args, **kwargs):
            return [FakeSegment()], FakeInfo()

    async def fake_obtener_modelo():
        return FakeModel()

    monkeypatch.setattr("app.services.reconocimiento_voz.obtener_modelo", fake_obtener_modelo)

    wav_bytes = generar_audio_wav_sintetico(duracion=1.0)
    respuesta = await procesar_audio(
        audio_bytes=wav_bytes,
        nombre_archivo="prueba.wav",
        frase_esperada="El gato duerme"
    )

    assert respuesta.estado == EstadoTranscripcion.OK
    assert respuesta.transcripcion == "el gato duerme"
    assert respuesta.duracion_audio_segundos == 2.5
    assert respuesta.comparacion is not None
    assert respuesta.comparacion.es_coincidente is True
    assert respuesta.comparacion.porcentaje_coincidencia == 100.0


@pytest.mark.asyncio
async def test_procesar_audio_silencio_retorna_vacio(monkeypatch):
    class FakeInfo:
        duration = 1.0
        language = "es"

    class FakeModel:
        def transcribe(self, *args, **kwargs):
            return [], FakeInfo()

    async def fake_obtener_modelo():
        return FakeModel()

    monkeypatch.setattr("app.services.reconocimiento_voz.obtener_modelo", fake_obtener_modelo)

    wav_bytes = generar_audio_wav_sintetico(duracion=1.0)
    respuesta = await procesar_audio(
        audio_bytes=wav_bytes,
        nombre_archivo="silencio.wav",
        frase_esperada="El gato duerme"
    )

    assert respuesta.estado == EstadoTranscripcion.AUDIO_VACIO
    assert respuesta.transcripcion == ""
    assert "No se detectaron palabras" in respuesta.mensaje


# ============================================================================
# 4. PRUEBAS HTTP DEL ENDPOINT DE LA API
# ============================================================================

@pytest.mark.asyncio
async def test_endpoint_transcribir_requiere_autenticacion():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        wav_bytes = generar_audio_wav_sintetico(duracion=0.5)
        response = await client.post(
            "/api/v1/educacion/voz/transcribir",
            files={"audio": ("test.wav", wav_bytes, "audio/wav")},
            data={"frase_esperada": "El gato duerme"},
        )
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_endpoint_transcribir_autenticado(monkeypatch):
    # Mock de usuario autenticado
    fake_user = Usuario(
        id_usuario=999,
        nombres="Padre",
        apellidos="Prueba",
        codigo_usuario="p00003",
        email="p00003@ashakids.test",
        activo=True,
    )
    async def mock_get_current_user():
        return fake_user, ["PADRE"]

    app.dependency_overrides[get_current_user] = mock_get_current_user

    class FakeSegment:
        text = "el gato duerme"

    class FakeInfo:
        duration = 1.8
        language = "es"

    class FakeModel:
        def transcribe(self, *args, **kwargs):
            return [FakeSegment()], FakeInfo()

    async def fake_obtener_modelo():
        return FakeModel()

    monkeypatch.setattr("app.services.reconocimiento_voz.obtener_modelo", fake_obtener_modelo)

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            wav_bytes = generar_audio_wav_sintetico(duracion=0.5)
            response = await client.post(
                "/api/v1/educacion/voz/transcribir",
                files={"audio": ("grabacion.wav", wav_bytes, "audio/wav")},
                data={"frase_esperada": "El gato duerme"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["estado"] == "OK"
            assert data["transcripcion"] == "el gato duerme"
            assert data["comparacion"]["es_coincidente"] is True
            assert data["comparacion"]["porcentaje_coincidencia"] == 100.0
            assert "aviso" in data["comparacion"]
    finally:
        app.dependency_overrides.pop(get_current_user, None)


# ============================================================================
# 5. PRUEBA DE INTEGRACIÓN CON MODELO WHISPER REAL
# ============================================================================

@pytest.mark.asyncio
async def test_integracion_whisper_real_con_audio_sintetico():
    """Ejecuta el modelo Whisper real local para comprobar que la inferencia no falla."""
    wav_bytes = generar_audio_wav_sintetico(duracion=1.0)
    respuesta = await procesar_audio(
        audio_bytes=wav_bytes,
        nombre_archivo="tono.wav",
        frase_esperada="El gato duerme"
    )
    # Al ser un tono sinusoidal sin voz, debe procesar correctamente y reportar vacío o texto
    assert respuesta.estado in (EstadoTranscripcion.AUDIO_VACIO, EstadoTranscripcion.OK)
    assert respuesta.duracion_audio_segundos > 0
    assert respuesta.tiempo_procesamiento_segundos > 0


# ============================================================================
# 6. PRUEBAS DE LOS CINCO NIVELES DE VOZ
# ============================================================================

def test_catalogo_voz_cinco_niveles():
    from app.services.juegos_catalogo import MUNDOS, catalogo_publico, catalogo
    voz = MUNDOS["VOZ"]
    assert len(voz["levels"]) == 5

    # Nivel 1: Frases breves (3-5 palabras)
    n1 = voz["levels"][0]
    assert n1["title"] == "Frases breves"
    assert len(n1["answer"][0].split()) >= 3 and len(n1["answer"][0].split()) <= 5

    # Nivel 2: Frases descriptivas (5-7 palabras)
    n2 = voz["levels"][1]
    assert n2["title"] == "Frases descriptivas"
    assert len(n2["answer"][0].split()) >= 5 and len(n2["answer"][0].split()) <= 7

    # Nivel 3: Oraciones de longitud media (7-10 palabras)
    n3 = voz["levels"][2]
    assert n3["title"] == "Oraciones de longitud media"
    assert len(n3["answer"][0].split()) >= 7 and len(n3["answer"][0].split()) <= 10

    # Nivel 4: Oraciones más elaboradas (10-14 palabras)
    n4 = voz["levels"][3]
    assert n4["title"] == "Oraciones más elaboradas"
    assert len(n4["answer"][0].split()) >= 10 and len(n4["answer"][0].split()) <= 14

    # Nivel 5: Oraciones extensas (14-20 palabras)
    n5 = voz["levels"][4]
    assert n5["title"] == "Oraciones extensas"
    assert len(n5["answer"][0].split()) >= 14 and len(n5["answer"][0].split()) <= 20

    # Catálogo público debe reportar 5 niveles
    pub = next(w for w in catalogo_publico() if w["id"] == "VOZ")
    assert len(pub["levels"]) == 5

    # Catálogo completo debe tener los 5 niveles
    cat = next(w for w in catalogo() if w["id"] == "VOZ")
    assert len(cat["levels"]) == 5


def test_comparacion_progresiva_cinco_niveles():
    from app.services.juegos_catalogo import MUNDOS
    from app.services.comparador_texto import comparar_frases
    for i, lvl in enumerate(MUNDOS["VOZ"]["levels"], 1):
        frase = lvl["answer"][0]
        # Frase exacta
        res_exacto = comparar_frases(frase, frase)
        assert res_exacto.es_coincidente is True
        assert res_exacto.porcentaje_coincidencia == 100.0

        # Frase con primera palabra omitida
        palabras = frase.split()
        if len(palabras) > 1:
            incompleta = " ".join(palabras[1:])
            res_parcial = comparar_frases(frase, incompleta)
            assert palabras[0].lower() in [p.lower() for p in res_parcial.palabras_omitidas]
