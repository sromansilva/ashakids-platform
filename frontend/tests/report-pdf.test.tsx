import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { apiClient, invalidateIdentityRequests } from '@/api/client';
import { ReportDownload } from '@/components/common/ReportDownload';
import { renderRoute } from './helpers';

const pdf = () => new Response('%PDF-1.4\nsynthetic-test', { headers: { 'Content-Type': 'application/pdf' } });
const failure = (status: number) => new Response(JSON.stringify({ detail: `Fallo ${status}` }), { status, headers: { 'Content-Type': 'application/json' } });
function browserDownload() {
  const create = vi.fn().mockReturnValue('blob:synthetic-report');
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: create });
  const revoke = vi.fn(); Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revoke });
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  return { create, revoke, click };
}

it('downloads PDF through the centralized cookie client', async () => {
  vi.mocked(fetch).mockResolvedValue(pdf());
  const result = await apiClient.pdf('/sesiones/9/reporte/pdf');
  const body = await new Promise<string>(resolve => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsText(result); });
  expect(body).toContain('%PDF-');
  expect(fetch).toHaveBeenCalledWith(expect.stringMatching('/api/v1/sesiones/9/reporte/pdf'), expect.objectContaining({ method: 'GET', credentials: 'include', headers: expect.objectContaining({ Accept: 'application/pdf' }) }));
});

it.each([401, 403, 404, 422, 503])('PDF %s keeps JSON errors and rejects download', async status => {
  const expired = vi.fn(); window.addEventListener('ashakids:session-expired', expired);
  vi.mocked(fetch).mockResolvedValue(failure(status));
  await expect(apiClient.pdf('/sesiones/9/reporte/pdf')).rejects.toMatchObject({ status, message: `Fallo ${status}` });
  expect(expired).toHaveBeenCalledTimes(status === 401 ? 1 : 0);
  window.removeEventListener('ashakids:session-expired', expired);
});

it.each([
  () => new Response('<html>Login</html>', { headers: { 'Content-Type': 'text/html' } }),
  () => new Response('not-a-pdf', { headers: { 'Content-Type': 'application/pdf' } }),
  () => new Response('', { headers: { 'Content-Type': 'application/pdf' } }),
  () => new Response(null, { status: 204 }),
])('rejects unexpected and empty binary bodies', async response => {
  vi.mocked(fetch).mockResolvedValue(response());
  await expect(apiClient.pdf('/sesiones/9/reporte/pdf')).rejects.toMatchObject({ status: 502 });
});

it('rejects a PDF response from a previous account', async () => {
  let finish!: (response: Response) => void;
  vi.mocked(fetch).mockReturnValue(new Promise(resolve => { finish = resolve; }));
  const request = apiClient.pdf('/sesiones/9/reporte/pdf');
  invalidateIdentityRequests(); finish(pdf());
  await expect(request).rejects.toMatchObject({ name: 'AbortError' });
});

it('rejects account change while the PDF body is being read', async () => {
  const response = pdf(); const original = response.arrayBuffer.bind(response);
  vi.spyOn(response, 'arrayBuffer').mockImplementation(async () => { invalidateIdentityRequests(); return original(); });
  vi.mocked(fetch).mockResolvedValue(response);
  await expect(apiClient.pdf('/sesiones/9/reporte/pdf')).rejects.toMatchObject({ name: 'AbortError' });
});

it('shows pending state, starts one download and releases its URL', async () => {
  const download = browserDownload(); let finish!: (response: Response) => void;
  vi.mocked(fetch).mockReturnValue(new Promise(resolve => { finish = resolve; }));
  render(<ReportDownload sessionId={9} />);
  fireEvent.click(screen.getByRole('button', { name: 'Descargar reporte PDF' }));
  expect(screen.getByRole('button', { name: 'Preparando PDF…' })).toBeDisabled();
  finish(pdf());
  expect(await screen.findByRole('status')).toHaveTextContent('El navegador inició la descarga');
  expect(download.create).toHaveBeenCalledTimes(1); expect(download.click).toHaveBeenCalledTimes(1);
  expect((download.click.mock.instances[0] as HTMLAnchorElement).download).toBe('reporte-sesion-9.pdf');
  await waitFor(() => expect(download.revoke).toHaveBeenCalledWith('blob:synthetic-report'), { timeout: 2000 });
});

it('failure does not create a file or false success and can retry', async () => {
  const download = browserDownload(); vi.mocked(fetch).mockResolvedValueOnce(failure(503)).mockResolvedValueOnce(pdf());
  render(<ReportDownload sessionId={9} />); fireEvent.click(screen.getByRole('button', { name: 'Descargar reporte PDF' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Fallo 503');
  expect(screen.queryByRole('status')).not.toBeInTheDocument(); expect(download.create).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Descargar reporte PDF' }));
  await screen.findByRole('status'); expect(download.create).toHaveBeenCalledTimes(1);
});

it('network error uses download copy, without pretending to save changes', async () => {
  browserDownload(); vi.mocked(fetch).mockRejectedValue(new TypeError('Offline'));
  render(<ReportDownload sessionId={9} />); fireEvent.click(screen.getByRole('button', { name: 'Descargar reporte PDF' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Vuelve a descargar el reporte');
  expect(screen.queryByText(/Tus cambios/)).not.toBeInTheDocument();
});

it('unmount cancels download and does not create a file afterwards', async () => {
  const download = browserDownload(); let finish!: (response: Response) => void;
  vi.mocked(fetch).mockReturnValue(new Promise(resolve => { finish = resolve; }));
  const component = render(<ReportDownload sessionId={9} />);
  fireEvent.click(screen.getByRole('button', { name: 'Descargar reporte PDF' })); component.unmount();
  const signal = vi.mocked(fetch).mock.calls[0][1]?.signal;
  expect(signal?.aborted).toBe(true); finish(pdf());
  await waitFor(() => expect(download.create).not.toHaveBeenCalled());
});

describe('Family reports', () => {
  it('monthly entry contains no invented report, signature or PDF action', async () => {
    renderRoute('/padre/reportes', 'PADRE');
    fireEvent.click(await screen.findByRole('button', { name: 'Progreso mensual (pendiente)' }));
    expect(screen.getByText('Informes mensuales pendientes')).toBeInTheDocument();
    expect(screen.queryByText(/Dra. Ana Ruiz|Mateo|TP-2847|Informe Mensual|Firma Digital/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Descargar|PDF/ })).not.toBeInTheDocument();
  });
  it('loading has no zero-session claim or empty-family fallback', async () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {})); renderRoute('/padre/reportes', 'PADRE');
    expect(await screen.findByText('Sin datos')).toBeInTheDocument();
    expect(screen.queryByText('No hay sesiones registradas.')).not.toBeInTheDocument();
  });
});
