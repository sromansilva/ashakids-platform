"""Shared, local-only Graphify workflow. Run from any directory using Python 3.12+."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import venv

ROOT = Path(__file__).resolve().parents[2]
ENV = ROOT / '.venv-graphify'
PYTHON = ENV / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
OUT = ROOT / 'graphify-out'


def run(args):
    subprocess.run([str(a) for a in args], cwd=ROOT, check=True)


def graphify(*args):
    if not PYTHON.exists():
        raise SystemExit('Run: python tools/knowledge/manage.py setup')
    run([PYTHON, '-m', 'graphify', *args])


def sources():
    files = set()
    for folder in ['frontend/src', 'backend/app', 'frontend/tests', 'backend/tests']:
        for file in (ROOT / folder).rglob('*'):
            if file.is_file() and file.suffix in {'.py', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.css'} and '__pycache__' not in file.parts:
                files.add(file)
    for name in ['frontend/package.json', 'frontend/vite.config.ts', '.graphifyignore', '.gitignore', 'tools/knowledge/requirements.txt', 'tools/knowledge/requirements-lock.txt', 'tools/knowledge/manage.py']:
        if (ROOT / name).exists():
            files.add(ROOT / name)
    return {f.relative_to(ROOT).as_posix(): hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(files)}


def current():
    manifest = OUT / 'sources.json'
    return (OUT / 'graph.json').exists() and manifest.exists() and json.loads(manifest.read_text(encoding='utf-8')) == sources()


def refresh():
    OUT.mkdir(exist_ok=True)
    # Full AST scan also handles deleted symbols. No semantic calls or community LLM labels.
    graphify('extract', '.', '--code-only', '--no-cluster', '--force')
    graphify('cluster-only', '.', '--no-label')
    data = json.loads((OUT / 'graph.json').read_text(encoding='utf-8'))
    if not data.get('nodes'):
        raise SystemExit('Graph is empty; freshness manifest was not updated.')
    (OUT / 'sources.json').write_text(json.dumps(sources(), indent=2)+'\n', encoding='utf-8')
    (OUT / '.graphify_python').write_text(str(PYTHON), encoding='utf-8')
    print(f"Knowledge map ready: {len(data['nodes'])} nodes. Local code-only extraction.")


def main():
    if sys.version_info < (3, 12) or sys.version_info[:3] == (3, 14, 1):
        raise SystemExit('Use Python 3.12+ (excluding 3.14.1, unsupported by the pinned NetworkX).')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['setup', 'refresh', 'check', 'query', 'explain', 'path'])
    parser.add_argument('terms', nargs='*')
    args = parser.parse_args()
    if args.command == 'setup':
        if not PYTHON.exists():
            venv.EnvBuilder(with_pip=True).create(ENV)
        run([PYTHON, '-m', 'pip', 'install', '-r', ROOT/'tools/knowledge/requirements-lock.txt'])
        if not current():
            refresh()
        return
    if args.command == 'refresh':
        refresh()
        return
    if args.command == 'check':
        if not current():
            raise SystemExit('Knowledge map is missing or stale. Run: python tools/knowledge/manage.py refresh')
        print('Knowledge map is current.')
        return
    if not args.terms:
        parser.error('Provide a symbol or query (two symbols for path).')
    if not current():
        raise SystemExit('Knowledge map is missing or stale. Run: python tools/knowledge/manage.py refresh')
    if args.command == 'path':
        if len(args.terms) != 2:
            parser.error('path requires two quoted symbols.')
        graphify('path', *args.terms)
    else:
        terms = ' '.join(args.terms)
        graphify(args.command, terms, *(['--budget', '1500'] if args.command == 'query' else []))


if __name__ == '__main__':
    try:
        main()
    except subprocess.CalledProcessError as exc:
        raise SystemExit(exc.returncode)
