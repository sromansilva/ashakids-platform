"""Verify only public deployed assets. No account, cookie or database access."""
import hashlib
import json
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = 'https://ashakids.onrender.com'

def digest(data):
    return hashlib.sha256(data).hexdigest()

def main():
    audio = ROOT / 'frontend/public/words/voice/v106'
    manifest_data = (audio / 'manifest.json').read_bytes()
    manifest = json.loads(manifest_data)
    chunks = list((ROOT / 'frontend/dist/assets').glob('world-map-*.js'))
    if len(chunks) != 1:
        raise RuntimeError('Build first; expected one world-map chunk')
    expected = {'/words/voice/v106/manifest.json': manifest_data,
                '/assets/' + chunks[0].name: chunks[0].read_bytes()}
    # Preview, naming word and game instructions. Manifest includes all 230 assets.
    for key in ['gato', 'explora tres dibujos y di cómo se llaman.',
                'hola. vamos a descubrir palabras juntos. escucha y juega a tu ritmo.']:
        filename = manifest['entries'][key]
        expected['/words/voice/v106/' + filename] = (audio / filename).read_bytes()
    deadline = time.monotonic() + 900
    print('Waiting for Render to serve the current voice bank and compiled game chunk', flush=True)
    while time.monotonic() < deadline:
        results = []
        try:
            for path, local in expected.items():
                request = urllib.request.Request(BASE + path, headers={'Cache-Control': 'no-cache'})
                with urllib.request.urlopen(request, timeout=25) as response:
                    remote = response.read()
                    # Git normalizes text CRLF/LF between Windows and Linux.
                    # Compare JSON content canonically; binary and compiled assets exactly.
                    canonical = lambda value: json.dumps(json.loads(value), ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
                    matches = canonical(remote) == canonical(local) if path.endswith('.json') else digest(remote) == digest(local)
                    if not matches:
                        raise RuntimeError('Deployment has not reached expected asset hashes')
                    results.append({'path': path, 'bytes': len(remote), 'sha256': digest(remote), 'http': response.status,
                                    'comparison': 'canonical JSON' if path.endswith('.json') else 'exact SHA256'})
            with urllib.request.urlopen(BASE + '/health', timeout=25) as response:
                health = response.status
            result = {'checked_at_utc': datetime.now(timezone.utc).isoformat(), 'url': BASE, 'branch': 'dev',
                      'health_http': health, 'verified_assets': results, 'voice_entries': len(manifest['entries']),
                      'limits': 'Public static assets and health only; no real child voice, account or clinical flow.'}
            output = ROOT / 'tmp/voice-v106/render-live.json'
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
            print(f'PASS: Render health {health}; {len(results)} verified assets (JSON content and exact binary/compiled hashes)', flush=True)
            return
        except Exception:
            time.sleep(15)
    raise RuntimeError('Render did not serve expected asset hashes in 15 minutes; do not claim deployment')

if __name__ == '__main__':
    main()
