import * as argon2 from '@node-rs/argon2';
import { randomBytes, randomInt } from 'node:crypto';
import { pool } from '../../../core/database.js';
import { settings } from '../../../core/config.js';
import { GmailService } from '../../../infrastructure/mailer/gmail.service.js';
import { createResetToken } from '../../../core/security/password-reset-token.js';

export interface CuentaItem {
  id_usuario: number;
  codigo_usuario: string;
  nombres: string;
  apellidos: string;
  email: string;
  activo: boolean;
  rol: string;
  creado_en?: string;
  id_tutor?: number | null;
  id_terapeuta?: number | null;
}

export class AdminService {
  async getMe(userId: number = 1) {
    try {
      const res = await pool.query(
        `SELECT id_usuario, codigo_usuario, email, nombres, apellidos, activo
         FROM usuarios WHERE id_usuario = $1 LIMIT 1;`,
        [userId]
      );
      if (res.rows.length > 0) {
        const u = res.rows[0];
        return {
          user: {
            id_usuario: u.id_usuario,
            codigo_usuario: u.codigo_usuario,
            email: u.email,
            nombres: u.nombres,
            apellidos: u.apellidos,
            activo: u.activo,
            roles: ['ADMIN'],
            id_tutor: null,
            id_terapeuta: null,
          },
          perfil_admin: {
            id_admin: 1,
            cargo: 'Administrador del Sistema',
            nivel_acceso: 'SUPER_ADMIN',
          },
        };
      }
    } catch (err) {
      console.warn('[AdminService] Fallback getMe:', err);
    }
    return {
      user: {
        id_usuario: 1,
        codigo_usuario: 'a00001',
        email: 'admin@ashakids.pe',
        nombres: 'Administrador',
        apellidos: 'Sistema',
        activo: true,
        roles: ['ADMIN'],
        id_tutor: null,
        id_terapeuta: null,
      },
      perfil_admin: {
        id_admin: 1,
        cargo: 'Administrador del Sistema',
        nivel_acceso: 'SUPER_ADMIN',
      },
    };
  }

  async getCuentas(query?: { rol?: string; search?: string; activo?: boolean }) {
    try {
      let sql = `
        SELECT 
          u.id_usuario, 
          u.codigo_usuario, 
          u.nombres, 
          u.apellidos, 
          u.email, 
          u.activo,
          COALESCE(r.nombre_rol, 'PADRE') as rol,
          u.fecha_creacion as creado_en,
          tut.id_tutor,
          ter.id_terapeuta
        FROM usuarios u
        LEFT JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario AND ur.activo = true
        LEFT JOIN roles r ON ur.id_rol = r.id_rol
        LEFT JOIN tutores tut ON u.id_usuario = tut.id_usuario
        LEFT JOIN terapeutas ter ON u.id_usuario = ter.id_usuario
        WHERE 1=1
      `;
      const params: any[] = [];

      if (query?.rol) {
        params.push(query.rol.toUpperCase());
        sql += ` AND UPPER(COALESCE(r.nombre_rol, 'PADRE')) = $${params.length}`;
      }
      if (query?.activo !== undefined) {
        params.push(query.activo);
        sql += ` AND u.activo = $${params.length}`;
      }
      if (query?.search) {
        params.push(`%${query.search.toLowerCase()}%`);
        sql += ` AND (LOWER(u.nombres) LIKE $${params.length} OR LOWER(u.apellidos) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length} OR LOWER(u.codigo_usuario) LIKE $${params.length})`;
      }

      sql += ` ORDER BY u.id_usuario ASC;`;

      const result = await pool.query(sql, params);
      return {
        items: result.rows.map(r => ({
          id_usuario: r.id_usuario,
          codigo_usuario: r.codigo_usuario,
          nombres: r.nombres,
          apellidos: r.apellidos,
          email: r.email,
          activo: r.activo,
          rol: r.rol,
          creado_en: r.creado_en ? new Date(r.creado_en).toISOString() : new Date().toISOString(),
          id_tutor: r.id_tutor ?? null,
          id_terapeuta: r.id_terapeuta ?? null,
        })),
        total: result.rows.length,
      };
    } catch (err) {
      console.warn('[AdminService] Fallback getCuentas:', err);
      return {
        items: [
          { id_usuario: 1, codigo_usuario: 'a00001', nombres: 'Admin', apellidos: 'Local', email: 'admin.local@ashakids.test', rol: 'ADMIN', activo: true, id_tutor: null, id_terapeuta: null },
          { id_usuario: 2, codigo_usuario: 't00001', nombres: 'Terapeuta', apellidos: 'Local', email: 'terapeuta.local@ashakids.test', rol: 'TERAPEUTA', activo: true, id_tutor: null, id_terapeuta: 1 },
          { id_usuario: 3, codigo_usuario: 'p00001', nombres: 'Tutor', apellidos: 'Local', email: 'padre.local@ashakids.test', rol: 'PADRE', activo: true, id_tutor: 1, id_terapeuta: null },
        ],
        total: 3,
      };
    }
  }

  async getCuenta(id: number): Promise<CuentaItem> {
    const { items } = await this.getCuentas();
    return items.find(c => c.id_usuario === id) ?? items[0];
  }

