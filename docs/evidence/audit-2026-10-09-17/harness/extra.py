import asyncio,json,time,re
from pathlib import Path
import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import Settings
from app.core.database_transport import engine_options
from scripts.inspect_schema_compatibility import COLUMNS,TABLES,CONSTRAINTS,INDEXES,model_differences,Base
root=Path.cwd(); audit=json.loads((root/'tmp/audit17-journey.json').read_text()); private=json.loads((root/'tmp'/f'{audit["marker"]}-private.json').read_text()); runtime=json.loads((root/'tmp/render-runtime-private.json').read_text()); origin=audit['api']
async def main():
 result={'marker':audit['marker'],'requests':[]}
 async with httpx.AsyncClient(base_url=origin,timeout=40,headers={'Origin':origin}) as c:
  async def call(method,path,expected,**kw):
   start=time.perf_counter(); r=await c.request(method,path,**kw); result['requests'].append({'method':method,'path':path,'expected':expected,'obtained':r.status_code,'duration_ms':round((time.perf_counter()-start)*1000,1)}); print(json.dumps(result["requests"][-1])); assert r.status_code==expected; return r
  for path in ['/','/login','/mundo-asha','/health','/health/ready','/openapi.json']:
   r=await call('GET',path,200,headers={'Accept':'text/html' if path in ['/', '/login', '/mundo-asha'] else 'application/json'})
   if path=='/openapi.json': result['openapi_operations']=[{'method':m.upper(),'path':p} for p,item in r.json()['paths'].items() for m in item if m in ['get','post','put','patch','delete']]
  await call('GET','/api/v1/auth/me',401)
  try:
   await call('POST','/api/v1/auth/login',200,json={'codigo_usuario':private['accounts']['therapist']['code'],'password':private['password']})
   path=f'/api/v1/sesiones/{audit["ids"]["sessions"][0]}/reporte'
   report=(await call('GET',path,200)).json(); payload=report|{'proximos_pasos':audit['marker']+' reproduction extras'}
   rejected=await call('PUT',path,422,json=payload)
   result['frontend_reproduction']={'extra_fields':sorted(set(report)-{'observaciones_iniciales','objetivos_trabajados','nivel_ayuda','proximos_pasos'}),'errors':[{'loc':e['loc'],'type':e['type']} for e in rejected.json()['detail']]}
   after=(await call('GET',path,200)).json(); result['rejected_write_preserved_report']=after==report; assert after==report
   await call('PUT',path,200,json={k:report[k] for k in ('observaciones_iniciales','objetivos_trabajados','nivel_ayuda','proximos_pasos')})
  finally: await call('POST','/api/v1/auth/logout',200)
  await call('GET','/api/v1/auth/me',401)
 config=Settings(_env_file=None,DATABASE_URL=runtime['database_url'],ENVIRONMENT='production',CORS_ORIGINS=[origin],DB_SSL_CA_FILE=runtime['ca_file'],DB_SSL_LEGACY_CA=runtime['legacy_ca']);url,opts=engine_options(runtime['database_url'],config); engine=create_async_engine(url,**opts)
 try:
  async with engine.connect() as db:
   await db.execute(text('SET TRANSACTION READ ONLY'))
   result['metadata']={'server_version':await db.scalar(text('SHOW server_version')),'role':await db.scalar(text('SELECT current_user')),'read_only':await db.scalar(text('SHOW transaction_read_only'))}
   for name,sql in [('tables',TABLES),('columns',COLUMNS),('constraints',CONSTRAINTS),('indexes',INDEXES)]: result['metadata'][name]=[dict(row) for row in (await db.execute(text(sql))).mappings().all()]
   result['metadata']['model_tables']=len(Base.metadata.tables);result['metadata']['model_differences']=model_differences(result['metadata']['columns']);assert not result['metadata']['model_differences']
  result['success']=True
 finally: await engine.dispose()
 (root/'tmp/audit17-extra.json').write_text(json.dumps(result,indent=2,ensure_ascii=False,default=lambda v:v.decode() if isinstance(v,bytes) else str(v)),encoding='utf-8')
 print(json.dumps({'success':result['success'],'requests':len(result['requests']),'operations':len(result['openapi_operations']),'model_differences':len(result['metadata']['model_differences']),'rejected_write_preserved_report':result['rejected_write_preserved_report']}))
asyncio.run(main())
