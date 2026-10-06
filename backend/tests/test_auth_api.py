"""Pruebas unitarias para la API REST de autenticación y autorización de ASHAKids.

Utiliza un doble de prueba en memoria (FakeAsyncSession) que aísla las pruebas unitarias
de la base de datos externa de Supabase sin recurrir a fallbacks en el código de producción.
"""

from datetime import datetime, timedelta, timezone
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
from app.models.auth import Administrador, Rol, SesionAutenticacion, Usuario, UsuarioRol
from app.models.perfiles import Terapeuta, Tutor


class MockScalarResult:
    """Resultado simulado para métodos scalar_one_or_none de SQLAlchemy."""
    def __init__(self, val):
        self._val = val

    def scalar_one_or_none(self):
        return self._val


class FakeAsyncSession:
    """Sesión asíncrona en memoria para pruebas unitarias aisladas."""

    def __init__(self, users=None, tutores=None, terapeutas=None, administradores=None):
        self.users = {u.codigo_usuario: u for u in (users or [])}
        self.sessions = {}  # token_hash -> SesionAutenticacion
        self.tutores = {t.id_usuario: t for t in (tutores or [])}
        self.terapeutas = {t.id_usuario: t for t in (terapeutas or [])}
        self.administradores = {a.id_usuario: a for a in (administradores or [])}

    def add(self, obj):
        if isinstance(obj, SesionAutenticacion):
            self.sessions[obj.token_hash] = obj
            for u in self.users.values():
                if u.id_usuario == obj.id_usuario:
                    obj.usuario = u
                    break
        elif isinstance(obj, Tutor):
            self.tutores[obj.id_usuario] = obj
        elif isinstance(obj, Terapeuta):
            self.terapeutas[obj.id_usuario] = obj
        elif isinstance(obj, Administrador):
            self.administradores[obj.id_usuario] = obj

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
            if sesion:
                now = datetime.now(timezone.utc)
                if sesion.revocado or sesion.fecha_expiracion <= now:
                    return MockScalarResult(None)
                if sesion.usuario and not sesion.usuario.activo:
                    return MockScalarResult(None)
            return MockScalarResult(sesion)

        if entity is Tutor:
            id_u = next((v for k, v in params.items() if "id_usuario" in k), None)
            return MockScalarResult(self.tutores.get(id_u))

        if entity is Terapeuta:
            id_u = next((v for k, v in params.items() if "id_usuario" in k), None)
            return MockScalarResult(self.terapeutas.get(id_u))

        if entity is Administrador:
            id_u = next((v for k, v in params.items() if "id_usuario" in k), None)
            return MockScalarResult(self.administradores.get(id_u))

        return MockScalarResult(None)


def build_test_fixtures():
    """Genera usuarios y perfiles de prueba con hashes Argon2id y roles asociados."""
    pwd_hash = hash_password("12345")
    now = datetime.now(timezone.utc)

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
    tutor_padre = Tutor(
        id_tutor=1,
        id_usuario=1,
        parentesco="Madre",
        telefono="999888777",
        direccion="Av. Los Pinos 123",
    )

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
    tera_perfil = Terapeuta(
        id_terapeuta=1,
        id_usuario=2,
        especialidad="Fonoaudiología",
        anios_experiencia=7,
        idiomas="Español, Inglés",
        descripcion_profesional="Especialista en terapia de lenguaje infantil.",
    )

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
    admin_perfil = Administrador(
        id_administrador=1,
        id_usuario=3,
        fecha_creacion=now,
    )

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

    # 6. Usuario sin roles asignados (codigo s00001)
    u_sin_rol = Usuario(
        id_usuario=6,
        nombres="SinRol",
        apellidos="Prueba",
        codigo_usuario="s00001",
        email="sinrol@ashakids.test",
        password_hash=pwd_hash,
        activo=True,
    )
    u_sin_rol.roles_asignados = []

    users = [u_padre, u_tera, u_admin, u_inactivo, u_cruzado, u_sin_rol]
    return users, [tutor_padre], [tera_perfil], [admin_perfil]


