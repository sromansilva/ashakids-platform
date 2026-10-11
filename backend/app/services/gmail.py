"""Gmail API server-side OAuth y mensajes transaccionales de ASHAKids.

Los secretos y tokens se leen exclusivamente desde Settings. Este módulo no
registra cuerpos de mensajes, credenciales ni contraseñas.
"""

import asyncio
import base64
import json
import threading
import time
from dataclasses import dataclass
from email.message import EmailMessage
from email.utils import formataddr
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.core.config import settings


class GmailIntegrationError(RuntimeError):
    """Fallo controlado al renovar OAuth o enviar por Gmail."""


@dataclass(frozen=True)
class GmailSendResult:
    status: str
    detail: str | None = None


_token_lock = threading.Lock()
_cached_access_token: str | None = None
_cached_token_expires_at = 0.0


def is_configured() -> bool:
    return bool(settings.GMAIL_ENABLED and settings.GMAIL_CLIENT_ID and
                settings.GMAIL_CLIENT_SECRET and settings.GMAIL_REFRESH_TOKEN and
                settings.GMAIL_SENDER_EMAIL)


def _request_json(url: str, *, method: str = "POST", headers: dict[str, str] | None = None,
                 body: bytes | None = None) -> dict:
    req = Request(url, data=body, headers=headers or {}, method=method)
    try:
        with urlopen(req, timeout=settings.DB_COMMAND_TIMEOUT) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
        raise GmailIntegrationError("Gmail no está disponible temporalmente.") from exc


def _get_access_token_sync() -> str:
    global _cached_access_token, _cached_token_expires_at
    now = time.monotonic()
    with _token_lock:
        if _cached_access_token and _cached_token_expires_at > now + 60:
            return _cached_access_token
        payload = urlencode({
            "grant_type": "refresh_token",
            "client_id": settings.GMAIL_CLIENT_ID,
            "client_secret": settings.GMAIL_CLIENT_SECRET,
            "refresh_token": settings.GMAIL_REFRESH_TOKEN,
        }).encode("utf-8")
        token_data = _request_json(
            "https://oauth2.googleapis.com/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            body=payload,
        )
        token = token_data.get("access_token")
        if not isinstance(token, str) or not token:
            raise GmailIntegrationError("Gmail no devolvió un token válido.")
        try:
            expires_in = int(token_data.get("expires_in", 3600))
        except (TypeError, ValueError) as exc:
            raise GmailIntegrationError("Gmail devolvió una expiración inválida.") from exc
        _cached_access_token = token
        _cached_token_expires_at = now + expires_in
        return token


def _message_bytes(*, to: str, subject: str, text: str) -> bytes:
    message = EmailMessage()
    message["To"] = to
    message["From"] = formataddr((settings.GMAIL_SENDER_NAME, settings.GMAIL_SENDER_EMAIL))
    message["Subject"] = subject
    message.set_content(text)
    return base64.urlsafe_b64encode(message.as_bytes()).decode("ascii").encode("ascii")


async def send_message(*, to: str, subject: str, text: str) -> None:
    if not is_configured():
        raise GmailIntegrationError("Gmail no está configurado.")
    token = await asyncio.to_thread(_get_access_token_sync)
    raw = _message_bytes(to=to, subject=subject, text=text)
    await asyncio.to_thread(
        _request_json,
        f"{settings.GMAIL_API_BASE_URL.rstrip('/')}/users/me/messages/send",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        body=json.dumps({"raw": raw.decode("ascii")}).encode("utf-8"),
    )


async def send_welcome_email(*, to: str, name: str, role: str, code: str,
                             initial_password: str) -> GmailSendResult:
    if not settings.GMAIL_ENABLED or not is_configured():
        return GmailSendResult("NO_CONFIGURADO")
    origin = (settings.PUBLIC_ORIGIN or "http://localhost:5174").rstrip("/")
    text = (f"Hola {name},\n\nTu cuenta ASHAKids como {role} fue creada.\n"
            f"Código de usuario: {code}\nContraseña inicial: {initial_password}\n\n"
            f"Ingresa en: {origin}\n\n"
            "Por seguridad, debes cambiar la contraseña en tu primer ingreso.\n")
    try:
        await send_message(to=to, subject="Bienvenido a ASHAKids", text=text)
        return GmailSendResult("ENVIADO")
    except GmailIntegrationError as exc:
        return GmailSendResult("PENDIENTE", str(exc))


async def send_newsletter_confirmation(*, to: str, confirmation_url: str,
                                       unsubscribe_url: str) -> GmailSendResult:
    if not settings.GMAIL_ENABLED or not is_configured():
        return GmailSendResult("NO_CONFIGURADO")
    text = ("Confirma tu suscripción al boletín de ASHAKids\n\n"
            f"Confirma aquí: {confirmation_url}\n\n"
            f"Si no deseas recibir mensajes, puedes darte de baja aquí: {unsubscribe_url}\n")
    try:
        await send_message(to=to, subject="Confirma tu suscripción a ASHAKids", text=text)
        return GmailSendResult("ENVIADO")
    except GmailIntegrationError as exc:
        return GmailSendResult("PENDIENTE", str(exc))
