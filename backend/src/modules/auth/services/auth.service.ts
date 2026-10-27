import * as argon2 from '@node-rs/argon2';
import { pool } from '../../../core/database.js';
import { settings } from '../../../core/config.js';
import { createSessionToken, hashSessionToken } from '../../../core/security/session-token.js';
import type { LoginDTO, RegisterDTO } from '../dtos/auth.dto.js';

const sessionLifetimeMs = settings.SESSION_TTL_HOURS * 60 * 60 * 1000;

async function persistSession(queryable: { query: (query: string, values?: unknown[]) => Promise<unknown> }, userId: number) {
  const { token, tokenHash } = createSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionLifetimeMs);
  await queryable.query(
    `INSERT INTO sesiones_autenticacion
       (id_usuario, token_hash, fecha_emision, fecha_expiracion, ultima_actividad, mfa_verificado, revocado)
     VALUES ($1, $2, $3, $4, $5, false, false);`,
    [userId, tokenHash, now, expiresAt, now],
  );
  return token;
}

export class AuthService {
  async login(dto: LoginDTO) {
    const rawId = (dto.codigo_usuario || dto.email || '').trim();
    if (!rawId) {
      const err = new Error('Código de usuario o correo electrónico es requerido.');
      (err as any).status = 400;
      throw err;
    }

    try {
      const query = `
        SELECT u.id_usuario, u.codigo_usuario, u.email, u.password_hash,
               u.nombres, u.apellidos, u.activo, u.password_change_required,
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

      let passwordMatches = false;
      if (firstRow.password_hash) {
        try {
          passwordMatches = await argon2.verify(firstRow.password_hash, dto.password);
        } catch (verifErr) {
          console.warn('[AuthService] No se pudo verificar el hash de contraseña:', verifErr);
        }
      }

      // Local development convenience only. It is disabled in production.
      if (!passwordMatches && settings.ENVIRONMENT !== 'production') {
        if (dto.password === '12345' || dto.password === 'admin123') passwordMatches = true;
      }
      if (!passwordMatches) {
        const err = new Error('Credenciales inválidas. Contraseña incorrecta.');
        (err as any).status = 401;
        throw err;
      }

      const roles: string[] = Array.from(new Set(
        result.rows
          .map((row: any) => row.nombre_rol)
          .filter((role: any): role is string => role === 'ADMIN' || role === 'TERAPEUTA' || role === 'PADRE'),
      ));

      if (roles.length === 0) {
        const err = new Error('La cuenta no tiene un rol activo asignado. Comuníquese con el administrador.');
        (err as any).status = 403;
        throw err;
      }

      let primaryRole: 'ADMIN' | 'TERAPEUTA' | 'PADRE' = 'PADRE';
      if (roles.includes('ADMIN')) primaryRole = 'ADMIN';
      else if (roles.includes('TERAPEUTA')) primaryRole = 'TERAPEUTA';
      else primaryRole = 'PADRE';

      const user = {
        id_usuario: Number(firstRow.id_usuario),
        codigo_usuario: firstRow.codigo_usuario,
        email: firstRow.email,
        nombres: firstRow.nombres,
        apellidos: firstRow.apellidos,
        rol: primaryRole,
        roles,
        activo: Boolean(firstRow.activo),
        password_change_required: Boolean(firstRow.password_change_required),
      };

      // The client receives a random opaque credential; only its SHA-256 hash is stored.
      const token = await persistSession(pool, user.id_usuario);
      return { token, user, usuario: user, message: 'Inicio de sesión exitoso' };
    } catch (err: any) {
      if (err.status) throw err;
      console.error('[AuthService] Error de conexión a PostgreSQL:', err);

      // Preserve the offline development experience; production never authenticates offline.
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
    return { token, user, usuario: user, message: 'Inicio de sesión exitoso (modo respaldo)' };
  }

  async register(dto: RegisterDTO) {
    if (dto.rol !== 'PADRE') {
      const err = new Error('El registro público solo permite crear cuentas PADRE.');
      (err as any).status = 403;
      throw err;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const codigo_usuario = dto.codigo_usuario || `p${Math.floor(10000 + Math.random() * 90000)}`;
      const password_hash = await argon2.hash(dto.password, {
        timeCost: 3,
        memoryCost: 65536,
        parallelism: 4,
      });
      const userInsert = await client.query(
        `INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo, fecha_creacion)
         VALUES ($1, $2, $3, $4, $5, true, NOW())
         RETURNING id_usuario, codigo_usuario, email, nombres, apellidos, activo, fecha_creacion;`,
        [dto.nombres, dto.apellidos, codigo_usuario, dto.email, password_hash],
      );
      const createdUser = userInsert.rows[0];

      const roleResult = await client.query('SELECT id_rol FROM roles WHERE nombre_rol = $1;', ['PADRE']);
      if (!roleResult.rows[0]) throw new Error('El rol PADRE no está configurado en la base de datos.');
      await client.query(
        `INSERT INTO usuario_roles (id_usuario, id_rol, fecha_asignacion, activo)
         VALUES ($1, $2, NOW(), true);`,
        [createdUser.id_usuario, roleResult.rows[0].id_rol],
      );

      const user = {
        ...createdUser,
        rol: 'PADRE' as const,
        roles: ['PADRE'],
        password_change_required: false,
      };
      const token = await persistSession(client, Number(user.id_usuario));
      await client.query('COMMIT');
      return { token, user, usuario: user, message: 'Usuario registrado exitosamente en PostgreSQL' };
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }

  async revokeSession(token?: string): Promise<void> {
    if (!token) return;
    await pool.query(
      `UPDATE sesiones_autenticacion
       SET revocado = true, fecha_cierre = NOW(), ultima_actividad = NOW()
       WHERE token_hash = $1 AND revocado = false;`,
      [hashSessionToken(token)],
    );
  }

  async getCurrentUser(user: any) {
    return user;
  }
}

export const authService = new AuthService();
