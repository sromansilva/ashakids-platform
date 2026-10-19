import asyncio
from generate_word_voice import generate_bank, ROOT

if __name__ == '__main__':
    asyncio.run(generate_bank(
        input_path=ROOT / 'tmp/sounds-v108/texts.json',
        OUTPUT=ROOT / 'frontend/public/sounds/voice/v108',
        index=ROOT / 'frontend/src/pages/padre/Sessions/SoundGames/soundVoiceIndex.ts',
        evidence_path=ROOT / 'docs/evidence/sounds-v108', export_name='soundVoiceFiles'))
