"""Generador del Reporte Word para ASHAKids - Fase 1."""

import os
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

DOCS_DIR = Path(__file__).resolve().parent
OUTPUT_DOCX = DOCS_DIR / "ASHAKids_Reporte_Fase_1_Configuracion_y_Hashing.docx"


def set_cell_background(cell, fill_hex):
    """Establece el color de fondo de una celda de tabla."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)


def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Ajusta márgenes internos de una celda."""
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


def build_report():
    doc = Document()

    # Configuración de márgenes de página
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Colores corporativos ASHAKids
    c_primary = RGBColor(0x3B, 0x1E, 0x7A)    # Violeta oscuro institucional
    c_secondary = RGBColor(0x6D, 0x28, 0xD9)  # Violeta vibrante
    c_dark = RGBColor(0x1F, 0x29, 0x37)       # Gris texto oscuro
    c_gray = RGBColor(0x4B, 0x55, 0x63)       # Gris texto secundario
    c_success = RGBColor(0x05, 0x96, 0x69)    # Verde confirmación

    # -------------------------------------------------------------
    # ENCABEZADO Y TÍTULO PRINCIPAL
    # -------------------------------------------------------------
    p_pre = doc.add_paragraph()
    p_pre.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run_pre = p_pre.add_run("ASHAKids Platform — Arquitectura y Seguridad")
    run_pre.font.name = "Calibri"
    run_pre.font.size = Pt(11)
    run_pre.font.bold = True
    run_pre.font.color.rgb = c_secondary

    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(4)
    title_p.paragraph_format.space_after = Pt(8)
    title_run = title_p.add_run("Reporte Técnico: Fase 1\nConfiguración Segura y Sistema de Hashing")
    title_run.font.name = "Calibri"
    title_run.font.size = Pt(22)
    title_run.font.bold = True
    title_run.font.color.rgb = c_primary

    # Metadata resumen
    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_after = Pt(18)
    meta_run = meta_p.add_run(
        "Rama de trabajo: feat/nlavadom  |  Algoritmo: Argon2id  |  Entorno: Python 3.13 / FastAPI\n"
        "Tipo de Autenticación: Propia (Sin Supabase Auth)  |  Estado: Validación Exitosa"
    )
    meta_run.font.name = "Calibri"
    meta_run.font.size = Pt(9.5)
    meta_run.font.color.rgb = c_gray

    def add_section_header(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)
        hrun = h.add_run(text)
        hrun.font.name = "Calibri"
        hrun.font.size = Pt(13)
        hrun.font.bold = True
        hrun.font.color.rgb = c_primary
        return h

    # -------------------------------------------------------------
    # 1. ARCHIVOS CREADOS Y MODIFICADOS
    # -------------------------------------------------------------
    add_section_header("1. Archivos Creados y Modificados")
    
    files_data = [
        (".gitignore", "Modificado", "Actualizado con reglas exhaustivas para *.env, .env, .env.*, preservando !.env.example."),
        ("backend/.env", "Actualizado", "Contiene las credenciales reales de Supabase. Ignorado estrictamente por Git."),
        ("backend/.env.example", "Preservado", "Plantilla de variables sin credenciales reales ni secretos."),
        ("backend/app/core/config.py", "Refactorizado", "Configuración centralizada con pydantic-settings; elimina antipatrón os.getenv."),
        ("backend/app/core/security.py", "Creado", "Funciones hash_password() y verify_password() con Argon2id."),
        ("backend/requirements.txt", "Actualizado", "Incorpora argon2-cffi>=23.1.0 y python-docx>=1.1.0."),
        ("backend/scripts/create_test_users.py", "Creado", "Script generador de hashes Argon2id y validación para usuarios de prueba."),
        ("backend/scripts/seed_test_users.sql", "Generado", "Seed SQL con los hashes generados, sin ejecución destructiva directa."),
        ("backend/tests/test_auth_security.py", "Creado", "Suite de pruebas unitarias para configuración y hashing (7 tests)."),
        ("docs/ (Carpeta raíz)", "Creado", "Directorio dedicado para el resguardo de reportes técnicos en formato Word."),
    ]

    t_files = doc.add_table(rows=1, cols=3)
    t_files.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = t_files.rows[0].cells
    hdr_cells[0].text = "Archivo / Ruta"
    hdr_cells[1].text = "Acción"
    hdr_cells[2].text = "Descripción Técnica"

    for c in hdr_cells:
        set_cell_background(c, "3B1E7A")
        set_cell_margins(c, 80, 80, 100, 100)
        for p in c.paragraphs:
            for r in p.runs:
                r.font.name = "Calibri"
                r.font.bold = True
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    for row_idx, (f_path, f_action, f_desc) in enumerate(files_data):
        row = t_files.add_row()
        cells = row.cells
        cells[0].text = f_path
        cells[1].text = f_action
        cells[2].text = f_desc
        bg = "F9FAFB" if row_idx % 2 == 0 else "FFFFFF"
        for i, c in enumerate(cells):
            set_cell_background(c, bg)
            set_cell_margins(c, 60, 60, 80, 80)
            for p in c.paragraphs:
                for r in p.runs:
                    r.font.name = "Calibri"
                    r.font.size = Pt(9)
                    r.font.color.rgb = c_dark
                    if i == 1 and f_action == "Creado":
                        r.font.bold = True
                        r.font.color.rgb = c_secondary

    # -------------------------------------------------------------
    # 2. DEPENDENCIAS AGREGADAS
    # -------------------------------------------------------------
    add_section_header("2. Dependencias Agregadas")
    p_dep = doc.add_paragraph()
    p_dep.paragraph_format.space_after = Pt(6)
    p_dep.add_run(
        "• argon2-cffi (v25.1.0): Enlace CFFI oficial para la implementación de referencia de Argon2. "
        "Permite el uso del algoritmo Argon2id, resistente a ataques acelerados por GPU y side-channel.\n"
        "• python-docx (v1.2.0): Biblioteca para la generación automática de la documentación de reporte en formato Word.\n"
        "• pydantic-settings (v2.15.0): Ya instalada en Fase 0, ahora utilizada de forma idiomática para la carga de .env."
    )
    for r in p_dep.runs:
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.color.rgb = c_dark

    # -------------------------------------------------------------
    # 3. ESTRUCTURA FINAL
    # -------------------------------------------------------------
    add_section_header("3. Estructura Final del Repositorio")
    p_tree = doc.add_paragraph()
    p_tree.paragraph_format.space_after = Pt(8)
    tree_text = (
        "ashakid/\n"
        "├── backend/\n"
        "│   ├── .env               <- Credenciales reales (IGNORADO POR GIT)\n"
        "│   ├── .env.example       <- Plantilla pública sin secretos\n"
        "│   ├── requirements.txt   <- Dependencias Python\n"
        "│   ├── app/\n"
        "│   │   ├── main.py        <- Aplicación FastAPI con /health\n"
        "│   │   └── core/\n"
        "│   │       ├── config.py  <- Carga centralizada con pydantic-settings\n"
        "│   │       └── security.py<- Hashing y verificación Argon2id\n"
        "│   ├── scripts/\n"
        "│   │   ├── create_test_users.py <- Generación de hashes y validación\n"
        "│   │   └── seed_test_users.sql  <- Seed SQL con hashes de prueba\n"
        "│   └── tests/\n"
        "│       └── test_auth_security.py<- Suite de pruebas unitarias\n"
        "├── docs/                  <- Reportes técnicos en formato Word (.docx)\n"
        "├── frontend/              <- Aplicación React + TypeScript + Vite\n"
        "└── .gitignore             <- Reglas de protección de secretos"
    )
    run_tree = p_tree.add_run(tree_text)
    run_tree.font.name = "Consolas"
    run_tree.font.size = Pt(8.5)
    run_tree.font.color.rgb = c_dark

    # -------------------------------------------------------------
    # 4. CARGA DE CONFIGURACIÓN (.env)
    # -------------------------------------------------------------
    add_section_header("4. Cómo se Carga .env y Corrección Conceptual")
    p_cfg = doc.add_paragraph()
    p_cfg.paragraph_format.space_after = Pt(6)
    p_cfg.add_run(
        "Se corrigió el error conceptual detectado en config.py, en el cual se habían ubicado valores reales como nombres "
        "de variables en os.getenv().\n"
        "La nueva implementación utiliza SettingsConfigDict de pydantic-settings, configurando:\n"
        "    env_file = (BACKEND_DIR / '.env', '.env')\n"
        "Esto garantiza que backend/.env se resuelva de forma determinista sin importar si el comando uvicorn se ejecuta "
        "desde la raíz o desde la carpeta backend/. Todos los módulos acceden a la configuración importando el singleton settings, "
        "sin invocar os.getenv() directamente en el código de la aplicación."
    )
    for r in p_cfg.runs:
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.color.rgb = c_dark

    # -------------------------------------------------------------
    # 5. SEGURIDAD DEL ARCHIVO .env Y .gitignore
    # -------------------------------------------------------------
    add_section_header("5. Confirmación de Seguridad en Git")
    p_git = doc.add_paragraph()
    p_git.paragraph_format.space_after = Pt(6)
    p_git.add_run(
        "✔ .gitignore verificado: Incluye las directivas .env, .env.* y *.env.\n"
        "✔ Excepción explícita: !.env.example y !*/.env.example permiten versionar la plantilla sin exponer secretos.\n"
        "✔ Verificación git check-ignore: Ejecutada sobre backend/.env, confirmando que el archivo está completamente ignorado.\n"
        "✔ Cero credenciales expuestas: Ni la URL real de Supabase ni la API key anon aparecen en el código versionado, "
        "commits, README ni en este documento."
    )
    for r in p_git.runs:
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.color.rgb = c_dark

    # -------------------------------------------------------------
    # 6. INTEGRIDAD DE .env.example
    # -------------------------------------------------------------
    add_section_header("6. Confirmación sobre .env.example")
    p_ex = doc.add_paragraph()
    p_ex.paragraph_format.space_after = Pt(6)
    p_ex.add_run(
        "El archivo backend/.env.example contiene únicamente placeholders declarativos:\n"
        "    SUPABASE_URL=https://your-project.supabase.co\n"
        "    SUPABASE_KEY=your-supabase-key-placeholder\n"
        "No existe ninguna credencial ni dato real del proyecto en la plantilla."
    )
    for r in p_ex.runs:
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.color.rgb = c_dark

    # -------------------------------------------------------------
    # 7. ALGORITMO DE HASHING CRIPTOGRÁFICO
    # -------------------------------------------------------------
    add_section_header("7. Algoritmo de Hashing Criptográfico")
    p_alg = doc.add_paragraph()
    p_alg.paragraph_format.space_after = Pt(6)
    p_alg.add_run(
        "Se adoptó el algoritmo Argon2id mediante argon2-cffi.PasswordHasher con los parámetros recomendados por OWASP:\n"
        "• Tipo: Type.ID (Argon2id) — Máxima protección híbrida contra ataques de canal lateral y paralelismo GPU.\n"
        "• Memoria (memory_cost): 65536 KiB (64 MiB).\n"
        "• Tiempo (time_cost): 3 iteraciones.\n"
        "• Paralelismo: 4 carriles (threads).\n"
        "• Longitud de sal: 16 bytes generados aleatoriamente por cada contraseña.\n"
        "• Longitud de hash: 32 bytes de salida."
    )
    for r in p_alg.runs:
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.color.rgb = c_dark

    # -------------------------------------------------------------
    # 8. RESULTADO DE PRUEBAS UNITARIAS
    # -------------------------------------------------------------
    add_section_header("8. Resultado de Pruebas de Hashing y Configuración")
    p_test = doc.add_paragraph()
    p_test.paragraph_format.space_after = Pt(6)
    p_test.add_run(
        "Se ejecutó la suite de pruebas unitarias (backend/tests/test_auth_security.py) con unittest:\n"
        "• Ran 7 tests in 0.765s — STATUS: OK\n\n"
        "Casos verificados:\n"
        "1. Carga de metadatos (PROJECT_NAME, VERSION, API_V1_PREFIX): PASS\n"
        "2. Lectura segura de SUPABASE_URL y SUPABASE_KEY desde .env: PASS\n"
        "3. Producción de prefijo estándar $argon2id$v=19$: PASS\n"
        "4. Verificación exitosa de contraseña correcta ('12345' -> True): PASS\n"
        "5. Rechazo inmediato de contraseña errónea ('incorrect_pass' -> False): PASS\n"
        "6. Manejo seguro de entradas vacías o hashes malformados: PASS\n"
        "7. Verificación de salts únicos: Dos llamadas consecutivas con '12345' produjeron hashes distintos, "
        "y ambos verificaron como True: PASS"
    )
    for r in p_test.runs:
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.color.rgb = c_dark

    # -------------------------------------------------------------
    # 9. USUARIOS DE PRUEBA PREPARADOS
    # -------------------------------------------------------------
    add_section_header("9. Preparación de Usuarios de Prueba")
    
    users_data = [
        ("PADRE", "padre@ashakids.test", "12345", "$argon2id$v=19$m=65536,t=3,p=4$...", "Rol 'padre' / 'tutor'"),
        ("TERAPEUTA", "terapeuta@ashakids.test", "12345", "$argon2id$v=19$m=65536,t=3,p=4$...", "Rol 'terapeuta'"),
        ("ADMINISTRADOR", "admin@ashakids.test", "12345", "$argon2id$v=19$m=65536,t=3,p=4$...", "Rol 'admin' / 'administrador'"),
    ]

    t_users = doc.add_table(rows=1, cols=5)
    t_users.alignment = WD_TABLE_ALIGNMENT.CENTER
    u_hdrs = t_users.rows[0].cells
    u_hdrs[0].text = "Perfil"
    u_hdrs[1].text = "Email"
    u_hdrs[2].text = "Password (Dev)"
    u_hdrs[3].text = "Algoritmo / Hash"
    u_hdrs[4].text = "Asignación Rol"

    for c in u_hdrs:
        set_cell_background(c, "6D28D9")
        set_cell_margins(c, 80, 80, 100, 100)
        for p in c.paragraphs:
            for r in p.runs:
                r.font.name = "Calibri"
                r.font.bold = True
                r.font.size = Pt(9)
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    for row_idx, (u_prof, u_email, u_pwd, u_algo, u_rol) in enumerate(users_data):
        row = t_users.add_row()
        cells = row.cells
        cells[0].text = u_prof
        cells[1].text = u_email
        cells[2].text = u_pwd
        cells[3].text = u_algo
        cells[4].text = u_rol
        bg = "F9FAFB" if row_idx % 2 == 0 else "FFFFFF"
        for c in cells:
            set_cell_background(c, bg)
            set_cell_margins(c, 60, 60, 80, 80)
            for p in c.paragraphs:
                for r in p.runs:
                    r.font.name = "Calibri"
                    r.font.size = Pt(8.5)
                    r.font.color.rgb = c_dark

    p_seed_desc = doc.add_paragraph()
    p_seed_desc.paragraph_format.space_before = Pt(6)
    p_seed_desc.paragraph_format.space_after = Pt(8)
    p_seed_desc.add_run(
        "Se generó el archivo backend/scripts/seed_test_users.sql que contiene las sentencias INSERT ... ON CONFLICT "
        "para la tabla usuarios y asignaciones en usuario_roles. Este archivo no se ejecuta automáticamente en la base de datos "
        "para preservar el esquema como fuente de verdad y evitar modificaciones no solicitadas."
    )
    for r in p_seed_desc.runs:
        r.font.name = "Calibri"
        r.font.size = Pt(9)
        r.font.color.rgb = c_gray

    # -------------------------------------------------------------
    # 10. DECISIONES PENDIENTES PARA LA SIGUIENTE FASE
    # -------------------------------------------------------------
    add_section_header("10. Decisiones Técnicas Pendientes para la Siguiente Fase")
    p_pend = doc.add_paragraph()
    p_pend.paragraph_format.space_after = Pt(12)
    p_pend.add_run(
        "1. Driver de Base de Datos: Definir si se utilizará conexión PostgreSQL directa (SQLAlchemy 2.0 con asyncpg o psycopg3) "
        "o cliente API REST PostgREST para acceder a las tablas usuarios, sesiones_autenticacion y roles.\n"
        "2. Mecanismo de Sesión: Definir el formato de sesiones_autenticacion (tokens criptográficos opacos almacenados en DB "
        "o JWTs firmados por FastAPI y validados contra sesiones_autenticacion).\n"
        "3. Endpoints de Autenticación: Diseñar los endpoints POST /api/v1/auth/login y POST /api/v1/auth/logout que recibirán "
        "las credenciales, verificarán con verify_password() y registrarán la sesión."
    )
    for r in p_pend.runs:
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.color.rgb = c_dark

    doc.save(str(OUTPUT_DOCX))
    print(f"[OK] Documento Word generado exitosamente en: {OUTPUT_DOCX}")


if __name__ == "__main__":
    build_report()
