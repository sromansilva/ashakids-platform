"""Script de validación y auditoría de seguridad para DELETE de cuentas.
Ejecuta todas las pruebas en un único ciclo de eventos asyncio (compatible con Windows).
"""

from pathlib import Path
import sys

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import asyncio
import httpx
from sqlalchemy import text
from app.core.database import async_session_factory

BASE_URL = "http://localhost:8000/api/v1"


async def main():
    print("=== INICIANDO AUDITORÍA DE SEGURIDAD PARA DELETE DE CUENTAS ===")
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # 0. Login como admin a00001
        res = await client.post("/auth/login", json={"codigo_usuario": "a00001", "password": "12345"})
        assert res.status_code == 200, f"Login admin falló: {res.text}"
        print("[OK] Login como admin a00001 exitoso.")

        # 1. Admin intentando eliminarse a sí mismo
        res_self = await client.delete("/admin/cuentas/1")
        assert res_self.status_code == 409, f"Esperado 409, obtenido {res_self.status_code}: {res_self.text}"
        assert "No puedes eliminar tu propia cuenta" in res_self.json()["detail"]
        print("[OK] Test 1: Intento de auto-eliminación de admin bloqueado con 409.")

        # 2. Intento de eliminar al último admin activo
        # (id_usuario 1 es el único admin actualmente)
        res_last = await client.delete("/admin/cuentas/1")
        assert res_last.status_code == 409
        print("[OK] Test 2: Intento de eliminar único admin activo bloqueado con 409.")

        # 3. Tutor con paciente asignado -> DELETE debe responder 409
        async with async_session_factory() as db:
            # Crear tutor de prueba
            r_u = await db.execute(text("""
                INSERT INTO public.usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo)
                VALUES ('TutorDep', 'Test', 'p88881', 'tutor.audit.test@ashakids.test', 'dummy_hash', true)
                RETURNING id_usuario;
            """))
            id_u_tutor = r_u.scalar_one()

            r_tut = await db.execute(text("""
                INSERT INTO public.tutores (id_usuario, parentesco, telefono)
                VALUES (:id_u, 'Madre', '999888777')
                RETURNING id_tutor;
            """), {"id_u": id_u_tutor})
            id_tutor = r_tut.scalar_one()

            await db.execute(text("""
                INSERT INTO public.usuario_roles (id_usuario, id_rol, activo)
                VALUES (:id_u, 1, true);
            """), {"id_u": id_u_tutor})

            # Crear paciente asignado al tutor
            r_p = await db.execute(text("""
                INSERT INTO public.pacientes (id_tutor, nombres_paciente, apellidos_paciente, fecha_nacimiento, sexo, activo)
                VALUES (:id_tutor, 'NiñoAudit', 'Test', '2018-05-10', 'M', true)
                RETURNING id_paciente;
            """), {"id_tutor": id_tutor})
            id_paciente = r_p.scalar_one()
            await db.commit()

        try:
            res_del_tutor = await client.delete(f"/admin/cuentas/{id_u_tutor}")
            assert res_del_tutor.status_code == 409, f"Esperado 409, obtenido {res_del_tutor.status_code}: {res_del_tutor.text}"
            detail = res_del_tutor.json()["detail"]
            assert "paciente(s) infantil(es) asignado(s)" in detail, f"Mensaje inesperado: {detail}"

            # Verificar que el paciente y el tutor siguen existiendo
            async with async_session_factory() as db:
                p_cnt = (await db.execute(text("SELECT count(*) FROM public.pacientes WHERE id_paciente = :id"), {"id": id_paciente})).scalar()
                u_cnt = (await db.execute(text("SELECT count(*) FROM public.usuarios WHERE id_usuario = :id"), {"id": id_u_tutor})).scalar()
                assert p_cnt == 1, "El paciente no debe haber sido eliminado."
                assert u_cnt == 1, "El usuario tutor no debe haber sido eliminado."
            print("[OK] Test 3: Tutor con paciente bloqueado con 409. Paciente y tutor preservados intactos.")
        finally:
            async with async_session_factory() as db:
                await db.execute(text("DELETE FROM public.pacientes WHERE id_paciente = :id"), {"id": id_paciente})
                await db.execute(text("DELETE FROM public.usuario_roles WHERE id_usuario = :id"), {"id": id_u_tutor})
                await db.execute(text("DELETE FROM public.tutores WHERE id_tutor = :id"), {"id": id_tutor})
                await db.execute(text("DELETE FROM public.usuarios WHERE id_usuario = :id"), {"id": id_u_tutor})
                await db.commit()

        # 4. Terapeuta con tratamiento asignado -> DELETE debe responder 409
        async with async_session_factory() as db:
            # Setup tutor y paciente auxiliar para el expediente
            r_u_aux = await db.execute(text("""
                INSERT INTO public.usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo)
                VALUES ('TutorAux', 'Test', 'p88882', 'tutor.aux.audit@ashakids.test', 'dummy_hash', true)
                RETURNING id_usuario;
            """))
            id_u_aux = r_u_aux.scalar_one()

            r_tut_aux = await db.execute(text("""
                INSERT INTO public.tutores (id_usuario, parentesco) VALUES (:id_u, 'Padre') RETURNING id_tutor;
            """), {"id_u": id_u_aux})
            id_tut_aux = r_tut_aux.scalar_one()

            r_pac_aux = await db.execute(text("""
                INSERT INTO public.pacientes (id_tutor, nombres_paciente, apellidos_paciente, fecha_nacimiento, sexo, activo)
                VALUES (:id_tutor, 'PacienteAux', 'Test', '2019-01-01', 'F', true) RETURNING id_paciente;
            """), {"id_tutor": id_tut_aux})
            id_pac_aux = r_pac_aux.scalar_one()

            r_exp = await db.execute(text("""
                INSERT INTO public.expedientes (id_paciente, historial_clinico, diagnostico_inicial)
                VALUES (:id_p, 'Historial clínico audit', 'Trastorno fonológico') RETURNING id_expediente;
            """), {"id_p": id_pac_aux})
            id_exp = r_exp.scalar_one()

            # Terapeuta
            r_u_ter = await db.execute(text("""
                INSERT INTO public.usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo)
                VALUES ('TerapeutaAudit', 'Test', 't88882', 'ter.audit@ashakids.test', 'dummy_hash', true)
                RETURNING id_usuario;
            """))
            id_u_ter = r_u_ter.scalar_one()

            await db.execute(text("""
                INSERT INTO public.usuario_roles (id_usuario, id_rol, activo) VALUES (:id_u, 2, true);
            """), {"id_u": id_u_ter})

            r_ter = await db.execute(text("""
                INSERT INTO public.terapeutas (id_usuario, especialidad, anios_experiencia)
                VALUES (:id_u, 'Lenguaje', 6) RETURNING id_terapeuta;
            """), {"id_u": id_u_ter})
            id_ter = r_ter.scalar_one()

            r_trat = await db.execute(text("""
                INSERT INTO public.tratamientos (id_expediente, id_terapeuta, nombre_tratamiento, estado_tratamiento)
                VALUES (:id_e, :id_t, 'Terapia auditada', 'activo') RETURNING id_tratamiento;
            """), {"id_e": id_exp, "id_t": id_ter})
            id_trat = r_trat.scalar_one()
            await db.commit()

        try:
            res_del_ter = await client.delete(f"/admin/cuentas/{id_u_ter}")
            assert res_del_ter.status_code == 409, f"Esperado 409, obtenido {res_del_ter.status_code}: {res_del_ter.text}"
            detail_t = res_del_ter.json()["detail"]
            assert "plan(es) de tratamiento asignado(s)" in detail_t, f"Mensaje inesperado: {detail_t}"

            # Verificar que el tratamiento y el terapeuta siguen existiendo
            async with async_session_factory() as db:
                t_cnt = (await db.execute(text("SELECT count(*) FROM public.tratamientos WHERE id_tratamiento = :id"), {"id": id_trat})).scalar()
                u_cnt = (await db.execute(text("SELECT count(*) FROM public.usuarios WHERE id_usuario = :id"), {"id": id_u_ter})).scalar()
                assert t_cnt == 1, "El tratamiento no debe haber sido eliminado."
                assert u_cnt == 1, "El usuario terapeuta no debe haber sido eliminado."
            print("[OK] Test 4: Terapeuta con tratamiento bloqueado con 409. Tratamiento y terapeuta preservados.")
        finally:
            async with async_session_factory() as db:
                await db.execute(text("DELETE FROM public.tratamientos WHERE id_tratamiento = :id"), {"id": id_trat})
                await db.execute(text("DELETE FROM public.expedientes WHERE id_expediente = :id"), {"id": id_exp})
                await db.execute(text("DELETE FROM public.pacientes WHERE id_paciente = :id"), {"id": id_pac_aux})
                await db.execute(text("DELETE FROM public.tutores WHERE id_tutor = :id"), {"id": id_tut_aux})
                await db.execute(text("DELETE FROM public.usuarios WHERE id_usuario = :id"), {"id": id_u_aux})
                await db.execute(text("DELETE FROM public.usuario_roles WHERE id_usuario = :id"), {"id": id_u_ter})
                await db.execute(text("DELETE FROM public.terapeutas WHERE id_terapeuta = :id"), {"id": id_ter})
                await db.execute(text("DELETE FROM public.usuarios WHERE id_usuario = :id"), {"id": id_u_ter})
                await db.commit()

        # 5. Usuario sin dependencias -> DELETE exitoso (200) y registro en auditoria_cambios
        res_create = await client.post("/admin/cuentas/padres", json={
            "nombres": "LimpioAudit",
            "apellidos": "Test",
            "email": "limpio.audit@ashakids.test",
            "password": "PasswordSegura99!",
            "parentesco": "Padre",
            "telefono": "988112233",
            "direccion": "Calle Limpia 100",
        })
        assert res_create.status_code == 201, f"Creación falló: {res_create.text}"
        id_usuario_limpio = res_create.json()["cuenta"]["id_usuario"]

        async with async_session_factory() as db:
            audit_cnt_antes = (await db.execute(text("SELECT count(*) FROM public.auditoria_cambios"))).scalar()

        res_del_ok = await client.delete(f"/admin/cuentas/{id_usuario_limpio}")
        assert res_del_ok.status_code == 200, f"DELETE falló: {res_del_ok.text}"

        # Verificar 404
        res_get_404 = await client.get(f"/admin/cuentas/{id_usuario_limpio}")
        assert res_get_404.status_code == 404

        # Verificar auditoría DELETE
        async with async_session_factory() as db:
            audit_del_row = (await db.execute(text("""
                SELECT id_usuario_actor, nombre_tabla, nombre_entidad, accion, datos_anteriores, datos_nuevos
                FROM public.auditoria_cambios
                WHERE nombre_tabla = 'usuarios'
                  AND nombre_entidad = :id_str
                  AND accion = 'DELETE'
                ORDER BY id_auditoria DESC
                LIMIT 1;
            """), {"id_str": str(id_usuario_limpio)})).fetchone()

            audit_cnt_despues = (await db.execute(text("SELECT count(*) FROM public.auditoria_cambios"))).scalar()

            assert audit_del_row is not None, "Debe existir un registro de auditoría con accion='DELETE'."
            assert audit_del_row[0] == 1, "id_usuario_actor debe ser el admin 1."
            assert audit_del_row[1] == "usuarios"
            assert audit_del_row[2] == str(id_usuario_limpio)
            assert audit_del_row[3] == "DELETE"
            assert audit_del_row[4] is not None, "datos_anteriores debe contener la información del usuario."
            assert audit_del_row[5] is None, "datos_nuevos debe ser NULL en DELETE."
            assert audit_cnt_despues > audit_cnt_antes, "Los registros de auditoría no deben haberse reducido."

        print("[OK] Test 5: Usuario sin dependencias eliminado limpiamente (200) y auditoría DELETE registrada intacta.")

        # 6. Cuenta con historial de auditoría como actor -> DELETE bloqueado (409 Conflict)
        # y suspensión permitida
        async with async_session_factory() as db:
            # Crear usuario con historial de auditoría
            r_u_hist = await db.execute(text("""
                INSERT INTO public.usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo)
                VALUES ('AdminHistorico', 'Test', 'a88883', 'admin.hist.audit@ashakids.test', 'dummy_hash', true)
                RETURNING id_usuario;
            """))
            id_u_hist = r_u_hist.scalar_one()

            await db.execute(text("""
                INSERT INTO public.usuario_roles (id_usuario, id_rol, activo) VALUES (:id_u, 3, true);
            """), {"id_u": id_u_hist})

            r_adm = await db.execute(text("""
                INSERT INTO public.administradores (id_usuario) VALUES (:id_u) RETURNING id_administrador;
            """), {"id_u": id_u_hist})
            id_adm_hist = r_adm.scalar_one()

            # Insertar evento de auditoría donde este usuario fue el actor responsable
            r_aud = await db.execute(text("""
                INSERT INTO public.auditoria_cambios (id_usuario_actor, nombre_tabla, nombre_entidad, accion, datos_anteriores, datos_nuevos)
                VALUES (:id_actor, 'usuarios', 'test_entity', 'UPDATE', '{"test": true}', '{"test": false}')
                RETURNING id_auditoria;
            """), {"id_actor": id_u_hist})
            id_aud_hist = r_aud.scalar_one()
            await db.commit()

        try:
            # Intentar DELETE -> Debe ser rechazado con 409
            res_del_hist = await client.delete(f"/admin/cuentas/{id_u_hist}")
            assert res_del_hist.status_code == 409, f"Esperado 409, obtenido {res_del_hist.status_code}: {res_del_hist.text}"
            detail_hist = res_del_hist.json()["detail"]
            assert "historial de auditoría como actor" in detail_hist, f"Mensaje inesperado: {detail_hist}"
            assert "Debe suspenderse en lugar de eliminarse" in detail_hist, f"Mensaje inesperado: {detail_hist}"

            # Verificar que el usuario y la auditoría permanecen intactos
            async with async_session_factory() as db:
                u_hist_cnt = (await db.execute(text("SELECT count(*) FROM public.usuarios WHERE id_usuario = :id"), {"id": id_u_hist})).scalar()
                aud_row = (await db.execute(text("SELECT id_usuario_actor FROM public.auditoria_cambios WHERE id_auditoria = :id"), {"id": id_aud_hist})).fetchone()
                assert u_hist_cnt == 1, "El usuario con historial no debe ser eliminado."
                assert aud_row is not None and aud_row[0] == id_u_hist, "El actor en auditoria_cambios no debe haber cambiado a NULL."

            # Probar que la suspensión SÍ está permitida para esta cuenta histórica
            res_susp_hist = await client.patch(f"/admin/cuentas/{id_u_hist}/suspender")
            assert res_susp_hist.status_code == 200, f"Suspensión falló: {res_susp_hist.text}"
            assert res_susp_hist.json()["cuenta"]["activo"] is False

            print("[OK] Test 6: Cuenta con historial en auditoría bloqueada con 409 para DELETE, preservando actor intacto y permitiendo suspensión.")
        finally:
            async with async_session_factory() as db:
                await db.execute(text("DELETE FROM public.auditoria_cambios WHERE id_auditoria = :id"), {"id": id_aud_hist})
                await db.execute(text("DELETE FROM public.administradores WHERE id_administrador = :id"), {"id": id_adm_hist})
                await db.execute(text("DELETE FROM public.usuario_roles WHERE id_usuario = :id"), {"id": id_u_hist})
                await db.execute(text("DELETE FROM public.usuarios WHERE id_usuario = :id"), {"id": id_u_hist})
                await db.commit()

    print("\n=== TODAS LAS PRUEBAS DE SEGURIDAD PASARON SATISFACTORIAMENTE (100% OK) ===")


if __name__ == "__main__":
    asyncio.run(main())

