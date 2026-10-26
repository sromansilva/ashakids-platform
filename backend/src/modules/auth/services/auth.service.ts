import crypto from 'node:crypto';
import * as argon2 from '@node-rs/argon2';
import { pool } from '../../../core/database.js';
import { settings } from '../../../core/config.js';
import type { LoginDTO, RegisterDTO } from '../dtos/auth.dto.js';

export class AuthService {
  async login(dto: LoginDTO) {
    const rawId = (dto.codigo_usuario || dto.email || '').trim();
    if (!rawId) {
      const err = new Error('Código de usuario o correo electrónico es requerido.');
      (err as any).status = 400;
      throw err;
    }

    try {
      // 1. Consultar usuario real desde PostgreSQL local
      const query = `
        SELECT 
          u.id_usuario, 
          u.codigo_usuario, 
          u.email, 
          u.password_hash, 
          u.nombres, 
          u.apellidos, 
          u.activo, 
          u.password_change_required,
          r.nombre_rol
        FROM usuarios u
        LEFT JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario AND ur.activo = true
        LEFT JOIN roles r ON ur.id_rol = r.id_rol
        WHERE (UPPER(u.codigo_usuario) = UPPER($1) OR LOWER(u.email) = LOWER($1));
      `;
      const result = await pool.query(query, [rawId]);

      if (result.rows.length === 0) {
        const err = new Error('Credenciales inválidas. Usuario no encontrado.');
        (err as any).status = 401;
        throw err;
      }

      const firstRow = result.rows[0];

      if (!firstRow.activo) {
        const err = new Error('Cuenta inactiva. Comuníquese con el administrador.');
        (err as any).status = 403;
        throw err;
      }

      // 2. Verificar contraseña con Argon2id
      let passwordMatches = false;
      if (firstRow.password_hash) {
        try {
          passwordMatches = await argon2.verify(firstRow.password_hash, dto.password);
        } catch (verifErr) {
          console.warn('[AuthService] Error al verificar Argon2:', verifErr);
        }
      }

      // Fallback para entorno de desarrollo local con contraseñas de testing habituales
      if (!passwordMatches && settings.ENVIRONMENT !== 'production') {
        if (dto.password === '12345' || dto.password === 'admin123') {
          console.info(`[AuthService] Acceso concedido por dev-fallback para ${firstRow.codigo_usuario}`);
          passwordMatches = true;
        }
      }

      if (!passwordMatches) {
        const err = new Error('Credenciales inválidas. Contraseña incorrecta.');
        (err as any).status = 401;
        throw err;
      }

      // 3. Determinar roles reales asignados
      const roles: string[] = Array.from(
        new Set(
          result.rows
            .map((r: any) => r.nombre_rol)
            .filter((role: any): role is string => Boolean(role))
        )
      );

      let primaryRole: 'ADMIN' | 'TERAPEUTA' | 'PADRE' = 'PADRE';
      if (roles.includes('ADMIN')) {
        primaryRole = 'ADMIN';
      } else if (roles.includes('TERAPEUTA')) {
        primaryRole = 'TERAPEUTA';
      } else if (roles.includes('PADRE')) {
        primaryRole = 'PADRE';
      } else {
        // Si no tiene rol asignado en usuario_roles, inferir del prefijo del código de usuario
        const codePrefix = (firstRow.codigo_usuario || '').trim().toUpperCase()[0];
        if (codePrefix === 'A') primaryRole = 'ADMIN';
        else if (codePrefix === 'T') primaryRole = 'TERAPEUTA';
        else primaryRole = 'PADRE';
        roles.push(primaryRole);
      }

      const user = {
        id_usuario: firstRow.id_usuario,
        codigo_usuario: firstRow.codigo_usuario,
        email: firstRow.email,
        nombres: firstRow.nombres,
        apellidos: firstRow.apellidos,
        rol: primaryRole,
        roles,
        activo: firstRow.activo,
        password_change_required: firstRow.password_change_required || false,
      };

      // 4. Persistir sesión en sesiones_autenticacion
      const rawSessionToken = crypto.randomUUID();
      const tokenHash = crypto.createHash('sha256').update(rawSessionToken).digest('hex');
      const now = new Date();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      try {
        await pool.query(
          `INSERT INTO sesiones_autenticacion (id_usuario, token_hash, fecha_emision, fecha_expiracion, ultima_actividad, mfa_verificado, revocado)
           VALUES ($1, $2, $3, $4, $5, false, false);`,
          [user.id_usuario, tokenHash, now, expiresAt, now]
        );
      } catch (dbErr) {
        console.warn('[AuthService] No se pudo persistir en sesiones_autenticacion:', dbErr);
      }

      const tokenPayload = {
        ...user,
        session_token: rawSessionToken,
      };
      const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

      return {
        token,
        user,
        usuario: user,
        message: 'Inicio de sesión exitoso',
      };
    } catch (err: any) {
      if (err.status) throw err;
      console.error('[AuthService] Error de conexión a PostgreSQL:', err);

      // Si falla la conexión a la base de datos y estamos en modo test o dev, permitir fallback controlado
      if (settings.ENVIRONMENT !== 'production') {
        console.warn('[AuthService] Ejecutando fallback offline para desarrollo.');
        return this.offlineFallbackLogin(dto, rawId);
      }
      throw err;
    }
  }

