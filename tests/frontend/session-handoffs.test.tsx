import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '@/modules/auth/application/AuthContext';
import type { SemanticRole, User } from '@/modules/auth/domain/auth';
import { TherapistVoiceAIWidget } from '@/shared/presentation/components/common/TherapistVoiceAIWidget';
import { ClinicalReportEditor, emptyReport } from '@/shared/presentation/components/common/ClinicalReportEditor';
import { FamilyAppointmentDetail } from '@/shared/presentation/components/common/FamilyAppointmentDetail';
import { renderRoute } from './helpers';
import { sessionsService } from '@/modules/clinica/infrastructure/clinicalService';
import { VoiceLevelTracker, NO_VOICE_MESSAGE } from '@/shared/application/audio/voiceSignal';
import { encodeArticulationResult } from '@/shared/application/articulationReportEntries';
import { presentarInformeParaFamilia } from '../../backend/src/modules/clinica/services/phoneticIndicators.ts';

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

function renderAs(ui: ReactElement, role: SemanticRole) {
  const user: User = { id_usuario: 1, codigo_usuario: 'test', nombres: 'Usuario', apellidos: 'Prueba', rol: role, roles: [role], activo: true, email: 'test@example.invalid' };
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <AuthContext.Provider value={{ user, role, isAuthenticated: true, isLoading: false, login: vi.fn(), logout: vi.fn(), refreshUser: vi.fn() }}>
          {ui}
        </AuthContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const pendingRow = (id: number, word: string, transcript: string, session = 7) => ({
  id_evaluacion: id, id_sesion: session, id_paciente: 3, fonema_objetivo: '/rr/', palabra_objetivo: word,
  transcripcion_detectada: transcript, estado: 'PENDIENTE_REVISION', similitud_texto_porcentaje: 60,
  tipo_error_sugerido: 'OMISION', hipotesis_sugerida: 'Posible rotacismo',
});

describe('muestras pendientes tras recargar', () => {
  it('lista varias pendientes de la sesión con su indicador etiquetado y permite descartar una', async () => {
    const reviews: Array<{ path: string; body: string }> = [];
    vi.mocked(fetch).mockImplementation(async (input, init = {}) => {
      const path = new URL(String(input)).pathname.replace('/api/v1', '');
      if (path === '/clinica/consentimientos/3') return json({ consentido: true, estado: 'CONCEDIDO' });
      if (path === '/clinica/evaluaciones-fonologicas/3') {
        return json([
          pendingRow(11, 'carro', 'caro'),
          pendingRow(12, 'rosa', 'osa'),
          pendingRow(13, 'carro', 'caro', 99),
          { ...pendingRow(14, 'carro', 'carro'), estado: 'CONFIRMADO_TERAPEUTA' },
        ]);
      }
      if (init.method === 'PATCH') { reviews.push({ path, body: String(init.body) }); return json({ id_evaluacion: 11, estado: 'DESCARTADO' }); }
      return json([]);
    });
    renderAs(<TherapistVoiceAIWidget sessionId={7} patientId={3} />, 'TERAPEUTA');
    expect(await screen.findByText('Muestras pendientes de revisión (2)')).toBeInTheDocument();
    expect(screen.getAllByTestId('pending-phonetic-review')).toHaveLength(2);
    expect(screen.getAllByText('Indicador de apoyo · sin validación clínica')).toHaveLength(2);
    expect(screen.getAllByText('Posible rotacismo').length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole('button', { name: 'Descartar transcripción' })[0]);
    await waitFor(() => expect(reviews).toHaveLength(1));
    expect(reviews[0].path).toBe('/evaluaciones-fonologicas/11/revision'.replace('/evaluaciones', '/clinica/evaluaciones'));
    expect(JSON.parse(reviews[0].body)).toMatchObject({ estado: 'DESCARTADO' });
  });

  it('al confirmar entrega el resultado al informe sin la hipótesis y exige observación y resultado', async () => {
    const onConfirm = vi.fn();
    vi.mocked(fetch).mockImplementation(async (input, init = {}) => {
      const path = new URL(String(input)).pathname.replace('/api/v1', '');
      if (path === '/clinica/consentimientos/3') return json({ consentido: true, estado: 'CONCEDIDO' });
      if (path === '/clinica/evaluaciones-fonologicas/3') return json([pendingRow(11, 'carro', 'caro')]);
      if (init.method === 'PATCH') return json({ id_evaluacion: 11, estado: 'CONFIRMADO_TERAPEUTA' });
      return json([]);
    });
    renderAs(<TherapistVoiceAIWidget sessionId={7} patientId={3} onConfirmResult={onConfirm} />, 'TERAPEUTA');
    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar y pegar en el informe' }));
    expect(await screen.findByText(/Corrige la transcripción, registra una observación/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Observación del terapeuta'), { target: { value: 'Omitió la vibrante.' } });
    fireEvent.change(screen.getByLabelText(/Resultado del objetivo observado/), { target: { value: 'EN_PROCESO' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar y pegar en el informe' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    const pasted = onConfirm.mock.calls[0][0];
    expect(pasted.similitud_apoyo).toBe(60);
    expect(JSON.stringify(pasted)).not.toContain('Posible rotacismo');
  });
});

describe('señal sin voz', () => {
  it('el criterio reutiliza el umbral del medidor (42 dB)', () => {
    const silence = new VoiceLevelTracker();
    silence.push(new Float32Array(4096).fill(0.0004));
    expect(silence.hasVoice).toBe(false);
    expect(silence.peakDb).toBeLessThan(42);
    const voice = new VoiceLevelTracker();
    voice.push(Float32Array.from({ length: 4096 }, (_, index) => Math.sin(index / 8) * 0.4));
    expect(voice.hasVoice).toBe(true);
    voice.reset();
    expect(voice.hasVoice).toBe(false);
    expect(NO_VOICE_MESSAGE).toBe('No se escuchó voz con claridad. Vuelve a grabar.');
  });
});

describe('editor del reporte', () => {
  it('explica qué falta para firmar y pide confirmación antes de firmar', async () => {
    let signed = 0;
    vi.mocked(fetch).mockImplementation(async (input, init = {}) => {
      const path = new URL(String(input)).pathname.replace('/api/v1', '');
      if (path === '/sesiones/5/reporte/firmar' && init.method === 'POST') { signed += 1; return json({ estado_reporte: 'FIRMADO' }); }
      return json([]);
    });
    const incomplete = { ...emptyReport, observaciones_iniciales: 'Obs', objetivos_trabajados: 'Obj', proximos_pasos: 'Casa' };
    const view = renderAs(<ClinicalReportEditor id={5} initial={incomplete} />, 'TERAPEUTA');
    expect(screen.getByRole('button', { name: 'Firmar y publicar reporte' })).toBeDisabled();
    expect(screen.getByRole('note', { name: 'Qué falta para firmar' })).toHaveTextContent('Elige el nivel de ayuda');
    view.unmount();

    renderAs(<ClinicalReportEditor id={5} initial={{ ...incomplete, nivel_ayuda: 'Ayuda moderada' }} />, 'TERAPEUTA');
    const sign = screen.getByRole('button', { name: 'Firmar y publicar reporte' });
    expect(sign).toBeEnabled();
    fireEvent.click(sign);
    expect(signed).toBe(0);
    expect(screen.getByRole('alertdialog')).toHaveTextContent('irreversible');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(signed).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Firmar y publicar reporte' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sí, firmar y publicar' }));
    await waitFor(() => expect(signed).toBe(1));
  });
});

describe('familia: reporte, errores y estados', () => {
  it('un 404 del reporte aún no publicado es un estado vacío; otros errores se siguen propagando', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json({ error: 'El reporte estará disponible cuando el terapeuta lo firme.' }, 404));
    await expect(sessionsService.report(9)).resolves.toBeNull();
    vi.mocked(fetch).mockResolvedValueOnce(json({ error: 'Falla del servidor' }, 500));
    await expect(sessionsService.report(9)).rejects.toMatchObject({ status: 500 });
  });

  it('el detalle de la cita usa etiquetas legibles y avisa de la sesión en curso sin mostrar error 404', async () => {
    const appointment = {
      id_reserva: 4, id_paciente: 3, id_terapeuta: 2, id_tratamiento: null, tipo_cita: 'TERAPIA', paciente_nombre: 'Ana', terapeuta_nombre: 'Luis',
      fecha_hora_inicio: '2026-11-10T15:00:00Z', fecha_hora_fin: '2026-11-10T15:40:00Z', modalidad: 'VIRTUAL', localizacion: null,
      estado_reserva: 'CONFIRMADA', estado_sesion: 'EN_CURSO', id_sesion: 9, meet_url: 'https://meet.google.com/abc-defg-hij', fecha_creacion: '2026-11-01T00:00:00Z',
    };
    vi.mocked(fetch).mockImplementation(async (input) => {
      const path = new URL(String(input)).pathname.replace('/api/v1', '');
      if (path === '/citas/4') return json(appointment);
      if (path === '/sesiones/9') return json({ id_sesion: 9, id_reserva: 4, cita: appointment, reporte_disponible: true, estado_sesion: 'EN_CURSO', asistencia: null, fecha_hora_inicio_real: null, fecha_hora_fin_real: null });
      if (path === '/sesiones/9/reporte') return json({ error: 'El reporte estará disponible cuando el terapeuta lo firme.' }, 404);
      if (path === '/sesiones/9/evaluacion-fonema/capturas-familia/pendiente') return json({ captura_id: 'abc', palabra_objetivo: 'carro', fonema_objetivo: '/rr/', estado: 'SOLICITADA' });
      if (path === '/sesiones/9/plan') return json(null);
      return json([]);
    });
    renderAs(<FamilyAppointmentDetail id={4} cancel={() => undefined} />, 'PADRE');
    expect(await screen.findByText(/Sesión de terapia · Confirmada/)).toBeInTheDocument();
    expect(screen.queryByText(/CONFIRMADA/)).not.toBeInTheDocument();
    const notice = await screen.findByTestId('family-session-notice');
    await waitFor(() => expect(notice).toHaveTextContent('Graba la palabra «carro»'));
    expect(notice).toHaveTextContent('Grabar ahora');
    expect(within(notice).getByRole('link', { name: /Entrar a la reunión/ })).toHaveAttribute('href', 'https://meet.google.com/abc-defg-hij');
    expect(screen.queryByText(/Error HTTP 404/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Un terapeuta puede iniciar un plan/)).not.toBeInTheDocument();
  });
});

describe('formateador del reporte para la familia', () => {
  it('convierte la entrada técnica en una frase clara y no toca el texto de origen', () => {
    const stored = encodeArticulationResult({
      objetivo_articulacion: 'Observación del objetivo /rr/', palabra_esperada: 'carro', transcripcion_tentativa: 'caro',
      resultado_revisado: 'Mejoró con apoyo. Transcripción revisada: "carro". Resultado del objetivo en esta muestra: en proceso.',
      archivo_origen: 'Micrófono de este dispositivo durante la sesión', inicio_segundo: 0, fin_segundo: 2.82, similitud_apoyo: 75,
    });
    const family = presentarInformeParaFamilia(`Texto libre.\n\n${stored}`);
    expect(family).toBe('Texto libre.\n\nPalabra practicada: Carro. Resultado: en proceso. Observación: Mejoró con apoyo.');
    expect(stored).toContain('[Resultado de articulación: análisis clínico]');
    expect(stored).toContain('Indicador de apoyo · sin validación clínica: 75 %');
  });
});

describe('avisos a la familia', () => {
  const live = {
    id_reserva: 3, id_paciente: 1, id_terapeuta: 2, id_tratamiento: null, tipo_cita: 'TERAPIA', paciente_nombre: 'Ana', terapeuta_nombre: 'Luis',
    fecha_hora_inicio: '2026-11-10T15:00:00Z', fecha_hora_fin: '2026-11-10T15:40:00Z', modalidad: 'VIRTUAL', localizacion: null,
    estado_reserva: 'CONFIRMADA', estado_sesion: 'EN_CURSO', id_sesion: 9, meet_url: 'https://meet.google.com/abc-defg-hij', fecha_creacion: '2026-11-01T00:00:00Z',
  };
  const notice = (id: number, tipo: string, titulo: string) => ({
    id_notificacion: id, tipo, titulo, texto: titulo, id_reserva: 3, id_conversacion: null,
    fecha_creacion: '2026-11-10T15:00:00Z', leida_en: null, meet_url: null,
  });

  it('la bienvenida destaca la sesión en curso y la muestra pedida sin consultar citas', async () => {
    const paths: string[] = [];
    vi.mocked(fetch).mockImplementation(async (input) => {
      const path = new URL(String(input)).pathname.replace('/api/v1', '');
      paths.push(path);
      if (path === '/notificaciones') {
        return json({ items: [
          { ...notice(1, 'MUESTRA_SOLICITADA', 'Tu terapeuta pidió una muestra de voz'), sesion_en_curso: true },
          { ...notice(2, 'SESION_INICIADA', 'Tu terapeuta inició la reunión'), sesion_en_curso: true, meet_url: 'https://meet.google.com/abc-defg-hij' },
          { ...notice(3, 'SESION_INICIADA', 'Sesión anterior'), sesion_en_curso: false },
        ], total: 3, sin_leer: 3 });
      }
      if (path === '/pacientes') return new Response(JSON.stringify([{ id_paciente: 1, id_tutor: 1, nombres_paciente: 'Ana', apellidos_paciente: 'Prueba', fecha_nacimiento: '2020-01-01', sexo: 'F', activo: true }]), { headers: { 'Content-Type': 'application/json', 'X-Total-Count': '1' } });
      if (path === '/pacientes/1/juegos') return json({ mundos: [] });
      return json([]);
    });
    renderRoute('/padre/welcome', 'PADRE');
    const banner = await screen.findByTestId('family-session-notice');
    expect(within(banner).getByRole('button', { name: /Grabar ahora/ })).toBeInTheDocument();
    expect(within(banner).getByRole('link', { name: /Entrar a la reunión/ })).toHaveAttribute('href', 'https://meet.google.com/abc-defg-hij');
    expect(within(banner).queryByText('Sesión anterior')).not.toBeInTheDocument();
    expect(paths.some((path) => /\/(citas|sesiones|tratamientos)/.test(path))).toBe(false);
  });

  it('las notificaciones críticas llevan a la cita con la acción concreta', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const path = new URL(String(input)).pathname.replace('/api/v1', '');
      if (path === '/notificaciones') {
        return json({ items: [
          notice(1, 'MUESTRA_SOLICITADA', 'Tu terapeuta pidió una muestra de voz'),
          notice(2, 'REPORTE_PUBLICADO', 'Tu terapeuta publicó el reporte'),
          { ...notice(3, 'SESION_INICIADA', 'Tu terapeuta inició la reunión'), meet_url: 'https://meet.google.com/abc-defg-hij' },
        ], total: 3, sin_leer: 3 });
      }
      return json([]);
    });
    renderRoute('/padre/config', 'PADRE');
    fireEvent.click(await screen.findByRole('button', { name: /Notificaciones, 3 sin leer/ }));
    expect(await screen.findByRole('button', { name: 'Grabar ahora' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver reporte' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Entrar a la reunión' })).toHaveAttribute('href', 'https://meet.google.com/abc-defg-hij');
  });
});
