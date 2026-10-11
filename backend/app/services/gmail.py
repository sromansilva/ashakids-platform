"""Gmail API server-side OAuth y mensajes transaccionales de ASHAKids.

Los secretos y tokens se leen exclusivamente desde Settings. Este módulo no
registra cuerpos de mensajes, credenciales ni contraseñas.
"""

import asyncio
import base64
import json
from html import escape
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


def _message_bytes(*, to: str, subject: str, text: str, html: str | None = None) -> bytes:
    message = EmailMessage()
    message["To"] = to
    message["From"] = formataddr((settings.GMAIL_SENDER_NAME, settings.GMAIL_SENDER_EMAIL))
    message["Subject"] = subject
    message.set_content(text)
    if html:
        message.add_alternative(html, subtype="html")
    return base64.urlsafe_b64encode(message.as_bytes()).decode("ascii").encode("ascii")


def _email_shell(*, preheader: str, eyebrow: str, heading: str, intro: str,
                 content: str, button_label: str, button_url: str,
                 footer_note: str) -> str:
    """Construye una plantilla HTML inline compatible con Gmail y móviles.

    No depende de imágenes externas ni de hojas de estilo remotas: el correo
    sigue siendo legible aunque el cliente bloquee recursos externos.
    """
    safe_button_url = escape(button_url, quote=True)
    return f"""<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <title>{escape(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f1fb;color:#241b3d;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">{escape(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f1fb;">
      <tr>
        <td align="center" style="padding:30px 14px 44px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:660px;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 12px 35px rgba(58,35,122,.10);">
            <tr>
              <td style="height:8px;background:#ff7918;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:22px 34px 20px;background:#ffffff;border-bottom:1px solid #eee9f8;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:22px;line-height:28px;font-weight:800;color:#241b3d;">
                      <span style="color:#7438dc;">ASHA</span><span style="color:#ff7918;">Kids</span><span style="margin-left:4px;color:#ff7918;font-size:17px;vertical-align:top;">✦</span>
                    </td>
                    <td align="right" style="font-size:12px;line-height:18px;color:#119ca3;font-weight:700;">Terapia que acompaña</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 30px;background:#ffffff;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f7f2ff" style="background:#f7f2ff;background:linear-gradient(135deg,#f7f2ff 0%,#fff7ef 100%);border:1px solid #eadffb;border-radius:24px;">
                  <tr>
                    <td style="padding:30px 28px 26px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td>
                            <p style="margin:0 0 12px;color:#7041c4;font-size:12px;line-height:18px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;">{escape(eyebrow)}</p>
                            <h1 style="margin:0 0 16px;color:#241b3d;font-size:31px;line-height:36px;font-weight:800;">{escape(heading)}</h1>
                            <p style="margin:0;color:#5f5872;font-size:16px;line-height:25px;">{escape(intro)}</p>
                          </td>
                          <td width="58" align="right" valign="top" style="padding-left:10px;">
                            <span style="display:inline-block;width:42px;height:42px;border-radius:50%;background:#ff7918;color:#ffffff;text-align:center;line-height:42px;font-size:22px;font-weight:800;">✦</span>
                            <br><span style="display:inline-block;margin-top:8px;color:#12a8ac;font-size:18px;line-height:18px;">● ●</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
                  <tr><td>{content}</td></tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0;">
                  <tr>
                    <td align="center" bgcolor="#7438dc" style="border-radius:13px;border-bottom:4px solid #ff7918;">
                      <a href="{safe_button_url}" style="display:inline-block;padding:15px 25px;border:1px solid #7438dc;border-radius:13px;color:#ffffff;font-size:15px;line-height:20px;font-weight:800;text-decoration:none;">{escape(button_label)} &nbsp;→</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 0;color:#817a91;font-size:12px;line-height:18px;word-break:break-word;">Si el botón no funciona, copia este enlace en tu navegador:<br><a href="{safe_button_url}" style="color:#5b2bbf;text-decoration:underline;">{escape(button_url)}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 34px 28px;background:#fbfaff;border-top:1px solid #eeeaf6;">
                <p style="margin:0 0 8px;color:#5f5872;font-size:12px;line-height:18px;">{escape(footer_note)}</p>
                <p style="margin:0;color:#938ca2;font-size:11px;line-height:17px;">ASHAKids · Cada palabra cuenta. Este mensaje fue enviado automáticamente.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>"""


