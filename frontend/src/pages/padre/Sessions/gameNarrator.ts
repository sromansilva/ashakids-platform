// Static narration, shared by both worlds. No remote TTS or native-voice fallback.
export const voiceKey = (text: string) => text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');
export function createGameNarrator(files: Record<string, string>, base: string, notice: (message: string) => void) {
  let audio: HTMLAudioElement | null = null;
  let version = 0;
  function stop() {
    version++; window.speechSynthesis?.cancel();
    if (audio) { audio.onended = null; audio.onerror = null; audio.pause(); audio.removeAttribute('src'); audio.load(); audio = null; }
  }
  function speak(text: string) {
    stop(); notice('');
    const file = files[voiceKey(text)];
    if (!file || typeof Audio === 'undefined') { notice('Esta indicación no tiene audio disponible. Puedes seguir con las imágenes y el texto.'); return; }
    const token = version, player = new Audio(`${base}/${file}`);
    audio = player;
    const failed = () => { if (token !== version) return; stop(); notice('No se pudo escuchar. Pulsa Escuchar para reintentar o sigue con las imágenes.'); };
    player.onerror = failed; player.onended = () => { if (token === version) stop(); };
    try { void player.play().catch(failed); } catch { failed(); }
  }
  return { speak, stop };
}
