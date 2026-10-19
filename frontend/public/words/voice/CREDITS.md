# Voz de la Isla de las Palabras — V106

Textos originales del catálogo ASHAKids. Voz sintética en español de Perú:
Microsoft es-PE-CamilaNeural, velocidad -8%, volumen -8%, sin alteración de tono.
Generación editorial previa mediante edge-tts 7.3.1; no es una grabación humana
ni una voz infantil clonada. No contiene nombres de pacientes ni datos reales.

Los MP3 se sirven como recursos estáticos del proyecto. No se envía texto a un
servicio TTS mientras el niño juega. El reconocimiento de su micrófono sigue un
flujo independiente en FastAPI y no usa estos archivos como grabaciones del niño.

Scripts reproducibles en tools/audio/prepare_word_voice.cjs y generate_word_voice.py.
Listado de textos, hashes y tamaños en docs/evidence/voice-v106/clips.json.
La herramienta de generación no forma parte del runtime ni de requirements.txt.
Fuente técnica: https://github.com/rany2/edge-tts .