async def send_message(*, to: str, subject: str, text: str, html: str | None = None) -> None:
    if not is_configured():
        raise GmailIntegrationError("Gmail no está configurado.")
    token = await asyncio.to_thread(_get_access_token_sync)
    raw = _message_bytes(to=to, subject=subject, text=text, html=html)
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
                             activation_url: str) -> GmailSendResult:
    if not settings.GMAIL_ENABLED or not is_configured():
        return GmailSendResult("NO_CONFIGURADO")
    text = (f"Hola {name},\n\nTu cuenta ASHAKids como {role} fue creada.\n"
            f"Código de usuario: {code}\n\nCrea tu contraseña: {activation_url}\n\n"
            "El enlace vence en 24 horas y se usa una sola vez.\n"
            "Después podrás iniciar sesión con tu código y la contraseña que elegiste.\n")
    details = (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
               'style="margin:0;background:#f8f5ff;border:1px solid #e9e1fb;border-radius:14px;">'
               f'<tr><td style="padding:14px 16px;color:#817a91;font-size:12px;line-height:18px;">CÓDIGO DE USUARIO</td>'
               f'<td align="right" style="padding:14px 16px;color:#30206f;font-size:16px;line-height:20px;font-weight:700;">{escape(code)}</td></tr>'
               f'<tr><td style="padding:0 16px 14px;color:#817a91;font-size:12px;line-height:18px;">PERFIL</td>'
               f'<td align="right" style="padding:0 16px 14px;color:#30206f;font-size:14px;line-height:18px;font-weight:700;">{escape(role)}</td></tr>'
               '</table>')
    next_steps = ('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">'
                  '<tr>'
                  '<td width="33%" valign="top" style="padding:12px 8px 12px 0;">'
                  '<span style="display:inline-block;width:25px;height:25px;border-radius:50%;background:#12a8ac;color:#ffffff;text-align:center;line-height:25px;font-size:12px;font-weight:800;">1</span>'
                  '<p style="margin:8px 0 0;color:#30206f;font-size:12px;line-height:17px;font-weight:700;">Crea tu contraseña</p>'
                  '</td>'
                  '<td width="33%" valign="top" style="padding:12px 8px;">'
                  '<span style="display:inline-block;width:25px;height:25px;border-radius:50%;background:#7438dc;color:#ffffff;text-align:center;line-height:25px;font-size:12px;font-weight:800;">2</span>'
                  '<p style="margin:8px 0 0;color:#30206f;font-size:12px;line-height:17px;font-weight:700;">Inicia sesión</p>'
                  '</td>'
                  '<td width="33%" valign="top" style="padding:12px 0 12px 8px;">'
                  '<span style="display:inline-block;width:25px;height:25px;border-radius:50%;background:#ff7918;color:#ffffff;text-align:center;line-height:25px;font-size:12px;font-weight:800;">3</span>'
                  '<p style="margin:8px 0 0;color:#30206f;font-size:12px;line-height:17px;font-weight:700;">Comienza tu camino</p>'
                  '</td>'
                  '</tr></table>')
    html = _email_shell(
        preheader="Tu cuenta ASHAKids está lista. Crea tu contraseña para comenzar.",
        eyebrow="Bienvenido a ASHAKids",
        heading="Tu cuenta ya está lista",
        intro=f"Hola {name}, creamos tu acceso como {role}. Solo falta elegir una contraseña personal para comenzar.",
        content=(details + next_steps + '<p style="margin:20px 0 0;color:#5f5872;font-size:14px;line-height:22px;">'
                 'Por seguridad, este enlace es de un solo uso y vence en 24 horas.</p>'),
        button_label="Crear mi contraseña",
        button_url=activation_url,
        footer_note="Si no esperabas este correo, puedes ignorarlo. Tu cuenta no se activará hasta completar este paso.",
    )
    try:
        await send_message(to=to, subject="Crea tu contraseña de ASHAKids", text=text, html=html)
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
    html = _email_shell(
        preheader="Confirma tu correo y recibe consejos de terapia de ASHAKids.",
        eyebrow="Boletín semanal · Gratis",
        heading="Consejos para acompañar cada avance",
        intro="Gracias por querer recibir ideas sencillas y novedades de ASHAKids directamente en tu correo.",
        content=('<div style="margin:0;background:#f8f5ff;border:1px solid #e9e1fb;border-radius:16px;padding:20px 20px 18px;">'
                 '<p style="margin:0 0 10px;color:#30206f;font-size:15px;line-height:22px;font-weight:700;">¿Qué recibirás?</p>'
                 '<p style="margin:0;color:#5f5872;font-size:14px;line-height:22px;">Ejercicios, recomendaciones de nuestros especialistas y recursos para acompañar el desarrollo de tu hijo en casa.</p>'
                 '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">'
                 '<tr><td width="33%" style="color:#119ca3;font-size:11px;line-height:16px;font-weight:800;">✦ IDEAS</td>'
                 '<td width="33%" style="color:#7438dc;font-size:11px;line-height:16px;font-weight:800;">✦ RECURSOS</td>'
                 '<td width="33%" style="color:#ff7918;font-size:11px;line-height:16px;font-weight:800;">✦ ACOMPAÑAMIENTO</td></tr>'
                 '</table></div>'
                 f'<p style="margin:20px 0 0;color:#5f5872;font-size:13px;line-height:20px;">'
                 f'¿No solicitaste esta suscripción? Puedes <a href="{escape(unsubscribe_url, quote=True)}" style="color:#5b2bbf;text-decoration:underline;">darte de baja aquí</a>.</p>'),
        button_label="Confirmar mi suscripción",
        button_url=confirmation_url,
        footer_note="Solo enviaremos información útil sobre terapia de lenguaje. Puedes darte de baja cuando quieras.",
    )
    try:
        await send_message(to=to, subject="Confirma tu suscripción a ASHAKids", text=text, html=html)
        return GmailSendResult("ENVIADO")
    except GmailIntegrationError as exc:
        return GmailSendResult("PENDIENTE", str(exc))
