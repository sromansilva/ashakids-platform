import { describe, it, test } from 'node:test';
import assert from 'node:assert/strict';

// Importar servicios (compatible con compilación en dist o ts directo)
let auditModule: any;
try {
  auditModule = await import('../../backend/dist/core/audit/audit.service.js');
} catch {
  auditModule = await import('../../backend/src/core/audit/audit.service.ts');
}
const { registrarAuditoria, sanitizeAuditData } = auditModule;

let solicitudesModule: any;
try {
  solicitudesModule = await import('../../backend/dist/modules/whatsapp/solicitudes.service.js');
} catch {
  solicitudesModule = await import('../../backend/src/modules/whatsapp/solicitudes.service.ts');
}
const { aprobarSolicitud, rechazarSolicitud } = solicitudesModule;

let adminServiceModule: any;
try {
  adminServiceModule = await import('../../backend/dist/modules/admin/services/admin.service.js');
} catch {
  adminServiceModule = await import('../../backend/src/modules/admin/services/admin.service.ts');
}
const { adminService } = adminServiceModule;

let dbModule: any;
try {
  dbModule = await import('../../backend/dist/core/database.js');
} catch {
  dbModule = await import('../../backend/src/core/database.ts');
}
const { pool } = dbModule;

let gmailModule: any;
try {
  gmailModule = await import('../../backend/dist/infrastructure/mailer/gmail.service.js');
} catch {
  gmailModule = await import('../../backend/src/infrastructure/mailer/gmail.service.ts');
}
const { GmailService } = gmailModule;

let waModule: any;
try {
  waModule = await import('../../backend/dist/infrastructure/whatsapp/whatsapp.service.js');
} catch {
  waModule = await import('../../backend/src/infrastructure/whatsapp/whatsapp.service.ts');
}
const { WhatsAppService } = waModule;

describe('Servicio de Auditoría - Sanitización y reglas de contrato', () => {
  it('sanitizeAuditData elimina DNI, passwords, hashes, tokens y enlaces de activación', () => {
    const input = {
      id_usuario: 15,
      codigo_usuario: 'p12345',
      dni: '87654321',
      tutor_dni: '12345678',
      password: 'password123',
      password_hash: '$argon2id$v=19$...',
      token: 'jwt.sample.token',
      activation_url: 'https://ashakids.pe/crear-contrasena?token=abcdef',
      rawUrl: 'https://ashakids.pe/crear-contrasena?token=secret123',
      estado: 'ACTIVO',
      roles: ['PADRE'],
      nested: {
        dni: '44556677',
        clave_secreta: 'secret',
        token_auth: 'xyz',
        descripcion: 'Correcto',
      },
    };

    const sanitized = sanitizeAuditData(input) as Record<string, any>;
    assert.equal(sanitized.id_usuario, 15);
    assert.equal(sanitized.codigo_usuario, 'p12345');
    assert.equal(sanitized.estado, 'ACTIVO');
    assert.deepEqual(sanitized.roles, ['PADRE']);
    assert.equal(sanitized.dni, undefined);
    assert.equal(sanitized.tutor_dni, undefined);
    assert.equal(sanitized.password, undefined);
    assert.equal(sanitized.password_hash, undefined);
    assert.equal(sanitized.token, undefined);
    assert.equal(sanitized.activation_url, undefined);
    assert.equal(sanitized.rawUrl, undefined);
    assert.equal(sanitized.nested?.dni, undefined);
    assert.equal(sanitized.nested?.clave_secreta, undefined);
    assert.equal(sanitized.nested?.token_auth, undefined);
    assert.equal(sanitized.nested?.descripcion, 'Correcto');
  });

  it('sanitizeAuditData reemplaza el texto del motivo por «motivo registrado»', () => {
    const input = {
      id_solicitud: 10,
      estado: 'RECHAZADA',
      motivo: 'El padre indicó datos inconsistentes con RENIEC DNI 12345678',
      motivo_rechazo: 'Texto con datos confidenciales',
    };

    const sanitized = sanitizeAuditData(input) as Record<string, any>;
    assert.equal(sanitized.id_solicitud, 10);
    assert.equal(sanitized.estado, 'RECHAZADA');
    assert.equal(sanitized.motivo, 'motivo registrado');
    assert.equal(sanitized.motivo_rechazo, 'motivo registrado');
    assert.ok(!JSON.stringify(sanitized).includes('RENIEC'));
    assert.ok(!JSON.stringify(sanitized).includes('12345678'));
  });

  it('registrarAuditoria propaga errores si se ejecuta dentro de transacción (con client)', async () => {
    const mockClient = {
      release: () => {},
      query: async () => {
        const err: any = new Error('DB Error in transaction');
        err.code = '23505';
        throw err;
      },
    };

    await assert.rejects(
      async () => {
        await registrarAuditoria(
          mockClient as any,
          {
            idUsuarioActor: 1,
            tabla: 'usuarios',
            entidad: '10',
            accion: 'CREAR_PADRE',
            detalle: { id_usuario: 10 },
          },
          true
        );
      },
      (err: any) => err.code === '23505'
    );
  });

  it('registrarAuditoria NO tumba la operación principal si falla fuera de transacción (con pool)', async () => {
    const mockPool = {
      totalCount: 5,
      query: async () => {
        const err: any = new Error('Connection timeout');
        err.code = 'ETIMEDOUT';
        throw err;
      },
    };

    const res = await registrarAuditoria(
      mockPool as any,
      {
        idUsuarioActor: 1,
        tabla: 'usuarios',
        entidad: '10',
        accion: 'ACTIVAR',
        detalle: { id_usuario: 10 },
      },
      false
    );

    assert.equal(res, null);
  });
});

