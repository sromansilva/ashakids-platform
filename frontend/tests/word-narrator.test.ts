import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createWordNarrator, narratorPreview, voiceKey } from '@/modules/padre/presentation/Sessions/WordGames/wordNarrator';
import { wordVoiceFiles } from '@/modules/padre/presentation/Sessions/WordGames/wordVoiceIndex';
import { wordGames, words } from '@/modules/padre/presentation/Sessions/WordGames/wordContent';

class Player {
  static last: Player;
  onended: (() => void) | null = null; onerror: (() => void) | null = null;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn(); removeAttribute = vi.fn(); load = vi.fn();
  constructor(public src: string) { Player.last = this; }
}
beforeEach(() => { vi.stubGlobal('Audio', Player); });
afterEach(() => vi.unstubAllGlobals());

it('sirve audio natural del proyecto, sin usar síntesis del navegador', () => {
  const speak = vi.fn(); vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak });
  const narrator = createWordNarrator(vi.fn());
  narrator.speak('  GATO  ');
  expect(Player.last.src).toBe(`/words/voice/v106/${wordVoiceFiles.gato}`);
  expect(Player.last.play).toHaveBeenCalledOnce(); expect(speak).not.toHaveBeenCalled();
});
it('incluye las palabras, metas e instrucciones de los once juegos y la muestra', () => {
  for (const text of [narratorPreview, ...Object.values(words).map(word => word.name), ...wordGames.flatMap(game => [game.goal, `${game.goal} ${game.steps.join(' ')}`])]) {
    expect(wordVoiceFiles[voiceKey(text)], text).toMatch(/^[a-f0-9]{16}\.mp3$/);
  }
});
it('detiene y descarga el audio anterior al repetir o cancelar', () => {
  const narrator = createWordNarrator(vi.fn()); narrator.speak('Gato'); const previous = Player.last;
  narrator.speak('Casa');
  expect(previous.pause).toHaveBeenCalled(); expect(previous.removeAttribute).toHaveBeenCalledWith('src');
  expect(previous.onended).toBeNull(); narrator.stop(); expect(Player.last.pause).toHaveBeenCalled();
});
it('recupera audio fallido con un aviso y permite reintentar', () => {
  const notice = vi.fn(), narrator = createWordNarrator(notice);
  narrator.speak('Gato'); Player.last.onerror?.();
  expect(notice).toHaveBeenLastCalledWith(expect.stringContaining('continuar con las imágenes'));
  narrator.speak('Gato'); expect(Player.last.play).toHaveBeenCalledOnce(); expect(notice).toHaveBeenLastCalledWith('');
});
it('no muestra avisos tardíos de un audio reemplazado', () => {
  const notice = vi.fn(), narrator = createWordNarrator(notice);
  narrator.speak('Gato'); const late = Player.last.onerror!;
  narrator.speak('Casa'); notice.mockClear(); late(); expect(notice).not.toHaveBeenCalled();
});
it('una indicación sin grabación conserva la alternativa visual sin voz robótica', () => {
  const notice = vi.fn(); createWordNarrator(notice).speak('Texto nuevo sin grabación');
  expect(notice).toHaveBeenLastCalledWith(expect.stringContaining('imágenes y el texto'));
});
