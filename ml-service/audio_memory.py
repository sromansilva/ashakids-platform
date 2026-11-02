"""Short-lived, bounded audio payload helpers shared by the ML API."""

import base64
import binascii
import re


MAX_AUDIO_BYTES = 512_000
MAX_BASE64_CHARS = ((MAX_AUDIO_BYTES + 2) // 3) * 4 + 64
MAX_AUDIO_REQUEST_BYTES = MAX_BASE64_CHARS + 16_384
_DATA_URL_PREFIX = re.compile(r"^data:audio/[^;,]+;base64,", re.IGNORECASE)


class AudioPayloadTooLarge(ValueError):
    """Raised when an audio payload exceeds the in-memory processing limit."""


def decode_audio_base64(value: str) -> bytearray:
    """Decode one bounded WAV payload into a mutable buffer for explicit wiping."""
    if not isinstance(value, str) or not value.strip():
        raise ValueError("El fragmento de audio está vacío.")

    encoded = value.strip()
    encoded = _DATA_URL_PREFIX.sub("", encoded, count=1)
    if len(encoded) > MAX_BASE64_CHARS:
        raise AudioPayloadTooLarge("El fragmento supera el tamaño permitido.")
    try:
        decoded = base64.b64decode(encoded, validate=True)
    except (binascii.Error, ValueError) as error:
        raise ValueError("El fragmento de audio no tiene un formato base64 válido.") from error
    if not decoded:
        raise ValueError("El fragmento de audio está vacío.")
    if len(decoded) > MAX_AUDIO_BYTES:
        raise AudioPayloadTooLarge("El fragmento supera el tamaño permitido.")
    return bytearray(decoded)


def clear_audio_buffer(audio: bytearray | None) -> None:
    """Overwrite a mutable audio buffer before releasing its references."""
    if audio is not None:
        audio[:] = b"\x00" * len(audio)


class AudioBodySizeLimitMiddleware:
    """Reject oversized audio requests before multipart parsing can spool them."""

    def __init__(self, app, limit: int = MAX_AUDIO_REQUEST_BYTES):
        self.app = app
        self.limit = limit

    async def __call__(self, scope, receive, send):
        if scope.get("type") != "http" or scope.get("path") not in {
            "/predict/phonetics",
            "/predict/file",
        }:
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers", []))
        content_length = headers.get(b"content-length")
        if content_length:
            try:
                if int(content_length) > self.limit:
                    await self._respond_too_large(send)
                    return
            except ValueError:
                await self._respond_too_large(send)
                return

        received = 0
        response_started = False

        async def bounded_receive():
            nonlocal received
            message = await receive()
            if message.get("type") == "http.request":
                received += len(message.get("body", b""))
                if received > self.limit:
                    raise AudioPayloadTooLarge("El fragmento supera el tamaño permitido.")
            return message

        async def tracked_send(message):
            nonlocal response_started
            if message.get("type") == "http.response.start":
                response_started = True
            await send(message)

        try:
            await self.app(scope, bounded_receive, tracked_send)
        except AudioPayloadTooLarge:
            if not response_started:
                await self._respond_too_large(send)

    async def _respond_too_large(self, send):
        body = b'{"detail":"El fragmento supera el tamano permitido."}'
        await send({
            "type": "http.response.start",
            "status": 413,
            "headers": [
                (b"content-type", b"application/json"),
                (b"content-length", str(len(body)).encode("ascii")),
            ],
        })
        await send({"type": "http.response.body", "body": body, "more_body": False})