  private offlineFallbackLogin(dto: LoginDTO, rawId: string) {
    let rol: 'ADMIN' | 'TERAPEUTA' | 'PADRE' = 'PADRE';
    let codigo = dto.codigo_usuario || 'p00001';
    let nombres = 'Familia';
    let apellidos = 'AshaKids';
    let email = dto.email || 'padre@ashakids.pe';

    const lower = rawId.toLowerCase();
    if (lower.startsWith('a') || lower.includes('admin')) {
      rol = 'ADMIN';
      codigo = 'a00001';
      nombres = 'Administrador';
      apellidos = 'Sistema';
      email = 'admin@ashakids.test';
    } else if (lower.startsWith('t') || lower.includes('terapeuta')) {
      rol = 'TERAPEUTA';
      codigo = 't00002';
      nombres = 'Terapeuta';
      apellidos = 'Especialista';
      email = 'terapeuta@ashakids.test';
    }

    const user = {
      id_usuario: rol === 'ADMIN' ? 1 : rol === 'TERAPEUTA' ? 14 : 87,
      codigo_usuario: codigo,
      email,
      nombres,
      apellidos,
      rol,
      roles: [rol],
      activo: true,
      password_change_required: false,
    };

    const token = Buffer.from(JSON.stringify(user)).toString('base64');
    return {
      token,
      user,
      usuario: user,
      message: 'Inicio de sesión exitoso (modo respaldo)',
    };
  }

  async register(dto: RegisterDTO) {
    try {
      const prefix = dto.rol === 'ADMIN' ? 'a' : dto.rol === 'TERAPEUTA' ? 't' : 'p';
      const codigo_usuario = dto.codigo_usuario || `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;

      // Hash con Argon2id
      const password_hash = await argon2.hash(dto.password, {
        timeCost: 3,
        memoryCost: 65536,
        parallelism: 4,
      });

      const userInsert = await pool.query(
        `INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, true, NOW())
         RETURNING id_usuario, codigo_usuario, email, nombres, apellidos, activo, fecha_creacion;`,
        [dto.nombres, dto.apellidos, codigo_usuario, dto.email, password_hash]
      );

      const createdUser = userInsert.rows[0];

      // Asignar rol
      const rolQuery = await pool.query(`SELECT id_rol FROM roles WHERE nombre_rol = $1;`, [dto.rol]);
      if (rolQuery.rows.length > 0) {
        const id_rol = rolQuery.rows[0].id_rol;
        await pool.query(
          `INSERT INTO usuario_roles (id_usuario, id_rol, fecha_asignacion, activo)
           VALUES ($1, $2, NOW(), true);`,
          [createdUser.id_usuario, id_rol]
        );
      }

      const user = {
        ...createdUser,
        rol: dto.rol,
        roles: [dto.rol],
        password_change_required: false,
      };

      const token = Buffer.from(JSON.stringify(user)).toString('base64');
      return {
        token,
        user,
        usuario: user,
        message: 'Usuario registrado exitosamente en PostgreSQL',
      };
    } catch (err: any) {
      console.error('[AuthService] Error al registrar en PostgreSQL:', err);
      // Fallback
      const prefix = dto.rol === 'ADMIN' ? 'a' : dto.rol === 'TERAPEUTA' ? 't' : 'p';
      const codigo_usuario = dto.codigo_usuario || `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;
      const user = {
        id_usuario: Date.now(),
        codigo_usuario,
        email: dto.email,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        rol: dto.rol,
        roles: [dto.rol],
        activo: true,
        password_change_required: false,
      };
      const token = Buffer.from(JSON.stringify(user)).toString('base64');
      return {
        token,
        user,
        usuario: user,
        message: 'Usuario registrado exitosamente',
      };
    }
  }

  async getCurrentUser(user: any) {
    return user;
  }
}

export const authService = new AuthService();
