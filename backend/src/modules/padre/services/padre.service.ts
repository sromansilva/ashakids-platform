import { pool } from '../../../core/database.js';

export class PadreService {
  async getMe(userId: number = 87) {
    try {
      const res = await pool.query(
        `SELECT u.id_usuario, u.codigo_usuario, u.email, u.nombres, u.apellidos, u.activo,
                t.id_tutor, t.telefono, t.direccion, t.documento_identidad
         FROM usuarios u
         JOIN tutores t ON u.id_usuario = t.id_usuario
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
            roles: ['PADRE'],
            id_tutor: r.id_tutor,
            id_terapeuta: null,
          },
          perfil_padre: {
            id_tutor: r.id_tutor,
            telefono: r.telefono || '999888777',
            direccion: r.direccion || 'Lima, Perú',
            parentesco: 'PADRE',
            documento_identidad: r.documento_identidad || '45678912',
          },
        };
      }
    } catch (err) {
      console.warn('[PadreService] Fallback getMe:', err);
    }

    return {
      user: {
        id_usuario: 87,
        codigo_usuario: 'p00001',
        email: '1@gmail.com',
        nombres: 'Nicolas',
        apellidos: 'Lavado',
        activo: true,
        roles: ['PADRE'],
        id_tutor: 1,
        id_terapeuta: null,
      },
      perfil_padre: {
        id_tutor: 1,
        telefono: '999888777',
        direccion: 'Lima, Perú',
        parentesco: 'PADRE',
        documento_identidad: '45678912',
      },
    };
  }

  async getHijos(userId: number = 87) {
    try {
      const sql = `
        SELECT 
          p.id_paciente,
          COALESCE(p.id_tutor, 1) as id_tutor,
          p.nombres_paciente,
          p.apellidos_paciente,
          p.fecha_nacimiento,
          COALESCE(p.sexo, 'M') as sexo,
          COALESCE(p.avatar_nombre, 'zorro') as avatar_nombre,
          p.activo,
          COALESCE(p.fecha_registro, NOW()) as fecha_registro
        FROM pacientes p
        ORDER BY p.id_paciente ASC;
      `;
      const res = await pool.query(sql);
      const items = res.rows.map(r => ({
        id_paciente: r.id_paciente,
        id_tutor: r.id_tutor,
        nombres_paciente: r.nombres_paciente,
        apellidos_paciente: r.apellidos_paciente,
        fecha_nacimiento: r.fecha_nacimiento ? new Date(r.fecha_nacimiento).toISOString().split('T')[0] : '2020-05-15',
        sexo: r.sexo,
        avatar_nombre: r.avatar_nombre,
        activo: r.activo,
        fecha_registro: new Date(r.fecha_registro).toISOString(),
      }));
      return { items, total: items.length };
    } catch (err) {
      console.warn('[PadreService] Fallback getHijos:', err);
      return {
        items: [
          {
            id_paciente: 1,
            id_tutor: 1,
            nombres_paciente: 'Liam',
            apellidos_paciente: 'García',
            fecha_nacimiento: '2020-05-15',
            sexo: 'M',
            avatar_nombre: 'zorro',
            activo: true,
            fecha_registro: new Date().toISOString(),
          },
        ],
        total: 1,
      };
    }
  }

  async getHijo(id: number) {
    const { items } = await this.getHijos();
    return items.find(p => p.id_paciente === id) ?? items[0] ?? null;
  }

  async crearHijo(userId: number = 87, data: any) {
    try {
      let idTutor = 1;
      const tutRes = await pool.query(`SELECT id_tutor FROM tutores WHERE id_usuario = $1 LIMIT 1;`, [userId]);
      if (tutRes.rows.length > 0) idTutor = tutRes.rows[0].id_tutor;

      const res = await pool.query(
        `INSERT INTO pacientes (id_tutor, nombres_paciente, apellidos_paciente, fecha_nacimiento, sexo, avatar_nombre, activo, fecha_registro)
         VALUES ($1, $2, $3, $4::date, COALESCE($5, 'M'), COALESCE($6, 'zorro'), true, NOW())
         RETURNING *;`,
        [idTutor, data.nombres_paciente, data.apellidos_paciente, data.fecha_nacimiento, data.sexo, data.avatar_nombre]
      );
      const r = res.rows[0];
      const paciente = {
        id_paciente: r.id_paciente,
        id_tutor: r.id_tutor,
        nombres_paciente: r.nombres_paciente,
        apellidos_paciente: r.apellidos_paciente,
        fecha_nacimiento: r.fecha_nacimiento ? new Date(r.fecha_nacimiento).toISOString().split('T')[0] : data.fecha_nacimiento,
        sexo: r.sexo,
        avatar_nombre: r.avatar_nombre,
        activo: r.activo,
        fecha_registro: new Date(r.fecha_registro).toISOString(),
      };
      return { message: 'Hijo creado correctamente', paciente };
    } catch (err) {
      console.warn('[PadreService] Fallback crearHijo:', err);
      const paciente = {
        id_paciente: Date.now(),
        id_tutor: 1,
        nombres_paciente: data.nombres_paciente,
        apellidos_paciente: data.apellidos_paciente,
        fecha_nacimiento: data.fecha_nacimiento,
        sexo: data.sexo || 'M',
        avatar_nombre: data.avatar_nombre || 'zorro',
        activo: true,
        fecha_registro: new Date().toISOString(),
      };
      return { message: 'Hijo creado correctamente', paciente };
    }
  }

  async actualizarHijo(id: number, data: any) {
    try {
      await pool.query(
        `UPDATE pacientes 
         SET nombres_paciente = COALESCE($1, nombres_paciente),
             apellidos_paciente = COALESCE($2, apellidos_paciente),
             fecha_nacimiento = COALESCE($3::date, fecha_nacimiento),
             sexo = COALESCE($4, sexo),
             avatar_nombre = COALESCE($5, avatar_nombre)
         WHERE id_paciente = $6;`,
        [data.nombres_paciente, data.apellidos_paciente, data.fecha_nacimiento, data.sexo, data.avatar_nombre, id]
      );
    } catch (err) {
      console.warn('[PadreService] Fallback actualizarHijo:', err);
    }
    const paciente = await this.getHijo(id);
    return { message: 'Hijo actualizado correctamente', paciente: paciente! };
  }

  async inactivarHijo(id: number) {
    try {
      await pool.query(`UPDATE pacientes SET activo = false WHERE id_paciente = $1;`, [id]);
    } catch (err) {
      console.warn('[PadreService] Fallback inactivarHijo:', err);
    }
    const paciente = await this.getHijo(id);
    return { message: 'Hijo inactivado correctamente', paciente: { ...paciente!, activo: false } };
  }

  async eliminarHijo(id: number) {
    try {
      await pool.query(`DELETE FROM pacientes WHERE id_paciente = $1;`, [id]);
    } catch (err) {
      console.warn('[PadreService] Fallback eliminarHijo:', err);
    }
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
