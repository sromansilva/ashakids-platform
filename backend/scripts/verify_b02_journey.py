"""Cohorte AUDITORIA nueva contra el rol candidato, antes de cambiar API8000.

ASGI en proceso: FastAPI/SQL reales, sin abrir puerto o sustituir backend/.env.
"""
import argparse
import asyncio
import json
from pathlib import Path
import httpx
from app.core import database
from app.main import app
from scripts.verify_hardening_journey import Journey, BASE
from scripts.b02_role_inventory import ROLE

class CandidateJourney(Journey):
    def client(self,name):
        client=httpx.AsyncClient(base_url=BASE,timeout=25,transport=httpx.ASGITransport(app=app))
        self.clients[name]=client
        return client

async def run(private,output):
    credentials=json.loads(private.read_text(encoding='utf-8'))
    if credentials['role']!=ROLE: raise ValueError('Wrong candidate')
    if database.async_engine: await database.async_engine.dispose()
    database.init_db(credentials['runtime_url'])
    journey=CandidateJourney(output)
    journey.result.update({'target':'ashakids_runtime; same configured Supabase database',
                          'api_transport':'FastAPI ASGI in-process; candidate role, no new port'})
    try:
        await journey.run()
    except Exception as exc:
        journey.result['error_type']=type(exc).__name__
    finally:
        await journey.finish()
    print(json.dumps({'success':journey.result.get('success',False),'requests':len(journey.result['requests']),
                      'marker':journey.marker,'ids':journey.ids,'error_type':journey.result.get('error_type')}))
    return journey.result.get('success',False)

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--execute-authorized',action='store_true',required=True)
    parser.add_argument('--private',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    raise SystemExit(0 if asyncio.run(run(args.private,args.output)) else 1)