describe('Auditoría en operaciones del Admin con pool simulado', () => {
  it('aprobarSolicitud genera fila en auditoria_cambios con actor correcto y sin DNI, motivo ni token', async () => {
    const auditInserts: any[] = [];
    const origQuery = pool.query;

    const mockAdminId = 88;
    const mockSolicitudId = 45;
    const mockUserId = 120;

    // Simular consultas
    (pool as any).query = async (sql: string, params: any[]) => {
      if (sql.includes('UPDATE public.solicitudes_acceso_familia SET estado = \'PROCESANDO\'')) {
        return {
          rowCount: 1,
          rows: [
            {
              id_solicitud: mockSolicitudId,
              telefono: '51999999999',
              nombres: 'María',
              apellidos: 'López',
              dni: '44332211',
              email: 'maria@ashakids.test',
              estado: 'PROCESANDO',
              consentimiento_en: new Date().toISOString(),
              ultimo_mensaje_en: new Date().toISOString(),
              creado_en: new Date().toISOString(),
            },
          ],
        };
      }
      if (sql.includes('UPDATE public.solicitudes_acceso_familia') && sql.includes('SET estado = \'APROBADA\'')) {
        return {
          rowCount: 1,
          rows: [
            {
              id_solicitud: mockSolicitudId,
              telefono: '51999999999',
              nombres: 'María',
              apellidos: 'López',
              dni: '44332211',
              email: 'maria@ashakids.test',
              estado: 'APROBADA',
              id_usuario_creado: mockUserId,
              revisado_por: mockAdminId,
              revisado_en: new Date().toISOString(),
              correo_estado: 'ENVIADO',
              consentimiento_en: new Date().toISOString(),
              ultimo_mensaje_en: new Date().toISOString(),
              creado_en: new Date().toISOString(),
            },
          ],
        };
      }
      if (sql.includes('UPDATE public.solicitudes_acceso_familia SET aviso_whatsapp_estado')) {
        return {
          rowCount: 1,
          rows: [
            {
              id_solicitud: mockSolicitudId,
              telefono: '51999999999',
              nombres: 'María',
              apellidos: 'López',
              dni: '44332211',
              email: 'maria@ashakids.test',
              estado: 'APROBADA',
              id_usuario_creado: mockUserId,
              revisado_por: mockAdminId,
              aviso_whatsapp_estado: 'OMITIDO',
              consentimiento_en: new Date().toISOString(),
              ultimo_mensaje_en: new Date().toISOString(),
              creado_en: new Date().toISOString(),
            },
          ],
        };
      }
      if (sql.includes('INSERT INTO public.auditoria_cambios')) {
        auditInserts.push({ sql, params });
        return { rowCount: 1, rows: [{ id_auditoria: 501 }] };
      }
      return { rowCount: 0, rows: [] };
    };

    const origCrearPadre = adminService.crearPadre;
    adminService.crearPadre = async () => ({
      message: 'Cuenta familiar creada con éxito',
      cuenta: { id_usuario: mockUserId, codigo_usuario: 'p54321', rol: 'PADRE' },
      correo_bienvenida: 'ENVIADO',
    }) as any;

    try {
      const res = await aprobarSolicitud(mockSolicitudId, mockAdminId);
      assert.ok(res);

      assert.ok(auditInserts.length >= 1, 'Debe haberse insertado al menos un registro de auditoría');
      const auditRecord = auditInserts.find(a => a.params[2] === String(mockSolicitudId));
      assert.ok(auditRecord, 'Debe haber un registro con entidad = id_solicitud');

      const [actorId, tabla, entidad, accion, _anteriores, detalleJson] = auditRecord.params;
      assert.equal(actorId, mockAdminId, 'El actor debe coincidir con el admin autenticado');
      assert.equal(tabla, 'solicitudes_acceso_familia');
      assert.equal(entidad, String(mockSolicitudId));
      assert.equal(accion, 'APROBAR');

      const detalle = JSON.parse(detalleJson);
      assert.equal(detalle.id_solicitud, mockSolicitudId);
      assert.equal(detalle.id_usuario_creado, mockUserId);
      assert.equal(detalle.estado, 'APROBADA');
      assert.equal(detalle.dni, undefined);
      assert.equal(detalle.motivo, undefined);
      assert.equal(detalle.token, undefined);
      assert.ok(!detalleJson.includes('44332211'), 'El detalle nunca debe incluir DNI');
    } finally {
      (pool as any).query = origQuery;
      adminService.crearPadre = origCrearPadre;
    }
  });

  it('rechazarSolicitud genera fila en auditoria_cambios con actor correcto y sin DNI, motivo ni token', async () => {
    const auditInserts: any[] = [];
    const origQuery = pool.query;

    const mockAdminId = 99;
    const mockSolicitudId = 62;
    const rawMotivo = 'Documento no válido DNI 88776655 token 12345';

    (pool as any).query = async (sql: string, params: any[]) => {
      if (sql.includes('UPDATE public.solicitudes_acceso_familia') && sql.includes('SET estado = \'RECHAZADA\'')) {
        return {
          rowCount: 1,
          rows: [
            {
              id_solicitud: mockSolicitudId,
              telefono: '51999888777',
              nombres: 'Carlos',
              apellidos: 'Ruiz',
              dni: '88776655',
              email: 'carlos@ashakids.test',
              estado: 'RECHAZADA',
              revisado_por: mockAdminId,
              revisado_en: new Date().toISOString(),
              motivo_rechazo: rawMotivo,
              consentimiento_en: new Date().toISOString(),
              ultimo_mensaje_en: new Date(Date.now() - 3600000).toISOString(),
              creado_en: new Date().toISOString(),
            },
          ],
        };
      }
      if (sql.includes('UPDATE public.solicitudes_acceso_familia SET aviso_whatsapp_estado = $2, correo_estado = $3')) {
        return {
          rowCount: 1,
          rows: [
            {
              id_solicitud: mockSolicitudId,
              telefono: '51999888777',
              nombres: 'Carlos',
              apellidos: 'Ruiz',
              dni: '88776655',
              email: 'carlos@ashakids.test',
              estado: 'RECHAZADA',
              revisado_por: mockAdminId,
              aviso_whatsapp_estado: 'ENVIADO',
              correo_estado: 'ENVIADO',
              consentimiento_en: new Date().toISOString(),
              ultimo_mensaje_en: new Date().toISOString(),
              creado_en: new Date().toISOString(),
            },
          ],
        };
      }
      if (sql.includes('INSERT INTO public.auditoria_cambios')) {
        auditInserts.push({ sql, params });
        return { rowCount: 1, rows: [{ id_auditoria: 502 }] };
      }
      return { rowCount: 0, rows: [] };
    };

    const origSendRejection = GmailService.sendAccessRequestRejectionEmail;
    GmailService.sendAccessRequestRejectionEmail = async () => ({ status: 'ENVIADO' }) as any;
    const origSendText = WhatsAppService.sendText;
    WhatsAppService.sendText = async () => ({ status: 'ENVIADO' }) as any;

    try {
      const res = await rechazarSolicitud(mockSolicitudId, mockAdminId, rawMotivo);
      assert.ok(res);

      assert.equal(auditInserts.length, 1);
      const [actorId, tabla, entidad, accion, _anteriores, detalleJson] = auditInserts[0].params;
      assert.equal(actorId, mockAdminId, 'El actor debe coincidir con el admin autenticado');
      assert.equal(tabla, 'solicitudes_acceso_familia');
      assert.equal(entidad, String(mockSolicitudId));
      assert.equal(accion, 'RECHAZAR');

      const detalle = JSON.parse(detalleJson);
      assert.equal(detalle.id_solicitud, mockSolicitudId);
      assert.equal(detalle.estado, 'RECHAZADA');
      assert.equal(detalle.motivo, 'motivo registrado', 'El motivo debe ser el placeholder seguro');
      assert.equal(detalle.dni, undefined);
      assert.equal(detalle.token, undefined);
      assert.ok(!detalleJson.includes('88776655'), 'El detalle nunca debe incluir DNI');
      assert.ok(!detalleJson.includes('12345'), 'El detalle nunca debe incluir token ni texto original');
    } finally {
      (pool as any).query = origQuery;
      GmailService.sendAccessRequestRejectionEmail = origSendRejection;
      WhatsAppService.sendText = origSendText;
    }
  });

  it('eliminarCuenta genera fila en auditoria_cambios con actor correcto y sin DNI, motivo ni token', async () => {
    const auditInserts: any[] = [];
    const origConnect = pool.connect;

    const mockAdminId = 77;
    const mockTargetUserId = 205;

    const mockClient = {
      release: () => {},
      query: async (sql: string, params: any[]) => {
        if (sql === 'BEGIN;' || sql === 'COMMIT;' || sql === 'ROLLBACK;') {
          return { rowCount: 0, rows: [] };
        }
        if (sql.includes('SELECT id_usuario, codigo_usuario, email, nombres, apellidos FROM usuarios WHERE id_usuario = $1')) {
          return {
            rowCount: 1,
            rows: [{ id_usuario: mockTargetUserId, codigo_usuario: 'p99999', email: 'del@ashakids.test', nombres: 'Elim', apellidos: 'Target' }],
          };
        }
        if (sql.includes('SELECT id_tutor FROM tutores WHERE id_usuario = $1')) {
          return { rowCount: 0, rows: [] };
        }
        if (sql.includes('SELECT id_terapeuta FROM terapeutas WHERE id_usuario = $1')) {
          return { rowCount: 0, rows: [] };
        }
        if (sql.includes('UPDATE solicitudes_acceso_familia')) {
          return { rowCount: 0, rows: [] };
        }
        if (sql.includes('DELETE FROM usuarios WHERE id_usuario = $1')) {
          return { rowCount: 1, rows: [] };
        }
        if (sql.includes('INSERT INTO public.auditoria_cambios')) {
          auditInserts.push({ sql, params });
          return { rowCount: 1, rows: [{ id_auditoria: 503 }] };
        }
        return { rowCount: 0, rows: [] };
      },
    };

    (pool as any).connect = async () => mockClient;

    try {
      const res = await adminService.eliminarCuenta(mockTargetUserId, mockAdminId);
      assert.ok(res);

      assert.equal(auditInserts.length, 1);
      const [actorId, tabla, entidad, accion, _anteriores, detalleJson] = auditInserts[0].params;
      assert.equal(actorId, mockAdminId, 'El actor debe coincidir con el admin que eliminó la cuenta');
      assert.equal(tabla, 'usuarios');
      assert.equal(entidad, String(mockTargetUserId));
      assert.equal(accion, 'ELIMINAR');

      const detalle = JSON.parse(detalleJson);
      assert.equal(detalle.id_usuario, mockTargetUserId);
      assert.equal(detalle.eliminado, true);
      assert.equal(detalle.dni, undefined);
      assert.equal(detalle.motivo, undefined);
      assert.equal(detalle.token, undefined);
      assert.ok(!detalleJson.includes('dni'), 'El detalle no contiene DNI');
    } finally {
      (pool as any).connect = origConnect;
    }
  });

  it('cambiarRol valida roles permitidos y rechaza que un admin se retire el rol ADMIN', async () => {
    // Intento de auto-degradación de un admin
    await assert.rejects(
      async () => {
        await adminService.cambiarRol(50, 'PADRE', 50);
      },
      (err: any) => err.status === 403 && /no puede retirarse a sí mismo el rol ADMIN/i.test(err.message)
    );

    // Intento con rol inválido
    await assert.rejects(
      async () => {
        await adminService.cambiarRol(50, 'SUPERUSER', 1);
      },
      (err: any) => err.status === 400 && /Rol inválido/i.test(err.message)
    );
  });
});

