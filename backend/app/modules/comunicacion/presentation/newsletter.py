from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.shared.presentation.contracts import DB
from app.modules.comunicacion.domain.newsletter_schemas import NewsletterSubscriptionRequest, NewsletterSubscriptionResponse
from app.modules.comunicacion.application.newsletter import check_rate_limit, confirm, subscribe, unsubscribe

router = APIRouter(prefix="/newsletter", tags=["Boletín"])


def _redirect(result: str) -> RedirectResponse:
    origin = (settings.PUBLIC_ORIGIN or "http://localhost:5174").rstrip("/")
    return RedirectResponse(f"{origin}/?newsletter={result}", status_code=303)


@router.post("/suscripciones", response_model=NewsletterSubscriptionResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_subscription(payload: NewsletterSubscriptionRequest, request: Request, db: DB):
    ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(ip):
        raise HTTPException(429, "Demasiadas solicitudes. Intenta nuevamente más tarde.")
    estado = await subscribe(db, str(payload.email))
    message = "Si el correo es válido, recibirás un enlace para confirmar tu suscripción."
    if estado == "NO_CONFIGURADO":
        message = "El boletín todavía no está configurado. Intenta nuevamente más tarde."
    return NewsletterSubscriptionResponse(
        message=message,
        estado=estado,
    )


@router.get("/confirmar")
async def confirm_subscription(token: str, db: DB):
    return _redirect("confirmada" if await confirm(db, token) else "invalida")


@router.get("/baja")
async def unsubscribe_subscription(token: str, db: DB):
    return _redirect("baja" if await unsubscribe(db, token) else "invalida")
