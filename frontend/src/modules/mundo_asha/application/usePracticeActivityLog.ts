import { useCallback, useRef, useState } from 'react';
import type { WorldArea } from '@/modules/clinica/domain/clinical';
import { learningGames, type LudicActivityData } from '../infrastructure/learningGames';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function usePracticeActivityLog(patientId: number, world: WorldArea) {
  const startedAt = useRef(Date.now());
  const request = useRef<LudicActivityData | null>(null);
  const saving = useRef(false);
  const stateRef = useRef<SaveState>('idle');
  const savedKey = useRef<string | null>(null);
  const inFlight = useRef<{ key: string; promise: Promise<boolean> } | null>(null);
  const [state, setState] = useState<SaveState>('idle');

  const updateState = useCallback((next: SaveState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const begin = useCallback(() => {
    startedAt.current = Date.now();
    request.current = null;
    savedKey.current = null;
    updateState('idle');
  }, [updateState]);

  const submit = useCallback(async (): Promise<boolean> => {
    const pending = inFlight.current;
    if (pending) {
      if (pending.key === request.current?.clave_intento) return pending.promise;
      await pending.promise;
      return submit();
    }
    const payload = request.current;
    if (!payload) return false;
    if (savedKey.current === payload.clave_intento) {
      updateState('saved');
      return true;
    }
    if (saving.current) return false;
    saving.current = true;
    const key = payload.clave_intento;
    const promise = (async () => {
      updateState('saving');
      try {
        await learningGames.practiceActivity(patientId, world, payload);
        savedKey.current = key;
        if (request.current?.clave_intento === key) updateState('saved');
        return true;
      } catch {
        if (request.current?.clave_intento === key) updateState('error');
        return false;
      } finally {
        saving.current = false;
      }
    })();
    inFlight.current = { key, promise };
    try {
      return await promise;
    } finally {
      if (inFlight.current?.key === key) inFlight.current = null;
    }
  }, [patientId, updateState, world]);

  const record = useCallback(async (activity: string) => {
    if (!Number.isInteger(patientId) || patientId <= 0) return false;
    if (stateRef.current === 'saved' && request.current?.actividad === activity) return true;
    if (!request.current || request.current.actividad !== activity) {
      request.current = {
        clave_intento: crypto.randomUUID(),
        version: 'adaptive-1',
        actividad: activity,
        duracion_segundos: Math.max(0, Math.min(3600, Math.floor((Date.now() - startedAt.current) / 1000))),
        completada: true,
      };
    }
    return submit();
  }, [patientId, submit]);

  const retry = useCallback(() => submit(), [submit]);
  return { state, begin, record, retry };
}
