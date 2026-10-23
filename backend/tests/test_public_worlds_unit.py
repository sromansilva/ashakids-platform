"""Access and public catalog regression checks, no database or real accounts."""
import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from types import SimpleNamespace
from unittest.mock import AsyncMock,patch,MagicMock
from fastapi import FastAPI,HTTPException
import httpx
from app.api.v1.juegos import router
from app.core.database import get_db
from app.services import juegos
from app.services.juegos_catalogo import catalogo_publico

class PublicWorldTests(unittest.IsolatedAsyncioTestCase):
    def test_public_metadata_has_no_exercises_or_answers(self):
        data=catalogo_publico()
        self.assertEqual(len(data),5)
        for world in data:
            expected_levels = [{'number': i + 1} for i in range(5 if world['id'] == 'VOZ' else 3)]
            self.assertEqual(world['levels'], expected_levels)
            self.assertEqual(set(world),{'id','version','name','description','levels'})

    async def test_http_guests_can_only_read_metadata(self):
        app=FastAPI();app.include_router(router,prefix='/api/v1')
        async def fake_db():yield object()
        app.dependency_overrides[get_db]=fake_db
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://test') as client:
            self.assertEqual((await client.get('/api/v1/juegos/catalogo')).status_code,200)
            self.assertEqual((await client.get('/api/v1/pacientes/1/juegos')).status_code,401)
            self.assertEqual((await client.post('/api/v1/pacientes/1/juegos/HABLA/intentos',json={})).status_code,401)

    async def test_wrong_role_cannot_record(self):
        with self.assertRaises(HTTPException) as err:
            await juegos.registrar(None,(SimpleNamespace(),['TERAPEUTA']),1,'HABLA',None)
        self.assertEqual(err.exception.status_code,403)

    async def test_unassigned_world_cannot_record(self):
        db=AsyncMock()
        with patch.object(juegos,'paciente_visible',AsyncMock(return_value=SimpleNamespace(activo=True))),patch.object(juegos,'es_familia',AsyncMock(return_value=True)),patch.object(juegos,'asignados',AsyncMock(return_value=[])):
            with self.assertRaises(HTTPException) as err:
                await juegos.registrar(db,(SimpleNamespace(),['PADRE']),1,'HABLA',None)
        self.assertEqual(err.exception.status_code,403)
        db.flush.assert_not_awaited()

    async def test_child_access_denial_is_preserved(self):
        with patch.object(juegos,'paciente_visible',AsyncMock(side_effect=HTTPException(404,'Recurso no encontrado.'))):
            with self.assertRaises(HTTPException) as err:
                await juegos.resumen(None,(SimpleNamespace(),['PADRE']),42)
        self.assertEqual(err.exception.status_code,404)

    async def test_summary_only_exposes_assigned_exercises(self):
        db=AsyncMock();db.scalar.return_value=None
        result=MagicMock();result.all.return_value=[];db.execute.return_value=result
        with patch.object(juegos,'paciente_visible',AsyncMock(return_value=SimpleNamespace(id_paciente=1))),patch.object(juegos,'asignados',AsyncMock(return_value=['HABLA'])):
            data=await juegos.resumen(db,(SimpleNamespace(),['PADRE']),1)
        for world in data['mundos']:
            self.assertEqual(len(world['levels']),3 if world['id']=='HABLA' else 0)
            for level in world['levels']:self.assertNotIn('answer',level)

class StaticCacheTests(unittest.IsolatedAsyncioTestCase):
    async def test_only_hashed_webp_uses_immutable_cache(self):
        from tempfile import TemporaryDirectory
        from app.core.frontend_hosting import FrontendFiles
        with TemporaryDirectory() as directory:
            root=Path(directory);(root/'illustrations/optimized').mkdir(parents=True)
            (root/'index.html').write_text('<html>Prueba</html>')
            name='illustrations/optimized/test-320-aabbccddee.webp'
            (root/name).write_bytes(b'RIFFsynthetic')
            app=FastAPI();app.mount('/',FrontendFiles(directory=directory,html=True))
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://test') as client:
                response=await client.get('/'+name)
                self.assertEqual(response.headers['cache-control'],'public, max-age=31536000, immutable')
                self.assertEqual((await client.get('/')).headers['cache-control'],'no-cache')
                self.assertEqual((await client.get('/illustrations/optimized/missing.webp')).status_code,404)

if __name__=='__main__' :unittest.main(verbosity=2)
