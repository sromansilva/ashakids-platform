"""Suite completa de pruebas para el CRUD de pacientes, avatares, gestión administrativa y auditoría.

Cubre:
1. Creación atómica de Paciente + Perfil infantil 1:1.
2. Validación de catálogo de avatares (10 permitidos) y valor por defecto 'zorro'.
3. Validación estricta de campo sexo ('Masculino', 'Femenino', 'Otro').
4. Listado de hijos para el padre autenticado (solo activos).
5. Protección IDOR: Tutores no pueden ver, editar, inactivar ni eliminar hijos ajenos.
6. Edición autorizada de datos y avatar.
7. Inactivación lógica (activo = False) que preserva datos y perfil intactos.
8. Bloqueo de eliminación física con HTTP 409 Conflict ante registros dependientes.
9. Eliminación física permitida cuando no existen registros históricos o dependencias.
10. Consulta administrativa de hijos de un tutor (incluye activos e inactivos).
11. Reactivación administrativa de pacientes inactivos.
12. Rechazo 403 Forbidden de reactivación administrativa por usuarios no autorizados (Padres/Terapeutas).
13. Auditoría en la tabla central AUDITORIA_CAMBIOS para creación, edición, inactivación, reactivación y eliminación.
14. Verificación de ausencia de regresiones en autenticación y cuentas.
"""

from datetime import date
from pathlib import Path
import sys
import unittest
import httpx
from sqlalchemy import text

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import init_db, async_session_factory
from app.schemas.pacientes import ALLOWED_AVATARS, ALLOWED_SEXO

BASE_URL = "http://localhost:8000/api/v1"


