import { wordVoiceFiles } from './wordVoiceIndex';

export const narratorPreview = 'Hola. Vamos a descubrir palabras juntos. Escucha y juega a tu ritmo.';
export const voiceKey = (text: string) => text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');

// Each island owns a player, so leaving it or opening the microphone stops audio.
export function createWordNarrator(notice: (message: string) => void) {
  let audio: HTMLAudioElement | null = null;
  let version = 0;
  function stop() {
    version++;
    window.speechSynthesis?.cancel();
    if (audio) {
      audio.onended = null; audio.onerror = null;
      audio.pause(); audio.removeAttribute('src'); audio.load();
      audio = null;
    }
  }
  function speak(text: string) {
    stop(); notice('');
    const file = wordVoiceFiles[voiceKey(text)];
    if (!file || typeof Audio === 'undefined') {
      notice('Esta indicación no tiene audio disponible. Puedes seguir con las imágenes y el texto.'); return;
    }
    const token = version;
    const player = new Audio(`/words/voice/v106/${file}`);
    audio = player;
    const failed = () => {
      if (token !== version) return;
      stop(); notice('No se pudo escuchar. Pulsa Escuchar para reintentar o sigue con las imágenes.');
    };
    player.onerror = failed;
    player.onended = () => { if (token === version) stop(); };
    try { void player.play().catch(failed); } catch { failed(); }
  }
  return { speak, stop };
}
