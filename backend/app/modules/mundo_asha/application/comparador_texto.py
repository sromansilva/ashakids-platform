"""Componente desacoplado de comparación textual para juegos de voz.

Fórmula y límites:
- La coincidencia se calcula utilizando similitud de secuencias de palabras normalizadas
  mediante SequenceMatcher (razón 2 * M / (len(T_esperada) + len(T_obtenida))), ponderando
  tanto la presencia de los términos como su orden secuencial.
- Límites: Es una métrica estrictamente sintáctica y lúdica. NO es una evaluación clínica
  de articulación, fonoaudiológica, acústica ni fonética.
"""
import difflib
import re
import unicodedata
from typing import List, Tuple
from app.modules.mundo_asha.domain.voz_schemas import ComparacionResultado, DetallePalabra


def normalizar_texto(texto: str, quitar_tildes: bool = True) -> str:
    """Normaliza texto eliminando puntuación, mayúsculas y espacios sobrantes."""
    if not texto:
        return ""
    texto = texto.strip().lower()
    if quitar_tildes:
        # NFD separa caracteres base de sus marcas diacríticas
        texto = "".join(
            c for c in unicodedata.normalize("NFD", texto)
            if unicodedata.category(c) != "Mn"
        )
    # Conservar solo caracteres alfanuméricos y espacios
    texto = re.sub(r"[^\w\s]", " ", texto)
    # Compactar espacios múltiples
    texto = re.sub(r"\s+", " ", texto).strip()
    return texto


def tokenizar(texto: str) -> List[str]:
    """Tokeniza el texto normalizado en una lista de palabras."""
    normalizado = normalizar_texto(texto)
    return normalizado.split() if normalizado else []


def comparar_frases(frase_esperada: str, frase_obtenida: str, umbral_coincidencia: float = 70.0) -> ComparacionResultado:
    """Compara la frase esperada con la obtenida y genera un reporte estructurado."""
    palabras_esp = tokenizar(frase_esperada)
    palabras_obt = tokenizar(frase_obtenida)

    if not palabras_esp and not palabras_obt:
        return ComparacionResultado(
            frase_esperada=frase_esperada,
            frase_obtenida=frase_obtenida,
            porcentaje_coincidencia=100.0,
            palabras_esperadas=[],
            palabras_obtenidas=[],
            palabras_omitidas=[],
            palabras_adicionales=[],
            es_coincidente=True,
            desglose=[],
        )

    if not palabras_esp or not palabras_obt:
        desglose = [DetallePalabra(palabra=w, estado="omitida") for w in palabras_esp]
        return ComparacionResultado(
            frase_esperada=frase_esperada,
            frase_obtenida=frase_obtenida,
            porcentaje_coincidencia=0.0,
            palabras_esperadas=palabras_esp,
            palabras_obtenidas=palabras_obt,
            palabras_omitidas=list(palabras_esp),
            palabras_adicionales=list(palabras_obt),
            es_coincidente=False,
            desglose=desglose,
        )

    matcher = difflib.SequenceMatcher(None, palabras_esp, palabras_obt)
    ratio = matcher.ratio()
    porcentaje = round(ratio * 100.0, 1)

    palabras_omitidas: List[str] = []
    palabras_adicionales: List[str] = []
    desglose: List[DetallePalabra] = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            for w in palabras_esp[i1:i2]:
                desglose.append(DetallePalabra(palabra=w, estado="correcta"))
        elif tag == "delete":
            for w in palabras_esp[i1:i2]:
                palabras_omitidas.append(w)
                desglose.append(DetallePalabra(palabra=w, estado="omitida"))
        elif tag == "insert":
            for w in palabras_obt[j1:j2]:
                palabras_adicionales.append(w)
        elif tag == "replace":
            for w in palabras_esp[i1:i2]:
                palabras_omitidas.append(w)
                desglose.append(DetallePalabra(palabra=w, estado="omitida"))
            for w in palabras_obt[j1:j2]:
                palabras_adicionales.append(w)

    es_coincidente = porcentaje >= umbral_coincidencia

    return ComparacionResultado(
        frase_esperada=frase_esperada,
        frase_obtenida=frase_obtenida,
        porcentaje_coincidencia=porcentaje,
        palabras_esperadas=palabras_esp,
        palabras_obtenidas=palabras_obt,
        palabras_omitidas=palabras_omitidas,
        palabras_adicionales=palabras_adicionales,
        es_coincidente=es_coincidente,
        desglose=desglose,
    )
