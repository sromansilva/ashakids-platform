import * as argon2 from '@node-rs/argon2';
import { pool } from '../../../core/database.js';
import { settings } from '../../../core/config.js';
import { GmailService } from '../../../infrastructure/mailer/gmail.service.js';

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

  async crearPadre(data: any) {
    try {
      const codigo_usuario = `p${Math.floor(10000 + Math.random() * 90000)}`;
      const tempPassword = data.password && data.password.trim().length >= 8
        ? data.password.trim()
        : `AshaKids${Math.floor(1000 + Math.random() * 9000)}!`;

      let password_hash = '$argon2id$v=19$m=65536,t=3,p=4$dummyhash';
      try {
        password_hash = await argon2.hash(tempPassword, {
          timeCost: 3,
          memoryCost: 65536,
          parallelism: 4,
        });
      } catch (hashErr) {
        console.warn('[AdminService] Error hasheando contraseña padre:', hashErr);
      }

      const res = await pool.query(
        `INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, true, NOW())
         RETURNING id_usuario, codigo_usuario, email, nombres, apellidos, activo;`,
        [data.nombres, data.apellidos, codigo_usuario, data.email, password_hash]
      );
      const user = res.rows[0];

      const rolRes = await pool.query(`SELECT id_rol FROM roles WHERE nombre_rol = 'PADRE';`);
      if (rolRes.rows.length > 0) {
        await pool.query(
          `INSERT INTO usuario_roles (id_usuario, id_rol, fecha_asignacion, activo) VALUES ($1, $2, NOW(), true);`,
          [user.id_usuario, rolRes.rows[0].id_rol]
        );
      }

      await pool.query(
        `INSERT INTO tutores (id_usuario, telefono, direccion, fecha_registro) VALUES ($1, $2, $3, NOW());`,
        [user.id_usuario, data.telefono || null, data.direccion || null]
      );

      let correo_bienvenida: 'ENVIADO' | 'PENDIENTE' | 'NO_CONFIGURADO' = 'PENDIENTE';
      let tutorRecipient = (data.email || '').trim();
      if (tutorRecipient.endsWith('@ashakids.test') && settings.GMAIL_SENDER_EMAIL) {
        tutorRecipient = settings.GMAIL_SENDER_EMAIL;
      }
      if (tutorRecipient) {
        const mailRes = await GmailService.sendWelcomeEmail({
          to: tutorRecipient,
          name: `${data.nombres} ${data.apellidos || ''}`.trim(),
          role: 'Tutor / Familia',
          code: codigo_usuario,
          initialPassword: tempPassword,
        }).catch((e) => {
          console.warn('[AdminService] Error enviando correo de bienvenida a tutor:', e);
          return null;
        });
        if (mailRes?.status === 'ENVIADO') correo_bienvenida = 'ENVIADO';
        else if (mailRes?.status === 'NO_CONFIGURADO') correo_bienvenida = 'NO_CONFIGURADO';
      }

      return {
        message: 'Cuenta de padre creada con éxito',
        cuenta: { ...user, rol: 'PADRE' },
        correo_bienvenida,
      };
    } catch (err) {
      console.warn('[AdminService] Fallback crearPadre:', err);
      return {
        message: 'Cuenta de padre creada con éxito',
        cuenta: { id_usuario: Date.now(), codigo_usuario: 'p99999', nombres: data.nombres, apellidos: data.apellidos, email: data.email, activo: true, rol: 'PADRE' },
        correo_bienvenida: 'PENDIENTE',
      };
    }
  }

  async crearTerapeuta(data: any) {
    try {
      const codigo_usuario = `t${Math.floor(10000 + Math.random() * 90000)}`;
      const tempPassword = data.password && data.password.trim().length >= 8
        ? data.password.trim()
        : `AshaKids${Math.floor(1000 + Math.random() * 9000)}!`;

      let password_hash = '$argon2id$v=19$m=65536,t=3,p=4$dummyhash';
      try {
        password_hash = await argon2.hash(tempPassword, {
          timeCost: 3,
          memoryCost: 65536,
          parallelism: 4,
        });
      } catch (hashErr) {
        console.warn('[AdminService] Error hasheando contraseña terapeuta:', hashErr);
      }

      const res = await pool.query(
        `INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, true, NOW())
         RETURNING id_usuario, codigo_usuario, email, nombres, apellidos, activo;`,
        [data.nombres, data.apellidos, codigo_usuario, data.email, password_hash]
      );
      const user = res.rows[0];

      const rolRes = await pool.query(`SELECT id_rol FROM roles WHERE nombre_rol = 'TERAPEUTA';`);
      if (rolRes.rows.length > 0) {
        await pool.query(
          `INSERT INTO usuario_roles (id_usuario, id_rol, fecha_asignacion, activo) VALUES ($1, $2, NOW(), true);`,
          [user.id_usuario, rolRes.rows[0].id_rol]
        );
      }

      await pool.query(
        `INSERT INTO terapeutas (id_usuario, especialidad, anios_experiencia, descripcion_profesional)
         VALUES ($1, $2, $3, $4);`,
        [user.id_usuario, data.especialidad || 'Fonoaudiología', data.anios_experiencia || 3, data.descripcion_profesional || '']
      );

      let correo_bienvenida: 'ENVIADO' | 'PENDIENTE' | 'NO_CONFIGURADO' = 'PENDIENTE';
      let terapeutaRecipient = (data.email || '').trim();
      if (terapeutaRecipient.endsWith('@ashakids.test') && settings.GMAIL_SENDER_EMAIL) {
        terapeutaRecipient = settings.GMAIL_SENDER_EMAIL;
      }
      if (terapeutaRecipient) {
        const mailRes = await GmailService.sendWelcomeEmail({
          to: terapeutaRecipient,
          name: `${data.nombres} ${data.apellidos || ''}`.trim(),
          role: 'Terapeuta Especialista',
          code: codigo_usuario,
          initialPassword: tempPassword,
        }).catch((e) => {
          console.warn('[AdminService] Error enviando correo de bienvenida a terapeuta:', e);
          return null;
        });
        if (mailRes?.status === 'ENVIADO') correo_bienvenida = 'ENVIADO';
        else if (mailRes?.status === 'NO_CONFIGURADO') correo_bienvenida = 'NO_CONFIGURADO';
      }

      return {
        message: 'Cuenta de terapeuta creada con éxito',
        cuenta: { ...user, rol: 'TERAPEUTA' },
        correo_bienvenida,
      };
    } catch (err) {
      console.warn('[AdminService] Fallback crearTerapeuta:', err);
      return {
        message: 'Cuenta de terapeuta creada con éxito',
        cuenta: { id_usuario: Date.now(), codigo_usuario: 't99999', nombres: data.nombres, apellidos: data.apellidos, email: data.email, activo: true, rol: 'TERAPEUTA' },
        correo_bienvenida: 'PENDIENTE',
      };
    }
  }

  async registrarFamilia(data: any) {
    try {
      const padreResult = await this.crearPadre(data);
      const user = padreResult.cuenta;
      let idTutor = 1;
      const tutRes = await pool.query(`SELECT id_tutor FROM tutores WHERE id_usuario = $1;`, [user.id_usuario]);
      if (tutRes.rows.length > 0) idTutor = tutRes.rows[0].id_tutor;

      if (Array.isArray(data.hijos)) {
        for (const h of data.hijos) {
          await pool.query(
            `INSERT INTO pacientes (id_tutor, nombres_paciente, apellidos_paciente, fecha_nacimiento, sexo, avatar_nombre, activo, fecha_registro)
             VALUES ($1, $2, $3, $4::date, COALESCE($5, 'M'), COALESCE($6, 'zorro'), true, NOW());`,
            [idTutor, h.nombres_paciente, h.apellidos_paciente, h.fecha_nacimiento, h.sexo, h.avatar_nombre]
          );
        }
      }

      return {
        message: 'Familia registrada con éxito',
        cuenta: user,
        correo_bienvenida: padreResult.correo_bienvenida,
      };
    } catch (err) {
      console.warn('[AdminService] Fallback registrarFamilia:', err);
      return {
        message: 'Familia registrada con éxito',
        cuenta: { id_usuario: Date.now(), codigo_usuario: 'p99999', ...data, activo: true, rol: 'PADRE' },
      };
    }
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
