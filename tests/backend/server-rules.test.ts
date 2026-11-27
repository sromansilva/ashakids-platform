import { test } from 'node:test';
import assert from 'node:assert/strict';
const { pool } = await import('../../backend/dist/core/database.js');
const { citasService } = await import('../../backend/dist/modules/citas/citas.service.js');
const { pacientesService } = await import('../../backend/dist/modules/pacientes/services/pacientes.service.js');
const { sesionesService } = await import('../../backend/dist/modules/sesiones/sesiones.service.js');
const { PHONEME_NAMING_TARGETS } = await import('../../backend/dist/modules/juegos/juegos.service.js');
const { isVirtualModality } = await import('../../backend/dist/modules/citas/modalidad.js');
const { incidenciasService, assertReaperturaPermitida } = await import('../../backend/dist/modules/incidencias/incidencias.service.js');
const admin = { id_usuario: 1, rol: 'ADMIN', roles: ['ADMIN'], nombres: 'Test', apellidos: 'Admin', email: 'test@example.invalid' };
const conflict = (error: any) => error.status === 409;

test('terapia requires the existing patient journey criterion for admin', async (t) => {
  t.mock.method(pool, 'query', async () => ({ rows: [{}] }));
  t.mock.method(pacientesService, 'recorrido', async () => ({ introduccion_atendida: false, introduccion_pendiente: null, terapia_habilitada: false }));
  await assert.rejects(citasService.crear({ id_paciente: 1, id_terapeuta: 1, tipo_cita: 'TERAPIA' }, admin), conflict);
});
test('patient overlap rejects even in immediate mode inside the transaction', async (t) => {
  t.mock.method(pool, 'query', async () => ({ rows: [{}] }));
  const statements: string[] = [];
  t.mock.method(pool, 'connect', async () => ({ release() {}, async query(sql: string) { statements.push(sql); return { rows: sql.includes('id_paciente = $1 AND estado_reserva') ? [{}] : [] }; } }));
  await assert.rejects(citasService.crear({ id_paciente: 1, id_terapeuta: 1, tipo_cita: 'INTRODUCTORIA', modo_prueba: true }, admin), conflict);
  assert.ok(statements.some(s => s.includes('id_paciente = $1') && s.includes('FOR UPDATE')));
  assert.ok(statements.includes('ROLLBACK;'));
});
test('signing rejects a session in progress', async (t) => {
  t.mock.method(pool, 'query', async (sql: string) => ({ rows: sql.startsWith('SELECT estado_sesion') ? [{ estado_sesion: 'EN_CURSO', asistencia: null }] : [] }));
  await assert.rejects(sesionesService.firmarReporte(1, admin), conflict);
});
test('family capture rejects an in-person session', async (t) => {
  t.mock.method(pool, 'query', async () => ({ rows: [{ estado_sesion: 'EN_CURSO', id_paciente: 1, modalidad: 'PRESENCIAL' }] }));
  const target = PHONEME_NAMING_TARGETS[0];
  await assert.rejects(sesionesService.solicitarCapturaFamiliar(1, admin, { captura_id: 'test', palabra_objetivo: target.word, fonema_objetivo: target.fonema_objetivo }), conflict);
});
test('virtual modality accepts legacy ONLINE and current VIRTUAL only', () => {
  assert.equal(isVirtualModality('ONLINE'), true);
  assert.equal(isVirtualModality('VIRTUAL'), true);
  assert.equal(isVirtualModality('PRESENCIAL'), false);
});
test('reopening a resolved incident observes the 48-hour limit', () => {
  assert.throws(() => assertReaperturaPermitida({ estado: 'RESUELTA', fecha_actualizacion: new Date(Date.now() - 49 * 3600000), fecha_creacion: new Date() }, 'RECIBIDA'), { status: 400 });
  assert.doesNotThrow(() => assertReaperturaPermitida({ estado: 'RESUELTA', fecha_actualizacion: new Date(), fecha_creacion: new Date() }, 'RECIBIDA'));
});
test('an unrelated therapist cannot read an unassigned incident', async (t) => {
  t.mock.method(pool, 'query', async (sql: string) => ({ rows: sql.includes('FROM public.incidencias') ? [{ id_usuario: 9, area_destino: 'TERAPEUTA', id_terapeuta: null }] : [{ id_terapeuta: 2 }] }));
  await assert.rejects(incidenciasService.obtenerPorId(1, { ...admin, id_usuario: 2, rol: 'TERAPEUTA', roles: ['TERAPEUTA'] }), { status: 403 });
});
