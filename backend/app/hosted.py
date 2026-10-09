"""Docker/hosting entry point; local app.main keeps its existing API behavior."""
import os
from pathlib import Path

from app.core.config import BACKEND_DIR
from app.core.frontend_hosting import mount_frontend
from app.main import app

mount_frontend(app, Path(os.environ.get("FRONTEND_DIST_PATH", BACKEND_DIR / "frontend-dist")))
