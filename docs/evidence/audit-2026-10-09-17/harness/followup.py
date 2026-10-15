"""Lecturas y variantes sobre la cohorte sintética NUEVA autorizada del corte13.

No usar con personas existentes; requiere manifiesto y credenciales privadas de
verify_hardening_journey. No DELETE físico, DDL ni limpieza de tablas.
"""
import argparse
import asyncio
import json
from pathlib import Path
import httpx


async def run(source, private, output):
    audit=json.loads(source.read_text(encoding="utf-8"))
    credentials=json.loads(private.read_text(encoding="utf-8"))
    if (not audit["marker"].startswith("AUDITORIA17_") or
            credentials["marker"]!=audit["marker"] or not audit.get("success")):
        raise ValueError("La cohorte/credenciales no coinciden.")
    if {a["id"] for a in credentials["accounts"].values()}!=set(audit["ids"]["users"]):
        raise ValueError("IDs de usuarios fuera de esta cohorte nueva.")
    clients,results={},[]
    async def call(who,method,path,expected=200,**kwargs):
        response=await clients[who].request(method,path,**kwargs)
        results.append({"actor":who,"method":method,"path":path,"case":"new-cohort followup",
                        "expected":expected,"obtained":response.status_code})
        if response.status_code!=expected:
            raise RuntimeError("Respuesta inesperada; ver códigos sanitizados.")
        return response
    success=False
    try:
        for who in ("admin","parent","other_parent","therapist"):
            clients[who]=httpx.AsyncClient(base_url=audit["api"],timeout=40,headers={"Origin":audit["api"]})
            await call(who,"POST","/api/v1/auth/login",json={"codigo_usuario":credentials["accounts"][who]["code"],
                                                           "password":credentials["password"]})
        uid=credentials["accounts"]["other_parent"]["id"]
        parent_id=credentials["accounts"]["parent"]["id"]
        patient,patient2=audit["ids"]["patients"]
        marker=audit["marker"]
        appointment=audit["ids"]["appointments"][0]
        session=audit["ids"]["sessions"][0]
        conversation=audit["ids"]["conversations"][0]
        reads=[("parent","/auth/me"),("parent",f"/pacientes/{patient}"),
               ("parent",f"/citas/{appointment}"),("parent",f"/sesiones/{session}"),
               ("parent",f"/conversaciones/{conversation}"),
               ("parent","/padres/hijos"),("parent",f"/padres/hijos/{patient}"),
               ("admin",f"/admin/cuentas?search={marker}"),("admin",f"/admin/cuentas/{uid}"),
               ("admin",f"/admin/cuentas/{parent_id}/hijos"),("admin",f"/usuarios?q={marker}"),
               ("parent",f"/pacientes?q={marker}"),("parent",f"/pacientes/{patient}/tratamientos"),
               ("parent","/citas"),("parent","/sesiones"),("parent","/conversaciones/contactos")]
        for who,path in reads: await call(who,"GET","/api/v1"+path)
        await call("admin","PATCH",f"/api/v1/admin/cuentas/{uid}",json={"nombres":"AUDITORIA"})
        # Restablecer la misma contraseña sintética prueba revocación sin invalidar
        # las credenciales retenidas del guion; afecta exclusivamente al usuario nuevo.
        await call("admin","PATCH",f"/api/v1/usuarios/{uid}",json={"password":credentials["password"]})
        await call("other_parent","GET","/api/v1/auth/me",401)
        await call("parent","PATCH",f"/api/v1/padres/hijos/{patient2}/inactivar")
        await call("admin","PATCH",f"/api/v1/admin/pacientes/{patient2}/reactivar")
        success=True
    finally:
        for who,client in clients.items():
            try: await call(who,"POST","/api/v1/auth/logout")
            finally: await client.aclose()
        output.write_text(json.dumps({"marker":audit["marker"],"success":success,"requests":results},
                                    indent=2,ensure_ascii=False),encoding="utf-8")
    return success,len(results)


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--execute-authorized",action="store_true",required=True)
    parser.add_argument("--source",type=Path,required=True)
    parser.add_argument("--private",type=Path,required=True)
    parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args()
    success,count=asyncio.run(run(args.source,args.private,args.output))
    print(json.dumps({"success":success,"requests":count}))
    raise SystemExit(0 if success else 1)
