"""Pruebas de integración de la API REST de autenticación y endpoints."""

import unittest
from pathlib import Path
import sys
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import settings
from app.main import app


class TestAuthAPI(unittest.TestCase):
    """Pruebas sobre los endpoints de autenticación y documentación."""

    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "healthy")

    def test_docs_and_openapi(self):
        res_docs = self.client.get("/docs")
        self.assertEqual(res_docs.status_code, 200)

        res_openapi = self.client.get("/openapi.json")
        self.assertEqual(res_openapi.status_code, 200)
        paths = res_openapi.json()["paths"]
        self.assertIn("/api/v1/auth/login", paths)
        self.assertIn("/api/v1/auth/logout", paths)
        self.assertIn("/api/v1/auth/me", paths)

    def test_login_invalid_credentials(self):
        res = self.client.post(
            "/api/v1/auth/login",
            json={"email": "padre@ashakids.test", "password": "wrongpassword"},
        )
        self.assertEqual(res.status_code, 401)
        self.assertIn("Credenciales incorrectas", res.json()["detail"])

    def test_login_success_padre(self):
        res = self.client.post(
            "/api/v1/auth/login",
            json={"email": "padre@ashakids.test", "password": "12345"},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("user", data)
        user = data["user"]
        self.assertEqual(user["email"], "padre@ashakids.test")
        self.assertEqual(user["rol"], "PADRE")
        self.assertNotIn("password_hash", user)
        self.assertNotIn("password", user)

        # Verificar cookie HttpOnly
        self.assertIn(settings.SESSION_COOKIE_NAME, res.cookies)

    def test_login_success_terapeuta_and_admin(self):
        # Terapeuta
        res_t = self.client.post(
            "/api/v1/auth/login",
            json={"email": "terapeuta@ashakids.test", "password": "12345"},
        )
        self.assertEqual(res_t.status_code, 200)
        self.assertEqual(res_t.json()["user"]["rol"], "TERAPEUTA")

        # Admin
        res_a = self.client.post(
            "/api/v1/auth/login",
            json={"email": "admin@ashakids.test", "password": "12345"},
        )
        self.assertEqual(res_a.status_code, 200)
        self.assertEqual(res_a.json()["user"]["rol"], "ADMIN")

    def test_me_and_logout_flow(self):
        # 1. Intentar /me sin sesión
        res_unauth = self.client.get("/api/v1/auth/me")
        self.assertEqual(res_unauth.status_code, 401)

        # 2. Iniciar sesión
        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"email": "padre@ashakids.test", "password": "12345"},
        )
        self.assertEqual(login_res.status_code, 200)
        session_token = login_res.cookies[settings.SESSION_COOKIE_NAME]

        # 3. Consultar /me con la cookie
        me_res = self.client.get(
            "/api/v1/auth/me",
            cookies={settings.SESSION_COOKIE_NAME: session_token},
        )
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["email"], "padre@ashakids.test")
        self.assertEqual(me_res.json()["rol"], "PADRE")

        # 4. Cerrar sesión
        logout_res = self.client.post(
            "/api/v1/auth/logout",
            cookies={settings.SESSION_COOKIE_NAME: session_token},
        )
        self.assertEqual(logout_res.status_code, 200)


if __name__ == "__main__":
    unittest.main()
