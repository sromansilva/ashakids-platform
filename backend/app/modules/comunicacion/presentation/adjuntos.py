from urllib.parse import quote
from fastapi import APIRouter, Request, Response, HTTPException
from pydantic import ValidationError
from starlette.datastructures import UploadFile
from app.shared.presentation.contracts import DB, Identity
from app.modules.comunicacion.presentation.mensajeria import Key
from app.modules.comunicacion.domain.mensajeria_schemas import MensajeSalida
from app.modules.comunicacion.application import adjuntos, mensajeria

router = APIRouter(prefix='/conversaciones', tags=['Mensajería'])

@router.post('/{key}/mensajes/adjunto', response_model=MensajeSalida, status_code=201,
    openapi_extra={'requestBody': {'required': True, 'content': {'multipart/form-data': {'schema': {
        'type': 'object', 'required': ['archivo', 'clave_envio'], 'properties': {
            'archivo': {'type': 'string', 'format': 'binary'},
            'texto_mensaje': {'type': 'string', 'maxLength': 4000},
            'clave_envio': {'type': 'string', 'format': 'uuid'},
        }}}}}})
async def enviar(key: Key, request: Request, db: DB, identity: Identity):
    await mensajeria.visible(db, identity, key)
    async with request.form(max_files=1, max_fields=2, max_part_size=16384) as form:
        file, text, token = form.get('archivo'), form.get('texto_mensaje', ''), form.get('clave_envio')
        if not isinstance(file, UploadFile) or not isinstance(text, str) or not isinstance(token, str):
            raise HTTPException(422, 'Selecciona un archivo y una clave de envío válida.')
        if set(form.keys()) - {'archivo', 'texto_mensaje', 'clave_envio'}:
            raise HTTPException(422, 'Campos de adjunto no admitidos.')
        try:
            return await adjuntos.enviar(db, identity, key, file, text, token)
        except ValidationError:
            raise HTTPException(422, 'El texto debe tener entre 1 y 4000 caracteres válidos.')

@router.get('/{key}/adjuntos/{attachment}')
async def descargar(key: Key, attachment: Key, db: DB, identity: Identity):
    row = await adjuntos.descargar(db, identity, key, attachment)
    # Los documentos se descargan; solo medios no activos se muestran en el chat.
    disposition = 'inline' if row.mime_type.startswith(('image/', 'audio/', 'video/')) else 'attachment'
    return Response(row.contenido, media_type=row.mime_type, headers={
        'Content-Disposition': f"{disposition}; filename*=UTF-8''{quote(row.nombre_archivo, safe='')}",
        'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
    })
