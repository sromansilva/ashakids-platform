"""Pruebas unitarias para los modelos SQLAlchemy 2.x de ASHAKids.

Verifica la estructura declarativa, columnas, restricciones (UNIQUE) y relaciones
para Perfiles, Logros, PerfilLogros, Pacientes y Usuarios.
"""

from pathlib import Path
import sys
import unittest

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import inspect
from sqlalchemy.orm import configure_mappers
from app.models.auth import Usuario, Rol, Administrador, UsuarioRol, SesionAutenticacion
from app.models.perfiles import Paciente, Perfil, Logro, PerfilLogro


class TestModels(unittest.TestCase):
    """Verificación de mapeo e integridad de modelos SQLAlchemy 2.x."""

    @classmethod
    def setUpClass(cls):
        configure_mappers()

    def test_usuario_columns_and_constraints(self):
        mapper = inspect(Usuario)
        columns = {c.key: c for c in mapper.columns}

        self.assertIn("codigo_usuario", columns)
        codigo_col = columns["codigo_usuario"]
        self.assertEqual(codigo_col.type.length, 6, "codigo_usuario debe ser VARCHAR(6)")
        self.assertFalse(codigo_col.nullable, "codigo_usuario debe ser NOT NULL")
        self.assertTrue(codigo_col.unique, "codigo_usuario debe ser UNIQUE")

        self.assertIn("email", columns)
        self.assertEqual(columns["email"].type.length, 150)
        self.assertFalse(columns["email"].nullable)

        self.assertIn("nombres", columns)
        self.assertEqual(columns["nombres"].type.length, 60)

        self.assertIn("apellidos", columns)
        self.assertEqual(columns["apellidos"].type.length, 80)

    def test_perfil_columns_and_relations(self):
        mapper = inspect(Perfil)
        columns = {c.key: c for c in mapper.columns}

        required_cols = [
            "id_perfil",
            "id_paciente",
            "progreso",
            "racha_dias",
            "objetivos_totales",
            "objetivos_completados",
            "actividades_desarrolladas_total",
            "sesiones_totales",
            "fecha_ultima_sesion",
            "experiencia",
            "nivel",
        ]
        for col in required_cols:
            self.assertIn(col, columns, f"Columna '{col}' debe existir en Perfil")

        # Restricción UNIQUE en id_paciente
        id_paciente_col = columns["id_paciente"]
        self.assertTrue(id_paciente_col.unique, "id_paciente debe reflejar la restricción UNIQUE")
        self.assertFalse(id_paciente_col.nullable, "id_paciente debe ser NOT NULL")

        # Relación 1:1 con Paciente
        rel_paciente = mapper.relationships.get("paciente")
        self.assertIsNotNone(rel_paciente, "Perfil debe relacionarse con Paciente")
        self.assertFalse(rel_paciente.uselist, "Relación Perfil -> Paciente debe ser 1:1 (uselist=False)")

        # Relación 1:N con PerfilLogros
        rel_logros = mapper.relationships.get("perfil_logros")
        self.assertIsNotNone(rel_logros, "Perfil debe relacionarse con PerfilLogro")
        self.assertTrue(rel_logros.uselist, "Relación Perfil -> PerfilLogro debe ser 1:N (uselist=True)")

    def test_logro_columns_and_relations(self):
        mapper = inspect(Logro)
        columns = {c.key: c for c in mapper.columns}

        required_cols = [
            "id_logro",
            "nombre_logro",
            "experiencia_logro",
            "requisito_logro",
            "icono_logro",
        ]
        for col in required_cols:
            self.assertIn(col, columns, f"Columna '{col}' debe existir en Logro")

        # Relación 1:N con PerfilLogros
        rel_perfiles = mapper.relationships.get("perfil_logros")
        self.assertIsNotNone(rel_perfiles, "Logro debe relacionarse con PerfilLogro")
        self.assertTrue(rel_perfiles.uselist, "Relación Logro -> PerfilLogro debe ser 1:N (uselist=True)")

    def test_perfil_logro_columns_and_constraints(self):
        mapper = inspect(PerfilLogro)
        columns = {c.key: c for c in mapper.columns}

        required_cols = [
            "id_perfil_logro",
            "id_perfil",
            "id_logro",
            "fecha_obtencion",
        ]
        for col in required_cols:
            self.assertIn(col, columns, f"Columna '{col}' debe existir en PerfilLogro")

        # Verificar restricción UNIQUE compuesta (id_perfil, id_logro)
        table = mapper.persist_selectable
        unique_constraints = [
            list(c.columns.keys()) for c in table.constraints if c.__class__.__name__ == "UniqueConstraint"
        ]
        self.assertTrue(
            any(set(cols) == {"id_perfil", "id_logro"} for cols in unique_constraints),
            "Debe existir la restricción UNIQUE(id_perfil, id_logro) en perfil_logros",
        )

    def test_paciente_columns_and_relations(self):
        mapper = inspect(Paciente)
        columns = {c.key: c for c in mapper.columns}

        required_cols = [
            "id_paciente",
            "id_tutor",
            "nombres_paciente",
            "apellidos_paciente",
            "fecha_nacimiento",
            "sexo",
            "activo",
            "fecha_registro",
        ]
        for col in required_cols:
            self.assertIn(col, columns, f"Columna '{col}' debe existir en Paciente")

        # Relación 1:1 con Perfil
        rel_perfil = mapper.relationships.get("perfil")
        self.assertIsNotNone(rel_perfil, "Paciente debe tener relación con Perfil")
        self.assertFalse(rel_perfil.uselist, "Relación Paciente -> Perfil debe ser 1:1 (uselist=False)")


if __name__ == "__main__":
    unittest.main()
