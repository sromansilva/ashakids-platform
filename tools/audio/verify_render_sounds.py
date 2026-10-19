"""Compare the public V108 sound-world assets on Render to the local build."""

import concurrent.futures
import hashlib
import json
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
    voice = ROOT / "frontend/public/sounds/voice/v108"
    manifest_bytes = (voice / "manifest.json").read_bytes()
    manifest = json.loads(manifest_bytes)
    chunks = list((ROOT / "frontend/dist/assets").glob("world-map-*.js"))
    if len(chunks) != 1:
        raise RuntimeError("Build first; expected one world-map JavaScript chunk")
    assets = {
        "/sounds/voice/v108/manifest.json": manifest_bytes,
        f"/assets/{chunks[0].name}": chunks[0].read_bytes(),
    }
    for filename in set(manifest["entries"].values()):
        assets[f"/sounds/voice/v108/{filename}"] = (voice / filename).read_bytes()
    art_manifest = json.loads((ROOT / "docs/evidence/sounds-v108/art-assets.json").read_text(encoding="utf-8"))
    if len(art_manifest) != 7:
        raise RuntimeError("Expected seven new public sound-game illustrations")
    for item in art_manifest:
        local = ROOT / item["output"]
        assets[f"/sounds/games/{local.name}"] = local.read_bytes()
    animals = ROOT / "frontend/public/sounds/animals"
    for filename in ["cow.mp3", "cat.mp3", "dog.mp3", "chick.mp3"]:
        assets[f"/sounds/animals/{filename}"] = (animals / filename).read_bytes()
    return assets


def main() -> None:
    assets = expected_assets()
    deadline = time.monotonic() + 900
    print(f"Waiting for Render to serve {len(assets)} V108 assets with the published world chunk.", flush=True)
    while time.monotonic() < deadline:
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
                futures = [pool.submit(fetch, path, content) for path, content in assets.items()]
                results = [future.result() for future in concurrent.futures.as_completed(futures)]
            with urllib.request.urlopen(BASE + "/health", timeout=25) as response:
                health = response.status
            report = {
                "checked_at_utc": datetime.now(timezone.utc).isoformat(),
                "url": BASE,
                "branch": "dev",
                "health_http": health,
                "voice_entries": len(json.loads((ROOT / "frontend/public/sounds/voice/v108/manifest.json").read_text(encoding="utf-8"))["entries"]),
                "illustrations": 7,
                "verified_assets": sorted(results, key=lambda item: item["path"]),
                "limits": "Public static assets and health only; no account, cookies, child data or clinical workflow. This is content verification, not a privileged Render deployment-SHA lookup.",
            }
            output = ROOT / "docs/evidence/sounds-v108/render-live.json"
            output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"PASS: Render health {health}; all {len(results)} public assets match V108.", flush=True)
            return
        except Exception as error:
            print(f"Render deployment is still updating: {error}", flush=True)
            time.sleep(15)
    raise RuntimeError("Render did not serve V108 hashes before timeout; do not claim deployment.")


if __name__ == "__main__":
    main()
