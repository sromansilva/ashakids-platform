import asyncio,json
from datetime import datetime,timezone
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import Settings
from app.core.database_transport import engine_options

root=Path(__file__).resolve().parents[3]
async def main():
    private=json.loads((root/'tmp/render-runtime-private.json').read_text())
    config=Settings(_env_file=None,DATABASE_URL=private['database_url'],ENVIRONMENT='production',CORS_ORIGINS=['https://ashakids.onrender.com'],DB_SSL_CA_FILE=private['ca_file'],DB_SSL_LEGACY_CA=private['legacy_ca'])
    url,opts=engine_options(private['database_url'],config)
    engine=create_async_engine(url,**opts)
    result={'captured_utc':datetime.now(timezone.utc).isoformat(),'mode':'READ ONLY, only new AUDITORIA IDs','marker':'AUDITORIA_RENDER_20261010_014323'}
    try:
        async with engine.connect() as db:
            await db.execute(text('SET TRANSACTION READ ONLY'))
            result['role']=await db.scalar(text('SELECT current_user'))
            assert result['role']=='ashakids_runtime'
            result['counts']={}
            queries={
              'users':('SELECT count(*) FROM usuarios WHERE id_usuario BETWEEN 72 AND 77',6),
              'patients_active':('SELECT count(*) FROM pacientes WHERE id_paciente IN (95,96) AND activo',2),
              'treatments':('SELECT count(*) FROM tratamientos WHERE id_tratamiento IN (15,16)',2),
              'appointments':('SELECT count(*) FROM reservas WHERE id_reserva IN (12,13)',2),
              'finalized_sessions':("SELECT count(*) FROM sesiones WHERE id_sesion IN (11,12) AND estado_sesion='FINALIZADA'",2),
              'complete_reports':("SELECT count(*) FROM reportes_sesion WHERE id_sesion IN (11,12) AND observaciones_iniciales IS NOT NULL AND objetivos_trabajados IS NOT NULL AND nivel_ayuda IS NOT NULL AND proximos_pasos IS NOT NULL",1),
              'messages':('SELECT count(*) FROM mensajes WHERE id_conversacion=6',2),
              'unrevoked_auth_sessions':('SELECT count(*) FROM sesiones_autenticacion WHERE id_usuario BETWEEN 72 AND 77 AND NOT revocado',0),
            }
            for label,(sql,expected) in queries.items():
                count=await db.scalar(text(sql))
                result['counts'][label]=count
                assert count==expected,label
            result['success']=True
    finally:
        await engine.dispose()
        (root/'tmp/render-persistence.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(result))
asyncio.run(main())
