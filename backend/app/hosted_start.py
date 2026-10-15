"""Start one hosted worker with explicit HTTPS origins and trusted proxy addresses."""
import ipaddress
import os
import sys
from urllib.parse import urlsplit


def startup_command(environ):
    if environ.get("ENVIRONMENT") != "production":
        raise ValueError("El arranque de hosting exige ENVIRONMENT=production.")
    if environ.get("WEB_CONCURRENCY", "1") != "1":
        raise ValueError("El limitador de login exige un proceso y una instancia.")
    if not environ.get("CORS_ORIGINS"):
        origin = environ.get("PUBLIC_ORIGIN") or environ.get("RENDER_EXTERNAL_URL", "")
        parsed = urlsplit(origin)
        if (parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password
                or parsed.path not in {"", "/"} or parsed.query or parsed.fragment):
            raise ValueError("Configure un origen HTTPS final mediante PUBLIC_ORIGIN o CORS_ORIGINS.")
        environ["CORS_ORIGINS"] = origin.rstrip("/")
    proxies = environ.get("FORWARDED_ALLOW_IPS", "127.0.0.1,::1")
    for peer in proxies.split(","):
        network = ipaddress.ip_network(peer.strip(), strict=False)
        if network.prefixlen == 0:
            raise ValueError("No se permite confiar en todas las IP de proxy.")
    port = int(environ.get("PORT", "10000"))
    if not 1 <= port <= 65535:
        raise ValueError("Puerto HTTP fuera de rango.")
    return [sys.executable, "-m", "uvicorn", "app.hosted:app", "--host", "0.0.0.0",
            "--port", str(port), "--workers", "1", "--proxy-headers",
            "--forwarded-allow-ips", proxies, "--no-server-header"]


def main():
    command = startup_command(os.environ)
    os.execv(sys.executable, command)


if __name__ == "__main__":
    main()
