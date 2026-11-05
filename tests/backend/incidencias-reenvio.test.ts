import { it, after } from 'node:test';
import assert from 'node:assert/strict';
import { pool } from '../../backend/dist/core/database.js';
import { incidenciasService } from '../../backend/dist/modules/incidencias/incidencias.service.js';
import { adminService } from '../../backend/dist/modules/admin/services/admin.service.js';
import { GmailService } from '../../backend/dist/infrastructure/mailer/gmail.service.js';
import { requireRoles } from '../../backend/dist/core/middleware/auth.middleware.js';
import { app } from '../../backend/dist/app.js';

after(async () => { await pool.end(); });
const row = { id_incidencia: 1, ticket: 'INC-1', tipo: 'Funcional', solicitud: 'error', solicitante: 'Prueba', usuario: 'Prueba', rol_solicitante: 'PADRE', rol: 'PADRE', area_destino: 'SOPORTE_TECNICO', prioridad: 2, estado: 'RECIBIDA', fecha_creacion: new Date(), id_usuario: 5 };

it('bandeja consulta ambas areas y devuelve solicitudes de padre y terapeuta con area', async (t) => {
  const query = t.mock.method(pool, 'query', async (sql: string) => {
    assert.match(sql, /SOPORTE_TECNICO/); assert.match(sql, /ADMINISTRACION/); assert.match(sql, /PADRE/); assert.match(sql, /TERAPEUTA/);
    return sql.includes('count(') ? { rows: [{ total: '2' }] } : { rows: [row, { ...row, id_incidencia: 2, rol: 'TERAPEUTA', rol_solicitante: 'TERAPEUTA' }] };
  });
  const result = await incidenciasService.listarRecibidasAdmin();
  assert.equal(query.mock.calls.length, 2); assert.equal(result.total, 2);
  assert.deepEqual(result.items.map((x: any) => [x.rol, x.area_destino]), [['PADRE','SOPORTE_TECNICO'],['TERAPEUTA','SOPORTE_TECNICO']]);
});

it('admin cambia estado de soporte y terapeuta no puede hacerlo', async (t) => {
  const query = t.mock.method(pool, 'query', async (sql: string) => ({ rows: [sql.includes('UPDATE') ? { ...row, estado: 'SOLUCIONADA' } : row] }));
  const admin = { id_usuario: 1, rol: 'ADMIN', roles: ['ADMIN'] };
  assert.equal((await incidenciasService.cambiarEstado(1, 'RESUELTA', admin)).estado, 'RESUELTA');
  assert.ok(query.mock.calls.some((call: any) => call.arguments[0].includes('UPDATE') && call.arguments[1].includes('RESUELTA')));
  await assert.rejects(() => incidenciasService.cambiarEstado(1, 'RESUELTA', { id_usuario: 2, rol: 'TERAPEUTA', roles: ['TERAPEUTA'] }), (err: any) => err.status === 403);
});

it('autorizacion administrativa deniega otros roles', () => {
  for (const role of ['PADRE','TERAPEUTA']) {
    let status = 0; const res: any = { status(n: number) { status = n; return this; }, json() {} };
    requireRoles(['ADMIN'])({ user: { rol: role, roles: [role] } } as any, res, () => assert.fail('acceso indebido'));
    assert.equal(status, 403);
  }
});

it('reenvio devuelve estado real y rechaza cuentas ya activadas', async (t) => {
  const user = { id_usuario: 5, codigo_usuario: 'p00001', email: 'fake@example.com', password_hash: 'hash', nombres: 'A', apellidos: 'B', activo: true, password_change_required: true, nombre_rol: 'PADRE' };
  t.mock.method(pool, 'query', async (sql: string) => ({ rows: sql.startsWith('SELECT') ? [user] : [] }));
  const send = t.mock.method(GmailService, 'sendAccountActivationEmail', async () => ({ status: 'NO_CONFIGURADO' }));
  assert.equal((await adminService.reenviarActivacion(5)).correo_estado, 'NO_CONFIGURADO');
  send.mock.mockImplementation(async () => ({ status: 'ENVIADO' }));
  assert.equal((await adminService.reenviarActivacion(5)).correo_estado, 'ENVIADO');
  send.mock.mockImplementation(async () => { throw new Error('offline'); });
  assert.equal((await adminService.reenviarActivacion(5)).correo_estado, 'PENDIENTE');
  user.password_change_required = false;
  await assert.rejects(() => adminService.reenviarActivacion(5), (err: any) => err.status === 409);
});


it('endpoint de reenvio rechaza roles no administrativos con 403', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('No se pudo abrir servidor de prueba');
    for (const role of ['PADRE', 'TERAPEUTA']) {
      const token = Buffer.from(JSON.stringify({ id_usuario: 999999, email: 'test@example.com', nombres: 'Test', apellidos: 'Test', rol: role, roles: [role] })).toString('base64');
      const res = await fetch(`http://127.0.0.1:${address.port}/api/v1/admin/cuentas/5/reenviar-activacion`, { method: 'POST', headers: { authorization: `Bearer ${token}` } });
      assert.equal(res.status, 403);
    }
  } finally { await new Promise<void>((resolve, reject) => server.close((err: Error | undefined) => err ? reject(err) : resolve())); }
});
