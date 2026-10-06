"""Pruebas unitarias para la API REST de autenticación y sesiones de ASHAKids.

Utiliza un doble de prueba en memoria (FakeAsyncSession) que aísla las pruebas unitarias
de la base de datos externa de Supabase sin recurrir a fallbacks en el código de producción.
"""

from datetime import datetime, timezone
from pathlib import Path
import sys
import unittest
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import settings
from app.core.database import get_db
from app.core.security import hash_password
from app.main import app
from app.models.auth import Rol, SesionAutenticacion, Usuario, UsuarioRol


class MockScalarResult:
    """Resultado simulado para métodos scalar_one_or_none de SQLAlchemy."""
    def __init__(self, val):
        self._val = val

    def scalar_one_or_none(self):
        return self._val


class FakeAsyncSession:
    """Sesión asíncrona en memoria para pruebas unitarias aisladas."""

    def __init__(self, users=None):
        self.users = {u.codigo_usuario: u for u in (users or [])}
        self.sessions = {}  # token_hash -> SesionAutenticacion

    def add(self, obj):
        if isinstance(obj, SesionAutenticacion):
            self.sessions[obj.token_hash] = obj
            for u in self.users.values():
                if u.id_usuario == obj.id_usuario:
                    obj.usuario = u
                    break

    async def flush(self):
        pass

    async def commit(self):
        pass

    async def rollback(self):
        pass

    async def execute(self, stmt):
        entity = stmt.column_descriptions[0]["entity"]
        params = stmt.compile().params

        if entity is Usuario:
            codigo = next((v for k, v in params.items() if "codigo_usuario" in k), None)
            user = self.users.get(codigo)
            if user and not user.activo:
                return MockScalarResult(None)
            return MockScalarResult(user)

        if entity is SesionAutenticacion:
            token_hash = next((v for k, v in params.items() if "token_hash" in k), None)
            sesion = self.sessions.get(token_hash)
            if sesion and sesion.revocado:
                return MockScalarResult(None)
            return MockScalarResult(sesion)

        return MockScalarResult(None)


def build_test_users():
    """Genera usuarios de prueba con hashes Argon2id y roles asociados."""
    # Hash Argon2id para '12345'
    pwd_hash = hash_password("12345")

    # 1. Padre (codigo p00001)
    u_padre = Usuario(
        id_usuario=1,
        nombres="Padre",
        apellidos="Familia",
        codigo_usuario="p00001",
        email="padre@ashakids.test",
        password_hash=pwd_hash,
        activo=True,
    )
    r_padre = Rol(id_rol=1, nombre_rol="PADRE")
    ur_padre = UsuarioRol(id_usuario_rol=1, id_usuario=1, id_rol=1, activo=True)
    ur_padre.rol = r_padre
    u_padre.roles_asignados = [ur_padre]

    # 2. Terapeuta (codigo t00001)
    u_tera = Usuario(
        id_usuario=2,
        nombres="Terapeuta",
        apellidos="Especialista",
        codigo_usuario="t00001",
        email="terapeuta@ashakids.test",
        password_hash=pwd_hash,
        activo=True,
    )
    r_tera = Rol(id_rol=2, nombre_rol="TERAPEUTA")
    ur_tera = UsuarioRol(id_usuario_rol=2, id_usuario=2, id_rol=2, activo=True)
    ur_tera.rol = r_tera
    u_tera.roles_asignados = [ur_tera]

    # 3. Administrador (codigo a00001)
    u_admin = Usuario(
        id_usuario=3,
        nombres="Administrador",
        apellidos="Sistema",
        codigo_usuario="a00001",
        email="admin@ashakids.test",
        password_hash=pwd_hash,
        activo=True,
    )
    r_admin = Rol(id_rol=3, nombre_rol="ADMIN")
    ur_admin = UsuarioRol(id_usuario_rol=3, id_usuario=3, id_rol=3, activo=True)
    ur_admin.rol = r_admin
    u_admin.roles_asignados = [ur_admin]

    # 4. Usuario Inactivo (codigo i00001)
    u_inactivo = Usuario(
        id_usuario=4,
        nombres="Inactivo",
        apellidos="Prueba",
        codigo_usuario="i00001",
        email="inactivo@ashakids.test",
        password_hash=pwd_hash,
        activo=False,
    )
    ur_inactivo = UsuarioRol(id_usuario_rol=4, id_usuario=4, id_rol=1, activo=True)
    ur_inactivo.rol = r_padre
    u_inactivo.roles_asignados = [ur_inactivo]

    # 5. Usuario con código con prefijo cruzado (codigo p99999 pero rol ADMIN)
    # Demuestra que el rol se obtiene de la BD y NO del prefijo
    u_cruzado = Usuario(
        id_usuario=5,
        nombres="Cruzado",
        apellidos="Prefijo",
        codigo_usuario="p99999",
        email="cruzado@ashakids.test",
        password_hash=pwd_hash,
        activo=True,
    )
    ur_cruzado = UsuarioRol(id_usuario_rol=5, id_usuario=5, id_rol=3, activo=True)
    ur_cruzado.rol = r_admin
    u_cruzado.roles_asignados = [ur_cruzado]

    return [u_padre, u_tera, u_admin, u_inactivo, u_cruzado]


