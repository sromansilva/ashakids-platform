"""Ventana fija acotada por IP y pareja IP/código; estado local a un proceso.

Se cuentan también los éxitos; no se bloquea una cuenta globalmente. Las peticiones
rechazadas no prolongan la ventana. Ignora X-Forwarded-For: solo usa Request.client,
que debe proceder de un proxy confiable configurado en el servidor ASGI.
"""
from collections import OrderedDict
from hashlib import blake2b
from math import ceil
from threading import Lock
from time import monotonic

from fastapi import HTTPException, Request

from app.core.config import settings


class LoginLimiter:
    def __init__(self, config=settings, clock=monotonic):
        self.config, self.clock = config, clock
        self.buckets = OrderedDict()
        self.lock = Lock()

    def check(self, ip: str, code: str):
        now = self.clock()
        digest = blake2b(code.strip().upper().encode(), digest_size=16).hexdigest()
        keys = (("ip", ip), ("pair", ip, digest))
        limits = (self.config.LOGIN_IP_LIMIT, self.config.LOGIN_PAIR_LIMIT)
        with self.lock:
            # Se insertan por fecha de expiración; no se refrescan al rechazar.
            while self.buckets and next(iter(self.buckets.values()))[0] <= now:
                self.buckets.popitem(last=False)
            retry = max((self.buckets[key][0] - now for key, limit in zip(keys, limits)
                         if key in self.buckets and self.buckets[key][1] >= limit), default=0)
            missing = sum(key not in self.buckets for key in keys)
            if len(self.buckets) + missing > self.config.LOGIN_LIMITER_MAX_KEYS:
                retry = max(retry, next(iter(self.buckets.values()))[0] - now)
            if retry > 0:
                raise HTTPException(429, "Demasiados intentos. Reintente más tarde.",
                                    headers={"Retry-After": str(max(1, ceil(retry)))})
            for key in keys:
                expiry, count = self.buckets.get(key, (now + self.config.LOGIN_WINDOW_SECONDS, 0))
                self.buckets[key] = (expiry, count + 1)


login_limiter = LoginLimiter()


def limit_login(request: Request, code: str):
    login_limiter.check(request.client.host if request.client else "unknown", code)
