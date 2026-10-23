import asyncio
import time
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.services import email_activation as service
from app.services.auth_service import authenticate_user
from app.schemas.auth import EmailActivationRequest
from app.core.security import hash_password, verify_password


def user():
    return SimpleNamespace(id_usuario=12, email="synthetic@example.com", activo=True,
                           password_change_required=True, password_hash=hash_password("Random-Unshared-Secret"))


def test_token_bound_to_user_email_hash_and_expiry():
    row = user()
    token = service.activation_token(row)
    service.validate_token(row, token)
    for invalid in ["", "garbage", "12.1." + "a" * 43,
                    f"99999999999999999999.{int(time.time())+60}." + "a" * 43,
                    token[:-1] + ("a" if token[-1] != "a" else "b"),
                    token.rsplit(".", 1)[0] + "." + "é" * 43]:
        with pytest.raises(HTTPException):
            service.validate_token(row, invalid)
    row.email = "changed@example.com"
    with pytest.raises(HTTPException):
        service.validate_token(row, token)
    row.email = "synthetic@example.com"
    row.activo = False
    with pytest.raises(HTTPException):
        service.validate_token(row, token)
    row.activo = True
    row.password_change_required = False
    with pytest.raises(HTTPException):
        service.validate_token(row, token)


def test_activation_consumes_link_and_revokes_sessions():
    row = user()
    token = service.activation_token(row)
    db = SimpleNamespace(scalar=AsyncMock(return_value=row), execute=AsyncMock(), flush=AsyncMock())
    asyncio.run(service.complete_email_activation(db, token, "New-Personal-Password"))
    assert verify_password("New-Personal-Password", row.password_hash)
    assert row.password_change_required is False
    db.execute.assert_awaited_once()
    with pytest.raises(HTTPException):
        asyncio.run(service.complete_email_activation(db, token, "Different-Password"))


def test_pending_account_cannot_login_even_with_old_dni():
    row = user()
    db = SimpleNamespace(execute=AsyncMock(return_value=SimpleNamespace(scalar_one_or_none=lambda: row)))
    assert asyncio.run(authenticate_user(db, "P00012", "12345678")) is None


def test_missing_account_and_password_policy():
    db = SimpleNamespace(scalar=AsyncMock(return_value=None))
    with pytest.raises(HTTPException):
        asyncio.run(service.complete_email_activation(db, f"12.{int(time.time())+60}." + "a"*43, "Password-Personal"))
    for password in ["12345678", "x" * 129]:
        with pytest.raises(ValidationError):
            EmailActivationRequest(token="test", new_password=password)


def test_resend_does_not_send_for_missing_account(monkeypatch):
    mail = AsyncMock()
    monkeypatch.setattr(service, "welcome_for_user", mail)
    asyncio.run(service.resend_activation(SimpleNamespace(scalar=AsyncMock(return_value=None)), "missing"))
    mail.assert_not_awaited()
