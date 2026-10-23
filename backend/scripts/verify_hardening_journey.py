"""Recorrido acotado autorizado: solo cuentas y clínica AUDITORIA NUEVAS.

Nunca TRUNCATE, DDL, DELETE físico ni edición de registros preexistentes.
Puerto8000 obligatorio. Credenciales iniciales: ASHAKIDS_AUDIT_ADMIN_CODE/PASSWORD
en .env privado. --execute-authorized confirma la autorización humana registrada.
Los secretos nuevos se guardan solo en tmp ignorado; la evidencia no contiene payloads.
"""
import argparse
import asyncio
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import secrets
import time

from dotenv import dotenv_values
import httpx
from sqlalchemy import text

from app.core import database
from app.core.config import BACKEND_DIR
from app.services.auth_service import hash_session_token

ROOT = BACKEND_DIR.parent
BASE = "http://127.0.0.1:8000"


class Journey:
    def __init__(self, output):
        self.output = output
        self.marker = "AUDITORIA13_" + datetime.now(timezone.utc).strftime("%H%M%S")
        self.password = secrets.token_urlsafe(24)
        self.clients = {}
        self.ids = {"users": [], "patients": [], "treatments": [], "appointments": [], "sessions": [], "conversations": []}
        self.result = {"captured_utc": datetime.now(timezone.utc).isoformat(), "target": "Supabase backend/.env",
                       "api": BASE, "marker": self.marker, "requests": [], "ids": self.ids,
                       "limits": "Only new synthetic IDs; no DDL/TRUNCATE/physical DELETE; no load test."}
        self.private = {"marker": self.marker, "password": self.password, "accounts": {}}

    def client(self, name):
        client = httpx.AsyncClient(base_url=BASE, timeout=25)
        self.clients[name] = client
        return client

    async def call(self, who, method, path, expected=200, case=None, **kwargs):
        start = time.monotonic()
        response = await self.clients[who].request(method, path, **kwargs)
        self.result["requests"].append({"actor": who, "method": method, "path": path,
            "case": case or path, "expected": expected, "obtained": response.status_code,
            "duration_ms": round(1000*(time.monotonic()-start), 1)})
        if response.status_code != expected:
            # No imprimir el body: puede incluir datos de cuenta o SQL del servidor.
            raise RuntimeError(f"Caso {case or path}: esperado {expected}, obtenido {response.status_code}")
        return response

    async def login(self, name, code, password=None):
        self.client(name)
        await self.call(name, "POST", "/api/v1/auth/login", json={"codigo_usuario": code, "password": password or self.password})

    async def prove_target(self, who):
        token = self.clients[who].cookies.get("ashakids_session")
        async with database.async_engine.connect() as db:
            await db.execute(text("SET TRANSACTION READ ONLY"))
            user_id = await db.scalar(text("SELECT id_usuario FROM sesiones_autenticacion "
                "WHERE token_hash=:h AND NOT revocado AND fecha_expiracion>now()"), {"h": hash_session_token(token)})
        if user_id is None:
            raise RuntimeError("La sesión de API8000 no pertenece a la BD configurada; no continuar escrituras.")
        self.result.setdefault("target_proofs", []).append({"actor": who, "matched": True})
        return user_id

    async def new_account(self, label, role, generic=False):
        payload = {"nombres": "AUDITORIA", "apellidos": self.marker+"_"+label,
                   "email": f"{self.marker.lower()}.{label}@example.com", "password": self.password}
        if generic:
            code = ("a" if role == "ADMIN" else "p") + secrets.token_hex(3)[:5]
            payload.update(rol=role, codigo_usuario=code)
            row = (await self.call("bootstrap" if label=="admin" else "admin", "POST", "/api/v1/usuarios", 201, json=payload)).json()
        else:
            route = "/api/v1/admin/cuentas/"+("padres" if role == "PADRE" else "terapeutas")
            row = (await self.call("admin", "POST", route, 201, json=payload)).json()["cuenta"]
        self.ids["users"].append(row["id_usuario"])
        self.private["accounts"][label] = {"code": row["codigo_usuario"], "id": row["id_usuario"]}
        await self.login(label, row["codigo_usuario"])
        detail = (await self.call("admin" if label!="admin" else "admin", "GET", f"/api/v1/usuarios/{row['id_usuario']}")).json()
        return detail

    def retain(self, kind, row, field):
        key = row[field]
        self.ids[kind].append(key)
        return key

    async def race(self, who, method, path, expected, **kwargs):
        responses=await asyncio.gather(*(self.clients[actor].request(method,path,**kwargs)
                                         for actor in (who,who+"_peer")))
        obtained=sorted(r.status_code for r in responses)
        self.result.setdefault("concurrent_transitions",[]).append({"path":path,"expected":expected,"obtained":obtained})
        if obtained!=expected: raise RuntimeError("Transición concurrente incorrecta.")
        for r in responses:
            self.result["requests"].append({"actor":who,"method":method,"path":path,"case":"concurrent transition",
                "expected":r.status_code,"obtained":r.status_code})
        return responses

    async def run(self):
        credentials = dotenv_values(BACKEND_DIR / ".env")
        code, password = credentials.get("ASHAKIDS_AUDIT_ADMIN_CODE"), credentials.get("ASHAKIDS_AUDIT_ADMIN_PASSWORD")
        if not code or not password:
            raise RuntimeError("Faltan credenciales ADMIN privadas; no hubo alta de registros.")
        await self.login("bootstrap", code, password)
        await self.prove_target("bootstrap")
        await self.call("bootstrap", "GET", "/api/v1/admin/me")
        await self.new_account("admin", "ADMIN", generic=True)
        await self.prove_target("admin")
        await self.call("bootstrap", "POST", "/api/v1/auth/logout")
        p1 = await self.new_account("parent", "PADRE")
        await self.new_account("other_parent", "PADRE", generic=True)
        t1 = await self.new_account("therapist", "TERAPEUTA")
        t2 = await self.new_account("other_therapist", "TERAPEUTA")
        # Sesiones distintas: ultima_actividad no debe serializar ambos pedidos
        # sobre la misma fila de autenticación y ocultar carreras de negocio.
        for who in ("parent","therapist"):
            await self.login(who+"_peer",self.private["accounts"][who]["code"])
        self.result["concurrency_uses_distinct_auth_sessions"]=True
        for who, path in (("parent", "/padres/me"), ("therapist", "/terapeutas/me"), ("admin", "/admin/me")):
            await self.call(who, "GET", "/api/v1"+path)
        payload = {"nombres_paciente":"AUDITORIA", "apellidos_paciente":self.marker,
                   "fecha_nacimiento":"2018-01-01", "sexo":"M"}
        child = (await self.call("parent", "POST", "/api/v1/padres/hijos", 201, json=payload)).json()["paciente"]
        patient = self.retain("patients", child, "id_paciente")
        child2 = (await self.call("admin", "POST", "/api/v1/pacientes", 201,
                    json={**payload, "sexo":"Femenino", "id_tutor":p1["id_tutor"]})).json()
        patient2 = self.retain("patients", child2, "id_paciente")
        await self.call("parent", "PATCH", f"/api/v1/padres/hijos/{patient}", json={"avatar_nombre":"oso"})
        await self.call("admin", "PUT", f"/api/v1/pacientes/{patient2}", json={**payload,"sexo":"OTRO"})
        for route in ("/padres/hijos", "/pacientes"):
            await self.call("parent", "POST", "/api/v1"+route, 422,
                            case="invalid sex "+route, json={**payload,"sexo":"INVALID"})
        for route in ("/usuarios", "/admin/cuentas/padres", "/admin/cuentas/terapeutas"):
            invalid = {"nombres":"AUDITORIA", "apellidos":self.marker,"email":"invalid@example.com", "password":"short"}
            if route=="/usuarios": invalid.update(rol="PADRE", codigo_usuario="pzzzzz")
            await self.call("admin", "POST", "/api/v1"+route, 422, case="short password "+route, json=invalid)
        treatments = []
        for pid, therapist in ((patient,t1),(patient2,t2)):
            data = {"id_paciente":pid,"id_terapeuta":therapist["id_terapeuta"],"nombre_tratamiento":self.marker}
            row = (await self.call("admin","POST","/api/v1/tratamientos",201,json=data)).json()
            treatments.append(self.retain("treatments",row,"id_tratamiento"))
        future = datetime.now(timezone.utc)+timedelta(days=1)
        def schedule(start, minutes=30):
            return {"fecha_hora_inicio":start.isoformat(),"fecha_hora_fin":(start+timedelta(minutes=minutes)).isoformat(),"modalidad":"VIRTUAL"}
        data={**schedule(future),"id_tratamiento":treatments[0]}
        # Esperar un201 y un409 sin suponer cuál gana.
        start = time.monotonic()
        responses = await asyncio.gather(*(self.clients[who].post("/api/v1/citas",json=data) for who in ("parent","parent_peer")))
        self.result["reservation_concurrency"] = sorted(r.status_code for r in responses)
        if self.result["reservation_concurrency"] != [201,409]: raise RuntimeError("Carrera de reservas no serializada.")
        for r in responses:
            self.result["requests"].append({"actor":"parent","method":"POST","path":"/api/v1/citas","case":"concurrent reservation","expected":r.status_code,"obtained":r.status_code})
        appointment = self.retain("appointments",next(r.json() for r in responses if r.status_code==201),"id_reserva")
        await self.call("parent","PUT",f"/api/v1/citas/{appointment}",json=schedule(future+timedelta(hours=1)))
        for who in ("other_parent","other_therapist"):
            for path in (f"/pacientes/{patient}",f"/citas/{appointment}"):
                await self.call(who,"GET","/api/v1"+path,404)
        await self.call("parent","PATCH",f"/api/v1/citas/{appointment}/estado",403,json={"estado_reserva":"CONFIRMADA"})
        # Acercar solo la cita nueva. Sin SQL clínico ni cambios al reloj.
        begin = datetime.now(timezone.utc)+timedelta(seconds=30)
        await self.call("parent","PUT",f"/api/v1/citas/{appointment}",json=schedule(begin,2))
        await self.call("therapist","PATCH",f"/api/v1/citas/{appointment}/estado",json={"estado_reserva":"CONFIRMADA"})
        responses=await asyncio.gather(*(self.clients[who].post("/api/v1/sesiones",json={"id_reserva":appointment}) for who in ("therapist","therapist_peer")))
        self.result["session_concurrency"]=sorted(r.status_code for r in responses)
        if self.result["session_concurrency"]!=[201,409]: raise RuntimeError("Doble creación de sesión.")
        for r in responses:
            self.result["requests"].append({"actor":"therapist","method":"POST","path":"/api/v1/sesiones","case":"concurrent session create","expected":r.status_code,"obtained":r.status_code})
        session=self.retain("sessions",next(r.json() for r in responses if r.status_code==201),"id_sesion")
        await self.call("therapist","POST",f"/api/v1/sesiones/{session}/iniciar",409,case="start before appointment")
        # Chat: pareja/tutor/profesional nuevos, apertura concurrente sin historial anterior.
        chat_data={"id_tutor":p1["id_tutor"],"id_terapeuta":t1["id_terapeuta"]}
        chats=await asyncio.gather(*(self.call(who,"POST","/api/v1/conversaciones",json=chat_data) for who in ("parent","parent_peer")))
        chat=chats[0].json()["id_conversacion"]
        if chats[1].json()["id_conversacion"]!=chat: raise RuntimeError("Chat duplicado.")
        self.ids["conversations"].append(chat)
        self.result["chat_concurrency"]="same_new_id"
        await self.call("admin","GET",f"/api/v1/conversaciones/{chat}",403)
        await self.call("other_parent","GET",f"/api/v1/conversaciones/{chat}",404)
        for who in ("parent","therapist"):
            await self.call(who,"POST",f"/api/v1/conversaciones/{chat}/mensajes",201,json={"texto_mensaje":self.marker+" mensaje "+who})
        await self.call("parent","POST",f"/api/v1/conversaciones/{chat}/mensajes",422,json={"texto_mensaje":" "})
        await self.call("parent","GET","/api/v1/conversaciones")
        await self.call("therapist","GET",f"/api/v1/conversaciones/{chat}/mensajes?limit=1")
        no_show_begin=datetime.now(timezone.utc)+timedelta(seconds=20)
        no_show_end=no_show_begin+timedelta(seconds=15)
        no_show=(await self.call("parent","POST","/api/v1/citas",201,json={
            "id_tratamiento":treatments[1],"fecha_hora_inicio":no_show_begin.isoformat(),
            "fecha_hora_fin":no_show_end.isoformat(),"modalidad":"VIRTUAL"})).json()
        no_show_id=self.retain("appointments",no_show,"id_reserva")
        await self.call("other_therapist","PATCH",f"/api/v1/citas/{no_show_id}/estado",json={"estado_reserva":"CONFIRMADA"})
        no_show_session=(await self.call("other_therapist","POST","/api/v1/sesiones",201,json={"id_reserva":no_show_id})).json()
        no_show_key=self.retain("sessions",no_show_session,"id_sesion")
        await self.call("other_therapist","POST",f"/api/v1/sesiones/{no_show_key}/cerrar",409,case="early no-show",
                        json={"asistencia":"NO_ASISTIO"})
        wait=max(0,(begin-datetime.now(timezone.utc)).total_seconds()+1)
        print(json.dumps({"checkpoint":"waiting_for_new_appointment","seconds":round(wait),"new_ids":self.ids}),flush=True)
        await asyncio.sleep(wait)
        await self.race("therapist","POST",f"/api/v1/sesiones/{session}/iniciar",[200,409])
        await self.call("therapist","POST",f"/api/v1/sesiones/{session}/iniciar",409,case="repeated start")
        report={"observaciones_iniciales":self.marker,"objetivos_trabajados":"Prueba sintética","nivel_ayuda":"Sin datos clínicos reales","proximos_pasos":"Verificación de persistencia"}
        responses=await asyncio.gather(*(self.call(who,"PUT",f"/api/v1/sesiones/{session}/reporte",json={**report,"objetivos_trabajados":text})
            for who,text in (("therapist","Escritor A"),("therapist_peer","Escritor B"))))
        await self.call("therapist","PUT",f"/api/v1/sesiones/{session}/reporte",422,json={"nivel_ayuda":"x"*10001})
        saved=(await self.call("parent","GET",f"/api/v1/sesiones/{session}/reporte")).json()
        if saved["objetivos_trabajados"] not in {"Escritor A","Escritor B"}: raise RuntimeError("Reporte parcial.")
        self.result["concurrent_report"]="one_complete_report_last_writer_wins"
        await self.race("therapist","POST",f"/api/v1/sesiones/{session}/cerrar",[200,409],json={"asistencia":"ASISTIO"})
        await self.call("therapist","POST",f"/api/v1/sesiones/{session}/cerrar",409,case="repeated close",json={"asistencia":"ASISTIO"})
        for who in ("other_parent","other_therapist"):
            for suffix in ("", "/reporte", "/reporte/pdf"):
                await self.call(who,"GET",f"/api/v1/sesiones/{session}"+suffix,404)
        pdf=await self.call("parent","GET",f"/api/v1/sesiones/{session}/reporte/pdf")
        if not pdf.content.startswith(b"%PDF-"): raise RuntimeError("PDF inválido.")
        self.output.parent.joinpath("report-synthetic.pdf").write_bytes(pdf.content)
        await self.call("parent","POST","/api/v1/auth/logout")
        await self.call("parent","GET","/api/v1/auth/me",401)
        # Crear cliente limpio para la recarga/relogin.
        await self.clients["parent"].aclose()
        await self.login("parent",self.private["accounts"]["parent"]["code"])
        reload=(await self.call("parent","GET",f"/api/v1/sesiones/{session}/reporte")).json()
        assert saved == reload
        self.result["report_persists_after_relogin"]=True
        await self.call("admin","PATCH",f"/api/v1/admin/cuentas/{p1['id_usuario']}/suspender")
        await self.call("parent","GET","/api/v1/auth/me",401,case="suspended session rejected")
        await self.call("admin","PATCH",f"/api/v1/admin/cuentas/{p1['id_usuario']}/activar")
        await self.call("parent","GET","/api/v1/auth/me",401,case="reactivation does not revive session")
        await self.clients["parent"].aclose()
        await self.login("parent",self.private["accounts"]["parent"]["code"])
        await self.call("parent","GET",f"/api/v1/conversaciones/{chat}/mensajes")
        wait=max(0,(no_show_end-datetime.now(timezone.utc)).total_seconds()+1)
        if wait: await asyncio.sleep(wait)
        await self.call("other_therapist","POST",f"/api/v1/sesiones/{no_show_key}/cerrar",json={"asistencia":"NO_ASISTIO"})
        await self.call("other_therapist","POST",f"/api/v1/sesiones/{no_show_key}/cerrar",409,case="repeated no-show",json={"asistencia":"NO_ASISTIO"})
        await self.call("parent","DELETE",f"/api/v1/pacientes/{patient2}",case="logical deactivation only")
        await self.call("admin","PATCH",f"/api/v1/admin/pacientes/{patient2}/reactivar")
        self.result["success"]=True

    async def finish(self):
        for who, client in self.clients.items():
            try:
                if client.is_closed: continue
                await self.call(who,"POST","/api/v1/auth/logout")
            except Exception as exc:
                self.result.setdefault("cleanup_warnings",[]).append({"actor":who,"error_type":type(exc).__name__})
            await client.aclose()
        self.output.parent.mkdir(parents=True, exist_ok=True)
        self.output.write_text(json.dumps(self.result,indent=2,ensure_ascii=False),encoding="utf-8")
        private=ROOT/"tmp"/(self.marker+"-private.json")
        private.parent.mkdir(parents=True,exist_ok=True)
        private.write_text(json.dumps(self.private,indent=2),encoding="utf-8")
        if database.async_engine: await database.async_engine.dispose()


async def main(output):
    journey=Journey(output)
    try:
        output.parent.mkdir(parents=True,exist_ok=True)
        await journey.run()
    except Exception as exc:
        journey.result["error_type"]=type(exc).__name__
        print(json.dumps({"journey":"failed","error_type":type(exc).__name__}),flush=True)
    finally:
        await journey.finish()
    print(json.dumps({"success":journey.result.get("success",False),"requests":len(journey.result["requests"]),"ids":journey.ids}))
    return journey.result.get("success",False)


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--execute-authorized",action="store_true",required=True)
    parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args()
    raise SystemExit(0 if asyncio.run(main(args.output)) else 1)
