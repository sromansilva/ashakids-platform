"""Reglas de doble confirmación del boletín."""

import hashlib
import secrets
import time
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.newsletter import SuscripcionBoletin
from app.services.gmail import send_newsletter_confirmation


_ip_buckets: dict[str, list[float]] = {}


def check_rate_limit(ip: str) -> bool:
    now = time.monotonic()
    bucket = [stamp for stamp in _ip_buckets.get(ip, [])
              if stamp > now - settings.NEWSLETTER_RATE_WINDOW_SECONDS]
    if len(bucket) >= settings.NEWSLETTER_RATE_LIMIT:
        _ip_buckets[ip] = bucket
        return False
    bucket.append(now)
    _ip_buckets[ip] = bucket
    if len(_ip_buckets) > 10000:
        _ip_buckets.pop(next(iter(_ip_buckets)))
    return True


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _origin() -> str:
    return (settings.PUBLIC_ORIGIN or "http://localhost:5174").rstrip("/")


async def subscribe(db: AsyncSession, email: str) -> str:
    now = datetime.now(timezone.utc)
    normalized = email.strip().lower()
    row = await db.scalar(select(SuscripcionBoletin).where(SuscripcionBoletin.correo == normalized).with_for_update())
    confirm_token = secrets.token_urlsafe(32)
    unsubscribe_token = secrets.token_urlsafe(32)
    if row is None:
        row = SuscripcionBoletin(correo=normalized)
        db.add(row)
    row.estado = "PENDIENTE"
    row.token_confirmacion_hash = _hash(confirm_token)
    row.token_confirmacion_expira = now + timedelta(hours=settings.NEWSLETTER_CONFIRMATION_TTL_HOURS)
    row.token_baja_hash = _hash(unsubscribe_token)
    row.consentimiento_en = now
    row.confirmado_en = None
    row.baja_en = None
    await db.flush()
    await db.commit()
    result = await send_newsletter_confirmation(
        to=normalized,
        confirmation_url=f"{_origin()}/api/v1/newsletter/confirmar?token={confirm_token}",
        unsubscribe_url=f"{_origin()}/api/v1/newsletter/baja?token={unsubscribe_token}",
    )
    return result.status


async def confirm(db: AsyncSession, token: str) -> bool:
    row = await db.scalar(select(SuscripcionBoletin).where(
        SuscripcionBoletin.token_confirmacion_hash == _hash(token)))
    if row is None or not row.token_confirmacion_expira or row.token_confirmacion_expira < datetime.now(timezone.utc):
        return False
    row.estado = "ACTIVA"
    row.confirmado_en = datetime.now(timezone.utc)
    row.token_confirmacion_hash = None
    row.token_confirmacion_expira = None
    await db.commit()
    return True


async def unsubscribe(db: AsyncSession, token: str) -> bool:
    row = await db.scalar(select(SuscripcionBoletin).where(SuscripcionBoletin.token_baja_hash == _hash(token)))
    if row is None:
        return False
    row.estado = "BAJA"
    row.baja_en = datetime.now(timezone.utc)
    row.token_confirmacion_hash = None
    row.token_confirmacion_expira = None
    await db.commit()
    return True
