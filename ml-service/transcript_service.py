"""Application services for locally supplied session transcripts."""

import io
import re
import unicodedata
import zipfile
import xml.etree.ElementTree as ET


def extraer_texto_de_docx_o_bytes(raw_bytes: bytes) -> str:
    """Extract plain text from a DOCX package or decode a text upload."""
    if raw_bytes.startswith(b"PK\x03\x04"):
        try:
            with zipfile.ZipFile(io.BytesIO(raw_bytes)) as archive:
                if "word/document.xml" in archive.namelist():
                    document = ET.fromstring(archive.read("word/document.xml"))
                    paragraphs = []
                    for paragraph in document.iter():
                        if paragraph.tag.endswith("}p"):
                            text = "".join(
                                node.text
                                for node in paragraph.iter()
                                if node.tag.endswith("}t") and node.text
                            )
                            if text:
                                paragraphs.append(text)
                    if paragraphs:
                        return "\n".join(paragraphs)
        except (ET.ParseError, OSError, zipfile.BadZipFile) as error:
            print(f"[Transcript Parser Warning]: {error}")

    try:
        return raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return raw_bytes.decode("latin-1", errors="replace")


def analizar_transcripcion_sesion(texto_transcripcion: str) -> dict[str, object]:
    """Split explicitly labelled turns without inferring a speaker's role."""
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
        normalized = "".join(
            char for char in normalized if unicodedata.category(char) != "Mn"
        )
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
