import type { RequestHandler } from 'express';

/** Ventana deslizante por proceso; las entradas caducadas se eliminan periódicamente. */
export function rateLimit(max: number, windowMs: number): RequestHandler {
  const requests = new Map<string, number[]>();
  const cleanup = setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [key, timestamps] of requests) {
      const active = timestamps.filter((time) => time > cutoff);
      if (active.length) requests.set(key, active); else requests.delete(key);
    }
  }, Math.min(windowMs, 60_000));
  cleanup.unref();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const active = (requests.get(key) || []).filter((time) => time > now - windowMs);
    if (active.length >= max) {
      requests.set(key, active);
      res.status(429).json({ detail: 'Demasiadas solicitudes. Inténtalo más tarde.', error: 'RATE_LIMIT_EXCEEDED' });
      return;
    }
    active.push(now); requests.set(key, active); next();
  };
}