class TestAuthAPI(unittest.TestCase):
    """Pruebas unitarias de los endpoints de autenticación y sesión."""

    def setUp(self):
        self.fake_db = FakeAsyncSession(users=build_test_users())

        async def override_get_db():
            yield self.fake_db

        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()

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

    def test_login_invalid_credentials_wrong_password(self):
        res = self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "p00001", "password": "wrongpassword"},
        )
        self.assertEqual(res.status_code, 401)
        self.assertIn("Credenciales incorrectas", res.json()["detail"])

    def test_login_invalid_credentials_nonexistent_code(self):
        res = self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "noexis", "password": "12345"},
        )
        self.assertEqual(res.status_code, 401)
        self.assertIn("Credenciales incorrectas", res.json()["detail"])

    def test_login_inactive_user_rejected(self):
        res = self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "i00001", "password": "12345"},
        )
        self.assertEqual(res.status_code, 401)

    def test_login_success_padre(self):
        res = self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "p00001", "password": "12345"},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("user", data)
        user = data["user"]
        self.assertEqual(user["codigo_usuario"], "p00001")
        self.assertEqual(user["rol"], "PADRE")
        self.assertNotIn("password_hash", user)
        self.assertNotIn("password", user)

        # Cookie HttpOnly emitida
        self.assertIn(settings.SESSION_COOKIE_NAME, res.cookies)

    def test_login_success_terapeuta_and_admin(self):
        # Terapeuta
        res_t = self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "t00001", "password": "12345"},
        )
        self.assertEqual(res_t.status_code, 200)
        self.assertEqual(res_t.json()["user"]["rol"], "TERAPEUTA")
        self.assertEqual(res_t.json()["user"]["codigo_usuario"], "t00001")

        # Admin
        res_a = self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "a00001", "password": "12345"},
        )
        self.assertEqual(res_a.status_code, 200)
        self.assertEqual(res_a.json()["user"]["rol"], "ADMIN")
        self.assertEqual(res_a.json()["user"]["codigo_usuario"], "a00001")

    def test_role_not_inferred_from_prefix(self):
        """Demuestra que el código p99999 (prefijo 'p') retorna ADMIN porque es su rol en BD."""
        res = self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "p99999", "password": "12345"},
        )
        self.assertEqual(res.status_code, 200)
        user = res.json()["user"]
        self.assertEqual(user["rol"], "ADMIN")
        self.assertNotEqual(user["rol"], "PADRE")

    def test_me_and_logout_flow(self):
        # 1. Intentar /me sin sesión
        res_unauth = self.client.get("/api/v1/auth/me")
        self.assertEqual(res_unauth.status_code, 401)

        # 2. Iniciar sesión con codigo_usuario
        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "p00001", "password": "12345"},
        )
        self.assertEqual(login_res.status_code, 200)
        session_token = login_res.cookies[settings.SESSION_COOKIE_NAME]

        # 3. Consultar /me con la cookie HttpOnly
        me_res = self.client.get(
            "/api/v1/auth/me",
            cookies={settings.SESSION_COOKIE_NAME: session_token},
        )
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["codigo_usuario"], "p00001")
        self.assertEqual(me_res.json()["rol"], "PADRE")

        # 4. Cerrar sesión
        logout_res = self.client.post(
            "/api/v1/auth/logout",
            cookies={settings.SESSION_COOKIE_NAME: session_token},
        )
        self.assertEqual(logout_res.status_code, 200)

        # 5. Sesión revocada -> /me debe fallar
        me_after_logout = self.client.get(
            "/api/v1/auth/me",
            cookies={settings.SESSION_COOKIE_NAME: session_token},
        )
        self.assertEqual(me_after_logout.status_code, 401)

    def test_db_unavailable_returns_503(self):
        """Verifica que cuando el motor de BD no está disponible, retorna 503."""
        from app.core import database
        old_factory = database.async_session_factory
        try:
            database.async_session_factory = None
            app.dependency_overrides.clear()
            res = self.client.post(
                "/api/v1/auth/login",
                json={"codigo_usuario": "p00001", "password": "12345"},
            )
            self.assertEqual(res.status_code, 503)
            self.assertIn("Servicio de base de datos no disponible", res.json()["detail"])
        finally:
            database.async_session_factory = old_factory


if __name__ == "__main__":
    unittest.main()
