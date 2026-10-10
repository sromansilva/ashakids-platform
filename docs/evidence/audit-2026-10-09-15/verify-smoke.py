import asyncio, json
from pathlib import Path
import httpx
root=Path(__file__).resolve().parents[3]
async def main():
    result={'origin':'https://ashakids.onrender.com','checks':[]}
    async with httpx.AsyncClient(base_url=result['origin'],timeout=60,headers={'Origin':result['origin']}) as client:
        for path in ['/health','/health/ready','/','/login','/assets/AUDITORIA-missing.js','/api/v1/AUDITORIA-missing','/api/v1/auth/me']:
            response=await client.get(path,headers={'Accept':'text/html' if path in ['/','/login'] else 'application/json'})
            result['checks'].append({'method':'GET','path':path,'status':response.status_code,'content_type':response.headers.get('content-type'),'cache_control':response.headers.get('cache-control')})
        response=await client.post('/api/v1/auth/login',json={})
        result['checks'].append({'method':'POST','path':'/api/v1/auth/login','case':'HTTPS transport; invalid empty body; no credentials or login session','status':response.status_code})
    (root/'tmp/render-http-checks.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(result,indent=2))
asyncio.run(main())
