"""Integración opcional con Zoom Server-to-Server OAuth.

La integración está desactivada por defecto. Este módulo no registra secretos ni
los expone en respuestas; el enlace de participante sí se persiste en la cita.
"""
import asyncio
import base64
import json
from dataclasses import dataclass
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

from app.core.config import settings


class ZoomIntegrationError(RuntimeError):
    """Error controlado al obtener token o crear una reunión."""


@dataclass(frozen=True)
class ZoomMeeting:
    meeting_id: str
    join_url: str
    # Solo vive durante la operación para permitir limpieza compensatoria; no se persiste.
    access_token: str | None = None


def _request(url: str, *, method: str = "GET", headers: dict[str, str] | None = None,
             body: bytes | None = None) -> dict:
    request = Request(url, data=body, headers=headers or {}, method=method)
    try:
        with urlopen(request, timeout=settings.DB_COMMAND_TIMEOUT) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
        raise ZoomIntegrationError("Zoom no está disponible temporalmente.") from exc


def _configured() -> bool:
    return bool(settings.ZOOM_ENABLED and settings.ZOOM_ACCOUNT_ID and
                settings.ZOOM_CLIENT_ID and settings.ZOOM_CLIENT_SECRET and
                settings.ZOOM_HOST_USER_ID)


async def _access_token() -> str:
    if not _configured():
        raise ZoomIntegrationError("La integración Zoom está habilitada pero incompleta.")
    credentials = base64.b64encode(
        f"{settings.ZOOM_CLIENT_ID}:{settings.ZOOM_CLIENT_SECRET}".encode("utf-8")
    ).decode("ascii")
    token_url = "https://zoom.us/oauth/token?" + urlencode({
        "grant_type": "account_credentials",
        "account_id": settings.ZOOM_ACCOUNT_ID,
    })
    token = await asyncio.to_thread(_request, token_url, method="POST", headers={
        "Authorization": f"Basic {credentials}",
        "Content-Type": "application/x-www-form-urlencoded",
    }, body=b"")
    access_token = token.get("access_token")
    if not isinstance(access_token, str) or not access_token:
        raise ZoomIntegrationError("Zoom no devolvió un token válido.")
    return access_token


async def create_meeting(*, topic: str, start_time: datetime, duration_minutes: int = 45) -> ZoomMeeting | None:
    """Crea una reunión solo cuando Zoom está habilitado; None conserva modo manual."""
    if not settings.ZOOM_ENABLED:
        return None
    access_token = await _access_token()

    payload = json.dumps({
        "topic": topic,
        "type": 2,
        "start_time": start_time.astimezone(ZoneInfo("America/Lima")).isoformat(),
        "duration": duration_minutes,
        "timezone": "America/Lima",
        "settings": {"waiting_room": True, "join_before_host": False},
    }).encode("utf-8")
    meeting = await asyncio.to_thread(_request,
        f"{settings.ZOOM_API_BASE_URL.rstrip('/')}/users/{settings.ZOOM_HOST_USER_ID}/meetings",
        method="POST", headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }, body=payload)
    meeting_id = meeting.get("id")
    join_url = meeting.get("join_url")
    if meeting_id is None or not isinstance(join_url, str) or not join_url:
        raise ZoomIntegrationError("Zoom no devolvió los datos de la reunión.")
    return ZoomMeeting(str(meeting_id), join_url, access_token)


async def delete_meeting(meeting_id: str, access_token: str | None = None) -> None:
    """Elimina una reunión creada durante una transacción local fallida."""
    if not settings.ZOOM_ENABLED or not meeting_id:
        return
    token = access_token or await _access_token()
    await asyncio.to_thread(_request,
        f"{settings.ZOOM_API_BASE_URL.rstrip('/')}/meetings/{meeting_id}",
        method="DELETE", headers={"Authorization": f"Bearer {token}"})
