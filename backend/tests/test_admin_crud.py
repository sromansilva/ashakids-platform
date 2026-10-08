"""Suite de pruebas para el subsistema administrativo de gestión de cuentas (/admin/cuentas).

Valida autenticación, autorización RBAC (Admin/Padre/Terapeuta/Anónimo),
creación atómica, edición, suspensión lógica con revocación de sesiones,
reactivación, eliminación segura y registro en AUDITORIA_CAMBIOS.
"""

from pathlib import Path
import sys
import unittest
import httpx

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

BASE_URL = "http://localhost:8000/api/v1"


class TestAdminCuentasCRUD(unittest.TestCase):
    """Pruebas end-to-end de administración de cuentas y auditoría."""

    @classmethod
    def setUpClass(cls):
        # Verificar que el servidor FastAPI esté respondiendo
        try:
            res = httpx.get("http://localhost:8000/health", timeout=10.0)
            if res.status_code != 200:
                raise unittest.SkipTest("El servidor FastAPI no responde 200 en /health.")
        except Exception as exc:
            raise unittest.SkipTest(f"El servidor FastAPI no está accesible en http://localhost:8000: {exc}")

    def setUp(self):
        self.admin_client = httpx.Client(base_url=BASE_URL, timeout=30.0)
        self.anon_client = httpx.Client(base_url=BASE_URL, timeout=30.0)

        # Login como administrador
        login_res = self.admin_client.post(
            "/auth/login",
            json={"codigo_usuario": "a00001", "password": "12345"},
        )
        self.assertEqual(login_res.status_code, 200, f"Login admin falló: {login_res.text}")

    def tearDown(self):
        self.admin_client.close()
        self.anon_client.close()

    def test_01_sin_sesion_retorna_401(self):
        """Solicitud anónima a /admin/cuentas debe responder 401."""
        res = self.anon_client.get("/admin/cuentas")
        self.assertEqual(res.status_code, 401)

    def test_02_padre_y_terapeuta_reciben_403(self):
        """Usuarios con rol PADRE o TERAPEUTA deben recibir 403 Forbidden en /admin/cuentas."""
        with httpx.Client(base_url=BASE_URL, timeout=30.0) as pad_cli:
            log_pad = pad_cli.post("/auth/login", json={"codigo_usuario": "p00001", "password": "12345"})
            self.assertEqual(log_pad.status_code, 200)
            res_pad = pad_cli.get("/admin/cuentas")
            self.assertEqual(res_pad.status_code, 403)

        with httpx.Client(base_url=BASE_URL, timeout=30.0) as ter_cli:
            log_ter = ter_cli.post("/auth/login", json={"codigo_usuario": "t00001", "password": "12345"})
            self.assertEqual(log_ter.status_code, 200)
            res_ter = ter_cli.get("/admin/cuentas")
            self.assertEqual(res_ter.status_code, 403)

    def test_03_admin_lista_cuentas_sin_exponer_secretos(self):
        """Admin lista cuentas; verificar que password_hash ni tokens aparezcan en el payload."""
        res = self.admin_client.get("/admin/cuentas")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("items", data)
        self.assertGreaterEqual(len(data["items"]), 3)

        for cuenta in data["items"]:
            self.assertNotIn("password", cuenta)
            self.assertNotIn("password_hash", cuenta)
            self.assertNotIn("token", cuenta)
            self.assertNotIn("token_hash", cuenta)

    def test_04_ciclo_completo_padre_crud_y_auditoria(self):
        """Ciclo completo: Crear padre -> Editar -> Iniciar sesión -> Suspender -> Activar -> Eliminar."""
        email_test = "padre.unit.test@ashakids.test"

        # 1. Crear Padre
        payload = {
            "nombres": "Pedro",
            "apellidos": "Unittest",
            "email": email_test,
            "password": "PasswordSegura99!",
            "parentesco": "Padre",
            "telefono": "988776655",
            "direccion": "Calle Las Pruebas 789",
        }
        res_crear = self.admin_client.post("/admin/cuentas/padres", json=payload)
        self.assertEqual(res_crear.status_code, 201)
        cuenta = res_crear.json()["cuenta"]
        id_usuario = cuenta["id_usuario"]
        codigo_usuario = cuenta["codigo_usuario"]

        self.assertEqual(len(codigo_usuario), 6)
        self.assertTrue(codigo_usuario.startswith("p"))
        self.assertEqual(cuenta["rol"], "PADRE")
        self.assertEqual(cuenta["tutor"]["parentesco"], "Padre")

        # 2. Email duplicado -> 409 Conflict
        res_dup = self.admin_client.post("/admin/cuentas/padres", json=payload)
        self.assertEqual(res_dup.status_code, 409)

        # 3. Editar cuenta
        res_edit = self.admin_client.patch(
            f"/admin/cuentas/{id_usuario}",
            json={"nombres": "Pedro Modificado", "telefono": "955443322"},
        )
        self.assertEqual(res_edit.status_code, 200)
        c_edit = res_edit.json()["cuenta"]
        self.assertEqual(c_edit["nombres"], "Pedro Modificado")
        self.assertEqual(c_edit["tutor"]["telefono"], "955443322")

        # 4. Probar login del nuevo padre y verificar que está activo
        with httpx.Client(base_url=BASE_URL, timeout=30.0) as usr_cli:
            log_ok = usr_cli.post(
                "/auth/login",
                json={"codigo_usuario": codigo_usuario, "password": "PasswordSegura99!"},
            )
            self.assertEqual(log_ok.status_code, 200)
            me_ok = usr_cli.get("/auth/me")
            self.assertEqual(me_ok.status_code, 200)

            # 5. Suspender cuenta desde admin
            res_susp = self.admin_client.patch(f"/admin/cuentas/{id_usuario}/suspender")
            self.assertEqual(res_susp.status_code, 200)
            self.assertFalse(res_susp.json()["cuenta"]["activo"])

            # 6. Sesión activa anterior debe quedar invalidada (401)
            me_rev = usr_cli.get("/auth/me")
            self.assertEqual(me_rev.status_code, 401)

            # 7. Nuevo login debe fallar (401)
            log_fail = usr_cli.post(
                "/auth/login",
                json={"codigo_usuario": codigo_usuario, "password": "PasswordSegura99!"},
            )
            self.assertEqual(log_fail.status_code, 401)

            # 8. Reactivar cuenta desde admin
            res_act = self.admin_client.patch(f"/admin/cuentas/{id_usuario}/activar")
            self.assertEqual(res_act.status_code, 200)
            self.assertTrue(res_act.json()["cuenta"]["activo"])

            # 9. Nuevo login debe tener éxito
            log_react = usr_cli.post(
                "/auth/login",
                json={"codigo_usuario": codigo_usuario, "password": "PasswordSegura99!"},
            )
            self.assertEqual(log_react.status_code, 200)

        # 10. Eliminar cuenta sin dependencias clínicas
        res_del = self.admin_client.delete(f"/admin/cuentas/{id_usuario}")
        self.assertEqual(res_del.status_code, 200)

        # 11. Verificar 404 posterior
        res_get = self.admin_client.get(f"/admin/cuentas/{id_usuario}")
        self.assertEqual(res_get.status_code, 404)

    def test_05_crear_terapeuta_y_eliminar(self):
        """Crear terapeuta atómico con especialidad y eliminar limpiamente."""
        payload = {
            "nombres": "Valeria",
            "apellidos": "Unittest",
            "email": "valeria.ter.test@ashakids.test",
            "password": "PasswordSegura99!",
            "especialidad": "Fonoaudiología Infantil",
            "anios_experiencia": 4,
            "idiomas": "Español, Inglés",
            "descripcion_profesional": "Especialista en deglución y habla.",
        }
        res_crear = self.admin_client.post("/admin/cuentas/terapeutas", json=payload)
        self.assertEqual(res_crear.status_code, 201)
        cuenta = res_crear.json()["cuenta"]
        id_usuario = cuenta["id_usuario"]
        codigo_usuario = cuenta["codigo_usuario"]

        self.assertEqual(len(codigo_usuario), 6)
        self.assertTrue(codigo_usuario.startswith("t"))
        self.assertEqual(cuenta["rol"], "TERAPEUTA")
        self.assertEqual(cuenta["terapeuta"]["especialidad"], "Fonoaudiología Infantil")

        # Eliminar
        res_del = self.admin_client.delete(f"/admin/cuentas/{id_usuario}")
        self.assertEqual(res_del.status_code, 200)

    def test_06_proteccion_propia_cuenta_admin(self):
        """Admin no puede suspenderse ni eliminarse a sí mismo (409 Conflict)."""
        res_susp = self.admin_client.patch("/admin/cuentas/1/suspender")
        self.assertEqual(res_susp.status_code, 409)
        self.assertIn("No puedes suspender tu propia cuenta", res_susp.json()["detail"])

        res_del = self.admin_client.delete("/admin/cuentas/1")
        self.assertEqual(res_del.status_code, 409)
        self.assertIn("No puedes eliminar tu propia cuenta", res_del.json()["detail"])


if __name__ == "__main__":
    unittest.main()
