"""Adjuntos pequeños transaccionales; sin URLs públicas ni archivos locales efímeros."""
import hashlib
from types import SimpleNamespace
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload, undefer
from app.models.mensajeria import Mensaje, MensajeAdjunto
from app.schemas.mensajeria import MensajeCrear
from app.services import mensajeria

MAX_BYTES = 10 * 1024 * 1024
MAX_BODY = MAX_BYTES + 64 * 1024
EXTENSIONS = {'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif',
 '.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg',
 '.mp4':'video/mp4','.webm':'video/webm','.pdf':'application/pdf','.txt':'text/plain'}


def validar(nombre, data):
    nombre = (nombre or '').replace('\\', '/').split('/')[-1]
    nombre = ''.join(c for c in nombre if ord(c) >= 32 and ord(c) != 127).strip()
    if not nombre or len(nombre) > 255:
        raise HTTPException(422, 'El nombre del archivo debe tener entre 1 y 255 caracteres.')
    if not data:
        raise HTTPException(422, 'El archivo está vacío.')
    if len(data) > MAX_BYTES:
        raise HTTPException(413, 'El archivo supera el límite de 10 MB.')
    ext = '.' + nombre.rsplit('.', 1)[-1].lower()
    mime = EXTENSIONS.get(ext)
    valid = {
        'image/png': data.startswith(b'\x89PNG\r\n\x1a\n'),
        'image/jpeg': data.startswith(b'\xff\xd8\xff'),
        'image/gif': data[:6] in (b'GIF87a', b'GIF89a'),
        'image/webp': data[:4] == b'RIFF' and data[8:12] == b'WEBP',
        'audio/wav': data[:4] == b'RIFF' and data[8:12] == b'WAVE',
        'audio/mpeg': data.startswith(b'ID3') or (len(data) >= 2 and data[0] == 255 and data[1] & 224 == 224),
        'audio/ogg': data.startswith(b'OggS'),
        'video/mp4': len(data) >= 12 and data[4:8] == b'ftyp',
        'video/webm': data.startswith(b'\x1a\x45\xdf\xa3') and b'webm' in data[:4096],
        'application/pdf': data.startswith(b'%PDF-'),
    }
    if mime == 'text/plain':
        try:
            data.decode('utf-8')
            valid[mime] = b'\x00' not in data
        except UnicodeDecodeError:
            valid[mime] = False
    if not mime or not valid.get(mime):
        raise HTTPException(415, 'Formato no admitido o contenido incompatible. Usa JPG, PNG, GIF, WebP, MP3, WAV, OGG, MP4, WebM, PDF o TXT.')
    return nombre, mime


async def enviar(db, identity, key, upload, texto, clave):
    await mensajeria.visible(db, identity, key, lock=True)
    try:
        token = UUID(clave)
    except (ValueError, TypeError):
        raise HTTPException(422, 'La clave de envío no es válida.')
    if texto:
        texto = MensajeCrear(texto_mensaje=texto).texto_mensaje
    else:
        texto = None
    data = await upload.read(MAX_BYTES + 1)
    name, mime = validar(upload.filename, data)
    digest = hashlib.sha256(data).hexdigest()
    previous = await db.scalar(select(MensajeAdjunto).where(MensajeAdjunto.clave_envio == token))
    if previous:
        message = await db.scalar(select(Mensaje).options(selectinload(Mensaje.adjuntos)).where(Mensaje.id_mensaje == previous.id_mensaje))
        if (message.id_conversacion != key or message.id_usuario_emisor != identity[0].id_usuario
            or message.texto_mensaje != texto or previous.sha256 != digest or previous.nombre_archivo != name):
            raise HTTPException(409, 'La clave de envío ya corresponde a otro mensaje.')
        return message
    count = await db.scalar(select(func.count()).select_from(MensajeAdjunto).join(Mensaje).where(
        Mensaje.id_usuario_emisor == identity[0].id_usuario,
        Mensaje.fecha_envio >= func.now() - text("interval '1 hour'")))
    if count >= 20:
        raise HTTPException(429, 'Alcanzaste el límite de 20 adjuntos por hora. Intenta más tarde.')
    message = await mensajeria.enviar(db, identity, key, SimpleNamespace(texto_mensaje=texto))
    attachment = MensajeAdjunto(nombre_archivo=name, mime_type=mime, tamano_bytes=len(data),
        contenido=data, clave_envio=token, sha256=digest, url_archivo=f'db:{token}')
    message.adjuntos.append(attachment)
    await db.flush()
    return message


async def descargar(db, identity, key, attachment):
    await mensajeria.visible(db, identity, key)
    row = await db.scalar(select(MensajeAdjunto).options(undefer(MensajeAdjunto.contenido)).join(Mensaje).where(
        MensajeAdjunto.id_adjunto == attachment, Mensaje.id_conversacion == key))
    if row is None or row.contenido is None:
        raise HTTPException(404, 'Adjunto no disponible.')
    return row


class LimiteAdjuntos:
    """Limita también multipart sin Content-Length antes de llenar el spool temporal."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http' or scope['method'] != 'POST' or not scope['path'].endswith('/mensajes/adjunto'):
            return await self.app(scope, receive, send)
        size = 0
        async def limited():
            nonlocal size
            event = await receive()
            size += len(event.get('body', b''))
            if size > MAX_BODY:
                raise HTTPException(413, 'El archivo supera el límite de 10 MB.')
            return event
        await self.app(scope, limited, send)
