"""Hosting routing and proxy boundaries; no database or login sessions."""
from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest
from starlette.requests import Request
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.core.frontend_hosting import mount_frontend
from app.hosted_start import startup_command


@pytest.fixture
def hosted(tmp_path):
    (tmp_path / "index.html").write_text("<html>AUDITORIA SPA</html>", encoding="utf-8")
    (tmp_path / "assets").mkdir()
    (tmp_path / "assets" / "app.js").write_text("console.log('AUDITORIA')", encoding="utf-8")
    app = FastAPI()

    @app.get("/", name="read_root")
    def root():
        return {"status": "online"}

    @app.get("/health")
    def health():
        return {"status": "healthy"}

    @app.get("/api/v1/example")
    def api():
        return {"message": "AUDITORIA"}

    mount_frontend(app, tmp_path)
    return TestClient(app)


@pytest.mark.parametrize("path", ["/", "/login", "/admin/cuentas", "/padre/seguimiento"])
def test_browser_navigation_and_refresh(hosted, path):
    response = hosted.get(path, headers={"Accept": "text/html"})
    assert response.status_code == 200 and "AUDITORIA SPA" in response.text
    assert response.headers["cache-control"] == "no-cache"


@pytest.mark.parametrize("path", ["/api/v1/missing", "/health/missing", "/docs/missing",
                                   "/assets/missing.js", "/.env", "/app/main.py"])
def test_missing_api_assets_and_sources_stay_404(hosted, path):
    response = hosted.get(path, headers={"Accept": "text/html"})
    assert response.status_code == 404 and "AUDITORIA SPA" not in response.text


def test_api_health_assets_and_head_keep_their_responses(hosted):
    assert hosted.get("/api/v1/example").json() == {"message": "AUDITORIA"}
    assert hosted.get("/health").json() == {"status": "healthy"}
    assert "console.log" in hosted.get("/assets/app.js").text
    assert hosted.head("/padre/seguimiento", headers={"Accept": "text/html"}).status_code == 200
    assert hosted.get("/padre/seguimiento", headers={"Accept": "application/json"}).status_code == 404


def test_missing_build_fails_before_replacing_root(tmp_path):
    with pytest.raises(RuntimeError):
        mount_frontend(FastAPI(), tmp_path)


def test_startup_uses_public_origin_and_one_worker():
    env = {"ENVIRONMENT": "production", "RENDER_EXTERNAL_URL": "https://audit.example.invalid/"}
    command = startup_command(env)
    assert env["CORS_ORIGINS"] == "https://audit.example.invalid"
    assert command[command.index("--workers") + 1] == "1"


@pytest.mark.parametrize("overrides", [
    {"ENVIRONMENT": "development"}, {"WEB_CONCURRENCY": "2"}, {"PORT": "0"},
    {"FORWARDED_ALLOW_IPS": "*"}, {"FORWARDED_ALLOW_IPS": "127.0.0.1,*"},
    {"FORWARDED_ALLOW_IPS": "0.0.0.0/0"}, {"FORWARDED_ALLOW_IPS": "::/0"},
    {"PUBLIC_ORIGIN": "http://audit.example.invalid"},
    {"PUBLIC_ORIGIN": "https://audit.example.invalid/path"},
])
def test_invalid_hosting_settings_fail_closed(overrides):
    env = {"ENVIRONMENT": "production", "PUBLIC_ORIGIN": "https://audit.example.invalid"}
    env.update(overrides)
    with pytest.raises(ValueError):
        startup_command(env)


@pytest.mark.parametrize("peer,expected_scheme,expected_client", [
    ("10.1.2.3", "https", "198.51.100.42"),
    ("203.0.113.9", "http", "203.0.113.9"),
])
def test_only_trusted_proxy_can_set_scheme_and_client(peer, expected_scheme, expected_client):
    app = FastAPI()

    @app.get("/context")
    def context(request: Request):
        return {"scheme": request.url.scheme, "client": request.client.host}

    wrapped = ProxyHeadersMiddleware(app, trusted_hosts="10.1.2.3")
    with TestClient(wrapped, client=(peer, 12345)) as client:
        response = client.get("/context", headers={"X-Forwarded-Proto": "https",
                                                   "X-Forwarded-For": "198.51.100.42"})
    assert response.json() == {"scheme": expected_scheme, "client": expected_client}
