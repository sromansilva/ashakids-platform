"""Renderiza exclusivamente los datos compartidos de un reporte autorizado."""
from html import escape
from io import BytesIO
from zoneinfo import ZoneInfo
from pathlib import Path
import reportlab

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import CondPageBreak, Paragraph, SimpleDocTemplate, Spacer
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from fastapi import HTTPException

# Fuentes redistribuidas con ReportLab: sin dependencia de fuentes del sistema.
for name, filename in (("AshaSans", "Vera.ttf"), ("AshaSans-Bold", "VeraBd.ttf")):
    pdfmetrics.registerFont(TTFont(name, str(Path(reportlab.__file__).parent / "fonts" / filename)))
pdfmetrics.registerFontFamily("AshaSans", normal="AshaSans", bold="AshaSans-Bold")

FIELDS = (
    ("Observaciones iniciales", "observaciones_iniciales"),
    ("Objetivos trabajados", "objetivos_trabajados"),
    ("Nivel de ayuda", "nivel_ayuda"),
    ("Próximos pasos", "proximos_pasos"),
)


def fecha(value):
    if value is None:
        return "No registrada"
    # PostgreSQL devuelve fechas de registro sin zona: se conservan como tales.
    if value.tzinfo is None:
        return value.strftime("%d/%m/%Y %H:%M") + " (registro sin zona)"
    return value.astimezone(ZoneInfo("America/Lima")).strftime("%d/%m/%Y %H:%M") + " (Lima)"


def text(value):
    # Paragraph admite markup: ningún campo clínico puede introducir tags o URLs.
    return escape(value if value not in {None, ""} else "No registrado").replace("\r\n", "\n").replace("\r", "\n").replace("\n", "<br/>")


def build_report_pdf(session, appointment, report):
    values = [appointment.paciente_nombre, appointment.terapeuta_nombre,
              session.estado_sesion, session.asistencia] + [getattr(report, key) for _, key in FIELDS]
    supported = pdfmetrics.getFont("AshaSans").face.charToGlyph
    if any(ord(char) not in supported for value in values if value for char in value if char not in "\n\r\t"):
        raise HTTPException(422, "El reporte contiene caracteres que la fuente PDF no admite. Puedes consultar el texto completo en la web.")
    output = BytesIO()
    navy, violet = colors.HexColor("#1C1135"), colors.HexColor("#6D28D9")
    body = ParagraphStyle("Body", fontName="AshaSans", fontSize=10.5, leading=16,
                          textColor=navy, spaceAfter=10, splitLongWords=True)
    title = ParagraphStyle("Title", parent=body, fontName="AshaSans-Bold", fontSize=21, leading=26, spaceAfter=18)
    heading = ParagraphStyle("Heading", parent=body, fontName="AshaSans-Bold", fontSize=12,
                             leading=17, spaceBefore=13, spaceAfter=5, textColor=violet)
    small = ParagraphStyle("Small", parent=body, fontSize=9, leading=13)
    doc = SimpleDocTemplate(output, pagesize=A4, leftMargin=22*mm, rightMargin=22*mm,
                            topMargin=28*mm, bottomMargin=25*mm,
                            title=f"Reporte de sesión {session.id_sesion}", author="ASHAKids")
    story = [Paragraph("Reporte de sesión", title)]
    for label, value in (
        ("Sesión", str(session.id_sesion)), ("Reporte", str(report.id_reporte_sesion)),
        ("Paciente", appointment.paciente_nombre), ("Profesional asignado", appointment.terapeuta_nombre),
        ("Cita", fecha(appointment.fecha_hora_inicio)), ("Estado", session.estado_sesion),
        ("Asistencia", session.asistencia or "Pendiente"), ("Registro del reporte", fecha(report.fecha_creacion)),
    ):
        story.append(Paragraph(f"<b>{label}:</b> {text(value)}", body))
    for label, key in FIELDS:
        # Reservar título y dos líneas sin desplazar todo un campo largo de página.
        story += [CondPageBreak(67), Paragraph(label, heading), Paragraph(text(getattr(report, key)), body)]
    story += [Spacer(1, 12), Paragraph("Copia del reporte guardado al momento de la descarga. Los cambios posteriores requieren una nueva descarga. No incluye notas privadas ni firma digital.", small)]

    def frame(canvas, document):
        canvas.saveState()
        canvas.setFillColor(violet)
        canvas.rect(0, A4[1]-4*mm, A4[0], 4*mm, fill=1, stroke=0)
        canvas.setFont("AshaSans-Bold", 10)
        canvas.setFillColor(navy)
        canvas.drawString(22*mm, A4[1]-18*mm, "ASHAKids")
        canvas.setFont("AshaSans", 8)
        canvas.drawString(22*mm, 14*mm, "Documento personal - Reporte de sesión guardado")
        canvas.drawRightString(A4[0]-22*mm, 14*mm, f"Página {document.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=frame, onLaterPages=frame)
    return output.getvalue()
