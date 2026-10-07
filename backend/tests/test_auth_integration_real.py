"""Prueba de integración real contra PostgreSQL en Supabase.

Esta suite ejecuta pruebas directas contra la base de datos real configurada en DATABASE_URL.
Si DATABASE_URL no se encuentra configurada en el entorno (.env), las pruebas de esta clase
se omiten automáticamente con SkipTest para no bloquear el ciclo de pruebas unitarias continuas.
"""

from datetime import datetime, timezone
import hashlib
from pathlib import Path
import sys
import unittest
import httpx
from sqlalchemy import select

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import settings
from app.core.database import init_db, async_engine, async_session_factory
from app.main import app
from app.models.auth import SesionAutenticacion, Usuario


class TestAuthIntegrationReal(unittest.IsolatedAsyncioTestCase):
    """Pruebas de integración contra PostgreSQL real mediante DATABASE_URL y asyncpg."""

    async def asyncSetUp(self):
        if not settings.effective_database_url:
            self.skipTest(
                "DATABASE_URL (o password/DB_PASSWORD) no está configurada en el entorno (.env). "
                "Se omite la prueba de integración contra PostgreSQL real."
            )
        init_db()
        if async_session_factory is None:
            self.skipTest(
                "El motor asíncrono hacia PostgreSQL no pudo inicializarse con DATABASE_URL. "
                "Verifique la conectividad de red y las credenciales."
            )
        transport = httpx.ASGITransport(app=app)
        self.client = httpx.AsyncClient(transport=transport, base_url="http://test")

    async def asyncTearDown(self):
        if hasattr(self, "client"):
            await self.client.aclose()
        if async_engine:
            await async_engine.dispose()

    async def test_01_login_inexistente_retorna_401(self):
        """1. Usuario inexistente: codigo_usuario = 'noexiste', password = '12345' -> HTTP 401."""
        res = await self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "noexis", "password": "12345"},
        )
        self.assertEqual(res.status_code, 401)
        self.assertIn("Credenciales incorrectas", res.json()["detail"])

    async def test_02_login_password_incorrecto_retorna_401(self):
        """2. Usuario existente con contraseña incorrecta -> HTTP 401."""
        res = await self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "p00001", "password": "wrong_password_999"},
        )
        self.assertEqual(res.status_code, 401)
        self.assertIn("Credenciales incorrectas", res.json()["detail"])

    async def test_03_login_correcto_y_persistencia_en_sesiones_auth(self):
        """3, 4 y 5. Login correcto con credenciales reales, registro en sesiones_autenticacion y consulta a /me."""
        res = await self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "p00001", "password": "12345"},
        )
        if res.status_code == 401:
            self.skipTest(
                "El usuario de prueba 'p00001' no está sembrado en la BD real. "
                "Ejecute scripts/seed_test_users.sql en Supabase para habilitar esta prueba."
            )

        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["user"]["codigo_usuario"], "p00001")
        self.assertEqual(data["user"]["rol"], "PADRE")

        cookie_val = res.cookies.get(settings.SESSION_COOKIE_NAME)
        self.assertIsNotNone(cookie_val)

        # 4. Verificar existencia del registro en la tabla sesiones_autenticacion en PostgreSQL real
        token_hash = hashlib.sha256(cookie_val.encode("utf-8")).hexdigest()
        async with async_session_factory() as session:
            stmt = select(SesionAutenticacion).where(SesionAutenticacion.token_hash == token_hash)
            result = await session.execute(stmt)
            db_session = result.scalar_one_or_none()
            self.assertIsNotNone(db_session, "La sesión debe estar registrada en sesiones_autenticacion de PostgreSQL")
            self.assertFalse(db_session.revocado)
            self.assertEqual(db_session.id_usuario, data["user"]["id_usuario"])

        # 5. /api/v1/auth/me obtiene la identidad desde la cookie y la sesión en PostgreSQL
        me_res = await self.client.get(
            "/api/v1/auth/me",
            cookies={settings.SESSION_COOKIE_NAME: cookie_val},
        )
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["codigo_usuario"], "p00001")
        self.assertEqual(me_res.json()["rol"], "PADRE")

        # Logout real y revocación en base de datos
        logout_res = await self.client.post(
            "/api/v1/auth/logout",
            cookies={settings.SESSION_COOKIE_NAME: cookie_val},
        )
        self.assertEqual(logout_res.status_code, 200)

        # Verificar que la sesión quedó marcada como revocada en PostgreSQL
        async with async_session_factory() as session:
            stmt = select(SesionAutenticacion).where(SesionAutenticacion.token_hash == token_hash)
            result = await session.execute(stmt)
            revoked_session = result.scalar_one_or_none()
            self.assertTrue(revoked_session.revocado)
            self.assertIsNotNone(revoked_session.fecha_cierre)

        # /me después del logout debe fallar con 401
        me_after = await self.client.get(
            "/api/v1/auth/me",
            cookies={settings.SESSION_COOKIE_NAME: cookie_val},
        )
        self.assertEqual(me_after.status_code, 401)

    async def test_04_padre_real_authorization_and_cross_role_403(self):
        """Verifica que un PADRE en Supabase real accede a /padres/me y es rechazado con 403 en otros roles."""
        login_res = await self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "p00001", "password": "12345"},
        )
        if login_res.status_code == 401:
            self.skipTest("Usuario p00001 no disponible en la BD real")

        cookie_val = login_res.cookies.get(settings.SESSION_COOKIE_NAME)

        # 1. Acceso a su endpoint propio -> 200 OK
        res_padre = await self.client.get(
            "/api/v1/padres/me",
            cookies={settings.SESSION_COOKIE_NAME: cookie_val},
        )
        self.assertEqual(res_padre.status_code, 200)
        self.assertEqual(res_padre.json()["user"]["rol"], "PADRE")

        # 2. Intento de acceso a terapeuta -> 403 Forbidden
        res_tera = await self.client.get(
            "/api/v1/terapeutas/me",
            cookies={settings.SESSION_COOKIE_NAME: cookie_val},
        )
        self.assertEqual(res_tera.status_code, 403)

        # 3. Intento de acceso a admin -> 403 Forbidden
        res_admin = await self.client.get(
            "/api/v1/admin/me",
            cookies={settings.SESSION_COOKIE_NAME: cookie_val},
        )
        self.assertEqual(res_admin.status_code, 403)

        await self.client.post("/api/v1/auth/logout", cookies={settings.SESSION_COOKIE_NAME: cookie_val})

    async def test_05_terapeuta_and_admin_real_authorization(self):
        """Verifica que TERAPEUTA y ADMIN acceden a sus endpoints respectivos y rechazan accesos cruzados."""
        # Terapeuta
        res_login_t = await self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "t00001", "password": "12345"},
        )
        if res_login_t.status_code == 200:
            cookie_t = res_login_t.cookies.get(settings.SESSION_COOKIE_NAME)
            res_t = await self.client.get(
                "/api/v1/terapeutas/me",
                cookies={settings.SESSION_COOKIE_NAME: cookie_t},
            )
            self.assertEqual(res_t.status_code, 200)

            # Terapeuta intentando acceder a padre -> 403
            res_cross = await self.client.get(
                "/api/v1/padres/me",
                cookies={settings.SESSION_COOKIE_NAME: cookie_t},
            )
            self.assertEqual(res_cross.status_code, 403)
            await self.client.post("/api/v1/auth/logout", cookies={settings.SESSION_COOKIE_NAME: cookie_t})

        # Administrador
        res_login_a = await self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "a00001", "password": "12345"},
        )
        if res_login_a.status_code == 200:
            cookie_a = res_login_a.cookies.get(settings.SESSION_COOKIE_NAME)
            res_a = await self.client.get(
                "/api/v1/admin/me",
                cookies={settings.SESSION_COOKIE_NAME: cookie_a},
            )
            self.assertEqual(res_a.status_code, 200)

            # Admin intentando acceder a padre -> 403
            res_admin_padre = await self.client.get(
                "/api/v1/padres/me",
                cookies={settings.SESSION_COOKIE_NAME: cookie_a},
            )
            self.assertEqual(res_admin_padre.status_code, 403)
            await self.client.post("/api/v1/auth/logout", cookies={settings.SESSION_COOKIE_NAME: cookie_a})


if __name__ == "__main__":
    unittest.main()