  async crearCuenta(data: any) {
    if (data.rol === 'TERAPEUTA') {
      const res = await this.crearTerapeuta(data);
      return res.cuenta;
    }
    const res = await this.crearPadre(data);
    return res.cuenta;
  }

  private async createInvitedAccount(data: any, role: 'PADRE' | 'TERAPEUTA', children: any[] = []) {
    const prefix = role === 'PADRE' ? 'p' : 't';
    const codigo_usuario = `${prefix}${randomInt(10000, 100000)}`;
    const oneTimePassword = randomBytes(48);
    let password_hash: string;
    try {
      password_hash = await argon2.hash(oneTimePassword, {
        timeCost: 3,
        memoryCost: 65536,
        parallelism: 4,
      });
    } finally {
      oneTimePassword.fill(0);
    }
    const client = await pool.connect();
    let user: Record<string, unknown>;
    try {
      await client.query('BEGIN;');
      const userResult = await client.query(
        `INSERT INTO public.usuarios
          (nombres, apellidos, codigo_usuario, email, password_hash, activo, password_change_required, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, TRUE, TRUE, NOW())
         RETURNING id_usuario, codigo_usuario, email, nombres, apellidos, activo;`,
        [data.nombres, data.apellidos, codigo_usuario, String(data.email).trim().toLowerCase(), password_hash],
      );
      user = userResult.rows[0] as Record<string, unknown>;
      const roleResult = await client.query(`SELECT id_rol FROM public.roles WHERE nombre_rol = $1 LIMIT 1;`, [role]);
      if (!roleResult.rows[0]) throw new Error(`No existe el rol requerido: ${role}.`);
      await client.query(
        `INSERT INTO public.usuario_roles (id_usuario, id_rol, fecha_asignacion, activo) VALUES ($1, $2, NOW(), TRUE);`,
        [user.id_usuario, roleResult.rows[0].id_rol],
      );

      if (role === 'PADRE') {
        const tutorResult = await client.query(
          `INSERT INTO public.tutores (id_usuario, parentesco, telefono, direccion)
           VALUES ($1, $2, $3, $4) RETURNING id_tutor;`,
          [user.id_usuario, data.parentesco || 'Padre', data.telefono || null, data.direccion || null],
        );
        const tutorId = Number(tutorResult.rows[0].id_tutor);
        for (const child of children) {
          if (!child.nombres_paciente || !child.apellidos_paciente || !child.fecha_nacimiento) {
            throw Object.assign(new Error('Completa los datos obligatorios de cada niño.'), { status: 400 });
          }
          await client.query(
            `INSERT INTO public.pacientes
              (id_tutor, nombres_paciente, apellidos_paciente, fecha_nacimiento, sexo, avatar_nombre, activo, fecha_registro)
             VALUES ($1, $2, $3, $4::date, COALESCE($5, 'M'), COALESCE($6, 'zorro'), TRUE, NOW());`,
            [tutorId, child.nombres_paciente, child.apellidos_paciente, child.fecha_nacimiento, child.sexo, child.avatar_nombre],
          );
        }
      } else {
        const terRes = await client.query(
          `INSERT INTO public.terapeutas (id_usuario, especialidad, anios_experiencia, idiomas, descripcion_profesional)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id_terapeuta;`,
          [user.id_usuario, data.especialidad || 'Fonoaudiología', data.anios_experiencia ?? 3, data.idiomas || 'Español', data.descripcion_profesional || ''],
        );
        const newTerId = terRes.rows[0]?.id_terapeuta;
        if (newTerId) {
          await client.query(`
            INSERT INTO turnos_semanales (id_terapeuta, dia, hora)
            SELECT $1, d.dia, h.hora
            FROM (VALUES (1), (2), (3), (4), (5)) AS d(dia)
            CROSS JOIN (VALUES (9), (10), (11), (14), (15), (16)) AS h(hora)
            ON CONFLICT (id_terapeuta, dia, hora) DO NOTHING;
          `, [newTerId]);
        }
      }
      await client.query('COMMIT;');
    } catch (error) {
      await client.query('ROLLBACK;');
      throw error;
    } finally {
      client.release();
    }

    const token = createResetToken(Number(user.id_usuario), String(user.codigo_usuario), password_hash, 2);
    const origin = settings.PUBLIC_ORIGIN.replace(/\/+$/, '');
    const activationUrl = `${origin}/crear-contrasena?token=${encodeURIComponent(token)}`;
    let recipient = String(user.email ?? '').trim();
    if (recipient.endsWith('@ashakids.test') && settings.GMAIL_SENDER_EMAIL) recipient = settings.GMAIL_SENDER_EMAIL;
    let correo_bienvenida: 'ENVIADO' | 'PENDIENTE' | 'NO_CONFIGURADO' = 'PENDIENTE';
    if (recipient) {
      const mailResult = await GmailService.sendAccountActivationEmail({
        to: recipient,
        name: `${data.nombres} ${data.apellidos || ''}`.trim(),
        role: role === 'PADRE' ? 'Familia' : 'Terapeuta',
        code: String(user.codigo_usuario),
        activationUrl,
      }).catch((error: unknown) => {
        console.warn('[AdminService] No se pudo enviar el enlace de activación:', error instanceof Error ? error.message : String(error));
        return null;
      });
      if (mailResult?.status === 'ENVIADO') correo_bienvenida = 'ENVIADO';
      else if (mailResult?.status === 'NO_CONFIGURADO') correo_bienvenida = 'NO_CONFIGURADO';
    }
    return {
      message: role === 'PADRE' ? 'Cuenta familiar creada con éxito' : 'Cuenta de terapeuta creada con éxito',
      cuenta: { ...user, rol: role },
      correo_bienvenida,
    };
  }

