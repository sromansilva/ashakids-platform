"""Cotejo READ ONLY de una cohorte AUDITORIA creada por verify_hardening_journey."""
import argparse
import asyncio
import json
from pathlib import Path

from sqlalchemy import text, bindparam
from app.core import database


async def verify(source):
    audit=json.loads(source.read_text(encoding="utf-8"))
    ids, marker=audit["ids"],audit["marker"]
    if not audit.get("success") or not marker.startswith("AUDITORIA13_"):
        raise ValueError("Se requiere una cohorte sintética completada.")
    result={"mode":"READ ONLY","marker":marker,"ids":ids}
    def query(sql):
        return text(sql).bindparams(bindparam("ids",expanding=True))
    try:
        async with database.async_engine.connect() as db:
            await db.execute(text("SET TRANSACTION READ ONLY"))
            await db.execute(text("SET LOCAL statement_timeout='15000ms'"))
            result["transaction_read_only"]=await db.scalar(text("SHOW transaction_read_only"))
            users=await db.scalar(query("SELECT count(*) FROM usuarios WHERE id_usuario IN :ids "
                "AND nombres='AUDITORIA' AND apellidos LIKE :marker"),{"ids":ids["users"],"marker":marker+"_%"})
            patients=await db.scalar(query("SELECT count(*) FROM pacientes WHERE id_paciente IN :ids "
                "AND nombres_paciente='AUDITORIA' AND apellidos_paciente=:marker"),{"ids":ids["patients"],"marker":marker})
            if users!=len(ids["users"]) or patients!=len(ids["patients"]):
                raise ValueError("Los IDs no corresponden a esta cohorte sintética.")
            result["new_users_match_marker"]=True
            result["new_patients_match_marker"]=True
            result["reservation_count"]=await db.scalar(query("SELECT count(*) FROM reservas WHERE id_tratamiento IN :ids"),{"ids":ids["treatments"]})
            result["session_count"]=await db.scalar(query("SELECT count(*) FROM sesiones WHERE id_reserva IN :ids"),{"ids":ids["appointments"]})
            result["sessions_finalized"]=await db.scalar(query("SELECT count(*) FROM sesiones WHERE id_sesion IN :ids AND estado_sesion='FINALIZADA'"),{"ids":ids["sessions"]})
            result["report_count"]=await db.scalar(query("SELECT count(*) FROM reportes_sesion WHERE id_sesion IN :ids"),{"ids":ids["sessions"]})
            result["report_complete"]=await db.scalar(query("SELECT count(*) FROM reportes_sesion WHERE id_sesion IN :ids "
                "AND observaciones_iniciales=:marker AND objetivos_trabajados IN ('Escritor A','Escritor B') "
                "AND nivel_ayuda='Sin datos clínicos reales' AND proximos_pasos='Verificación de persistencia'"),{"ids":ids["sessions"],"marker":marker})==1
            result["message_count"]=await db.scalar(query("SELECT count(*) FROM mensajes WHERE id_conversacion IN :ids"),{"ids":ids["conversations"]})
            result["new_active_auth_sessions"]=await db.scalar(query("SELECT count(*) FROM sesiones_autenticacion WHERE id_usuario IN :ids AND NOT revocado"),{"ids":ids["users"]})
            result["passed"]=(result["reservation_count"]==2 and result["session_count"]==2 and
                result["sessions_finalized"]==2 and result["report_count"]==1 and result["report_complete"] and
                result["message_count"]==2 and result["new_active_auth_sessions"]==0)
    finally:
        await database.async_engine.dispose()
    return result


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--source",type=Path,required=True)
    parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args()
    result=asyncio.run(verify(args.source))
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps(result,ensure_ascii=False))
    raise SystemExit(0 if result["passed"] else 1)