class TestAuthAPI(unittest.TestCase):
    """Pruebas unitarias de los endpoints de autenticación y autorización."""

    def setUp(self):
        users, tutores, terapeutas, admins = build_test_fixtures()
        self.fake_db = FakeAsyncSession(
            users=users,
            tutores=tutores,
            terapeutas=terapeutas,
            administradores=admins,
        )

        async def override_get_db():
            yield self.fake_db

        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()

    def _login_as(self, codigo_usuario: str, password: str = "12345") -> str:
        """Helper para autenticar y retornar el token de cookie."""
        res = self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": codigo_usuario, "password": password},
        )
        self.assertEqual(res.status_code, 200, f"Login falló para {codigo_usuario}: {res.text}")
        return res.cookies[settings.SESSION_COOKIE_NAME]

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
        self.assertIn("/api/v1/padres/me", paths)
        self.assertIn("/api/v1/terapeutas/me", paths)
        self.assertIn("/api/v1/admin/me", paths)

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
        self.assertIn(settings.SESSION_COOKIE_NAME, res.cookies)

    def test_login_success_terapeuta_and_admin(self):
        res_t = self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "t00001", "password": "12345"},
        )
        self.assertEqual(res_t.status_code, 200)
        self.assertEqual(res_t.json()["user"]["rol"], "TERAPEUTA")

        res_a = self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "a00001", "password": "12345"},
        )
        self.assertEqual(res_a.status_code, 200)
        self.assertEqual(res_a.json()["user"]["rol"], "ADMIN")

    def test_role_not_inferred_from_prefix(self):
        """Demuestra que el código p99999 (prefijo 'p') retorna ADMIN porque es su rol en BD."""
        res = self.client.post(
            "/api/v1/auth/login",
            json={"codigo_usuario": "p99999", "password": "12345"},
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["user"]["rol"], "ADMIN")

    def test_protected_endpoints_without_cookie_return_401(self):
        """Cualquier endpoint protegido sin cookie/sesión debe rechazar con 401."""
        for endpoint in [
            "/api/v1/auth/me",
            "/api/v1/padres/me",
            "/api/v1/terapeutas/me",
            "/api/v1/admin/me",
        ]:
            res = self.client.get(endpoint)
            self.assertEqual(res.status_code, 401, f"Endpoint {endpoint} debió responder 401 sin cookie")
            self.assertIn("detail", res.json())

    def test_protected_endpoints_with_invalid_cookie_return_401(self):
        """Cookie con token no existente en DB debe rechazar con 401."""
        bad_cookies = {settings.SESSION_COOKIE_NAME: "invalid_random_token_123"}
        for endpoint in [
            "/api/v1/auth/me",
            "/api/v1/padres/me",
            "/api/v1/terapeutas/me",
            "/api/v1/admin/me",
        ]:
            res = self.client.get(endpoint, cookies=bad_cookies)
            self.assertEqual(res.status_code, 401, f"Endpoint {endpoint} debió responder 401 con cookie inválida")

    def test_padre_me_with_padre_session_returns_200(self):
        """Un usuario con rol PADRE accede a /api/v1/padres/me exitosamente."""
        token = self._login_as("p00001")
        res = self.client.get("/api/v1/padres/me", cookies={settings.SESSION_COOKIE_NAME: token})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["user"]["codigo_usuario"], "p00001")
        self.assertEqual(data["user"]["rol"], "PADRE")
        self.assertIsNotNone(data["perfil_tutor"])
        self.assertEqual(data["perfil_tutor"]["parentesco"], "Madre")

    def test_padre_me_with_terapeuta_session_returns_403(self):
        """Un usuario con rol TERAPEUTA intentando /api/v1/padres/me recibe 403."""
        token = self._login_as("t00001")
        res = self.client.get("/api/v1/padres/me", cookies={settings.SESSION_COOKIE_NAME: token})
        self.assertEqual(res.status_code, 403)
        self.assertIn("PADRE", res.json()["detail"])

    def test_padre_me_with_admin_session_returns_403(self):
        """Un usuario con rol ADMIN intentando /api/v1/padres/me recibe 403 (no asume permiso implícito)."""
        token = self._login_as("a00001")
        res = self.client.get("/api/v1/padres/me", cookies={settings.SESSION_COOKIE_NAME: token})
        self.assertEqual(res.status_code, 403)
        self.assertIn("PADRE", res.json()["detail"])

    def test_terapeuta_me_with_terapeuta_session_returns_200(self):
        """Un usuario con rol TERAPEUTA accede a /api/v1/terapeutas/me exitosamente."""
        token = self._login_as("t00001")
        res = self.client.get("/api/v1/terapeutas/me", cookies={settings.SESSION_COOKIE_NAME: token})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["user"]["codigo_usuario"], "t00001")
        self.assertEqual(data["user"]["rol"], "TERAPEUTA")
        self.assertIsNotNone(data["perfil_terapeuta"])
        self.assertEqual(data["perfil_terapeuta"]["especialidad"], "Fonoaudiología")

    def test_terapeuta_me_with_padre_session_returns_403(self):
        """Un usuario con rol PADRE intentando /api/v1/terapeutas/me recibe 403."""
        token = self._login_as("p00001")
        res = self.client.get("/api/v1/terapeutas/me", cookies={settings.SESSION_COOKIE_NAME: token})
        self.assertEqual(res.status_code, 403)
        self.assertIn("TERAPEUTA", res.json()["detail"])

    def test_terapeuta_me_with_admin_session_returns_403(self):
        """Un usuario con rol ADMIN intentando /api/v1/terapeutas/me recibe 403."""
        token = self._login_as("a00001")
        res = self.client.get("/api/v1/terapeutas/me", cookies={settings.SESSION_COOKIE_NAME: token})
        self.assertEqual(res.status_code, 403)
        self.assertIn("TERAPEUTA", res.json()["detail"])

    def test_admin_me_with_admin_session_returns_200(self):
        """Un usuario con rol ADMIN accede a /api/v1/admin/me exitosamente."""
        token = self._login_as("a00001")
        res = self.client.get("/api/v1/admin/me", cookies={settings.SESSION_COOKIE_NAME: token})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["user"]["codigo_usuario"], "a00001")
        self.assertEqual(data["user"]["rol"], "ADMIN")
        self.assertIsNotNone(data["perfil_admin"])

    def test_admin_me_with_padre_session_returns_403(self):
        """Un usuario con rol PADRE intentando /api/v1/admin/me recibe 403."""
        token = self._login_as("p00001")
        res = self.client.get("/api/v1/admin/me", cookies={settings.SESSION_COOKIE_NAME: token})
        self.assertEqual(res.status_code, 403)
        self.assertIn("ADMIN", res.json()["detail"])

    def test_admin_me_with_terapeuta_session_returns_403(self):
        """Un usuario con rol TERAPEUTA intentando /api/v1/admin/me recibe 403."""
        token = self._login_as("t00001")
        res = self.client.get("/api/v1/admin/me", cookies={settings.SESSION_COOKIE_NAME: token})
        self.assertEqual(res.status_code, 403)
        self.assertIn("ADMIN", res.json()["detail"])

    def test_me_and_logout_flow(self):
        # 1. Intentar /me sin sesión
        res_unauth = self.client.get("/api/v1/auth/me")
        self.assertEqual(res_unauth.status_code, 401)

        # 2. Iniciar sesión
        session_token = self._login_as("p00001")

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

        # 5. Sesión revocada -> /me y /padres/me deben fallar con 401
        me_after_logout = self.client.get(
            "/api/v1/auth/me",
            cookies={settings.SESSION_COOKIE_NAME: session_token},
        )
        self.assertEqual(me_after_logout.status_code, 401)

        padre_after_logout = self.client.get(
            "/api/v1/padres/me",
            cookies={settings.SESSION_COOKIE_NAME: session_token},
        )
        self.assertEqual(padre_after_logout.status_code, 401)

    def test_expired_session_returns_401(self):
        """Una sesión expirada en DB debe retornar 401 al acceder a endpoints protegidos."""
        token = self._login_as("p00001")
        # Envejecer la fecha de expiración manualmente
        for s in self.fake_db.sessions.values():
            s.fecha_expiracion = datetime.now(timezone.utc) - timedelta(minutes=5)

        res = self.client.get("/api/v1/padres/me", cookies={settings.SESSION_COOKIE_NAME: token})
        self.assertEqual(res.status_code, 401)

    def test_user_without_roles_returns_403_on_role_endpoints(self):
        """Un usuario autenticado pero sin ningún rol activo en DB debe recibir 403."""
        token = self._login_as("s00001")
        # /auth/me responde 200 porque está autenticado
        me_res = self.client.get("/api/v1/auth/me", cookies={settings.SESSION_COOKIE_NAME: token})
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["roles"], [])

        # Endpoints protegidos por rol deben rechazar con 403
        self.assertEqual(
            self.client.get("/api/v1/padres/me", cookies={settings.SESSION_COOKIE_NAME: token}).status_code,
            403,
        )
        self.assertEqual(
            self.client.get("/api/v1/terapeutas/me", cookies={settings.SESSION_COOKIE_NAME: token}).status_code,
            403,
        )
        self.assertEqual(
            self.client.get("/api/v1/admin/me", cookies={settings.SESSION_COOKIE_NAME: token}).status_code,
            403,
        )

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
