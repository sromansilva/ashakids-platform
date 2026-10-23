# Voz del Taller de los Sonidos — V108

Textos originales del catálogo ASHAKids. Narración sintética en español de Perú:
Microsoft es-PE-CamilaNeural, velocidad -8%, volumen -8%, sin alterar el tono.
Generación editorial previa mediante edge-tts 7.3.1; no es grabación humana ni
clonación de una voz infantil. No contiene nombres de pacientes ni datos reales.

Los 33 MP3 se sirven como recursos estáticos locales; no se envían frases a un
servicio TTS durante el juego. El ambiente usa grabaciones de animales con créditos
separados en ../animals/CREDITS.md. El índice, textos, tamaños y hashes están en
frontend/src/pages/padre/Sessions/SoundGames/soundVoiceIndex.ts y
docs/evidence/sounds-v108/clips.json.

Preparación y generación reproducibles con tools/audio/prepare_sound_voice.cjs y
tools/audio/generate_sound_voice.py. edge-tts es sólo una herramienta de autoría,
no forma parte del runtime ni requirements.txt. Fuente técnica:
https://github.com/rany2/edge-tts .