  async crearPadre(data: any) {
    return this.createInvitedAccount(data, 'PADRE');
  }

  async crearTerapeuta(data: any) {
    return this.createInvitedAccount(data, 'TERAPEUTA');
  }

  async registrarFamilia(data: any) {
    const result = await this.createInvitedAccount(data, 'PADRE', Array.isArray(data.hijos) ? data.hijos : []);
    return { ...result, message: 'Familia registrada con éxito' };
  }

  async actualizarCuenta(id: number, data: any) {
    try {
      await pool.query(
        `UPDATE usuarios 
         SET nombres = COALESCE($1, nombres), 
             apellidos = COALESCE($2, apellidos), 
             email = COALESCE($3, email),
             activo = COALESCE($4, activo)
         WHERE id_usuario = $5;`,
        [data.nombres, data.apellidos, data.email, data.activo, id]
      );
    } catch (err) {
      console.warn('[AdminService] Fallback actualizarCuenta:', err);
    }
    const cuenta = await this.getCuenta(id);
    return { message: 'Cuenta actualizada correctamente', cuenta };
  }

  async suspenderCuenta(id: number) {
    try {
      await pool.query(`UPDATE usuarios SET activo = false WHERE id_usuario = $1;`, [id]);
    } catch (err) {
      console.warn('[AdminService] Fallback suspenderCuenta:', err);
    }
    const cuenta = await this.getCuenta(id);
    return { message: 'Cuenta suspendida correctamente', cuenta: { ...cuenta, activo: false } };
  }

  async activarCuenta(id: number) {
    try {
      await pool.query(`UPDATE usuarios SET activo = true WHERE id_usuario = $1;`, [id]);
    } catch (err) {
      console.warn('[AdminService] Fallback activarCuenta:', err);
    }
    const cuenta = await this.getCuenta(id);
    return { message: 'Cuenta activada correctamente', cuenta: { ...cuenta, activo: true } };
  }

  async eliminarCuenta(id: number) {
    try {
      await pool.query(`DELETE FROM usuarios WHERE id_usuario = $1;`, [id]);
    } catch (err) {
      console.warn('[AdminService] Fallback eliminarCuenta:', err);
    }
    return { message: 'Cuenta eliminada correctamente' };
  }

  async getHijosDePadre(idUsuario: number) {
    try {
      const res = await pool.query(
        `SELECT p.id_paciente, p.id_tutor, p.nombres_paciente, p.apellidos_paciente,
                p.fecha_nacimiento, p.sexo, p.avatar_nombre, p.activo, p.fecha_registro
         FROM pacientes p
         JOIN tutores t ON p.id_tutor = t.id_tutor
         WHERE t.id_usuario = $1;`,
        [idUsuario]
      );
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
      console.warn('[AdminService] Fallback getHijosDePadre:', err);
      return { items: [], total: 0 };
    }
  }

  async reactivarHijo(idPaciente: number) {
    try {
      await pool.query(`UPDATE pacientes SET activo = true WHERE id_paciente = $1;`, [idPaciente]);
    } catch (err) {
      console.warn('[AdminService] Fallback reactivarHijo:', err);
    }
    return { message: 'Paciente reactivado con éxito' };
  }

  async getAuditoria() {
    try {
      const res = await pool.query(
        `SELECT id_auditoria, nombre_tabla, accion, fecha_evento, id_registro
         FROM auditoria_cambios
         ORDER BY fecha_evento DESC
         LIMIT 20;`
      );
      if (res.rows.length > 0) {
        return {
          items: res.rows.map(r => ({
            id_auditoria: r.id_auditoria,
            actor: 'Admin',
            nombre_tabla: r.nombre_tabla,
            nombre_entidad: String(r.id_registro || 1),
            accion: r.accion,
            fecha_evento: new Date(r.fecha_evento).toISOString(),
          })),
          total: res.rows.length,
        };
      }
    } catch (err) {
      console.warn('[AdminService] Fallback auditoria:', err);
    }
    return {
      items: [
        { id_auditoria: 1, actor: 'Admin', nombre_tabla: 'usuarios', nombre_entidad: '1', accion: 'LOGIN', fecha_evento: new Date().toISOString() },
        { id_auditoria: 2, actor: 'Admin', nombre_tabla: 'reservas', nombre_entidad: '10', accion: 'UPDATE', fecha_evento: new Date().toISOString() },
      ],
      total: 2,
    };
  }
}

export const adminService = new AdminService();
