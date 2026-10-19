import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NamingGame } from '@/pages/padre/Sessions/WordGames/NamingGame';
import { voiceService, type TranscripcionRespuesta } from '@/services/voiceService';

class Recorder {
  static last: Recorder;
  static bytes = 1024;
  static isTypeSupported = () => true;
  state = 'inactive'; mimeType = 'audio/webm';
  onstop: (() => void) | null = null;
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() { Recorder.last = this; }
  start() { this.state = 'recording'; }
  stop() {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['x'.repeat(Recorder.bytes)], { type: this.mimeType }) });
    this.onstop?.();
  }
}
const trackStop = vi.fn();
const stream = { getTracks: () => [{ stop: trackStop }] };
const speech = { speak: vi.fn(), stop: vi.fn(), notice: '' };
const response = (match = true, text = 'gato'): TranscripcionRespuesta => ({
  estado: 'OK', transcripcion: text, comparacion: {
    frase_esperada: 'Gato', frase_obtenida: text, porcentaje_coincidencia: match ? 100 : 0,
    palabras_esperadas: ['gato'], palabras_obtenidas: [text], palabras_omitidas: [], palabras_adicionales: [],
    es_coincidente: match, desglose: [], aviso: 'Comparación textual',
  },
});
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }));
const play = () => { const finish = vi.fn(); return { ...render(<NamingGame speech={speech} mode="gentle" finish={finish}/>), finish }; };
async function record() { click('Pulsar para hablar'); await screen.findByRole('button', { name: 'Terminar grabación' }); click('Terminar grabación'); }

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(.999);
  vi.stubGlobal('MediaRecorder', Recorder); Recorder.bytes = 1024;
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL = vi.fn(() => 'blob:word-test'); static revokeObjectURL = vi.fn();
  });
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn().mockResolvedValue(stream) } });
  vi.spyOn(voiceService, 'transcribe').mockResolvedValue(response());
  trackStop.mockClear(); speech.stop.mockClear(); speech.speak.mockClear();
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('permite oír el modelo, graba sólo por acción y exige confirmación antes de avanzar', async () => {
  const view = play();
  expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  click('Escuchar la palabra'); expect(speech.speak).toHaveBeenCalledWith('Gato');
  click('Pulsar para hablar');
  await screen.findByRole('button', { name: 'Terminar grabación' });
  expect(screen.getByRole('button', { name: 'Escuchar la palabra' })).toBeDisabled();
  expect(speech.stop).toHaveBeenCalled();
  click('Terminar grabación');
  await screen.findByText('«gato»');
  expect(trackStop).toHaveBeenCalled();
  expect(voiceService.transcribe).toHaveBeenCalledWith(expect.any(Blob), { targetPhrase: 'Gato', signal: expect.any(AbortSignal) });
  expect(screen.getByLabelText('Escuchar mi grabación')).toHaveAttribute('src', 'blob:word-test');
  expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument();
  click('¡Ya dije la palabra!'); click('Continuar');
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:word-test');
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  expect(view.finish).not.toHaveBeenCalled();
});
it('un desacierto no completa la ronda ni muestra porcentajes de pronunciación', async () => {
  vi.mocked(voiceService.transcribe).mockResolvedValue(response(false, 'perro'));
  play(); await record(); await screen.findByText('«perro»');
  expect(screen.queryByRole('button', { name: '¡Ya dije la palabra!' })).not.toBeInTheDocument();
  expect(screen.queryByText(/0\s*%/)).not.toBeInTheDocument();
  click('Grabar otra vez'); await screen.findByRole('button', { name: 'Terminar grabación' });
  expect(screen.queryByText('«perro»')).not.toBeInTheDocument();
});
it('ofrece una salida sin micrófono y completa tres rondas sólo con respuestas correctas', () => {
  const { finish } = play();
  for (const word of ['Gato', 'Casa', 'Pelota']) {
    click('Seguir con imágenes'); click('Perro');
    expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument();
    click(word); click(word === 'Pelota' ? 'Terminar juego' : 'Continuar');
  }
  expect(finish).toHaveBeenCalledOnce(); expect(voiceService.transcribe).not.toHaveBeenCalled();
});
it('completa tres grabaciones coincidentes sin enviar paciente, nivel ni intento', async () => {
  const { finish } = play();
  for (const word of ['Gato', 'Casa', 'Pelota']) {
    vi.mocked(voiceService.transcribe).mockResolvedValue(response(true, word.toLowerCase()));
    await record(); await screen.findByText(`«${word.toLowerCase()}»`);
    click('¡Ya dije la palabra!'); click(word === 'Pelota' ? 'Terminar juego' : 'Continuar');
  }
  expect(finish).toHaveBeenCalledOnce();
  for (const [, options] of vi.mocked(voiceService.transcribe).mock.calls) expect(Object.keys(options!)).toEqual(['targetPhrase', 'signal']);
});
it('recupera permisos denegados y permite seguir sin grabar', async () => {
  vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(new DOMException('denied', 'NotAllowedError'));
  play(); click('Pulsar para hablar'); await screen.findByText(/El micrófono no tiene permiso/);
  click('Seguir con imágenes'); click('Gato'); expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
});
it('no conserva un micrófono concedido después de salir de la actividad', async () => {
  let allow!: (value: MediaStream) => void;
  vi.mocked(navigator.mediaDevices.getUserMedia).mockReturnValue(new Promise(resolve => { allow = resolve; }));
  const view = play(); click('Pulsar para hablar'); view.unmount();
  await act(async () => { allow(stream as unknown as MediaStream); });
  expect(trackStop).toHaveBeenCalled(); expect(voiceService.transcribe).not.toHaveBeenCalled();
});
it('cancela durante la grabación y apaga el micrófono sin subir audio', async () => {
  play(); click('Pulsar para hablar'); await screen.findByRole('button', { name: 'Terminar grabación' }); click('Cancelar grabación');
  expect(trackStop).toHaveBeenCalled(); expect(voiceService.transcribe).not.toHaveBeenCalled();
});
it('ignora una respuesta tardía después de cambiar a imágenes y aborta su petición', async () => {
  let resolve!: (value: TranscripcionRespuesta) => void;
  vi.mocked(voiceService.transcribe).mockReturnValue(new Promise(done => { resolve = done; }));
  play(); await record(); await screen.findByText('Estamos escuchando tu grabación…');
  const options = vi.mocked(voiceService.transcribe).mock.calls[0][1] as { signal: AbortSignal };
  click('Seguir con imágenes');
  expect(options.signal.aborted).toBe(true);
  await act(async () => { resolve(response()); });
  expect(screen.queryByText('«gato»')).not.toBeInTheDocument(); expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument();
});
it.each(['empty', 'network', 'short', 'large'])('recupera %s sin dar una respuesta por correcta', async kind => {
  if (kind === 'empty') vi.mocked(voiceService.transcribe).mockResolvedValue({ estado: 'AUDIO_VACIO', transcripcion: '' });
  if (kind === 'network') vi.mocked(voiceService.transcribe).mockRejectedValue(new Error('offline'));
  if (kind === 'short') Recorder.bytes = 100;
  if (kind === 'large') Recorder.bytes = 5 * 1024 * 1024 + 1;
  play(); await record();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Seguir con imágenes' })).toBeInTheDocument());
  await waitFor(() => expect(screen.queryByText('Estamos escuchando tu grabación…')).not.toBeInTheDocument());
  expect(screen.queryByRole('button', { name: '¡Ya dije la palabra!' })).not.toBeInTheDocument();
  if (kind === 'short' || kind === 'large') expect(voiceService.transcribe).not.toHaveBeenCalled();
});
it('detiene la grabación automáticamente a los diez segundos', async () => {
  vi.useFakeTimers(); play(); click('Pulsar para hablar');
  await act(async () => {});
  expect(Recorder.last.state).toBe('recording');
  await act(async () => { vi.advanceTimersByTime(10000); });
  expect(Recorder.last.state).toBe('inactive'); expect(trackStop).toHaveBeenCalled();
  expect(voiceService.transcribe).toHaveBeenCalledOnce();
});
it('detiene y descarta la grabación al ocultar la página', async () => {
  play(); click('Pulsar para hablar'); await screen.findByRole('button', { name: 'Terminar grabación' });
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  fireEvent(document, new Event('visibilitychange'));
  expect(trackStop).toHaveBeenCalled(); expect(voiceService.transcribe).not.toHaveBeenCalled();
});
