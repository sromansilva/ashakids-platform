import type { Request } from 'express';
import type { AuthenticatedUser } from '../middleware/auth.middleware.js';
import { pool } from '../database.js';

type ScopedUser = Pick<AuthenticatedUser, 'id_usuario' | 'rol'>;

function fail(message: string, status = 404): Error {
  return Object.assign(new Error(message), { status });
}

export function requireUser(req: Request): AuthenticatedUser {
  if (!req.user) throw fail('Acceso no autorizado.', 401);
  return req.user;
}

/** Appends a patient visibility constraint to a query using the caller's DB parameter array. */
export function appendPatientScope(
  params: unknown[],
  user: ScopedUser,
  patientExpression: string,
): string {
  if (user.rol === 'ADMIN') return '';
  params.push(user.id_usuario);
  const userParam = `$${params.length}`;

  if (user.rol === 'PADRE') {
    return ` AND EXISTS (
      SELECT 1 FROM pacientes scope_p
      JOIN tutores scope_tu ON scope_tu.id_tutor = scope_p.id_tutor
      WHERE scope_p.id_paciente = ${patientExpression}
        AND scope_tu.id_usuario = ${userParam}
    )`;
  }

  return ` AND EXISTS (
    SELECT 1 FROM terapeutas scope_ter
    WHERE scope_ter.id_usuario = ${userParam}
      AND (
        EXISTS (
          SELECT 1 FROM reservas scope_r
          WHERE scope_r.id_paciente = ${patientExpression}
            AND scope_r.id_terapeuta = scope_ter.id_terapeuta
            AND UPPER(COALESCE(scope_r.estado_reserva, '')) <> 'CANCELADA'
        )
        OR EXISTS (
          SELECT 1 FROM sesiones scope_s
          JOIN reservas scope_sr ON scope_sr.id_reserva = scope_s.id_reserva
          WHERE scope_sr.id_paciente = ${patientExpression}
            AND scope_sr.id_terapeuta = scope_ter.id_terapeuta
        )
        OR EXISTS (
          SELECT 1 FROM tratamientos scope_tr
          JOIN expedientes scope_e ON scope_e.id_expediente = scope_tr.id_expediente
          WHERE scope_e.id_paciente = ${patientExpression}
            AND scope_tr.id_terapeuta = scope_ter.id_terapeuta
            AND UPPER(COALESCE(scope_tr.estado_tratamiento, '')) = 'ACTIVO'
        )
      )
  )`;
}

/** Appends appointment visibility; appointment ownership never follows client-supplied query IDs. */
export function appendReservationScope(
  params: unknown[],
  user: ScopedUser,
  reservationAlias = 'r',
): string {
  if (user.rol === 'ADMIN') return '';
  params.push(user.id_usuario);
  const userParam = `$${params.length}`;

  if (user.rol === 'PADRE') {
    return ` AND EXISTS (
      SELECT 1 FROM pacientes scope_p
      JOIN tutores scope_tu ON scope_tu.id_tutor = scope_p.id_tutor
      WHERE scope_p.id_paciente = ${reservationAlias}.id_paciente
        AND scope_tu.id_usuario = ${userParam}
    )`;
  }

  return ` AND EXISTS (
    SELECT 1 FROM terapeutas scope_ter
    WHERE scope_ter.id_usuario = ${userParam}
      AND scope_ter.id_terapeuta = ${reservationAlias}.id_terapeuta
  )`;
}

export async function getTherapistId(userId: number): Promise<number | null> {
  const result = await pool.query(
    `SELECT t.id_terapeuta
     FROM terapeutas t
     JOIN usuarios u ON u.id_usuario = t.id_usuario
     JOIN usuario_roles ur ON ur.id_usuario = u.id_usuario AND ur.activo = true
     JOIN roles role ON role.id_rol = ur.id_rol AND role.nombre_rol = 'TERAPEUTA'
     WHERE t.id_usuario = $1 AND u.activo = true
     LIMIT 1;`,
    [userId],
  );
  return result.rows[0] ? Number(result.rows[0].id_terapeuta) : null;
}

export async function isActiveTherapist(therapistId: number): Promise<boolean> {
  if (!Number.isInteger(therapistId) || therapistId <= 0) return false;
  const result = await pool.query(
    `SELECT 1
     FROM terapeutas t
     JOIN usuarios u ON u.id_usuario = t.id_usuario AND u.activo = true
     LEFT JOIN usuario_roles ur ON ur.id_usuario = u.id_usuario AND ur.activo = true
     LEFT JOIN roles role ON role.id_rol = ur.id_rol
     WHERE t.id_terapeuta = $1
       AND (role.nombre_rol = 'TERAPEUTA' OR u.codigo_usuario LIKE 't%')
     LIMIT 1;`,
    [therapistId],
  );
  return result.rows.length > 0;
}

export async function canAccessPatient(user: AuthenticatedUser, patientId: number): Promise<boolean> {
  if (!Number.isInteger(patientId) || patientId <= 0) return false;
  if (user.rol === 'ADMIN') {
    const result = await pool.query('SELECT 1 FROM pacientes WHERE id_paciente = $1 LIMIT 1;', [patientId]);
    return result.rows.length > 0;
  }
  const params: unknown[] = [patientId];
  const scope = appendPatientScope(params, user, 'p.id_paciente');
  const result = await pool.query(
    `SELECT 1 FROM pacientes p WHERE p.id_paciente = $1${scope} LIMIT 1;`,
    params,
  );
  return result.rows.length > 0;
}

