"""Verify the public V123 Fluency world assets served by Render."""

import concurrent.futures
import hashlib
import json
import subprocess
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = "https://ashakids.onrender.com"


def digest(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def fetch(path: str, expected: bytes) -> dict:
    request = urllib.request.Request(BASE + path, headers={"Cache-Control": "no-cache"})
    with urllib.request.urlopen(request, timeout=25) as response:
        actual = response.read()
        if path.endswith(".json"):
            canonical = lambda value: json.dumps(
                json.loads(value), ensure_ascii=False, sort_keys=True, separators=(",", ":")
            ).encode("utf-8")
            matches = canonical(actual) == canonical(expected)
            comparison = "canonical JSON"
        else:
            matches = digest(actual) == digest(expected)
            comparison = "exact SHA256"
        if not matches:
            raise RuntimeError(f"Render still serves another version: {path}")
        return {"path": path, "http": response.status, "bytes": len(actual), "sha256": digest(actual), "comparison": comparison}


def expected_assets() -> dict[str, bytes]:
    assets: dict[str, bytes] = {}
    for pattern in ("index-*.js", "index-*.css", "world-map-*.js", "world-map-*.css"):
        chunks = list((ROOT / "frontend/dist/assets").glob(pattern))
        if len(chunks) != 1:
            raise RuntimeError(f"Build first; expected one {pattern} asset")
        chunk = chunks[0]
        assets[f"/assets/{chunk.name}"] = chunk.read_bytes()

    voice = ROOT / "frontend/public/words/voice/fluency-v1"
    manifest_bytes = (voice / "manifest.json").read_bytes()
    manifest = json.loads(manifest_bytes)
    assets["/words/voice/fluency-v1/manifest.json"] = manifest_bytes
    for filename in set(manifest["entries"].values()):
        assets[f"/words/voice/fluency-v1/{filename}"] = (voice / filename).read_bytes()
    return assets


def main() -> None:
    assets = expected_assets()
    deadline = time.monotonic() + 900
    print(f"Waiting for Render to serve {len(assets)} current Fluency assets with matching hashes.", flush=True)
    while time.monotonic() < deadline:
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
                futures = [pool.submit(fetch, path, content) for path, content in assets.items()]
                results = [future.result() for future in concurrent.futures.as_completed(futures)]
            with urllib.request.urlopen(BASE + "/health", timeout=25) as response:
                health = response.status
            report = {
                "checked_at_utc": datetime.now(timezone.utc).isoformat(),
                "url": BASE,
                "branch": "dev",
                "commit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
                "health_http": health,
                "voice_entries": len(json.loads((ROOT / "frontend/public/words/voice/fluency-v1/manifest.json").read_text(encoding="utf-8"))["entries"]),
                "verified_assets": sorted(results, key=lambda item: item["path"]),
                "limits": "Public static assets and health only; no account, cookies, child data, clinical workflow, internal Render deployment SHA, browser playback or device interaction were checked.",
            }
            output = ROOT / "docs/evidence/fluency-v1/render-live.json"
            output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"PASS: Render health {health}; all {len(results)} public Fluency assets match the local build.", flush=True)
            return
        except Exception as error:
            print(f"Render deployment is still updating: {error}", flush=True)
            time.sleep(15)
    raise RuntimeError("Render did not serve current hashes before timeout; do not claim deployment.")


if __name__ == "__main__":
    main()
