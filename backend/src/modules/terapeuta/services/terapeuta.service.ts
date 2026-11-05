import { pool } from '../../../core/database.js';
import { appointmentLocalDateTime, getNextCalendarDate } from '../../../core/appointment-time.js';

export interface ProfessionalItem {
  id_terapeuta: number;
  nombres: string;
  apellidos: string;
  especialidad: string | null;
  descripcion_profesional: string | null;
  foto_perfil_url: string | null;
}

export interface AvailabilityData {
  turnos: { dia: number; hora: number }[];
  bloqueos: { inicio: string; fin: string }[];
  duracion_minutos?: number;
}

export interface AvailableSlotItem {
  inicio: string;
  fin: string;
  disponible: boolean;
  motivo: string | null;
}

export interface TherapistProfileChanges {
  telefono?: string | null;
  cedula_profesional?: string | null;
}

export class TerapeutaService {
  async syncTherapists(): Promise<void> {
    try {
      await pool.query(`
        INSERT INTO terapeutas (id_usuario, especialidad, anios_experiencia, idiomas, descripcion_profesional)
        SELECT 
          u.id_usuario,
          'Terapia del Lenguaje',
          3,
          'Español',
          'Especialista en fonoaudiología y comunicación infantil.'
        FROM usuarios u
        LEFT JOIN terapeutas t ON u.id_usuario = t.id_usuario
        LEFT JOIN usuario_roles ur ON ur.id_usuario = u.id_usuario AND ur.activo = true
        LEFT JOIN roles r ON r.id_rol = ur.id_rol
        WHERE t.id_terapeuta IS NULL 
          AND u.activo = true
          AND (r.nombre_rol = 'TERAPEUTA' OR u.codigo_usuario LIKE 't%')
        ON CONFLICT (id_usuario) DO NOTHING;
      `);

      await pool.query(`
        INSERT INTO usuario_roles (id_usuario, id_rol, fecha_asignacion, activo)
        SELECT t.id_usuario, r.id_rol, NOW(), true
        FROM terapeutas t
        CROSS JOIN roles r
        WHERE r.nombre_rol = 'TERAPEUTA'
          AND NOT EXISTS (
            SELECT 1 FROM usuario_roles ur 
            WHERE ur.id_usuario = t.id_usuario AND ur.id_rol = r.id_rol
          )
        ON CONFLICT (id_usuario, id_rol) DO NOTHING;
      `);

      await pool.query(`
        INSERT INTO turnos_semanales (id_terapeuta, dia, hora)
        SELECT t.id_terapeuta, d.dia, h.hora
        FROM terapeutas t
        CROSS JOIN (VALUES (1), (2), (3), (4), (5)) AS d(dia)
        CROSS JOIN (VALUES (9), (10), (11), (14), (15), (16)) AS h(hora)
        WHERE NOT EXISTS (
          SELECT 1 FROM turnos_semanales ts WHERE ts.id_terapeuta = t.id_terapeuta
        )
        ON CONFLICT (id_terapeuta, dia, hora) DO NOTHING;
      `);
    } catch (err) {
      console.warn('[TerapeutaService] syncTherapists error:', err);
    }
  }

  async getDirectorio(filters?: { limit?: number; offset?: number }): Promise<{ items: ProfessionalItem[]; total: number }> {
    await this.syncTherapists();
    try {
      const sql = `
        SELECT 
          t.id_terapeuta,
          u.nombres,
          u.apellidos,
          COALESCE(t.especialidad, 'Terapia del Lenguaje') as especialidad,
          COALESCE(t.descripcion_profesional, 'Especialista en fonoaudiología y comunicación infantil.') as descripcion_profesional,
          t.foto_perfil,
          t.foto_perfil_mime
        FROM terapeutas t
        JOIN usuarios u ON t.id_usuario = u.id_usuario
        WHERE u.activo = true
        ORDER BY u.nombres ASC, u.apellidos ASC
        LIMIT $1 OFFSET $2;
      `;
      const limit = filters?.limit ?? 50;
      const offset = filters?.offset ?? 0;
      const res = await pool.query(sql, [limit, offset]);
      const countRes = await pool.query(`
        SELECT COUNT(*) as total
        FROM terapeutas t
        JOIN usuarios u ON t.id_usuario = u.id_usuario
        WHERE u.activo = true;
      `);
      const total = Number(countRes.rows[0]?.total ?? res.rows.length);
      const items: ProfessionalItem[] = res.rows.map(r => ({
        id_terapeuta: r.id_terapeuta,
        nombres: r.nombres,
        apellidos: r.apellidos,
        especialidad: r.especialidad,
        descripcion_profesional: r.descripcion_profesional,
        foto_perfil_url: Buffer.isBuffer(r.foto_perfil) && r.foto_perfil_mime
          ? `data:${r.foto_perfil_mime};base64,${r.foto_perfil.toString('base64')}`
          : null,
      }));
      return { items, total };
    } catch (err) {
      console.warn('[TerapeutaService] Fallback getDirectorio:', err);
      return {
        items: [
          {
            id_terapeuta: 1,
            nombres: 'Sergei',
            apellidos: 'Ramirez',
            especialidad: 'Terapia del Lenguaje y Fonología',
            descripcion_profesional: 'Certificado en intervención temprana y habla infantil.',
            foto_perfil_url: null,
          },
        ],
        total: 1,
      };
    }
  }

