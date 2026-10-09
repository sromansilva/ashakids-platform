"""Suite de pruebas unittest para verificación de dependencias en DELETE de cuentas.
Ejecuta la auditoría integral en un único ciclo de eventos asyncio.
"""

from pathlib import Path
import sys
import unittest
import asyncio

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from tests.run_delete_dependencies_audit import main as run_audit_main


class TestDeleteDependenciesSecurity(unittest.TestCase):
    """Pruebas de seguridad de dependencias para DELETE de cuentas."""

    def test_auditoria_completa_dependencias_delete(self):
        """Ejecuta la suite integral de verificación de dependencias y DELETE físico."""
        from tests.live_environment import isolated_live_api
        try:
            isolated_live_api()
        except RuntimeError as exc:
            self.skipTest(str(exc))
        asyncio.run(run_audit_main())


if __name__ == "__main__":
    unittest.main()
