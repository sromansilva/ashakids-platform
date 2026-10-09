"""Renderiza el informe Markdown de auditoría; no consulta DB ni contiene secretos."""
from pathlib import Path
import argparse
import re
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image,
)

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs" / "auditoria-backend-2026-10-08.md"
OUTPUT = ROOT / "output" / "pdf" / "Auditoria_Backend_AshaKids_2026-10-08.pdf"
FONT_DIR = Path("C:/Windows/Fonts")
REPORT_DATE = '08 OCT 2026'
pdfmetrics.registerFont(TTFont("Audit", str(FONT_DIR / "arial.ttf")))
pdfmetrics.registerFont(TTFont("AuditBold", str(FONT_DIR / "arialbd.ttf")))
pdfmetrics.registerFontFamily("Audit", normal="Audit", bold="AuditBold", italic="Audit", boldItalic="AuditBold")
NAVY = colors.HexColor("#193349")
TEAL = colors.HexColor("#087F83")
GRAY = colors.HexColor("#4E6070")
STYLES = {
    "title": ParagraphStyle("title", fontName="AuditBold", fontSize=23, leading=28, textColor=NAVY, spaceAfter=15),
    "h2": ParagraphStyle("h2", fontName="AuditBold", fontSize=17, leading=22, textColor=TEAL, spaceAfter=13),
    "body": ParagraphStyle("body", fontName="Audit", fontSize=9.5, leading=14, textColor=NAVY, spaceAfter=10),
    "cell": ParagraphStyle("cell", fontName="Audit", fontSize=8.3, leading=11.4, textColor=NAVY),
    "th": ParagraphStyle("th", fontName="AuditBold", fontSize=8.4, leading=11.4, textColor=colors.white),
}


def inline(text):
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'\1 (\2)', text)
    text = escape(text)
    text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", text)
    return text.replace("`", "")


def table(lines):
    rows = [[part.strip() for part in line.strip().strip("|").split("|")] for line in lines]
    rows = [row for row in rows if not all(re.fullmatch(r"[-: ]+", cell) for cell in row)]
    count = len(rows[0])
    width = A4[0] - 88
    if count == 2:
        widths = [width * .32, width * .68]
    elif rows[0][0] == "Método y ruta":
        widths = [width * .46, width * .09, width * .45]
    elif rows[0][0] == "Prioridad":
        widths = [width * .13, width * .37, width * .50]
    elif count == 3:
        widths = [width * .27, width * .29, width * .44]
    else:
        widths = [width / count] * count
    data = [[Paragraph(inline(cell), STYLES["th" if i == 0 else "cell"]) for cell in row] for i, row in enumerate(rows)]
    block = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    block.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#F0F6F7"), colors.white]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, 0), 1.2, TEAL),
    ]))
    return block


def page(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(TEAL)
    canvas.rect(0, height-12, width, 12, fill=True, stroke=False)
    canvas.setFont("AuditBold", 8)
    canvas.setFillColor(GRAY)
    canvas.drawString(44, height-37, "ASHAKids  /  INGENIERÍA Y CALIDAD")
    canvas.setFont("Audit", 8)
    canvas.drawRightString(width-44, height-37, REPORT_DATE)
    canvas.setStrokeColor(colors.HexColor("#C9DADD"))
    canvas.line(44, 38, width-44, 38)
    canvas.drawString(44, 24, "Auditoría técnica | Datos sintéticos en pruebas | Sin secretos")
    canvas.drawRightString(width-44, 24, f"{doc.page}")
    canvas.restoreState()


def build():
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    story = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        i += 1
        if not line:
            continue
        if line == "<!-- pagebreak -->":
            story.append(PageBreak())
        elif line.startswith('!['):
            match = re.fullmatch(r'!\[([^\]]*)\]\(([^)]+)\)', line)
            if not match:
                raise ValueError(f'Invalid evidence image: {line}')
            picture = Image(str((SOURCE.parent / match.group(2)).resolve()))
            scale = min((A4[0] - 88) / picture.imageWidth, 550 / picture.imageHeight)
            picture.drawWidth = picture.imageWidth * scale
            picture.drawHeight = picture.imageHeight * scale
            story.extend([picture, Spacer(1, 6), Paragraph(inline(match.group(1)), STYLES['body'])])
        elif line.startswith("# "):
            story.append(Paragraph(inline(line[2:]), STYLES["title"]))
        elif line.startswith("## "):
            story.append(Paragraph(inline(line[3:]), STYLES["h2"]))
        elif line.startswith("|"):
            group = [line]
            while i < len(lines) and lines[i].startswith("|"):
                group.append(lines[i])
                i += 1
            story.extend([table(group), Spacer(1, 12)])
        else:
            story.append(Paragraph(inline(line), STYLES["body"]))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=44, leftMargin=44,
        topMargin=60, bottomMargin=52, title="ASHAKids - Auditoría del backend",
        author="ASHAKids | Revisión técnica", allowSplitting=1)
    doc.build(story, onFirstPage=page, onLaterPages=page)
    print(str(OUTPUT))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=SOURCE)
    parser.add_argument('--output', type=Path, default=OUTPUT)
    parser.add_argument('--date', default=REPORT_DATE)
    args = parser.parse_args()
    SOURCE, OUTPUT, REPORT_DATE = args.source.resolve(), args.output.resolve(), args.date
    build()
