"""Serve the compiled React app without swallowing API errors or exposing sources."""
from pathlib import Path, PurePosixPath

from fastapi import FastAPI
from starlette.exceptions import HTTPException
from starlette.staticfiles import StaticFiles


class FrontendFiles(StaticFiles):
    async def get_response(self, path, scope):
        # StaticFiles normalizes paths with the host OS separator (Windows in local QA).
        path = path.replace("\\", "/")
        parts = PurePosixPath(path).parts
        first = parts[:1]
        if (any(part.startswith(".") for part in parts) or
                (first and first[0] in {"api", "health", "docs", "redoc", "openapi.json"})):
            raise HTTPException(404)
        try:
            response = await super().get_response(path, scope)
        except HTTPException as exc:
            if exc.status_code != 404:
                raise
            headers = dict(scope.get("headers", []))
            accepts_html = b"text/html" in headers.get(b"accept", b"").lower()
            # Missing assets must remain 404; only browser navigation gets index.html.
            if scope["method"] not in {"GET", "HEAD"} or not accepts_html or PurePosixPath(path).suffix:
                raise
            response = await super().get_response("index.html", scope)
        if response.status_code == 200 and (path in {"", ".", "index.html"} or
                response.headers.get("content-type", "").startswith("text/html")):
            response.headers["Cache-Control"] = "no-cache"
        return response


def mount_frontend(app: FastAPI, directory: Path):
    directory = directory.resolve()
    if not (directory / "index.html").is_file():
        raise RuntimeError("Falta el frontend compilado: ejecutar el build antes del hosting.")
    # Only the hosted entry point replaces the API's root status response.
    app.router.routes = [route for route in app.router.routes
                         if not (getattr(route, "path", None) == "/" and
                                 getattr(route, "name", None) == "read_root")]
    app.mount("/", FrontendFiles(directory=str(directory), html=True), name="frontend")