export async function assertPatientAccess(user: AuthenticatedUser, patientId: number): Promise<void> {
  if (!(await canAccessPatient(user, patientId))) throw fail('Paciente no encontrado.');
}

export async function assertPatientOwner(user: AuthenticatedUser, patientId: number): Promise<void> {
  if (!Number.isInteger(patientId) || patientId <= 0) throw fail('Paciente no encontrado.');
  if (user.rol === 'ADMIN') {
    const exists = await pool.query('SELECT 1 FROM pacientes WHERE id_paciente = $1 LIMIT 1;', [patientId]);
    if (!exists.rows.length) throw fail('Paciente no encontrado.');
    return;
  }
  if (user.rol !== 'PADRE') throw fail('Solo el padre o administración pueden reservar para este paciente.', 403);
  const result = await pool.query(
    `SELECT 1 FROM pacientes p
     JOIN tutores tu ON tu.id_tutor = p.id_tutor
     WHERE p.id_paciente = $1 AND tu.id_usuario = $2
     LIMIT 1;`,
    [patientId, user.id_usuario],
  );
  if (!result.rows.length) throw fail('Paciente no encontrado.');
}

export async function assertReservationAccess(user: AuthenticatedUser, reservationId: number): Promise<void> {
  if (!Number.isInteger(reservationId) || reservationId <= 0) throw fail('Cita no encontrada.');
  const params: unknown[] = [reservationId];
  const scope = appendReservationScope(params, user, 'r');
  const result = await pool.query(
    `SELECT 1 FROM reservas r WHERE r.id_reserva = $1${scope} LIMIT 1;`,
    params,
  );
  if (!result.rows.length) throw fail('Cita no encontrada.');
}

export async function assertSessionReadAccess(user: AuthenticatedUser, sessionId: number): Promise<void> {
  if (!Number.isInteger(sessionId) || sessionId <= 0) throw fail('Sesión no encontrada.');
  const params: unknown[] = [sessionId];
  const scope = appendPatientScope(params, user, 'r.id_paciente');
  const result = await pool.query(
    `SELECT 1 FROM sesiones s
     JOIN reservas r ON r.id_reserva = s.id_reserva
     WHERE s.id_sesion = $1${scope}
     LIMIT 1;`,
    params,
  );
  if (!result.rows.length) throw fail('Sesión no encontrada.');
}

export async function canEditSession(user: AuthenticatedUser, sessionId: number): Promise<boolean> {
  if (!Number.isInteger(sessionId) || sessionId <= 0) return false;
  if (user.rol === 'ADMIN') return true;
  if (user.rol !== 'TERAPEUTA') return false;
  const result = await pool.query(
    `SELECT 1 FROM sesiones s
     JOIN reservas r ON r.id_reserva = s.id_reserva
     JOIN terapeutas t ON t.id_terapeuta = r.id_terapeuta
     WHERE s.id_sesion = $1 AND t.id_usuario = $2
     LIMIT 1;`,
    [sessionId, user.id_usuario],
  );
  return result.rows.length > 0;
}

export async function assertSessionEditAccess(user: AuthenticatedUser, sessionId: number): Promise<void> {
  if (user.rol === 'ADMIN') return;
  if (user.rol !== 'TERAPEUTA') throw fail('Solo el terapeuta asignado puede modificar esta sesión.', 403);
  if (!(await canEditSession(user, sessionId))) throw fail('Sesión no encontrada.');
}

export async function hasConsentForAI(
  patientId: number,
  tipo = 'EVALUACION_FONOLOGICA_IA',
): Promise<boolean> {
  if (!Number.isInteger(patientId) || patientId <= 0) return false;
  try {
    const result = await pool.query(
      `SELECT estado FROM public.consentimientos_ia
       WHERE id_paciente = $1 AND tipo_consentimiento = $2
       ORDER BY fecha_concesion DESC, id_consentimiento DESC
       LIMIT 1;`,
      [patientId, tipo],
    );
    return result.rows[0]?.estado === 'CONCEDIDO';
  } catch {
    return false;
  }
}
export async function getSessionPatientId(sessionId: number): Promise<number | null> {
  if (!Number.isInteger(sessionId) || sessionId <= 0) return null;
  const result = await pool.query(
    `SELECT r.id_paciente
     FROM sesiones s
     JOIN reservas r ON r.id_reserva = s.id_reserva
     WHERE s.id_sesion = $1
     LIMIT 1;`,
    [sessionId],
  );
  return result.rows[0] ? Number(result.rows[0].id_paciente) : null;
}

export async function assertConsentAccess(
  patientId: number,
  tipo = 'EVALUACION_FONOLOGICA_IA',
): Promise<void> {
  const granted = await hasConsentForAI(patientId, tipo);
  if (!granted) {
    throw Object.assign(
      new Error('CONSENT_REQUIRED: Se requiere la autorización explícita del tutor para evaluación asistida por IA (Ley 29733).'),
      { status: 403, code: 'CONSENT_REQUIRED' },
    );
  }
}
