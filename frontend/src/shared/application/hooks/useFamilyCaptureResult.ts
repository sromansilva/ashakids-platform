import { useEffect, useRef } from 'react';
import { sessionsService, type FamilyCaptureStatus } from '@/modules/clinica/infrastructure/clinicalService';

export function useFamilyCaptureResult(
  sessionId: number,
  captureId: string | null,
  onResult: (result: NonNullable<FamilyCaptureStatus['resultado']>) => void,
  onExpired: () => void,
) {
  const onResultRef = useRef(onResult);
  const onExpiredRef = useRef(onExpired);
  onResultRef.current = onResult;
  onExpiredRef.current = onExpired;

  useEffect(() => {
    if (!captureId) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();
    const poll = async () => {
      try {
        const status = await sessionsService.resultadoCapturaFamiliar(sessionId, captureId);
        if (!active) return;
        if (status.estado === 'COMPLETADA' && status.resultado) {
          onResultRef.current(status.resultado);
          return;
        }
      } catch {
        if (active && Date.now() - startedAt > 5 * 60_000) {
          onExpiredRef.current();
          return;
        }
      }
      if (active) timer = setTimeout(() => void poll(), 3000);
    };
    void poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      void sessionsService.descartarCapturaFamiliar(sessionId, captureId).catch(() => undefined);
    };
  }, [captureId, sessionId]);
}