  async getDisponibilidad(terapeutaId: number): Promise<AvailabilityData> {
    const res = await pool.query(
      `SELECT dia, hora FROM turnos_semanales WHERE id_terapeuta = $1 ORDER BY dia, hora ASC;`,
      [terapeutaId]
    );
    return {
      turnos: res.rows.map((row) => ({ dia: Number(row.dia), hora: Number(row.hora) })),
      bloqueos: [],
      duracion_minutos: 40,
    };
  }

  async updateDisponibilidad(terapeutaId: number, data: any): Promise<AvailabilityData> {
    if (!Array.isArray(data.turnos) || data.turnos.length > 70) {
      throw Object.assign(new Error('La disponibilidad debe incluir una lista válida de turnos.'), { status: 400 });
    }
    const normalized = data.turnos.map((slot: any) => ({ dia: Number(slot.dia), hora: Number(slot.hora) }));
    const seen = new Set<string>();
    for (const slot of normalized) {
      const key = slot.dia + ':' + slot.hora;
      if (!Number.isInteger(slot.dia) || slot.dia < 1 || slot.dia > 5 || !Number.isInteger(slot.hora) || slot.hora < 8 || slot.hora > 17 || seen.has(key)) {
        throw Object.assign(new Error('Cada turno debe ser único y estar entre lunes y viernes, de 08:00 a 17:00.'), { status: 400 });
      }
      seen.add(key);
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN;');
      // Serialize availability edits with appointment creation/rescheduling,
      // which use the same per-therapist lock before checking offered slots.
      await client.query('SELECT pg_advisory_xact_lock(7421, $1::integer);', [terapeutaId]);
      await client.query('DELETE FROM turnos_semanales WHERE id_terapeuta = $1;', [terapeutaId]);
      for (const slot of normalized) {
        await client.query(
          'INSERT INTO turnos_semanales (id_terapeuta, dia, hora) VALUES ($1, $2, $3);',
          [terapeutaId, slot.dia, slot.hora],
        );
      }
      await client.query('COMMIT;');
      return { turnos: normalized, bloqueos: [], duracion_minutos: 40 };
    } catch (error) {
      await client.query('ROLLBACK;');
      throw error;
    } finally {
      client.release();
    }
  }

