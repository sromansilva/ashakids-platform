"""Hosted acceptance: new AUDITORIA records only; old admin secret stays local."""
import asyncio,json,secrets
from datetime import datetime,timezone
from pathlib import Path
from dotenv import dotenv_values
import httpx
from app.core import database
from app.main import app
from app.core.config import BACKEND_DIR
import scripts.verify_hardening_journey as source

root=Path(__file__).resolve().parents[3]
origin='https://ashakids.onrender.com'
class HostedJourney(source.Journey):
    def __init__(self,output,marker):
        super().__init__(output)
        self.marker=marker
        self.private['marker']=marker
        self.result.update(api=origin,marker=marker,target='Render HTTPS -> ashakids_runtime -> same Supabase')
    def client(self,name):
        client=httpx.AsyncClient(base_url=origin,timeout=40,headers={'Origin':origin})
        self.clients[name]=client
        return client
    async def call(self,who,method,path,expected=200,case=None,**kwargs):
        response=await super().call(who,method,path,expected,case,**kwargs)
        if path=='/api/v1/auth/login' and expected==200:
            cookie=response.headers.get('set-cookie','').lower()
            flags={'actor':who,'secure':'; secure' in cookie,'http_only':'; httponly' in cookie,'same_site_lax':'samesite=lax' in cookie}
            assert all(flags[key] for key in ('secure','http_only','same_site_lax'))
            self.result.setdefault('cookie_flags',[]).append(flags)
        return response

async def main():
    marker='AUDITORIA_RENDER_'+datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
    private=json.loads((root/'tmp/render-runtime-private.json').read_text())
    database.init_db(private['database_url'])
    output=root/'tmp/render-journey.json'
    journey=HostedJourney(output,marker)
    values=dotenv_values(BACKEND_DIR/'.env')
    seed_code='a'+secrets.token_hex(3)[:5]
    original_reader=source.dotenv_values
    try:
        async with httpx.AsyncClient(base_url='https://local-bootstrap.invalid',transport=httpx.ASGITransport(app=app),timeout=40) as local:
            response=await local.post('/api/v1/auth/login',json={'codigo_usuario':values['ASHAKIDS_AUDIT_ADMIN_CODE'],'password':values['ASHAKIDS_AUDIT_ADMIN_PASSWORD']})
            assert response.status_code==200
            try:
                response=await local.post('/api/v1/usuarios',json={'nombres':'AUDITORIA','apellidos':marker+'_bootstrap','email':marker.lower()+'.bootstrap@example.com','password':journey.password,'rol':'ADMIN','codigo_usuario':seed_code})
                assert response.status_code==201
                seed_id=response.json()['id_usuario']
                journey.ids['users'].append(seed_id)
                journey.private['accounts']['seed_admin']={'code':seed_code,'id':seed_id}
            finally:
                logout=await local.post('/api/v1/auth/logout')
                assert logout.status_code==200
        journey.result['bootstrap']='Existing admin login/create synthetic seed/logout in local ASGI; secret never sent to Render'
        source.dotenv_values=lambda path:{'ASHAKIDS_AUDIT_ADMIN_CODE':seed_code,'ASHAKIDS_AUDIT_ADMIN_PASSWORD':journey.password}
        await journey.run()
        await journey.call('admin','POST','/api/v1/auth/logout',403,case='foreign origin rejected',headers={'Origin':'https://audit.example.invalid'})
        await journey.call('admin','GET','/api/v1/auth/me')
        journey.result['foreign_origin_rejected']=True
    except Exception as exc:
        journey.result['success']=False
        journey.result['error_type']=type(exc).__name__
    finally:
        source.dotenv_values=original_reader
        await journey.finish()
    print(json.dumps({'success':journey.result.get('success',False),'requests':len(journey.result['requests']),'marker':marker,'ids':journey.ids,'error_type':journey.result.get('error_type'),'cookie_checks':len(journey.result.get('cookie_flags',[]))}))
    if not journey.result.get('success'): raise SystemExit(1)
if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--execute-authorized',action='store_true',required=True)
    parser.parse_args()
    asyncio.run(main())
