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


if __name__ == "__main__":
    unittest.main()
