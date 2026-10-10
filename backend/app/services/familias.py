"""Registro íntegro de padre e hijos en la transacción HTTP existente."""
from app.models.perfiles import Paciente
from app.schemas.admin import CrearPadreRequest
from app.services.admin_auditoria import registrar_auditoria
from app.services.admin_cuentas_creacion import crear_padre


async def registrar_familia(db, identity, data):
    cuenta = await crear_padre(db, CrearPadreRequest(
        **data.model_dump(exclude={"dni", "hijos"}), password=data.dni,
    ), identity[0])
    tutor_id = cuenta["tutor"]["id_tutor"]
    hijos = []
    for child in data.hijos:
        row = Paciente(**child.model_dump(), id_tutor=tutor_id)
        db.add(row)
        await db.flush()
        await registrar_auditoria(
            db=db, id_usuario_actor=identity[0].id_usuario, nombre_tabla="pacientes",
            nombre_entidad=str(row.id_paciente), accion="INSERT", datos_anteriores=None,
            datos_nuevos={"id_paciente": row.id_paciente, "id_tutor": tutor_id},
        )
        hijos.append(row)
    return {"cuenta": cuenta, "hijos": hijos,
            "message": f"Familia registrada. Entregue el código {cuenta['codigo_usuario']} y solicite cambiar la contraseña inicial."}
