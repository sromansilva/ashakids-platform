import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { sessionsService } from '@/services/clinicalService';
import { ApiError } from '@/api/client';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';

export function ReportDownload({ sessionId }: { sessionId: number }) {
  const controller = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [started, setStarted] = useState(false);
  useEffect(() => () => controller.current?.abort(), []);
  const download = async () => {
    if (controller.current && !controller.current.signal.aborted) return;
    const request = new AbortController(); controller.current = request;
    setPending(true); setError(null); setStarted(false);
    try {
      const blob = await sessionsService.reportPdf(sessionId, request.signal);
      if (request.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      try {
        anchor.href = url; anchor.download = `reporte-sesion-${sessionId}.pdf`;
        document.body.appendChild(anchor); anchor.click();
        setStarted(true);
      } finally {
        anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (failure) {
      if (!request.signal.aborted && !(failure instanceof Error && failure.name === 'AbortError')) {
        setError(failure instanceof ApiError && failure.status === 0 ? new Error('No hay conexión. Vuelve a descargar el reporte cuando el servidor esté disponible.') : failure);
      }
    } finally {
      if (!request.signal.aborted) setPending(false);
      if (controller.current === request) controller.current = null;
    }
  };
  return <div className="space-y-2">
    <Btn variant="outline" disabled={pending} onClick={() => void download()}><Download size={16} aria-hidden="true" />{pending ? 'Preparando PDF…' : 'Descargar reporte PDF'}</Btn>
    <RemoteFeedback error={error} />
    {started && <p role="status" className="text-sm text-[#4B4264] pr-16 sm:pr-0">PDF recibido. El navegador inició la descarga.</p>}
    <p className="text-sm text-[#4B4264] pr-16 sm:pr-0">Incluye la última versión guardada. Los cambios sin guardar quedan fuera del PDF.</p>
  </div>;
}
