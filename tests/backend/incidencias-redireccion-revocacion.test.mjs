import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryApp } from './support-test-helpers.mjs';
const { migrateIncidencias } = await import('../../backend/dist/modules/incidencias/incidencias.migration.js');
const { incidenciasService } = await import('../../backend/dist/modules/incidencias/incidencias.service.js');

test('incidencias: redirección y regla estricta de revocación (límite 2 días)', { timeout: 30000 }, async (t) => {
  const { db, users } = await memoryApp(t, { migrations: [migrateIncidencias] });

  // Crear una incidencia inicial enviada por PADRE a ADMINISTRACION
  const insertRes = await db.query(
    `INSERT INTO public.incidencias (
       id_usuario, tipo, solicitud, solicitante, rol_solicitante,
       responsable, area_destino, prioridad, estado, fecha_creacion, fecha_actualizacion
     ) VALUES (
       $1, 'Cuentas y Permisos', 'Deseo consultar sobre mi cuenta', 'Padre Test', 'PADRE',
       'admin', 'ADMINISTRACION', 2, 'RECIBIDA', NOW(), NOW()
     ) RETURNING id_incidencia;`,
    [users.PADRE.id_usuario]
  );
  const idIncidencia = insertRes.rows[0].id_incidencia;

  const adminUser = { id_usuario: users.ADMIN.id_usuario, rol: 'ADMIN', roles: ['ADMIN'] };
  const padreUser = { id_usuario: users.PADRE.id_usuario, rol: 'PADRE', roles: ['PADRE'] };

  // 1. Un usuario PADRE no puede redirigir
  await assert.rejects(
    () => incidenciasService.redirigir(idIncidencia, 'SOPORTE_TECNICO', null, padreUser),
    (err) => err.status === 403
  );

  // 2. ADMIN puede redirigir a SOPORTE_TECNICO
  const redirSoporte = await incidenciasService.redirigir(idIncidencia, 'SOPORTE_TECNICO', null, adminUser);
  assert.equal(redirSoporte.area_destino, 'SOPORTE_TECNICO');
  assert.equal(redirSoporte.responsable, 'soporte_tecnico');

  // Verificar en base de datos
  const dbRow1 = (await db.query('SELECT area_destino, responsable FROM public.incidencias WHERE id_incidencia = $1', [idIncidencia])).rows[0];
  assert.equal(dbRow1.area_destino, 'SOPORTE_TECNICO');
  assert.equal(dbRow1.responsable, 'soporte_tecnico');

  // 3. ADMIN puede redirigir a TERAPEUTA
  const terapeutaRow = (await db.query('SELECT id_terapeuta FROM terapeutas LIMIT 1')).rows[0];
  const idTerapeuta = terapeutaRow ? terapeutaRow.id_terapeuta : 1;
  const redirTerapeuta = await incidenciasService.redirigir(idIncidencia, 'TERAPEUTA', idTerapeuta, adminUser);
  assert.equal(redirTerapeuta.area_destino, 'TERAPEUTA');
  assert.equal(redirTerapeuta.responsable, 'terapeuta');
  assert.equal(redirTerapeuta.id_terapeuta, idTerapeuta);

  // 4. Marcar como RESUELTA
  const resuelta = await incidenciasService.cambiarEstado(idIncidencia, 'RESUELTA', adminUser);
  assert.equal(resuelta.estado, 'RESUELTA');

  // 5. Revocar estado dentro de los 2 días -> éxito
  const revocada = await incidenciasService.revocar(idIncidencia, adminUser);
  assert.equal(revocada.estado, 'EN ATENCIÓN');

  // 6. Volver a marcar como RESUELTA pero simular que fue resuelta hace 3 días (72 horas)
  await incidenciasService.cambiarEstado(idIncidencia, 'RESUELTA', adminUser);
  await db.query(
    "UPDATE public.incidencias SET fecha_actualizacion = NOW() - INTERVAL '3 days' WHERE id_incidencia = $1",
    [idIncidencia]
  );

  // 7. Intentar revocar una incidencia resuelta hace 3 días -> debe fallar con 400
  await assert.rejects(
    () => incidenciasService.revocar(idIncidencia, adminUser),
    (err) => err.status === 400 && err.message.includes('2 días')
  );

  // 8. Intentar cambiarEstado directo a 'EN ATENCIÓN' con fecha vencida -> también debe fallar con 400
  await assert.rejects(
    () => incidenciasService.cambiarEstado(idIncidencia, 'EN ATENCIÓN', adminUser),
    (err) => err.status === 400 && err.message.includes('2 días')
  );
});
