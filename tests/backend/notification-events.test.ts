import test from 'node:test';
import assert from 'node:assert/strict';
import type { PoolClient } from 'pg';
import { emitNotificationEvent } from '../../backend/src/modules/notificaciones/notification-events.ts';

test('notification event persists only when its preference is enabled and the user is active', async () => {
  const calls: Array<{ sql: string; params: unknown[] }> = [];
  const client = {
    query: async (sql: string, params: unknown[]) => {
      calls.push({ sql, params });
      return { rows: [], rowCount: 0 };
    },
  } as unknown as Pick<PoolClient, 'query'>;

  await emitNotificationEvent(client, {
    userId: 19,
    preference: 'reprogramacion',
    type: 'REPROGRAMACION',
    title: 'Cita reprogramada',
    text: 'La cita cambió de horario.',
    reservationId: 37,
    eventKey: 'reprogramacion:37:2026-11-02T15:00:00.000Z',
  });

  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /preferencias_notificacion/);
  assert.match(calls[0].sql, /reprogramacion/);
  assert.match(calls[0].sql, /ON CONFLICT \(id_usuario, clave_evento\) DO NOTHING/);
  assert.match(calls[0].sql, /usuarios WHERE id_usuario = \$1 AND activo = TRUE/);
  assert.deepEqual(calls[0].params, [
    19,
    'REPROGRAMACION',
    'Cita reprogramada',
    'La cita cambió de horario.',
    37,
    null,
    'reprogramacion:37:2026-11-02T15:00:00.000Z',
  ]);
});

test('message notifications require a conversation and never accept an appointment resource', async () => {
  let called = false;
  const client = {
    query: async () => {
      called = true;
      return { rows: [], rowCount: 0 };
    },
  } as unknown as Pick<PoolClient, 'query'>;

  await assert.rejects(() => emitNotificationEvent(client, {
    userId: 19,
    preference: 'mensajes',
    type: 'MENSAJE',
    title: 'Nuevo mensaje',
    text: 'Tienes un mensaje nuevo.',
    reservationId: 37,
    eventKey: 'mensaje:42',
  }), /no coinciden/);
  assert.equal(called, false);
});
