"""Generador del Reporte Oficial en Word para el Avance del Proyecto Final 2 (APF2).

Curso Integrador II: Sistemas - UTP.
Proyecto: ASHAKids Platform - Telerehabilitación e Intervención Infantil.
"""

import os
from pathlib import Path
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

DOCS_DIR = Path(__file__).resolve().parent
OUTPUT_DOCX_PRIMARY = DOCS_DIR / "AVANCE DEL PROYECTO FINAL 2.docx"
OUTPUT_DOCX_SECONDARY = DOCS_DIR / "ASHAKids_Avance_Proyecto_Final_2.docx"
LOGO_PATH = DOCS_DIR / "utp_logo.png"

# Colores corporativos y académicos
COLOR_PRIMARY_HEX = "1E3A8A"     # Azul marino institucional UTP
COLOR_SECONDARY_HEX = "3B1E7A"   # Violeta ASHAKids
COLOR_LIGHT_BG_HEX = "F8FAFC"    # Gris ultra claro para celdas
COLOR_BORDER_HEX = "CBD5E1"      # Borde sutil
COLOR_CODE_BG_HEX = "F1F5F9"     # Fondo bloques código

C_PRIMARY = RGBColor(0x1E, 0x3A, 0x8A)
C_SECONDARY = RGBColor(0x3B, 0x1E, 0x7A)
C_DARK = RGBColor(0x0F, 0x17, 0x2A)
C_MUTED = RGBColor(0x47, 0x55, 0x69)
C_SUCCESS = RGBColor(0x05, 0x96, 0x69)


def set_cell_background(cell, fill_hex):
    """Aplica color de fondo hexadecimal a una celda."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)


def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    """Ajusta padding interno de la celda en dxa."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)


def set_table_borders(table):
    """Establece bordes limpios y discretos a la tabla."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="4" w:space="0" w:color="{COLOR_BORDER_HEX}"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="{COLOR_PRIMARY_HEX}"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{COLOR_BORDER_HEX}"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)


def format_header_row(row, col_widths=None):
    """Aplica formato elegante a la fila de encabezado de tabla."""
    for i, cell in enumerate(row.cells):
        set_cell_background(cell, COLOR_PRIMARY_HEX)
        set_cell_margins(cell, top=140, bottom=140, left=150, right=150)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.name = "Arial"
                r.font.size = Pt(9.5)
                r.font.bold = True
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        if col_widths and i < len(col_widths):
            cell.width = col_widths[i]


def format_body_row(row, is_zebra=False, col_widths=None, alignments=None):
    """Aplica formato a las filas de contenido de tabla."""
    bg_color = COLOR_LIGHT_BG_HEX if is_zebra else "FFFFFF"
    for i, cell in enumerate(row.cells):
        set_cell_background(cell, bg_color)
        set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        for p in cell.paragraphs:
            if alignments and i < len(alignments):
                p.alignment = alignments[i]
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = "Arial"
                r.font.size = Pt(9)
                r.font.color.rgb = C_DARK
        if col_widths and i < len(col_widths):
            cell.width = col_widths[i]


def add_callout(doc, title, text_content):
    """Crea una caja destacada tipo alerta / nota técnica."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F0FDF4")  # Fondo verde/menta muy suave
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)

    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="059669"/>'
        f'<w:top w:val="none"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    r_title = p.add_run(f"✓ {title}: ")
    r_title.bold = True
    r_title.font.name = "Arial"
    r_title.font.size = Pt(9.5)
    r_title.font.color.rgb = C_SUCCESS

    r_body = p.add_run(text_content)
    r_body.font.name = "Arial"
    r_body.font.size = Pt(9)
    r_body.font.color.rgb = C_DARK

    doc.add_paragraph().paragraph_format.space_after = Pt(4)