// Prueba de base de datos real (solo se ejecuta si ASHAKIDS_RUN_DB_E2E=1 y base aislada)
const isolatedDb =
  process.env.ASHAKIDS_RUN_DB_E2E === '1' &&
  process.env.ENVIRONMENT === 'test' &&
  ['localhost', '127.0.0.1'].includes(process.env.DB_HOST ?? '') &&
  /_(test|e2e)$/.test(process.env.DB_NAME ?? '');
const skipDb = isolatedDb
  ? false
  : 'requiere ASHAKIDS_RUN_DB_E2E=1, ENVIRONMENT=test, DB local y DB_NAME terminado en _test o _e2e';

test('Auditoría - inserción e integridad real en base de datos PostgreSQL', { skip: skipDb }, async (t) => {
  t.after(async () => {
    await pool.query("DELETE FROM public.auditoria_cambios WHERE nombre_tabla = 'test_auditoria'");
  });

  const idAudit = await registrarAuditoria(
    pool,
    {
      idUsuarioActor: null,
      tabla: 'test_auditoria',
      entidad: '9999',
      accion: 'CREAR',
      detalle: { estado: 'OK', test: true },
    },
    false
  );

  assert.ok(idAudit, 'Debe haber retornado el id generado de auditoria');
  const res = await pool.query('SELECT * FROM public.auditoria_cambios WHERE id_auditoria = $1', [idAudit]);
  assert.equal(res.rowCount, 1);
  assert.equal(res.rows[0].nombre_tabla, 'test_auditoria');
  assert.equal(res.rows[0].accion, 'CREAR');
});
