import type { Request, Response, NextFunction } from 'express';
import { pool } from '../database.js';
import { settings } from '../config.js';
import { hashSessionToken } from '../security/session-token.js';

export type UserRole = 'ADMIN' | 'TERAPEUTA' | 'PADRE';

export interface AuthenticatedUser {
  id_usuario: number;
  codigo_usuario?: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: UserRole;
  roles: string[];
  activo?: boolean;
  password_change_required?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const validRoles: UserRole[] = ['ADMIN', 'TERAPEUTA', 'PADRE'];

export function getSessionToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7).trim() || undefined;
  const cookie = req.cookies?.[settings.SESSION_COOKIE_NAME];
  return typeof cookie === 'string' && cookie.length > 0 ? cookie : undefined;
}

function normalizeUserRole(rows: Array<Record<string, unknown>>): AuthenticatedUser | null {
  const row = rows[0];
  if (!row) return null;

  const roles = Array.from(new Set(rows.map((item) => item.nombre_rol).filter(
    (role): role is UserRole => typeof role === 'string' && validRoles.includes(role as UserRole),
  )));
  const primaryRole = validRoles.find((role) => roles.includes(role));
  if (!primaryRole) return null;

  return {
    id_usuario: Number(row.id_usuario),
    codigo_usuario: String(row.codigo_usuario ?? ''),
    email: String(row.email ?? ''),
    nombres: String(row.nombres ?? ''),
    apellidos: String(row.apellidos ?? ''),
    rol: primaryRole,
    roles,
    activo: Boolean(row.activo),
    password_change_required: Boolean(row.password_change_required),
  };
}

function parseDevelopmentToken(token: string): AuthenticatedUser | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (!parsed || typeof parsed !== 'object') return null;
    const candidate = parsed as Partial<AuthenticatedUser>;
    if (
      typeof candidate.id_usuario !== 'number' ||
      typeof candidate.email !== 'string' ||
      typeof candidate.nombres !== 'string' ||
      typeof candidate.apellidos !== 'string' ||
      !validRoles.includes(candidate.rol as UserRole) ||
      !Array.isArray(candidate.roles) ||
      !candidate.roles.every((role) => typeof role === 'string' && validRoles.includes(role as UserRole))
    ) return null;
    return candidate as AuthenticatedUser;
  } catch {
    return null;
  }
}

function sendUnauthorized(res: Response): void {
  res.status(401).json({ error: 'No autenticado. Token o sesión válida requerida.' });
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = getSessionToken(req);

  if (!token) {
    const mockRole = req.headers['x-mock-role'];
    if (settings.ENVIRONMENT !== 'production' && typeof mockRole === 'string' && validRoles.includes(mockRole.toUpperCase() as UserRole)) {
      const role = mockRole.toUpperCase() as UserRole;
      req.user = {
        id_usuario: 1,
        email: 'mock@ashakids.pe',
        nombres: 'Mock',
        apellidos: 'User',
        rol: role,
        roles: [role],
        activo: true,
      };
      next();
      return;
    }
    sendUnauthorized(res);
    return;
  }

  try {
    const result = await pool.query(
      `SELECT u.id_usuario, u.codigo_usuario, u.email, u.nombres, u.apellidos,
              u.activo, u.password_change_required, r.nombre_rol
       FROM sesiones_autenticacion s
       JOIN usuarios u ON u.id_usuario = s.id_usuario
       LEFT JOIN usuario_roles ur ON ur.id_usuario = u.id_usuario AND ur.activo = true
       LEFT JOIN roles r ON r.id_rol = ur.id_rol
       WHERE s.token_hash = $1
         AND s.revocado = false
         AND s.fecha_expiracion > NOW()
         AND u.activo = true;`,
      [hashSessionToken(token)],
    );

    const sessionUser = normalizeUserRole(result.rows as Array<Record<string, unknown>>);
    if (sessionUser) {
      req.user = sessionUser;
      next();
      return;
    }

    if (settings.ENVIRONMENT !== 'production') {
      const legacyUser = parseDevelopmentToken(token);
      if (legacyUser) {
        req.user = legacyUser;
        next();
        return;
      }
    }

    sendUnauthorized(res);
  } catch (err) {
    // A database outage must never turn an invalid or expired credential into access.
    next(err);
  }
}

export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = getSessionToken(req);

  if (!token) {
    const mockRole = req.headers['x-mock-role'];
    if (settings.ENVIRONMENT !== 'production' && typeof mockRole === 'string' && validRoles.includes(mockRole.toUpperCase() as UserRole)) {
      const role = mockRole.toUpperCase() as UserRole;
      req.user = {
        id_usuario: 1,
        email: 'mock@ashakids.pe',
        nombres: 'Mock',
        apellidos: 'User',
        rol: role,
        roles: [role],
        activo: true,
      };
    }
    return next();
  }

  try {
    const result = await pool.query(
      `SELECT u.id_usuario, u.codigo_usuario, u.email, u.nombres, u.apellidos,
              u.activo, u.password_change_required, r.nombre_rol
       FROM sesiones_autenticacion s
       JOIN usuarios u ON u.id_usuario = s.id_usuario
       LEFT JOIN usuario_roles ur ON ur.id_usuario = u.id_usuario AND ur.activo = true
       LEFT JOIN roles r ON r.id_rol = ur.id_rol
       WHERE s.token_hash = $1
         AND s.revocado = false
         AND s.fecha_expiracion > NOW()
         AND u.activo = true;`,
      [hashSessionToken(token)],
    );

    const sessionUser = normalizeUserRole(result.rows as Array<Record<string, unknown>>);
    if (sessionUser) {
      req.user = sessionUser;
      return next();
    }

    if (settings.ENVIRONMENT !== 'production') {
      const legacyUser = parseDevelopmentToken(token);
      if (legacyUser) {
        req.user = legacyUser;
        return next();
      }
    }

    return next();
  } catch {
    return next();
  }
}

export function requireRoles(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Acceso no autorizado.' });
      return;
    }

    const hasRole = roles.includes(req.user.rol) || req.user.roles.some((role) => roles.includes(role as UserRole));
    if (!hasRole) {
      res.status(403).json({ error: 'Permisos insuficientes para este recurso.' });
      return;
    }

    next();
  };
}