def add_code_block(doc, code_str):
    """Agrega un bloque formateado de código monoespaciado."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, COLOR_CODE_BG_HEX)
    set_cell_margins(cell, top=100, bottom=100, left=160, right=160)

    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:left w:val="single" w:sz="16" w:space="0" w:color="3B1E7A"/>'
        f'<w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
        f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
        f'<w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(code_str)
    run.font.name = "Consolas"
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)


def add_heading_1(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    r = h.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = C_PRIMARY
    return h


def add_heading_2(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    r = h.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.bold = True
    r.font.color.rgb = C_SECONDARY
    return h


def add_heading_3(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(8)
    h.paragraph_format.space_after = Pt(2)
    h.paragraph_format.keep_with_next = True
    r = h.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(10)
    r.font.bold = True
    r.font.color.rgb = C_DARK
    return h


def add_body_p(doc, text, bold_prefix=None, space_after=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(10)
        r_pre.font.bold = True
        r_pre.font.color.rgb = C_DARK
    r_body = p.add_run(text)
    r_body.font.name = "Arial"
    r_body.font.size = Pt(10)
    r_body.font.color.rgb = C_DARK
    return p


def add_bullet_p(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(9.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = C_DARK
    r_body = p.add_run(text)
    r_body.font.name = "Arial"
    r_body.font.size = Pt(9.5)
    r_body.font.color.rgb = C_DARK
    return p


def build_apf2_document():
    doc = Document()

    # Márgenes estándar APA / académico: 2.54 cm (1 pulgada)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # =========================================================================
    # PORTADA OFICIAL
    # =========================================================================
    if LOGO_PATH.exists():
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_logo.paragraph_format.space_after = Pt(10)
        run_logo = p_logo.add_run()
        run_logo.add_picture(str(LOGO_PATH), width=Inches(1.8))

    p_fac = doc.add_paragraph()
    p_fac.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_fac.paragraph_format.space_before = Pt(10)
    p_fac.paragraph_format.space_after = Pt(2)
    r_fac = p_fac.add_run("FACULTAD DE INGENIERÍA")
    r_fac.font.name = "Arial"
    r_fac.font.size = Pt(16)
    r_fac.font.bold = True
    r_fac.font.color.rgb = C_PRIMARY

    p_prog = doc.add_paragraph()
    p_prog.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_prog.paragraph_format.space_after = Pt(24)
    r_prog = p_prog.add_run("PROGRAMA DE INGENIERÍA DE SISTEMAS E INFORMÁTICA")
    r_prog.font.name = "Arial"
    r_prog.font.size = Pt(12)
    r_prog.font.bold = True
    r_prog.font.color.rgb = C_MUTED

    p_curso = doc.add_paragraph()
    p_curso.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_curso.paragraph_format.space_after = Pt(16)
    r_curso = p_curso.add_run("CURSO INTEGRADOR II: SISTEMAS")
    r_curso.font.name = "Arial"
    r_curso.font.size = Pt(13)
    r_curso.font.bold = True
    r_curso.font.color.rgb = C_SECONDARY

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(16)
    p_title.paragraph_format.space_after = Pt(8)
    r_title = p_title.add_run("ASHAKIDS: PLATAFORMA DE TELEREHABILITACIÓN E INTERVENCIÓN CLÍNICA Y TERAPÉUTICA INFANTIL")
    r_title.font.name = "Arial"
    r_title.font.size = Pt(18)
    r_title.font.bold = True
    r_title.font.color.rgb = C_PRIMARY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(36)
    r_sub = p_sub.add_run("INFORME DE AVANCE DEL PROYECTO FINAL 2 (APF2)")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(13)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(0x05, 0x96, 0x69)

    # Bloque de Integrantes y Docente
    p_int_title = doc.add_paragraph()
    p_int_title.paragraph_format.space_after = Pt(4)
    r_it = p_int_title.add_run("Integrantes (Orden Alfabético por Apellido Paterno):")
    r_it.font.name = "Arial"
    r_it.font.size = Pt(10.5)
    r_it.font.bold = True
    r_it.font.color.rgb = C_DARK

    integrantes = [
        "Anticona, Piero",
        "Lavado Mendoza, Nicolas",
        "Roman Silva, Sergio"
    ]
    for integ in integrantes:
        p_i = doc.add_paragraph()
        p_i.paragraph_format.left_indent = Inches(0.3)
        p_i.paragraph_format.space_after = Pt(2)
        r_i = p_i.add_run(f"•  {integ}")
        r_i.font.name = "Arial"
        r_i.font.size = Pt(10)
        r_i.font.color.rgb = C_DARK

    p_doc = doc.add_paragraph()
    p_doc.paragraph_format.space_before = Pt(16)
    p_doc.paragraph_format.space_after = Pt(2)
    r_dt = p_doc.add_run("Docente:")
    r_dt.font.name = "Arial"
    r_dt.font.size = Pt(10.5)
    r_dt.font.bold = True

    p_doc_name = doc.add_paragraph()
    p_doc_name.paragraph_format.left_indent = Inches(0.3)
    p_doc_name.paragraph_format.space_after = Pt(24)
    r_dn = p_doc_name.add_run("Mg. Ing. Junior Alexander Neyra Gonzales")
    r_dn.font.name = "Arial"
    r_dn.font.size = Pt(10)

    p_pie = doc.add_paragraph()
    p_pie.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_pie.paragraph_format.space_before = Pt(20)
    r_pie = p_pie.add_run("Versión 2.0  |  Octubre del 2026  |  Lima, Perú")
    r_pie.font.name = "Arial"
    r_pie.font.size = Pt(9.5)
    r_pie.font.color.rgb = C_MUTED

    doc.add_page_break()

    # =========================================================================
    # HISTORIAL DE REVISIONES
    # =========================================================================
    add_heading_1(doc, "Historial de Revisiones")
    add_body_p(doc, "El presente cuadro documenta las versiones formales presentadas en el marco del curso:")

    t_hist = doc.add_table(rows=3, cols=6)
    t_hist.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_hist)
    format_header_row(t_hist.rows[0], [Inches(1.0), Inches(0.7), Inches(1.3), Inches(1.8), Inches(1.2), Inches(0.9)])

    h_data = [
        ["Fecha Elaboración", "Versión", "Elaborado por", "Descripción", "Revisado por", "Fecha Revisión"],
        ["03/09/2026", "1.0", "Equipo de Desarrollo", "Versión preliminar y propuesta de arquitectura (APF1).", "Ing. Junior Neyra", "03/09/2026"],
        ["08/10/2026", "2.0", "Equipo de Desarrollo", "Segundo avance (APF2): Implementación de backend FastAPI, persistencia PostgreSQL, hashing Argon2id y modularización frontend.", "Ing. Junior Neyra", "08/10/2026"]
    ]
    for r_idx, row in enumerate(h_data):
        if r_idx == 0:
            for c_idx, val in enumerate(row):
                t_hist.cell(r_idx, c_idx).paragraphs[0].text = val
            format_header_row(t_hist.rows[0])
        else:
            for c_idx, val in enumerate(row):
                t_hist.cell(r_idx, c_idx).paragraphs[0].text = val
            format_body_row(t_hist.rows[r_idx], is_zebra=(r_idx % 2 == 1))

    # =========================================================================
    # ÍNDICE GENERAL
    # =========================================================================
    add_heading_1(doc, "ÍNDICE GENERAL")
    indices = [
        ("1. RESUMEN DEL PROYECTO", "3"),
        ("   1.1 NOMBRE DEL PROYECTO", "3"),
        ("   1.2 DESCRIPCIÓN GENERAL", "3"),
        ("   1.3 PROBLEMA IDENTIFICADO", "4"),
        ("   1.4 SOLUCIÓN PROPUESTA", "4"),
        ("   1.5 ESTADO ACTUAL DEL PROYECTO", "4"),
        ("   1.6 CRONOGRAMA Y PLANIFICACIÓN", "5"),
        ("2. RESUMEN DEL AVANCE DEL PROYECTO (UNIDAD II)", "6"),
        ("3. LEVANTAMIENTO DE OBSERVACIONES APF1", "7"),
        ("4. ARQUITECTURA IMPLEMENTADA DEL SISTEMA", "8"),
        ("   4.1 ARQUITECTURA ACTUAL", "8"),
        ("   4.2 TECNOLOGÍAS UTILIZADAS", "9"),
        ("5. DESARROLLO BACKEND (SPRINT 04)", "10"),
        ("   5.1 ARQUITECTURA DEL BACKEND", "10"),
        ("   5.2 FUNCIONALIDADES BACKEND IMPLEMENTADAS", "11"),
        ("   5.3 EVIDENCIAS DEL BACKEND (ENDPOINTS Y JSON)", "12"),
        ("6. IMPLEMENTACIÓN DE SEGURIDAD (SPRINT 03 Y 04)", "14"),
        ("   6.1 MODELO FÍSICO IMPLEMENTADO", "14"),
        ("   6.2 TABLAS IMPLEMENTADAS", "15"),
        ("   6.3 OPERACIONES REALIZADAS (CRUD Y SOFT DELETE)", "16"),
        ("7. VALIDACIÓN DEL SISTEMA (SEMANA 7)", "17"),
        ("   7.1 ACTIVOS DEL PROYECTO", "17"),
        ("   7.2 CONTROL DE ACCESO (RBAC)", "18"),
        ("   7.3 MATRIZ DE SEGURIDAD DEL PROYECTO", "19"),
        ("8. EVIDENCIAS DEL PROYECTO", "20"),
        ("9. CONCLUSIONES", "21"),
        ("10. REFERENCIAS", "22"),
    ]
    for item, pag in indices:
        p_idx = doc.add_paragraph()
        p_idx.paragraph_format.space_after = Pt(2)
        r_item = p_idx.add_run(item.ljust(75, '.'))
        r_item.font.name = "Arial"
        r_item.font.size = Pt(9.5)
        r_pag = p_idx.add_run(f" {pag}")
        r_pag.font.name = "Arial"
        r_pag.font.size = Pt(9.5)
        r_pag.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # 1. RESUMEN DEL PROYECTO
    # =========================================================================
    add_heading_1(doc, "1. RESUMEN DEL PROYECTO")

    add_heading_2(doc, "1.1 NOMBRE DEL PROYECTO")
    add_body_p(doc, "ASHAKids Platform — Plataforma Integral de Telerehabilitación e Intervención Fonoaudiológica y Psicológica Infantil.")

    add_heading_2(doc, "1.2 DESCRIPCIÓN GENERAL")
    add_body_p(doc, "ASHAKids es un ecosistema tecnológico diseñado para optimizar los tratamientos terapéuticos y fonoaudiológicos de niños con dificultades del lenguaje, habla, neurodesarrollo y comunicación. La plataforma articula a las familias con profesionales de la salud certificados mediante un entorno gamificado interactivo (Mundo ASHA) y un panel clínico riguroso.")

    add_body_p(doc, "Propósito del sistema: ", bold_prefix="• ")
    add_body_p(doc, "Democratizar y asegurar la continuidad de las terapias infantiles mediante telerehabilitación asistida, reduciendo tasas de deserción terapéutica y permitiendo a especialistas y tutores monitorizar en tiempo real el progreso clínico, asistencia y adherencia a los planes terapéuticos.")

    add_body_p(doc, "Usuarios involucrados: ", bold_prefix="• ")
    add_bullet_p(doc, " Padres y madres de familia responsables del menor. Acceden a la agenda de citas, visualización de avances, reportes clínicos autorizados, módulos interactivos de práctica en el hogar y gestión de su cuenta.", bold_prefix="1. Padre / Tutor Familiar (Rol PADRE):")
    add_bullet_p(doc, " Especialistas certificados en fonoaudiología, psicología y terapia ocupacional. Gestionan expedientes clínicos de pacientes asignados, programan citas, registran la asistencia a sesiones y emiten reportes clínicos estructurados.", bold_prefix="2. Terapeuta / Profesional Clínico (Rol TERAPEUTA):")
    add_bullet_p(doc, " Personal de gestión institucional. Administra la creación de usuarios, asignación de roles, auditoría operativa del sistema y vinculación de tratamientos entre terapeutas y pacientes.", bold_prefix="3. Administrador de Plataforma (Rol ADMIN):")

    add_body_p(doc, "Funcionalidades principales: ", bold_prefix="• ")
    add_bullet_p(doc, " Sistema de autenticación de grado de seguridad bancario utilizando hashing Argon2id y gestión de sesiones persistidas mediante cookies HttpOnly.")
    add_bullet_p(doc, " Gestión de expedientes de pacientes pediátricos con preservación estricta de historial clínico (baja lógica).")
    add_bullet_p(doc, " Agendamiento de citas sincrónicas y asincrónicas con validación de conflictos de horario y solapamientos.")
    add_bullet_p(doc, " Registro y ejecución de sesiones terapéuticas con control de asistencia, hora de inicio/fin y emisión de reportes clínicos post-sesión.")
    add_bullet_p(doc, " Interfaz frontend reactiva modularizada en 278 componentes con 96 rutas protegidas por roles declarativos.")

    add_heading_2(doc, "1.3 PROBLEMA IDENTIFICADO")
    add_body_p(doc, "En el ámbito de la salud infantil en el Perú y Latinoamérica, el acceso a terapias de lenguaje y neurodesarrollo enfrenta barreras críticas: escasez de profesionales especializados en zonas periféricas, altos costos de desplazamiento, tiempos prolongados de espera y, fundamentalmente, una tasa de abandono de terapia superior al 45% debido a la falta de adherencia en el hogar y a la ausencia de retroalimentación sistemática entre las sesiones presenciales.")
    add_body_p(doc, "Adicionalmente, desde el punto de vista informático, los centros terapéuticos carecen de plataformas especializadas que integren la gestión clínica con la estimulación lúdica, dependiendo de hojas de cálculo o chats no seguros que exponen la información sensible de menores de edad incumpliendo normativas de protección de datos personales.")

    add_heading_2(doc, "1.4 SOLUCIÓN PROPUESTA")
    add_body_p(doc, "ASHAKids implementa una arquitectura desacoplada de tres capas compuesta por:")
    add_bullet_p(doc, "Frontend web reactivo (React 18 + TypeScript + Vite + Tailwind CSS) que ofrece interfaces personalizadas por rol, navegación fluida sin recargas y un entorno interactivo atractivo para los menores.")
    add_bullet_p(doc, "Backend RESTful robusto (FastAPI en Python 3.13) con validación estricta de esquemas de datos mediante Pydantic v2 y seguridad basada en el estándar OWASP.")
    add_bullet_p(doc, "Base de datos relacional PostgreSQL (gestionada en Supabase Cloud) con 26 tablas normalizadas que garantizan la integridad referencial y confidencialidad médica.")

    add_heading_2(doc, "1.5 ESTADO ACTUAL DEL PROYECTO")
    add_body_p(doc, "A continuación, se detalla el porcentaje de avance cuantitativo y cualitativo alcanzado en el segundo avance:")

    # Tabla 1: Estado Actual
    t_estado = doc.add_table(rows=7, cols=2)
    t_estado.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_estado)
    format_header_row(t_estado.rows[0], [Inches(2.5), Inches(4.2)])

    estado_data = [
        ["Componente", "Estado (%)"],
        ["Frontend", "90% — Modularización completa en 278 archivos (<500 líneas c/u), 96 rutas declarativas en React Router v7 con lazy loading y 145 pruebas automatizadas superadas."],
        ["Backend", "85% — 32 operaciones REST implementadas en FastAPI con OpenAPI; servicios de autenticación, pacientes, citas, sesiones y reportes completamente operativos."],
        ["Base de datos", "90% — Esquema físico de 26 tablas en PostgreSQL (Supabase) con claves foráneas, restricciones de unicidad, checks y transacciones atómicas."],
        ["Seguridad", "90% — Hashing Argon2id (OWASP), tokens opacos SHA-256 en BD con cookie HttpOnly/Secure/SameSite, control de acceso RBAC por rol y aislamiento de recursos."],
        ["Pruebas", "85% — 145 pruebas automatizadas de frontend (120 Vitest + 25 routing) y 63 pruebas backend (pytest + 109 aserciones en Postman) con 100% de éxito."],
        ["Despliegue", "30% — Base de datos desplegada en Supabase Cloud (PostgreSQL 17.6); backend y frontend preparados para contenedor Docker en staging local."]
    ]
    for r_idx, row in enumerate(estado_data):
        if r_idx == 0:
            for c_idx, val in enumerate(row):
                t_estado.cell(r_idx, c_idx).paragraphs[0].text = val
            format_header_row(t_estado.rows[0])
        else:
            for c_idx, val in enumerate(row):
                t_estado.cell(r_idx, c_idx).paragraphs[0].text = val
            format_body_row(t_estado.rows[r_idx], is_zebra=(r_idx % 2 == 1), alignments=[WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT])

    add_heading_2(doc, "1.6 CRONOGRAMA Y PLANIFICACIÓN DEL PROYECTO")
    add_body_p(doc, "El proyecto se estructura en 6 sprints de desarrollo ágil según el cronograma académico del curso:")

    t_crono = doc.add_table(rows=7, cols=4)
    t_crono.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_crono)
    format_header_row(t_crono.rows[0], [Inches(1.2), Inches(1.6), Inches(2.7), Inches(1.2)])

    crono_data = [
        ["Sprint", "Semanas / Fechas", "Entregables Clave", "Estado"],
        ["Sprint 01", "Semana 1 - 2 (Ago)", "Requerimientos, diagrama de arquitectura preliminar y prototipo Figma.", "Completado (100%)"],
        ["Sprint 02", "Semana 3 - 4 (Set)", "Diseño de base de datos relacional y levantamiento de observaciones APF1.", "Completado (100%)"],
        ["Sprint 03", "Semana 5 - 6 (Set-Oct)", "Configuración de entorno seguro, modelo físico y hashing Argon2id.", "Completado (100%)"],
        ["Sprint 04", "Semana 7 - 8 (Octubre)", "Desarrollo Backend FastAPI (32 endpoints), CRUD clínico y APF2.", "Completado (100%)"],
        ["Sprint 05", "Semana 9 - 11 (Oct-Nov)", "Integración completa frontend-backend y pruebas de integración clínica.", "En Progreso (30%)"],
        ["Sprint 06", "Semana 12 - 14 (Noviembre)", "Despliegue final en producción cloud, pruebas de carga y APF3 final.", "Planificado (0%)"]
    ]
    for r_idx, row in enumerate(crono_data):
        if r_idx == 0:
            for c_idx, val in enumerate(row):
                t_crono.cell(r_idx, c_idx).paragraphs[0].text = val
            format_header_row(t_crono.rows[0])
        else:
            for c_idx, val in enumerate(row):
                t_crono.cell(r_idx, c_idx).paragraphs[0].text = val
            format_body_row(t_crono.rows[r_idx], is_zebra=(r_idx % 2 == 1), alignments=[WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER])

    doc.add_page_break()

    # =========================================================================
    # 2. RESUMEN DEL AVANCE DEL PROYECTO (UNIDAD II)
    # =========================================================================
    add_heading_1(doc, "2. RESUMEN DEL AVANCE DEL PROYECTO (UNIDAD II)")
    add_body_p(doc, "El presente documento formaliza el segundo avance del proyecto integrador (APF2), consolidando la transición desde la fase de diseño y prototipado estático hacia una primera versión funcional desacoplada y clínicamente operativa.")

    add_body_p(doc, "Contexto del proyecto: ", bold_prefix="• ")
    add_body_p(doc, "Durante la Unidad I se concibió la idea de negocio, los casos de uso preliminares y un prototipo frontend en React. Sin embargo, dicho prototipo presentaba una arquitectura monolítica (un único archivo App.tsx con más de 7,200 líneas de código) y carecía de lógica de negocio en backend, persistencia y mecanismos de seguridad reales.")

    add_body_p(doc, "Problema técnico resuelto en la Unidad II: ", bold_prefix="• ")
    add_body_p(doc, "El desafío central de esta unidad consistió en desacoplar íntegramente la capa de presentación de la capa de datos, desarrollar un backend API RESTful bajo estándares profesionales, implementar mecanismos de seguridad criptográfica de grado industrial y reorganizar el frontend en módulos testeables e independientes.")

    add_body_p(doc, "Solución desarrollada en la Unidad II: ", bold_prefix="• ")
    add_bullet_p(doc, "Desarrollo de una API RESTful completa en FastAPI (Python 3.13) con 32 operaciones en OpenAPI, gestionando el ciclo de vida de usuarios, pacientes, citas, sesiones y reportes clínicos.")
    add_bullet_p(doc, "Implementación del algoritmo Argon2id para el resguardo de contraseñas y arquitectura de tokens opacos en base de datos para sesiones de usuario con cookies HttpOnly seguras.")
    add_bullet_p(doc, "Descomposición del frontend monolítico en 278 componentes modulares organizados por dominios de rol (Padre, Terapeuta, Admin), reduciendo el bundle de entrada de 1,020 kB a 259 kB.")
    add_bullet_p(doc, "Despliegue de la base de datos relacional en PostgreSQL 17.6 sobre Supabase Cloud con 26 tablas normalizadas e integridad referencial.")

    add_body_p(doc, "Avances alcanzados en la Unidad II: ", bold_prefix="• ")
    add_bullet_p(doc, "Cumplimiento del Sprint 03: Modelo físico relacional y módulo criptográfico Argon2id.")
    add_bullet_p(doc, "Cumplimiento del Sprint 04: Backend clínico completo con transacciones atómicas y control de concurrencia.")
    add_bullet_p(doc, "Cumplimiento de la Semana 07: Auditoría de activos de información, matriz de seguridad y control de acceso RBAC.")

    # =========================================================================
    # 3. LEVANTAMIENTO DE OBSERVACIONES APF1
    # =========================================================================
    add_heading_1(doc, "3. LEVANTAMIENTO DE OBSERVACIONES APF1")
    add_body_p(doc, "En el feedback recibido tras la evaluación del primer avance (APF1), se formularon recomendaciones para elevar el rigor ingenieril del proyecto. A continuación se demuestra el levantamiento exhaustivo de cada observación:")

    t_obs = doc.add_table(rows=5, cols=3)
    t_obs.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_obs)
    format_header_row(t_obs.rows[0], [Inches(1.8), Inches(2.2), Inches(2.7)])

    obs_data = [
        ["Observación APF1", "Acción Correctiva Implementada", "Evidencia en el Repositorio"],
        [
            "1. Mejorar arquitectura: Evitar arquitectura monolítica y acoplamiento.",
            "Se implementó una arquitectura limpia de 3 capas. El frontend ya no tiene acceso a la BD; toda petición viaja vía HTTP REST a FastAPI, y este utiliza SQLAlchemy 2.0 asíncrono hacia PostgreSQL.",
            "docs/architecture.md\nbackend/app/main.py\nfrontend/src/api/client.ts"
        ],
        [
            "2. Completar requerimientos: Falta de persistencia clínica y endpoints de gestión.",
            "Se desarrollaron 32 endpoints REST cubriendo el ciclo clínico completo: expedientes, tratamientos, citas con detección de choques horarios, sesiones y reportes post-sesión.",
            "backend/app/api/v1/\nbackend/app/services/clinica_service.py"
        ],
        [
            "3. Ajustar prototipo: Archivo App.tsx excesivamente extenso (>7,000 líneas).",
            "Refactorización estructural: App.tsx se redujo a una línea de composición; se dividió en 278 componentes modulares bajo 500 líneas c/u con React Router v7 y lazy loading.",
            "docs/decisions/0002-frontend-modular-rutas.md\nfrontend/src/app/AppRouter.tsx"
        ],
        [
            "4. Seguridad deficiente: Contraseñas sin hashing robusto y sesiones simuladas.",
            "Se implementó Argon2id (OWASP: 64 MiB, 3 iteraciones, 4 hilos) con sal criptográfica única y sesiones opacas en tabla sesiones_autenticacion con cookie HttpOnly.",
            "backend/app/core/security.py\nbackend/app/models/auth.py"
        ]
    ]
    for r_idx, row in enumerate(obs_data):
        if r_idx == 0:
            for c_idx, val in enumerate(row):
                t_obs.cell(r_idx, c_idx).paragraphs[0].text = val
            format_header_row(t_obs.rows[0])
        else:
            for c_idx, val in enumerate(row):
                t_obs.cell(r_idx, c_idx).paragraphs[0].text = val
            format_body_row(t_obs.rows[r_idx], is_zebra=(r_idx % 2 == 1), alignments=[WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT])

    doc.add_page_break()

    # =========================================================================
    # 4. ARQUITECTURA IMPLEMENTADA DEL SISTEMA
    # =========================================================================
    add_heading_1(doc, "4. ARQUITECTURA IMPLEMENTADA DEL SISTEMA")

    add_heading_2(doc, "4.1 ARQUITECTURA ACTUAL")
    add_body_p(doc, "El sistema adopta una arquitectura desacoplada de 3 capas cliente-servidor estrictamente delimitada:")

    # Diagrama en tabla estilizada
    t_diag = doc.add_table(rows=7, cols=3)
    t_diag.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_diag)
    format_header_row(t_diag.rows[0], [Inches(1.8), Inches(3.2), Inches(1.7)])

    diag_data = [
        ["Capa / Nivel", "Componente y Responsabilidad", "Protocolo / Interfaz"],
        ["Usuario", "Navegador Web (Padre, Terapeuta, Administrador)", "HTTPS / DOM Events"],
        ["↓", "Peticiones de interfaz y eventos de usuario", "↓"],
        ["Frontend (SPA)", "React 18 + TypeScript + Vite + React Router v7\nRenderizado de componentes, gestión de estado y guardianes de ruta.", "HTTP REST / JSON\n(Cookies HttpOnly)"],
        ["↓", "Llamadas a API seguras sin acceso directo a BD", "↓"],
        ["Backend (API)", "FastAPI (Python 3.13) + Pydantic v2 + SQLAlchemy 2.0 Async\nAutenticación Argon2id, RBAC, lógica clínica y transacciones ACID.", "TCP / asyncpg\n(SSL Encrypted)"],
        ["Base de Datos", "PostgreSQL 17.6 (Supabase Managed Cloud)\n26 tablas relacionales, integridad referencial y restricciones.", "Almacenamiento ACID"]
    ]
    for r_idx, row in enumerate(diag_data):
        if r_idx == 0:
            for c_idx, val in enumerate(row):
                t_diag.cell(r_idx, c_idx).paragraphs[0].text = val
            format_header_row(t_diag.rows[0])
        else:
            for c_idx, val in enumerate(row):
                t_diag.cell(r_idx, c_idx).paragraphs[0].text = val
            is_arrow = row[0] == "↓"
            bg = "F1F5F9" if is_arrow else (COLOR_LIGHT_BG_HEX if r_idx % 2 == 1 else "FFFFFF")
            format_body_row(t_diag.rows[r_idx], is_zebra=False, alignments=[WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER])
            if is_arrow:
                set_cell_background(t_diag.cell(r_idx, 0), "F1F5F9")
                set_cell_background(t_diag.cell(r_idx, 1), "F1F5F9")
                set_cell_background(t_diag.cell(r_idx, 2), "F1F5F9")

    add_body_p(doc, "")

    add_heading_2(doc, "4.2 TECNOLOGÍAS UTILIZADAS")
    add_body_p(doc, "A continuación, se presenta la matriz tecnológica formal que soporta la solución técnica:")

    # Tabla 2: Tecnologías Utilizadas
    t_tec = doc.add_table(rows=6, cols=3)
    t_tec.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_tec)
    format_header_row(t_tec.rows[0], [Inches(1.8), Inches(2.2), Inches(2.7)])

    tec_data = [
        ["Capa", "Tecnología Seleccionada", "Justificación Técnica"],
        ["Frontend", "React 18.3, TypeScript 5.9, Vite 6.4, Tailwind CSS 4.1, React Router 7.18", "Renderizado reactivo eficiente, tipado estático estricto, hot reload ultra rápido y routing declarativo con protección de roles."],
        ["Backend", "Python 3.13, FastAPI 0.115, Uvicorn ASGI, Pydantic v2, Argon2-cffi", "Ejecución asíncrona de alto rendimiento, autogeneración de OpenAPI, validación estricta de esquemas y hashing resistente a ataques por GPU."],
        ["Base de Datos", "PostgreSQL 17.6 (Supabase), SQLAlchemy 2.0 Async (asyncpg)", "Modelo relacional robusto con llaves foráneas, disparadores, índices B-Tree y pool de conexiones asíncronas no bloqueantes."],
        ["Servidor / Cloud", "Supabase Cloud (PostgreSQL Gestionado), Uvicorn Server", "Infraestructura cloud administrada con SSL automático, respaldos continuos y alta disponibilidad."],
        ["Control de versiones", "Git, GitHub (Repositorio: ashakids-platform)", "Control de versiones distribuido con ramas organizadas (main, dev, feat/*) y registro de pull requests aprobados."]
    ]
    for r_idx, row in enumerate(tec_data):
        if r_idx == 0:
            for c_idx, val in enumerate(row):
                t_tec.cell(r_idx, c_idx).paragraphs[0].text = val
            format_header_row(t_tec.rows[0])
        else:
            for c_idx, val in enumerate(row):
                t_tec.cell(r_idx, c_idx).paragraphs[0].text = val
            format_body_row(t_tec.rows[r_idx], is_zebra=(r_idx % 2 == 1), alignments=[WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT])

    doc.add_page_break()

    # =========================================================================
    # 5. DESARROLLO BACKEND (SPRINT 04)
    # =========================================================================
    add_heading_1(doc, "5. DESARROLLO BACKEND (Relacionado al Sprint 04)")

    add_heading_2(doc, "5.1 ARQUITECTURA DEL BACKEND")
    add_body_p(doc, "El backend se diseñó siguiendo una arquitectura por capas orientada a dominios (Domain-Driven Design simplificado):")
    add_bullet_p(doc, "Python 3.13.", bold_prefix="Lenguaje utilizado: ")
    add_bullet_p(doc, "FastAPI 0.115 sobre servidor ASGI Uvicorn.", bold_prefix="Framework web: ")
    add_bullet_p(doc, "Mapeador Objeto-Relacional (ORM) SQLAlchemy 2.0 con soporte asíncrono nativo (asyncpg).", bold_prefix="Capa de persistencia: ")
    add_bullet_p(doc, "Estructura modular en carpetas:", bold_prefix="Estructura del proyecto: ")

    add_code_block(doc, 
        "backend/\n"
        "├── app/\n"
        "│   ├── api/          # Controladores y rutas HTTP (/api/v1)\n"
        "│   │   └── v1/       # auth.py, usuarios.py, pacientes.py, citas.py, sesiones.py\n"
        "│   ├── core/         # Configuración (config.py), BD (database.py), Cripto (security.py)\n"
        "│   ├── models/       # Modelos ORM (auth.py, perfiles.py, clinica.py)\n"
        "│   ├── schemas/      # DTOs de validación Pydantic v2 (auth.py, clinica.py)\n"
        "│   ├── services/     # Lógica de negocio transaccional (auth_service, clinica_service)\n"
        "│   └── main.py       # Entrada ASGI, middlewares de CORS y control de origen\n"
        "├── scripts/          # Creación DDL (db_creation.sql) y auditoría de solo lectura\n"
        "└── tests/            # Pruebas unitarias y de integración (63 tests)"
    )

    add_heading_2(doc, "5.2 FUNCIONALIDADES BACKEND IMPLEMENTADAS")
    add_body_p(doc, "A continuación, se detalla el catálogo de funcionalidades desarrolladas en el Sprint 04:")

    # Tabla 3: Funcionalidades Backend
    t_func = doc.add_table(rows=11, cols=3)
    t_func.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_func)
    format_header_row(t_func.rows[0], [Inches(1.8), Inches(3.7), Inches(1.2)])

    func_data = [
        ["Funcionalidad", "Descripción", "Estado (%)"],
        ["Login / Autenticación", "Verificación con Argon2id, creación de token opaco con hash SHA-256 en BD y emisión de cookie HttpOnly.", "100%"],
        ["Cierre de Sesión (Logout)", "Revocación inmediata del token en BD y limpieza de la cookie de sesión.", "100%"],
        ["Identidad Propia (/me)", "Consulta del usuario autenticado y perfil específico (/padres/me, /terapeutas/me, /admin/me).", "100%"],
        ["Gestión de Usuarios", "Alta atómica (usuario + rol + perfil), listado paginado y actualización de credenciales por ADMIN.", "100%"],
        ["Gestión de Pacientes", "Registro de pacientes vinculados a tutores, consulta con aislamiento de familia y baja lógica (soft delete).", "100%"],
        ["Asignación de Tratamiento", "Vinculación clínica entre paciente, terapeuta y apertura de expediente médico.", "100%"],
        ["Agenda de Citas (Reservas)", "Creación, reprogramación, confirmación y cancelación con detección de solapamiento horario (409 Conflict).", "100%"],
        ["Sesiones Terapéuticas", "Inicio formal de sesión, registro de asistencia y cierre controlado de sesión.", "100%"],
        ["Reportes Clínicos", "Emisión estructurada de reporte post-sesión (observaciones, objetivos trabajados y nivel de ayuda).", "100%"],
        ["Verificación de Salud", "Endpoints de liveness (/health) y readiness (/health/ready con prueba SELECT 1 sobre PostgreSQL).", "100%"]
    ]
    for r_idx, row in enumerate(func_data):
        if r_idx == 0:
            for c_idx, val in enumerate(row):
                t_func.cell(r_idx, c_idx).paragraphs[0].text = val
            format_header_row(t_func.rows[0])
        else:
            for c_idx, val in enumerate(row):
                t_func.cell(r_idx, c_idx).paragraphs[0].text = val
            format_body_row(t_func.rows[r_idx], is_zebra=(r_idx % 2 == 1), alignments=[WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER])

    add_heading_2(doc, "5.3 EVIDENCIAS DEL BACKEND")
    add_body_p(doc, "El backend expone 32 operaciones formalmente verificadas. A continuación, se ilustran ejemplos de endpoints y respuestas JSON reales emitidas por el servidor:")

    add_heading_3(doc, "a) Endpoint POST /api/v1/auth/login — Respuesta JSON Exitosa (200 OK)")
    add_code_block(doc,
        "HTTP/1.1 200 OK\n"
        "Content-Type: application/json\n"
        "Set-Cookie: ashakids_session=s_8f3a9e...; HttpOnly; SameSite=Lax; Path=/\n"
        "{\n"
        '  "mensaje": "Inicio de sesión exitoso.",\n'
        '  "usuario": {\n'
        '    "id_usuario": 14,\n'
        '    "nombres": "Rosa Elena",\n'
        '    "apellidos": "Mendoza Silva",\n'
        '    "codigo_usuario": "PAD001",\n'
        '    "email": "rosa.mendoza@ashakids.com",\n'
        '    "activo": true,\n'
        '    "rol": "PADRE",\n'
        '    "roles": ["PADRE"]\n'
        "  }\n"
        "}"
    )

    add_heading_3(doc, "b) Endpoint POST /api/v1/citas — Reserva de Cita Terapéutica (201 Created)")
    add_code_block(doc,
        "HTTP/1.1 201 Created\n"
        "Content-Type: application/json\n"
        "{\n"
        '  "id_reserva": 58,\n'
        '  "id_paciente": 7,\n'
        '  "id_terapeuta": 3,\n'
        '  "id_tratamiento": 4,\n'
        '  "fecha_hora_inicio": "2026-10-15T15:00:00Z",\n'
        '  "fecha_hora_fin": "2026-10-15T15:45:00Z",\n'
        '  "modalidad": "VIRTUAL",\n'
        '  "estado_reserva": "PENDIENTE"\n'
        "}"
    )

    add_callout(doc, "Resultado de Auditoría Local con Postman",
        "Se ejecutó la colección completa de Postman sobre las 32 operaciones OpenAPI expuestas. "
        "Resultado: 109 aserciones superadas exitosamente (100%), 0 aserciones fallidas, en 1.37 segundos de ejecución aislada.")

    doc.add_page_break()

    # =========================================================================
    # 6. IMPLEMENTACIÓN DE SEGURIDAD (SPRINT 03 Y SPRINT 04)
    # =========================================================================
    add_heading_1(doc, "6. IMPLEMENTACIÓN DE SEGURIDAD (Relacionado al Sprint 03 y Sprint 04)")

    add_heading_2(doc, "6.1 MODELO FÍSICO IMPLEMENTADO")
    add_body_p(doc, "La base de datos se encuentra normalizada en Tercera Forma Normal (3FN) con integridad referencial exhaustiva. Las relaciones clave del modelo físico abarcan:")
    add_bullet_p(doc, "usuarios (1) ──── (N) usuario_roles (N) ──── (1) roles", bold_prefix="Seguridad y RBAC: ")
    add_bullet_p(doc, "usuarios (1) ──── (N) sesiones_autenticacion [Control de tokens opacos]", bold_prefix="Sesiones: ")
    add_bullet_p(doc, "usuarios (1) ──── (1) tutores (1) ──── (N) pacientes", bold_prefix="Familia: ")
    add_bullet_p(doc, "pacientes (1) ──── (1) expedientes (1) ──── (N) tratamientos", bold_prefix="Expediente Clínico: ")
    add_bullet_p(doc, "tratamientos (1) ──── (N) reservas (1) ──── (1) sesiones (1) ──── (1) reportes_sesion", bold_prefix="Ciclo de Atención: ")

    add_heading_2(doc, "6.2 TABLAS IMPLEMENTADAS")
    add_body_p(doc, "A continuación, se describen las 12 tablas clínicas y operativas fundamentales del sistema:")

    # Tabla 4: Tablas Implementadas
    t_tablas = doc.add_table(rows=13, cols=2)
    t_tablas.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_tablas)
    format_header_row(t_tablas.rows[0], [Inches(2.2), Inches(4.5)])

    tablas_data = [
        ["Nombre de Tabla en BD", "Descripción y Función en el Sistema"],
        ["usuarios", "Entidad central de credenciales de acceso: nombres, apellidos, código único, email y hash Argon2id."],
        ["roles", "Catálogo estricto de roles admitidos en el sistema (PADRE, TERAPEUTA, ADMIN)."],
        ["usuario_roles", "Tabla intermedia de asignación de roles con trazabilidad de fecha y administrador asignador."],
        ["sesiones_autenticacion", "Registro persistente de sesiones activas: token con hash SHA-256, expiración y estado de revocación."],
        ["tutores", "Perfil específico de padres/tutores legales: datos de parentesco, teléfono y dirección."],
        ["terapeutas", "Perfil profesional clínico: especialidad médica, años de experiencia comprobada y descripción."],
        ["pacientes", "Registro del menor/paciente vinculado a su tutor familiar, incluyendo fecha de nacimiento y estado activo."],
        ["expedientes", "Historial clínico acumulativo y diagnósticos fonoaudiológicos/psicológicos del paciente."],
        ["tratamientos", "Plan terapéutico formal que vincula un expediente a un terapeuta con cantidad de sesiones."],
        ["reservas", "Agenda de citas con fecha, hora de inicio/fin, modalidad (presencial/virtual) y estado."],
        ["sesiones", "Ejecución real de la sesión terapéutica con control de asistencia y timestamps efectivos."],
        ["reportes_sesion", "Documento clínico post-sesión con observaciones diagnósticas, objetivos y recomendaciones."]
    ]
    for r_idx, row in enumerate(tablas_data):
        if r_idx == 0:
            for c_idx, val in enumerate(row):
                t_tablas.cell(r_idx, c_idx).paragraphs[0].text = val
            format_header_row(t_tablas.rows[0])
        else:
            for c_idx, val in enumerate(row):
                t_tablas.cell(r_idx, c_idx).paragraphs[0].text = val
            format_body_row(t_tablas.rows[r_idx], is_zebra=(r_idx % 2 == 1), alignments=[WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT])

    add_heading_2(doc, "6.3 OPERACIONES REALIZADAS (EVIDENCIA CRUD)")
    add_body_p(doc, "El backend demuestra la implementación completa y segura de las operaciones CRUD:")

    add_bullet_p(doc, "Creación atómica de usuario + asignación de rol + perfil en una sola transacción ACID mediante SQLAlchemy Async. Si falla la creación del perfil, se ejecuta rollback automático.", bold_prefix="1. INSERT (Creación Atómica): ")
    add_bullet_p(doc, "Listados paginados (limit y offset) con aislamiento horizontal de seguridad. Una familia solo puede listar sus propios hijos; un terapeuta solo sus pacientes asignados.", bold_prefix="2. SELECT (Consultas Paginadas y Seguras): ")
    add_bullet_p(doc, "Modificación controlada de citas (reprogramación) y actualización de reportes de sesión. Validación de transiciones válidas de estado (PENDIENTE -> CONFIRMADA -> COMPLETADA).", bold_prefix="3. UPDATE (Actualizaciones con Reglas de Estado): ")
    add_bullet_p(doc, "Implementación obligatoria de baja lógica mediante el endpoint DELETE /api/v1/pacientes/{id}. Se establece activo = false preservando el registro físico y su historial médico para cumplimiento legal.", bold_prefix="4. DELETE (Baja Lógica / Soft Delete): ")

    doc.add_page_break()

    # =========================================================================
    # 7. VALIDACIÓN DEL SISTEMA (SEMANA 7)
    # =========================================================================
    add_heading_1(doc, "7. VALIDACIÓN DEL SISTEMA (semana 7)")

    add_heading_2(doc, "7.1 ACTIVOS DEL PROYECTO")
    add_body_p(doc, "Identificación y clasificación de los activos de información críticos del sistema (Semana 7, Sesión 01):")

    # Tabla 5: Activos
    t_activos = doc.add_table(rows=6, cols=4)
    t_activos.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_activos)
    format_header_row(t_activos.rows[0], [Inches(1.8), Inches(2.5), Inches(1.5), Inches(0.9)])

    activos_data = [
        ["Activo", "Descripción", "Componente Asociado", "Importancia"],
        ["Credenciales de acceso", "Códigos de usuario, emails y contraseñas hasheadas.", "Módulo Auth / usuarios", "Alta"],
        ["Tokens de sesión activa", "Identificadores opacos para mantener autenticación.", "sesiones_autenticacion", "Alta"],
        ["Datos de pacientes menores", "Nombres, DNI, fechas de nacimiento y datos familiares.", "pacientes / tutores", "Alta"],
        ["Historias clínicas y reportes", "Diagnósticos médicos, notas terapéuticas y evolución.", "expedientes / reportes", "Alta"],
        ["Disponibilidad del servicio", "Operatividad ininterrumpida de la API y base de datos.", "Infraestructura FastAPI", "Media"]
    ]
    for r_idx, row in enumerate(activos_data):
        if r_idx == 0:
            for c_idx, val in enumerate(row):
                t_activos.cell(r_idx, c_idx).paragraphs[0].text = val
            format_header_row(t_activos.rows[0])
        else:
            for c_idx, val in enumerate(row):
                t_activos.cell(r_idx, c_idx).paragraphs[0].text = val
            format_body_row(t_activos.rows[r_idx], is_zebra=(r_idx % 2 == 1), alignments=[WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER])

    add_heading_2(doc, "7.2 CONTROL DE ACCESO (RBAC)")
    add_body_p(doc, "Matriz de privilegios y control de acceso basado en roles implementado en backend:")

    # Tabla 6: Control de Acceso
    t_rbac = doc.add_table(rows=4, cols=3)
    t_rbac.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_rbac)
    format_header_row(t_rbac.rows[0], [Inches(1.5), Inches(4.0), Inches(1.2)])

    rbac_data = [
        ["ROL", "Descripción de Permisos", "Funcionalidad (%)"],
        ["Administrador (ADMIN)", "Gestión de usuarios y asignación de roles. Asignación de tratamientos clínicos entre terapeutas y pacientes. Auditoría general del sistema.", "100%"],
        ["Terapeuta (TERAPEUTA)", "Acceso exclusivo a pacientes que tiene asignados. Gestión de agenda de citas. Registro de asistencia e inicio/fin de sesión. Creación y edición de reportes clínicos.", "100%"],
        ["Padre / Tutor (PADRE)", "Acceso exclusivo a sus propios hijos registrados. Creación y reprogramación de citas de su familia. Lectura de reportes clínicos autorizados de sus menores.", "100%"]
    ]
    for r_idx, row in enumerate(rbac_data):
        if r_idx == 0:
            for c_idx, val in enumerate(row):
                t_rbac.cell(r_idx, c_idx).paragraphs[0].text = val
            format_header_row(t_rbac.rows[0])
        else:
            for c_idx, val in enumerate(row):
                t_rbac.cell(r_idx, c_idx).paragraphs[0].text = val
            format_body_row(t_rbac.rows[r_idx], is_zebra=(r_idx % 2 == 1), alignments=[WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER])

    add_heading_2(doc, "7.3 MATRIZ DE SEGURIDAD DEL PROYECTO")
    add_body_p(doc, "Matriz de riesgos, vectores de ataque y controles de seguridad activos en el código:")

    # Tabla 7: Matriz de Seguridad
    t_sec = doc.add_table(rows=5, cols=4)
    t_sec.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_sec)
    format_header_row(t_sec.rows[0], [Inches(1.6), Inches(1.6), Inches(1.6), Inches(1.9)])

    sec_data = [
        ["Activo de Información", "Riesgo Identificado", "Ataque Posible", "Control de Seguridad Implementado"],
        ["Credenciales de acceso", "Robo de base de datos o fuga de contraseñas.", "Ataques de diccionario y fuerza bruta con GPU.", "Hashing con Argon2id (64 MiB memoria, 3 iteraciones, sal única de 16 bytes). Cumple estándar OWASP."],
        ["Sesión de usuario", "Secuestro de sesión o inyección de scripts.", "Session Hijacking, Robo por XSS.", "Tokens opacos de 256 bits almacenados como SHA-256 en BD; transmitidos solo por cookie HttpOnly, SameSite=Lax y Secure."],
        ["Mutaciones de datos", "Envío de solicitudes no autorizadas desde otros sitios.", "Cross-Site Request Forgery (CSRF).", "Middleware check_origin en FastAPI que valida encabezados Origin contra lista blanca estricta para POST, PUT, DELETE."],
        ["Datos de menores", "Acceso a historias clínicas de niños ajenos.", "Fuga de datos / BOLA (Broken Object Level Auth).", "Validación estricta de pertenencia en cada consulta SQL. Acceso no autorizado retorna 404 Not Found para evitar enumeración."]
    ]
    for r_idx, row in enumerate(sec_data):
        if r_idx == 0:
            for c_idx, val in enumerate(row):
                t_sec.cell(r_idx, c_idx).paragraphs[0].text = val
            format_header_row(t_sec.rows[0])
        else:
            for c_idx, val in enumerate(row):
                t_sec.cell(r_idx, c_idx).paragraphs[0].text = val
            format_body_row(t_sec.rows[r_idx], is_zebra=(r_idx % 2 == 1), alignments=[WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT])

    doc.add_page_break()

    # =========================================================================
    # 8. EVIDENCIAS DEL PROYECTO
    # =========================================================================
    add_heading_1(doc, "8. EVIDENCIAS DEL PROYECTO")
    add_body_p(doc, "El proyecto cuenta con un ecosistema completo de evidencias técnicas reproducibles:")

    add_body_p(doc, "a) Pruebas Automatizadas en Frontend (145 Pruebas Exitosas):", bold_prefix="• ")
    add_bullet_p(doc, "25 pruebas de routing declarativo ejecutadas mediante Node test runner oficial (tests/routing.test.mjs). Validan acceso a rutas públicas, bloqueo de accesos anónimos y aislamiento de roles.")
    add_bullet_p(doc, "120 pruebas de componentes ejecutadas con Vitest y React Testing Library en 7 suites de prueba (interacciones, proveedores, pantallas, límites de error y autenticación).")
    add_bullet_p(doc, "Script de control de calidad interno (scripts/check-frontend.mjs): verifica 278 archivos de código, garantizando un límite estricto de máximo 495 líneas por archivo.")

    add_body_p(doc, "b) Pruebas Automatizadas en Backend (63 Pruebas Exitosas):", bold_prefix="• ")
    add_bullet_p(doc, "63 pruebas unitarias y de integración ejecutadas mediante pytest, cubriendo hashing Argon2id, modelos relacionales, transacciones de citas, aislamiento de expedientes y concurrencia.")
    add_bullet_p(doc, "Verificación de 32 operaciones en OpenAPI documentadas y validadas con colección local de Postman con 109 aserciones superadas sin errores.")

    add_body_p(doc, "c) Métricas de Compilación y Rendimiento:", bold_prefix="• ")
    add_bullet_p(doc, "Compilación limpia en Vite (npm run build) sin chunks que excedan 500 kB (el bundle principal se redujo a 259.8 kB).")
    add_bullet_p(doc, "Cero vulnerabilidades reportadas por npm audit y análisis de tipos completo superado sin errores (tsc --noEmit).")

    # =========================================================================
    # 9. CONCLUSIONES
    # =========================================================================
    add_heading_1(doc, "9. CONCLUSIONES")
    add_body_p(doc, "1. Madurez Arquitectónica: ", bold_prefix="• ")
    add_body_p(doc, "Se logró con éxito la transición desde un prototipo estático monolítico hacia una arquitectura desacoplada de tres capas altamente escalable. La división clara entre React, FastAPI y PostgreSQL permite el desarrollo independiente y seguro de cada componente.")

    add_body_p(doc, "2. Estándares de Seguridad de Grado Industrial: ", bold_prefix="• ")
    add_body_p(doc, "La implementación de Argon2id para el resguardo de credenciales y la adopción de tokens de sesión opacos gestionados en base de datos mediante cookies HttpOnly elevan a ASHAKids por encima de las implementaciones promedio de proyectos académicos, cumpliendo los lineamientos de OWASP para el manejo de información sensible de menores de edad.")

    add_body_p(doc, "3. Operatividad Clínica Demostrada: ", bold_prefix="• ")
    add_body_p(doc, "El backend no se limita a operaciones CRUD genéricas, sino que implementa lógica de negocio especializada en telerehabilitación: detección de solapamientos en citas terapéuticas, preservación de expedientes mediante baja lógica (soft delete) y control del ciclo de vida de sesiones y reportes clínicos.")

    add_body_p(doc, "4. Calidad del Código y Mantenibilidad: ", bold_prefix="• ")
    add_body_p(doc, "La erradicación de más de 7,200 líneas de código monolítico en frontend y su descomposición en 278 componentes modulares bajo 500 líneas c/u, respaldados por 208 pruebas automatizadas combinadas (145 en frontend y 63 en backend), garantizan la sostenibilidad del proyecto hacia su entrega final.")

    # =========================================================================
    # 10. REFERENCIAS
    # =========================================================================
    add_heading_1(doc, "10. REFERENCIAS")
    referencias = [
        "Biryukov, A., Dinu, D., & Khovratovich, D. (2016). Argon2: the memory-hard function for password hashing and other applications. IETF RFC 9106.",
        "FastAPI Documentation. (2024). Dependencies with yield and Security scopes. Recuperado de: https://fastapi.tiangolo.com/tutorial/dependencies/",
        "Open Web Application Security Project (OWASP). (2023). OWASP Application Security Verification Standard (ASVS) 4.0.3 — Authentication and Session Management.",
        "PostgreSQL Global Development Group. (2024). PostgreSQL 17.6 Documentation: Concurrency Control and Foreign Keys. Recuperado de: https://www.postgresql.org/docs/",
        "React Router Documentation. (2024). Declarative Routing and Role-Based Guards in React Router v7. Recuperado de: https://reactrouter.com/",
        "SQLAlchemy Authors. (2024). SQLAlchemy 2.0 Asyncio and Mapped Column Documentation. Recuperado de: https://docs.sqlalchemy.org/en/20/"
    ]
    for r_text in referencias:
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.left_indent = Inches(0.4)
        p_ref.paragraph_format.first_line_indent = Inches(-0.4)
        p_ref.paragraph_format.space_after = Pt(4)
        p_ref.paragraph_format.line_spacing = 1.15
        r_run = p_ref.add_run(r_text)
        r_run.font.name = "Arial"
        r_run.font.size = Pt(9.5)

    # Guardar en las dos rutas
    doc.save(str(OUTPUT_DOCX_PRIMARY))
    doc.save(str(OUTPUT_DOCX_SECONDARY))
    print(f"Documento guardado con éxito en:")
    print(f"1) {OUTPUT_DOCX_PRIMARY}")
    print(f"2) {OUTPUT_DOCX_SECONDARY}")


if __name__ == "__main__":
    build_apf2_document()