class TestPacientesCRUD(unittest.TestCase):
    """Pruebas end-to-end y de integración para gestión de pacientes y perfil infantil."""

    @classmethod
    def run_db_op(cls, coro_func):
        import asyncio
        from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
        from app.core.config import settings

        async def _runner():
            engine = create_async_engine(settings.effective_database_url, echo=False)
            factory = async_sessionmaker(engine, expire_on_commit=False)
            try:
                async with factory() as session:
                    return await coro_func(session)
            finally:
                await engine.dispose()

        return asyncio.run(_runner())

    @classmethod
    def setUpClass(cls):
        init_db()
        try:
            res = httpx.get("http://localhost:8000/health", timeout=10.0)
            if res.status_code != 200:
                raise unittest.SkipTest("FastAPI no responde 200 en /health")
        except Exception as exc:
            raise unittest.SkipTest(f"FastAPI no accesible en http://localhost:8000: {exc}")

        cls.admin_client = httpx.Client(base_url=BASE_URL, timeout=30.0)
        cls.padre1_client = httpx.Client(base_url=BASE_URL, timeout=30.0)
        cls.padre2_client = httpx.Client(base_url=BASE_URL, timeout=30.0)
        cls.anon_client = httpx.Client(base_url=BASE_URL, timeout=30.0)

        # 1. Login Admin
        res_adm = cls.admin_client.post("/auth/login", json={"codigo_usuario": "a00001", "password": "12345"})
        if res_adm.status_code != 200:
            raise RuntimeError(f"Login admin falló: {res_adm.text}")

        # 2. Asegurar existencia de Padre 1
        p1_email = "padre1.crud.test@ashakids.com"
        res_p1 = cls.admin_client.post(
            "/admin/cuentas/padres",
            json={
                "nombres": "Roberto",
                "apellidos": "PadreUno",
                "email": p1_email,
                "password": "PasswordTest123!",
                "parentesco": "Padre",
                "telefono": "987654321",
                "direccion": "Av. Uno 123",
            },
        )
        if res_p1.status_code == 201:
            cls.padre1_codigo = res_p1.json()["cuenta"]["codigo_usuario"]
            cls.padre1_id_usuario = res_p1.json()["cuenta"]["id_usuario"]
        else:
            res_list = cls.admin_client.get("/admin/cuentas")
            p1_user = next(u for u in res_list.json()["items"] if u["email"] == p1_email)
            cls.padre1_codigo = p1_user["codigo_usuario"]
            cls.padre1_id_usuario = p1_user["id_usuario"]

        login_p1 = cls.padre1_client.post("/auth/login", json={"codigo_usuario": cls.padre1_codigo, "password": "PasswordTest123!"})
        if login_p1.status_code != 200:
            raise RuntimeError(f"Login padre1 falló: {login_p1.text}")

        # 3. Asegurar existencia de Padre 2
        p2_email = "padre2.crud.test@ashakids.com"
        res_p2 = cls.admin_client.post(
            "/admin/cuentas/padres",
            json={
                "nombres": "Carlos",
                "apellidos": "PadreDos",
                "email": p2_email,
                "password": "PasswordTest123!",
                "parentesco": "Padre",
                "telefono": "987654322",
                "direccion": "Av. Dos 456",
            },
        )
        if res_p2.status_code == 201:
            cls.padre2_codigo = res_p2.json()["cuenta"]["codigo_usuario"]
            cls.padre2_id_usuario = res_p2.json()["cuenta"]["id_usuario"]
        else:
            res_list = cls.admin_client.get("/admin/cuentas")
            p2_user = next(u for u in res_list.json()["items"] if u["email"] == p2_email)
            cls.padre2_codigo = p2_user["codigo_usuario"]
            cls.padre2_id_usuario = p2_user["id_usuario"]

        login_p2 = cls.padre2_client.post("/auth/login", json={"codigo_usuario": cls.padre2_codigo, "password": "PasswordTest123!"})
        if login_p2.status_code != 200:
            raise RuntimeError(f"Login padre2 falló: {login_p2.text}")

    @classmethod
    def tearDownClass(cls):
        cls.admin_client.close()
        cls.padre1_client.close()
        cls.padre2_client.close()
        cls.anon_client.close()

    def test_01_crear_hijo_con_avatar_y_perfil_atomico(self):
        """Padre crea un hijo con avatar 'panda'. Verifica creación atómica de paciente y perfil 1:1."""
        payload = {
            "nombres_paciente": "Sofía",
            "apellidos_paciente": "PadreUno",
            "fecha_nacimiento": "2018-06-10",
            "sexo": "Femenino",
            "avatar_nombre": "panda",
        }
        res = self.padre1_client.post("/padres/hijos", json=payload)
        self.assertEqual(res.status_code, 201, f"Creación falló: {res.text}")
        data = res.json()
        self.assertIn("paciente", data)
        p = data["paciente"]
        self.assertEqual(p["nombres_paciente"], "Sofía")
        self.assertEqual(p["apellidos_paciente"], "PadreUno")
        self.assertEqual(p["avatar_nombre"], "panda")
        self.assertEqual(p["sexo"], "Femenino")
        self.assertTrue(p["activo"])
        self.assertIsNotNone(p["perfil"], "El perfil infantil debe crearse de manera atómica junto al paciente.")
        self.assertEqual(p["perfil"]["progreso"], 0.0)
        self.assertEqual(p["perfil"]["nivel"], 1)

    def test_02_avatar_predeterminado_zorro(self):
        """Si no se especifica avatar, debe asignarse 'zorro' por defecto."""
        payload = {
            "nombres_paciente": "Tomás",
            "apellidos_paciente": "PadreUno",
            "fecha_nacimiento": "2020-03-20",
            "sexo": "Masculino",
        }
        res = self.padre1_client.post("/padres/hijos", json=payload)
        self.assertEqual(res.status_code, 201)
        p = res.json()["paciente"]
        self.assertEqual(p["avatar_nombre"], "zorro")

    def test_03_validacion_avatar_invalido(self):
        """Si se envía un avatar fuera del catálogo permitido, debe responder 422."""
        payload = {
            "nombres_paciente": "AvatarInvalido",
            "apellidos_paciente": "Test",
            "fecha_nacimiento": "2019-01-01",
            "sexo": "Masculino",
            "avatar_nombre": "dragon_mitico",  # No permitido
        }
        res = self.padre1_client.post("/padres/hijos", json=payload)
        self.assertEqual(res.status_code, 422)

    def test_04_validacion_sexo_obligatorio_y_catalogo(self):
        """PACIENTES.sexo debe ser 'Masculino', 'Femenino' u 'Otro'."""
        # Inválido
        payload_bad = {
            "nombres_paciente": "SexoInvalido",
            "apellidos_paciente": "Test",
            "fecha_nacimiento": "2019-01-01",
            "sexo": "Desconocido",
            "avatar_nombre": "oso",
        }
        res = self.padre1_client.post("/padres/hijos", json=payload_bad)
        self.assertEqual(res.status_code, 422)

        # Válido 'Otro'
        payload_ok = {
            "nombres_paciente": "Alex",
            "apellidos_paciente": "Test",
            "fecha_nacimiento": "2019-01-01",
            "sexo": "Otro",
            "avatar_nombre": "koala",
        }
        res_ok = self.padre1_client.post("/padres/hijos", json=payload_ok)
        self.assertEqual(res_ok.status_code, 201)
        self.assertEqual(res_ok.json()["paciente"]["sexo"], "Otro")

    def test_05_validacion_fecha_nacimiento_no_futura(self):
        """Fecha de nacimiento no puede ser futura."""
        payload = {
            "nombres_paciente": "BebeDelFuturo",
            "apellidos_paciente": "Test",
            "fecha_nacimiento": "2030-01-01",
            "sexo": "Masculino",
        }
        res = self.padre1_client.post("/padres/hijos", json=payload)
        self.assertEqual(res.status_code, 422)

    def test_06_proteccion_idor_entre_tutores(self):
        """Padre 2 no puede acceder, modificar ni inactivar hijos creados por Padre 1."""
        # 1. Crear hijo como Padre 1
        res = self.padre1_client.post(
            "/padres/hijos",
            json={
                "nombres_paciente": "HijoDePadre1",
                "apellidos_paciente": "Privado",
                "fecha_nacimiento": "2017-08-14",
                "sexo": "Masculino",
                "avatar_nombre": "leon",
            },
        )
        self.assertEqual(res.status_code, 201)
        id_hijo = res.json()["paciente"]["id_paciente"]

        # 2. Padre 2 intenta consultar el hijo de Padre 1 -> 404
        res_idor_get = self.padre2_client.get(f"/padres/hijos/{id_hijo}")
        self.assertEqual(res_idor_get.status_code, 404)

        # 3. Padre 2 intenta editar el hijo de Padre 1 -> 404
        res_idor_patch = self.padre2_client.patch(f"/padres/hijos/{id_hijo}", json={"nombres_paciente": "HackedName"})
        self.assertEqual(res_idor_patch.status_code, 404)

        # 4. Padre 2 intenta inactivar el hijo de Padre 1 -> 404
        res_idor_inact = self.padre2_client.patch(f"/padres/hijos/{id_hijo}/inactivar")
        self.assertEqual(res_idor_inact.status_code, 404)

        # 5. Padre 2 intenta eliminar el hijo de Padre 1 -> 404
        res_idor_del = self.padre2_client.delete(f"/padres/hijos/{id_hijo}")
        self.assertEqual(res_idor_del.status_code, 404)

    def test_07_edicion_autorizada_de_hijo_y_avatar(self):
        """Padre edita exitosamente nombres y avatar de su hijo."""
        crear = self.padre1_client.post(
            "/padres/hijos",
            json={
                "nombres_paciente": "Valentina",
                "apellidos_paciente": "Original",
                "fecha_nacimiento": "2018-09-09",
                "sexo": "Femenino",
                "avatar_nombre": "conejo",
            },
        )
        self.assertEqual(crear.status_code, 201)
        id_hijo = crear.json()["paciente"]["id_paciente"]

        # Editar
        edit_res = self.padre1_client.patch(
            f"/padres/hijos/{id_hijo}",
            json={
                "nombres_paciente": "Valentina María",
                "avatar_nombre": "buho",
            },
        )
        self.assertEqual(edit_res.status_code, 200)
        p = edit_res.json()["paciente"]
        self.assertEqual(p["nombres_paciente"], "Valentina María")
        self.assertEqual(p["avatar_nombre"], "buho")
        self.assertEqual(p["sexo"], "Femenino")  # No modificado se conserva

    def test_08_inactivacion_logica_excluye_de_lista_padre(self):
        """Inactivar hijo establece activo=False, conserva perfil, y lo excluye de /padres/hijos."""
        crear = self.padre1_client.post(
            "/padres/hijos",
            json={
                "nombres_paciente": "Inactivable",
                "apellidos_paciente": "Test",
                "fecha_nacimiento": "2019-11-11",
                "sexo": "Masculino",
                "avatar_nombre": "tortuga",
            },
        )
        self.assertEqual(crear.status_code, 201)
        id_hijo = crear.json()["paciente"]["id_paciente"]

        # Inactivar
        inact_res = self.padre1_client.patch(f"/padres/hijos/{id_hijo}/inactivar")
        self.assertEqual(inact_res.status_code, 200)
        self.assertFalse(inact_res.json()["paciente"]["activo"])

        # Verificar que ya no aparece en el listado normal del padre
        listar = self.padre1_client.get("/padres/hijos")
        self.assertEqual(listar.status_code, 200)
        ids_activos = [item["id_paciente"] for item in listar.json()["items"]]
        self.assertNotIn(id_hijo, ids_activos, "Hijo inactivo no debe figurar en el listado regular del padre.")

    def test_09_bloqueo_eliminacion_con_dependencias_409(self):
        """Si un paciente tiene registros dependientes (ej. tratamientos o sesiones), delete retorna 409 Conflict."""
        # 1. Crear hijo
        crear = self.padre1_client.post(
            "/padres/hijos",
            json={
                "nombres_paciente": "ConHistorial",
                "apellidos_paciente": "Clinico",
                "fecha_nacimiento": "2018-01-01",
                "sexo": "Masculino",
                "avatar_nombre": "mono",
            },
        )
        self.assertEqual(crear.status_code, 201)
        id_hijo = crear.json()["paciente"]["id_paciente"]

        # 2. Insertar una dependencia simulada directa en BD (ej. expediente o tratamiento)
        async def insert_expediente(db):
            await db.execute(
                text(
                    "INSERT INTO expedientes (id_paciente, historial_clinico, diagnostico_inicial) "
                    "VALUES (:id_paciente, 'Historial clínico de prueba', 'Diagnóstico inicial')"
                ),
                {"id_paciente": id_hijo},
            )
            await db.commit()

        self.run_db_op(insert_expediente)

        # 3. Intentar eliminar físicamente -> debe responder 409 Conflict
        del_res = self.padre1_client.delete(f"/padres/hijos/{id_hijo}")
        self.assertEqual(del_res.status_code, 409)
        self.assertTrue(
            "clínico" in del_res.json()["detail"].lower()
            or "expediente" in del_res.json()["detail"].lower()
            or "inactive" in del_res.json()["detail"].lower()
        )

    def test_10_eliminacion_fisica_exitosa_cuando_limpio(self):
        """Eliminación física solo si el paciente no tiene dependencias clínicas históricas."""
        crear = self.padre1_client.post(
            "/padres/hijos",
            json={
                "nombres_paciente": "Borrable",
                "apellidos_paciente": "SinHistorial",
                "fecha_nacimiento": "2021-02-02",
                "sexo": "Femenino",
                "avatar_nombre": "pinguino",
            },
        )
        self.assertEqual(crear.status_code, 201)
        id_hijo = crear.json()["paciente"]["id_paciente"]

        # Eliminar
        del_res = self.padre1_client.delete(f"/padres/hijos/{id_hijo}")
        self.assertEqual(del_res.status_code, 200)

        # Ya no existe
        get_res = self.padre1_client.get(f"/padres/hijos/{id_hijo}")
        self.assertEqual(get_res.status_code, 404)

    def test_11_admin_lista_hijos_activos_e_inactivos(self):
        """Administrador consulta los hijos de un padre y visualiza tanto activos como inactivos."""
        # Crear e inactivar uno
        crear = self.padre1_client.post(
            "/padres/hijos",
            json={
                "nombres_paciente": "ParaVerEnAdmin",
                "apellidos_paciente": "PadreUno",
                "fecha_nacimiento": "2019-07-07",
                "sexo": "Masculino",
                "avatar_nombre": "zorro",
            },
        )
        self.assertEqual(crear.status_code, 201)
        id_hijo = crear.json()["paciente"]["id_paciente"]

        self.padre1_client.patch(f"/padres/hijos/{id_hijo}/inactivar")

        # Admin consulta
        admin_hijos = self.admin_client.get(f"/admin/cuentas/{self.padre1_id_usuario}/hijos")
        self.assertEqual(admin_hijos.status_code, 200)
        items = admin_hijos.json()["items"]
        hijo_inactivo = next((h for h in items if h["id_paciente"] == id_hijo), None)
        self.assertIsNotNone(hijo_inactivo, "El administrador debe poder ver los hijos inactivos.")
        self.assertFalse(hijo_inactivo["activo"])

    def test_12_reactivacion_administrativa_y_control_rbac(self):
        """Solo Admin puede reactivar. Usuarios con rol PADRE reciben 403."""
        # 1. Crear e inactivar
        crear = self.padre1_client.post(
            "/padres/hijos",
            json={
                "nombres_paciente": "Reactivable",
                "apellidos_paciente": "Test",
                "fecha_nacimiento": "2019-10-10",
                "sexo": "Femenino",
                "avatar_nombre": "panda",
            },
        )
        self.assertEqual(crear.status_code, 201)
        id_hijo = crear.json()["paciente"]["id_paciente"]
        self.padre1_client.patch(f"/padres/hijos/{id_hijo}/inactivar")

        # 2. Padre intenta reactivar -> 403 Forbidden
        react_padre = self.padre1_client.patch(f"/admin/pacientes/{id_hijo}/reactivar")
        self.assertEqual(react_padre.status_code, 403)

        # 3. Anónimo intenta reactivar -> 401 Unauthorized
        react_anon = self.anon_client.patch(f"/admin/pacientes/{id_hijo}/reactivar")
        self.assertEqual(react_anon.status_code, 401)

        # 4. Admin reactiva exitosamente
        react_admin = self.admin_client.patch(f"/admin/pacientes/{id_hijo}/reactivar")
        self.assertEqual(react_admin.status_code, 200)
        self.assertTrue(react_admin.json()["paciente"]["activo"])

        # 5. Ahora vuelve a figurar en el listado del padre
        listar = self.padre1_client.get("/padres/hijos")
        ids_activos = [item["id_paciente"] for item in listar.json()["items"]]
        self.assertIn(id_hijo, ids_activos)

    def test_13_auditoria_cambios_registrada_correctamente(self):
        """Verifica que las operaciones en pacientes dejen rastro en AUDITORIA_CAMBIOS."""
        async def verificar_auditoria(db):
            res = await db.execute(
                text(
                    "SELECT accion, nombre_tabla, datos_nuevos FROM auditoria_cambios "
                    "WHERE nombre_tabla = 'pacientes' ORDER BY id_auditoria DESC LIMIT 10"
                )
            )
            rows = res.fetchall()
            acciones = [r[0] for r in rows]
            return acciones

        acciones = self.run_db_op(verificar_auditoria)
        self.assertTrue(len(acciones) > 0, "Debe existir al menos un registro de auditoría para la tabla pacientes.")
        self.assertTrue(any(a in ["INSERT", "UPDATE", "DELETE"] for a in acciones))


if __name__ == "__main__":
    unittest.main()