  async getTurnosDelDia(terapeutaId: number, fechaStr: string): Promise<AvailableSlotItem[]> {
    const slots: AvailableSlotItem[] = [];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaStr) || Number.isNaN(Date.parse(fechaStr + 'T00:00:00Z'))) {
      throw Object.assign(new Error('La fecha debe tener formato AAAA-MM-DD.'), { status: 400 });
    }
    const date = new Date(fechaStr + 'T00:00:00Z');
    if (date.toISOString().slice(0, 10) !== fechaStr) {
      throw Object.assign(new Error('La fecha indicada no existe.'), { status: 400 });
    }
    const dayOfWeek = (date.getUTCDay() + 6) % 7 + 1;
    if (dayOfWeek > 5) return [];
    const availability = await pool.query(
      'SELECT hora FROM turnos_semanales WHERE id_terapeuta = $1 AND dia = $2 ORDER BY hora;',
      [terapeutaId, dayOfWeek],
    );
    const nextDate = getNextCalendarDate(fechaStr);
    const dayStart = appointmentLocalDateTime(fechaStr, 0);
    const dayEnd = appointmentLocalDateTime(nextDate, 0);
    const reservations = await pool.query(
      "SELECT fecha_hora_inicio, fecha_hora_fin FROM reservas WHERE id_terapeuta = $1 AND estado_reserva <> 'CANCELADA' AND fecha_hora_inicio < $3::timestamptz AND fecha_hora_fin > $2::timestamptz;",
      [terapeutaId, dayStart, dayEnd],
    );
    const existing = reservations.rows.map((row) => ({
      start: new Date(row.fecha_hora_inicio).getTime(),
      end: new Date(row.fecha_hora_fin).getTime(),
    }));
    for (const row of availability.rows) {
      const hour = Number(row.hora);
      const hStr = String(hour).padStart(2, '0');
      const startIso = appointmentLocalDateTime(fechaStr, hour);
      const endIso = appointmentLocalDateTime(fechaStr, hour, 40);
      const start = new Date(startIso).getTime();
      const end = new Date(endIso).getTime();
      const unavailable = existing.some((booking) => booking.start < end && booking.end > start);
      const past = start <= Date.now();
      slots.push({
        inicio: new Date(startIso).toISOString(),
        fin: new Date(endIso).toISOString(),
        disponible: !unavailable && !past,
        motivo: unavailable
          ? 'Este horario se superpone con una cita existente.'
          : past ? 'Este horario ya pasó.' : null,
      });
    }
    return slots;
  }

  async getMe(userId: number = 2) {
    try {
      const res = await pool.query(
        `SELECT u.id_usuario, u.codigo_usuario, u.email, u.nombres, u.apellidos, u.activo,
                t.id_terapeuta, t.especialidad, t.anios_experiencia, t.idiomas, t.descripcion_profesional,
                t.telefono, t.cedula_profesional, t.foto_perfil, t.foto_perfil_mime
         FROM usuarios u
         JOIN terapeutas t ON u.id_usuario = t.id_usuario
         WHERE u.id_usuario = $1 LIMIT 1;`,
        [userId]
      );
      if (res.rows.length > 0) {
        const r = res.rows[0];
        return {
          user: {
            id_usuario: r.id_usuario,
            codigo_usuario: r.codigo_usuario,
            email: r.email,
            nombres: r.nombres,
            apellidos: r.apellidos,
            activo: r.activo,
            roles: ['TERAPEUTA'],
            id_terapeuta: r.id_terapeuta,
            id_tutor: null,
          },
          perfil_terapeuta: {
            id_terapeuta: r.id_terapeuta,
            especialidad: r.especialidad,
            anios_experiencia: r.anios_experiencia,
            idiomas: r.idiomas || 'Español',
            descripcion_profesional: r.descripcion_profesional,
            telefono: r.telefono ?? null,
            cedula_profesional: r.cedula_profesional ?? null,
            foto_perfil_url: Buffer.isBuffer(r.foto_perfil) && r.foto_perfil_mime
              ? `data:${r.foto_perfil_mime};base64,${r.foto_perfil.toString('base64')}`
              : null,
          },
        };
      }
    } catch (err) {
      console.warn('[TerapeutaService] Fallback getMe:', err);
    }

    return {
      user: {
        id_usuario: 2,
        codigo_usuario: 't00001',
        email: 'terapeuta.local@ashakids.test',
        nombres: 'Terapeuta',
        apellidos: 'Local',
        activo: true,
        roles: ['TERAPEUTA'],
        id_terapeuta: 1,
        id_tutor: null,
      },
      perfil_terapeuta: {
        id_terapeuta: 1,
        especialidad: 'Terapia del Lenguaje y Fonología',
        anios_experiencia: 5,
        idiomas: 'Español',
        descripcion_profesional: 'Especialista en fonoaudiología y comunicación infantil.',
        telefono: null,
        cedula_profesional: null,
        foto_perfil_url: null,
      },
    };
  }

  async updateMyProfile(userId: number, changes: TherapistProfileChanges): Promise<void> {
    const columns: string[] = [];
    const values: Array<string | null | number> = [];
    if (Object.prototype.hasOwnProperty.call(changes, 'telefono')) {
      values.push(changes.telefono?.trim() || null);
      columns.push(`telefono = $${values.length}`);
    }
    if (Object.prototype.hasOwnProperty.call(changes, 'cedula_profesional')) {
      values.push(changes.cedula_profesional?.trim() || null);
      columns.push(`cedula_profesional = $${values.length}`);
    }
    if (columns.length === 0) return;

    values.push(userId);
    const result = await pool.query(
      `UPDATE public.terapeutas SET ${columns.join(', ')} WHERE id_usuario = $${values.length} RETURNING id_terapeuta;`,
      values,
    );
    if (result.rowCount === 0) {
      throw Object.assign(new Error('No se encontró el perfil profesional asociado a tu usuario.'), { status: 404 });
    }
  }

  async updateMyProfilePhoto(userId: number, image: Buffer, mimeType: string): Promise<void> {
    const result = await pool.query(
      `UPDATE public.terapeutas
       SET foto_perfil = $1, foto_perfil_mime = $2
       WHERE id_usuario = $3
       RETURNING id_terapeuta;`,
      [image, mimeType, userId],
    );
    if (result.rowCount === 0) {
      throw Object.assign(new Error('No se encontró el perfil profesional asociado a tu usuario.'), { status: 404 });
    }
  }

  async removeMyProfilePhoto(userId: number): Promise<void> {
    const result = await pool.query(
      `UPDATE public.terapeutas
       SET foto_perfil = NULL, foto_perfil_mime = NULL
       WHERE id_usuario = $1
       RETURNING id_terapeuta;`,
      [userId],
    );
    if (result.rowCount === 0) {
      throw Object.assign(new Error('No se encontró el perfil profesional asociado a tu usuario.'), { status: 404 });
    }
  }

  async getPacientes(terapeutaId: number) {
    return [
      {
        id_paciente: 1,
        codigo_paciente: 'PAC-001',
        nombres: 'Liam',
        apellidos: 'García',
        edad: 6,
        id_terapeuta: terapeutaId,
        diagnostico: 'Trastorno de los sonidos del habla (TSH)',
        ultima_sesion: '2026-10-20',
      },
    ];
  }

  async crearReporteClinico(dto: any) {
    return {
      id_reporte: Date.now(),
      ...dto,
      creado_en: new Date().toISOString(),
    };
  }
}

export const terapeutaService = new TerapeutaService();
