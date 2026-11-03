"""Privacy and request-boundary checks for temporary audio payload handling."""

import asyncio
import base64
import unittest

from audio_memory import (
    AudioBodySizeLimitMiddleware,
    AudioPayloadTooLarge,
    clear_audio_buffer,
    decode_audio_base64,
)


class AudioMemoryTests(unittest.TestCase):
    def test_decode_accepts_plain_base64_and_audio_data_urls(self):
        expected = b"short-pcm-sample"
        encoded = base64.b64encode(expected).decode("ascii")

        self.assertEqual(decode_audio_base64(encoded), bytearray(expected))
        self.assertEqual(decode_audio_base64("data:audio/wav;base64," + encoded), bytearray(expected))

    def test_decode_rejects_invalid_or_empty_payloads(self):
        for payload in ("", "not base64!"):
            with self.subTest(payload=payload), self.assertRaises(ValueError):
                decode_audio_base64(payload)

    def test_decode_rejects_payloads_over_the_memory_limit(self):
        encoded = base64.b64encode(b"x" * 512_001).decode("ascii")
        with self.assertRaises(AudioPayloadTooLarge):
            decode_audio_base64(encoded)

    def test_clear_overwrites_the_mutable_audio_buffer(self):
        audio = bytearray(b"private audio")
        clear_audio_buffer(audio)
        self.assertEqual(audio, bytearray(len(audio)))

    def test_middleware_rejects_declared_oversized_body_before_reading(self):
        async def scenario():
            sent = []
            read_called = False

            async def receive():
                nonlocal read_called
                read_called = True
                return {"type": "http.request", "body": b"ignored", "more_body": False}

            async def send(message):
                sent.append(message)

            async def app(scope, receive, send):
                raise AssertionError("Oversized request reached the application")

            middleware = AudioBodySizeLimitMiddleware(app, limit=3)
            await middleware(
                {"type": "http", "path": "/predict/file", "headers": [(b"content-length", b"4")]},
                receive,
                send,
            )
            self.assertFalse(read_called)
            self.assertEqual(sent[0]["status"], 413)

        asyncio.run(scenario())

    def test_middleware_rejects_oversized_streamed_body(self):
        async def scenario():
            sent = []

            async def receive():
                return {"type": "http.request", "body": b"1234", "more_body": False}

            async def send(message):
                sent.append(message)

            async def app(scope, receive, send):
                await receive()
                raise AssertionError("Oversized request reached the endpoint")

            middleware = AudioBodySizeLimitMiddleware(app, limit=3)
            await middleware(
                {"type": "http", "path": "/predict/phonetics", "headers": []},
                receive,
                send,
            )
            self.assertEqual(sent[0]["status"], 413)

        asyncio.run(scenario())


if __name__ == "__main__":
    unittest.main()
