import { pool } from '../../../core/database.js';
import type { AuthenticatedUser } from '../../../core/middleware/auth.middleware.js';
import { appendPatientScope, assertPatientAccess, assertReservationAccess } from '../../../core/security/clinical-access.js';
import type { SesionClinicaDTO, ValoracionInicialDTO } from '../dtos/clinica.dto.js';

export class ClinicaService {
  async getSesiones(pacienteId: number | undefined, user: AuthenticatedUser) {
      let sql = `
        SELECT 
          s.id_sesion,
          s.id_reserva as id_cita,
          r.id_paciente,
          r.id_terapeuta,
          s.fecha_hora_inicio_real as fecha,
          s.estado_sesion as estado,
          COALESCE(rs.observaciones_iniciales, '') as resumen,
          rs.objetivos_trabajados
        FROM sesiones s
        JOIN reservas r ON s.id_reserva = r.id_reserva
        LEFT JOIN reportes_sesion rs ON s.id_sesion = rs.id_sesion
        WHERE 1=1
      `;
      const params: any[] = [];
      if (pacienteId) {
        params.push(pacienteId);
        sql += ` AND r.id_paciente = $1`;
      }
      sql += appendPatientScope(params, user, 'r.id_paciente');
      sql += ` ORDER BY s.fecha_hora_inicio_real DESC LIMIT 20;`;

      const res = await pool.query(sql, params);
      return res.rows.map(row => ({
          id_sesion: row.id_sesion,
          id_cita: row.id_cita,
          id_paciente: row.id_paciente,
          id_terapeuta: row.id_terapeuta,
          fecha: row.fecha ? new Date(row.fecha).toISOString().split('T')[0] : null,
          hora_inicio: row.fecha ? new Date(row.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          estado: row.estado || 'COMPLETADA',
          resumen: row.resumen,
          objetivos: typeof row.objetivos_trabajados === 'string' && row.objetivos_trabajados
            ? row.objetivos_trabajados.split(/\r?\n|,/).map((item: string) => item.trim()).filter(Boolean)
            : [],
        }));
  }

  async crearSesion(dto: SesionClinicaDTO, user: AuthenticatedUser) {
    if (user.rol !== 'ADMIN' && user.rol !== 'TERAPEUTA') {
      throw Object.assign(new Error('Solo el terapeuta asignado puede registrar una sesión.'), { status: 403 });
    }
    await assertReservationAccess(user, dto.id_cita);
    try {
      const res = await pool.query(
        `INSERT INTO sesiones (id_reserva, fecha_hora_inicio_real, estado_sesion, asistencia)
         VALUES ($1, NOW(), 'EN_PROGRESO', true)
         RETURNING id_sesion;`,
        [dto.id_cita]
      );
      if (!res.rows[0]?.id_sesion) throw new Error('No se pudo registrar la sesión.');
      const reservation = await pool.query(
        'SELECT id_paciente, id_terapeuta FROM reservas WHERE id_reserva = $1 LIMIT 1;',
        [dto.id_cita],
      );
      return {
        id_sesion: res.rows[0].id_sesion,
        id_cita: dto.id_cita,
        id_paciente: reservation.rows[0]?.id_paciente,
        id_terapeuta: reservation.rows[0]?.id_terapeuta,
        fecha: dto.fecha,
        hora_inicio: dto.hora_inicio,
        objetivos: dto.objetivos ?? [],
        resumen: dto.resumen ?? '',
        estado: 'EN_PROGRESO',
        creado_en: new Date().toISOString(),
      };
    } catch (err) {
      throw err;
    }
  }

  async crearValoracion(dto: ValoracionInicialDTO, user: AuthenticatedUser) {
    await assertPatientAccess(user, dto.id_paciente);
    if (user.rol !== 'ADMIN' && user.rol !== 'TERAPEUTA') {
      throw Object.assign(new Error('Solo administración o el terapeuta pueden registrar una valoración clínica inicial.'), { status: 403 });
    }
    return {
      id_valoracion: Date.now(),
      ...dto,
      creado_en: new Date().toISOString(),
    };
  }
}

export const clinicaService = new ClinicaService();
