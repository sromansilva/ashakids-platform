import { pool } from '../../../core/database.js';

function httpError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

function mapPatientRow(r: any) {
  return {
    id_paciente: r.id_paciente,
    id_tutor: r.id_tutor,
    nombres_paciente: r.nombres_paciente,
    apellidos_paciente: r.apellidos_paciente,
    fecha_nacimiento: r.fecha_nacimiento ? new Date(r.fecha_nacimiento).toISOString().split('T')[0] : null,
    sexo: r.sexo,
    avatar_nombre: r.avatar_nombre,
    activo: r.activo,
    fecha_registro: r.fecha_registro ? new Date(r.fecha_registro).toISOString() : null,
  };
}

export class PadreService {
  async getMe(userId: number) {
    const res = await pool.query(
      `SELECT u.id_usuario, u.codigo_usuario, u.email, u.nombres, u.apellidos, u.activo,
              t.id_tutor, t.telefono, t.direccion, t.parentesco
       FROM usuarios u
       LEFT JOIN tutores t ON u.id_usuario = t.id_usuario
       WHERE u.id_usuario = $1 LIMIT 1;`,
      [userId],
    );
    const r = res.rows[0];
    if (!r) throw httpError('Cuenta de padre no encontrada.', 404);
    return {
      user: {
        id_usuario: r.id_usuario,
        codigo_usuario: r.codigo_usuario,
        email: r.email,
        nombres: r.nombres,
        apellidos: r.apellidos,
        activo: r.activo,
        roles: ['PADRE'],
        id_tutor: r.id_tutor ?? null,
        id_terapeuta: null,
      },
      perfil_padre: {
        id_tutor: r.id_tutor ?? null,
        telefono: r.telefono ?? null,
        direccion: r.direccion ?? null,
        parentesco: r.parentesco ?? 'PADRE',
        documento_identidad: null,
      },
    };
  }

  async getHijos(userId: number) {
    const res = await pool.query(
      `SELECT p.id_paciente, p.id_tutor, p.nombres_paciente, p.apellidos_paciente,
              p.fecha_nacimiento, p.sexo, p.avatar_nombre, p.activo, p.fecha_registro
       FROM pacientes p
       JOIN tutores t ON t.id_tutor = p.id_tutor
       WHERE t.id_usuario = $1
       ORDER BY p.id_paciente ASC;`,
      [userId],
    );
    const items = res.rows.map(mapPatientRow);
    return { items, total: items.length };
  }

  async getHijo(id: number, userId: number) {
    const res = await pool.query(
      `SELECT p.id_paciente, p.id_tutor, p.nombres_paciente, p.apellidos_paciente,
              p.fecha_nacimiento, p.sexo, p.avatar_nombre, p.activo, p.fecha_registro
       FROM pacientes p
       JOIN tutores t ON t.id_tutor = p.id_tutor
       WHERE p.id_paciente = $1 AND t.id_usuario = $2
       LIMIT 1;`,
      [id, userId],
    );
    return res.rows[0] ? mapPatientRow(res.rows[0]) : null;
  }

  async crearHijo(userId: number, data: any) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const tutRes = await client.query('SELECT id_tutor FROM tutores WHERE id_usuario = $1 LIMIT 1;', [userId]);
      const idTutor = tutRes.rows[0]?.id_tutor ?? (await client.query(
        `INSERT INTO tutores (id_usuario, parentesco, telefono, direccion)
         VALUES ($1, $2, $3, $4) RETURNING id_tutor;`,
        [userId, data.parentesco ?? 'PADRE', data.telefono ?? null, data.direccion ?? null],
      )).rows[0].id_tutor;

      const res = await client.query(
        `INSERT INTO pacientes (id_tutor, nombres_paciente, apellidos_paciente, fecha_nacimiento, sexo, avatar_nombre, activo, fecha_registro)
         VALUES ($1, $2, $3, $4::date, COALESCE($5, 'M'), COALESCE($6, 'zorro'), true, NOW())
         RETURNING *;`,
        [idTutor, data.nombres_paciente ?? data.nombres, data.apellidos_paciente ?? data.apellidos, data.fecha_nacimiento, data.sexo ?? data.genero, data.avatar_nombre],
      );
      await client.query('COMMIT');
      const paciente = mapPatientRow(res.rows[0]);
      return { message: 'Hijo creado correctamente', paciente };
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }

  async actualizarHijo(id: number, userId: number, data: any) {
    const updated = await pool.query(
      `UPDATE pacientes p
       SET nombres_paciente = COALESCE($1, p.nombres_paciente),
           apellidos_paciente = COALESCE($2, p.apellidos_paciente),
           fecha_nacimiento = COALESCE($3::date, p.fecha_nacimiento),
           sexo = COALESCE($4, p.sexo),
           avatar_nombre = COALESCE($5, p.avatar_nombre)
       WHERE p.id_paciente = $6
         AND EXISTS (SELECT 1 FROM tutores t WHERE t.id_tutor = p.id_tutor AND t.id_usuario = $7)
       RETURNING p.id_paciente;`,
      [data.nombres_paciente, data.apellidos_paciente, data.fecha_nacimiento, data.sexo, data.avatar_nombre, id, userId],
    );
    if (updated.rowCount === 0) throw httpError('Hijo no encontrado.', 404);
    return { message: 'Hijo actualizado correctamente', paciente: await this.getHijo(id, userId) };
  }

  async inactivarHijo(id: number, userId: number) {
    const updated = await pool.query(
      `UPDATE pacientes p SET activo = false
       WHERE p.id_paciente = $1
         AND EXISTS (SELECT 1 FROM tutores t WHERE t.id_tutor = p.id_tutor AND t.id_usuario = $2)
       RETURNING p.id_paciente;`,
      [id, userId],
    );
    if (updated.rowCount === 0) throw httpError('Hijo no encontrado.', 404);
    return { message: 'Hijo inactivado correctamente', paciente: await this.getHijo(id, userId) };
  }

  async eliminarHijo(id: number, userId: number) {
    const deleted = await pool.query(
      `DELETE FROM pacientes p
       WHERE p.id_paciente = $1
         AND EXISTS (SELECT 1 FROM tutores t WHERE t.id_tutor = p.id_tutor AND t.id_usuario = $2)
       RETURNING p.id_paciente;`,
      [id, userId],
    );
    if (deleted.rowCount === 0) throw httpError('Hijo no encontrado.', 404);
    return { message: 'Hijo eliminado correctamente' };
  }

  async registrarHijo(padreId: number, data: any) {
    const res = await this.crearHijo(padreId, data);
    return res.paciente;
  }

  async reservarCita(padreId: number, dto: any) {
    return {
      id_cita: Date.now(),
      id_padre: padreId,
      id_paciente: dto.id_paciente,
      id_terapeuta: dto.id_terapeuta,
      fecha_hora_inicio: `${dto.fecha}T${dto.hora_inicio}:00Z`,
      estado_reserva: 'PENDIENTE',
    };
  }

  async getProgresoHijo(idPaciente: number) {
    return {
      id_paciente: idPaciente,
      experiencia: 150,
      nivel: 1,
      actividades_completadas: 3,
    };
  }
}

export const padreService = new PadreService();
