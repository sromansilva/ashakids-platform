"""Author-time generation for public Ritmo de las Palabras instructions."""
import asyncio
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools' / 'audio'))
from generate_word_voice import generate_bank


if __name__ == '__main__':
    asyncio.run(generate_bank(
        input_path=ROOT / 'tmp/voice-fluency-v1/texts.json',
        OUTPUT=ROOT / 'frontend/public/words/voice/fluency-v1',
        index=ROOT / 'frontend/src/pages/padre/Sessions/FluencyGames/fluencyVoiceIndex.ts',
        evidence_path=ROOT / 'docs/evidence/fluency-v1',
        export_name='fluencyVoiceFiles',
    ))
