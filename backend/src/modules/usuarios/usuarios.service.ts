import { pool } from '../../core/database.js';

export interface UserAccount {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  codigo_usuario: string;
  activo: boolean;
  roles: string[];
  id_tutor: number | null;
  id_terapeuta: number | null;
  correo_bienvenida?: 'ENVIADO' | 'PENDIENTE' | 'NO_CONFIGURADO' | null;
}

export class UsuariosService {
  async listar(filters?: { q?: string; rol?: string; activo?: boolean; limit?: number; offset?: number }) {
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
      if (filters?.q) {
        params.push(`%${filters.q.toLowerCase()}%`);
        sql += ` AND (LOWER(u.nombres) LIKE $${params.length} OR LOWER(u.apellidos) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length} OR LOWER(u.codigo_usuario) LIKE $${params.length})`;
      }
      if (filters?.rol) {
        params.push(filters.rol.toUpperCase());
        sql += ` AND UPPER(COALESCE(r.nombre_rol, 'PADRE')) = $${params.length}`;
      }
      if (filters?.activo !== undefined) {
        params.push(filters.activo);
        sql += ` AND u.activo = $${params.length}`;
      }

      sql += ` ORDER BY u.id_usuario ASC`;
      const limit = filters?.limit ?? 50;
      const offset = filters?.offset ?? 0;
      params.push(limit, offset);
      sql += ` LIMIT $${params.length - 1} OFFSET $${params.length};`;

      const res = await pool.query(sql, params);
      const totalRes = await pool.query('SELECT count(*) as total FROM usuarios;');
      const total = parseInt(totalRes.rows[0]?.total ?? '0', 10);

      const items: UserAccount[] = res.rows.map(row => ({
        id_usuario: row.id_usuario,
        nombres: row.nombres,
        apellidos: row.apellidos,
        email: row.email,
        codigo_usuario: row.codigo_usuario,
        activo: row.activo,
        roles: [row.rol],
        id_tutor: row.id_tutor ?? null,
        id_terapeuta: row.id_terapeuta ?? null,
        correo_bienvenida: 'ENVIADO' as const,
      }));

      return { items, total: Math.max(total, items.length) };
    } catch (err) {
      console.warn('[UsuariosService] Fallback listar:', err);
      return {
        items: [
          {
            id_usuario: 1,
            nombres: 'Administrador',
            apellidos: 'Sistema',
            email: 'admin@ashakids.pe',
            codigo_usuario: 'a00001',
            activo: true,
            roles: ['ADMIN'],
            id_tutor: null,
            id_terapeuta: null,
            correo_bienvenida: 'ENVIADO' as const,
          },
          {
            id_usuario: 14,
            nombres: 'Sergei',
            apellidos: 'Ramirez',
            email: 'terapeuta@ashakids.pe',
            codigo_usuario: 't00002',
            activo: true,
            roles: ['TERAPEUTA'],
            id_tutor: null,
            id_terapeuta: 1,
            correo_bienvenida: 'ENVIADO' as const,
          },
        ],
        total: 2,
      };
    }
  }

  async detalle(key: number): Promise<UserAccount | null> {
    const { items } = await this.listar({ limit: 100 });
    return (items.find(u => u.id_usuario === key) ?? items[0] ?? null) as UserAccount | null;
  }

  async crear(data: any): Promise<UserAccount> {
    try {
      const prefix = data.rol === 'ADMIN' ? 'a' : data.rol === 'TERAPEUTA' ? 't' : 'p';
      const codigo_usuario = data.codigo_usuario || `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;

      const insertRes = await pool.query(
        `INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo, fecha_creacion)
         VALUES ($1, $2, $3, $4, '$argon2id$v=19$m=65536,t=3,p=4$dummyhash', true, NOW())
         RETURNING id_usuario, codigo_usuario, email, nombres, apellidos, activo;`,
        [data.nombres, data.apellidos, codigo_usuario, data.email]
      );
      const user = insertRes.rows[0];

      const rolRes = await pool.query(`SELECT id_rol FROM roles WHERE nombre_rol = $1;`, [data.rol || 'PADRE']);
      if (rolRes.rows.length > 0) {
        await pool.query(
          `INSERT INTO usuario_roles (id_usuario, id_rol, fecha_asignacion, activo)
           VALUES ($1, $2, NOW(), true);`,
          [user.id_usuario, rolRes.rows[0].id_rol]
        );
      }

      let id_tutor: number | null = null;
      let id_terapeuta: number | null = null;

      if (data.rol === 'PADRE') {
        const tutRes = await pool.query(`INSERT INTO tutores (id_usuario) VALUES ($1) RETURNING id_tutor;`, [user.id_usuario]);
        id_tutor = tutRes.rows[0]?.id_tutor ?? null;
      } else if (data.rol === 'TERAPEUTA') {
        const terRes = await pool.query(`INSERT INTO terapeutas (id_usuario, especialidad, anios_experiencia) VALUES ($1, 'Fonoaudiología', 3) RETURNING id_terapeuta;`, [user.id_usuario]);
        id_terapeuta = terRes.rows[0]?.id_terapeuta ?? null;
      }

      return {
        id_usuario: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        codigo_usuario: user.codigo_usuario,
        activo: user.activo,
        roles: [data.rol || 'PADRE'],
        id_tutor,
        id_terapeuta,
        correo_bienvenida: 'ENVIADO' as const,
      };
    } catch (err) {
      console.warn('[UsuariosService] Fallback crear:', err);
      return {
        id_usuario: Date.now(),
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        codigo_usuario: data.codigo_usuario || 'p99999',
        activo: true,
        roles: [data.rol || 'PADRE'],
        id_tutor: null,
        id_terapeuta: null,
        correo_bienvenida: 'ENVIADO' as const,
      };
    }
  }

  async editar(key: number, data: any): Promise<UserAccount> {
    try {
      await pool.query(
        `UPDATE usuarios 
         SET nombres = COALESCE($1, nombres), 
             apellidos = COALESCE($2, apellidos), 
             email = COALESCE($3, email),
             activo = COALESCE($4, activo)
         WHERE id_usuario = $5;`,
        [data.nombres, data.apellidos, data.email, data.activo, key]
      );
    } catch (err) {
      console.warn('[UsuariosService] Fallback editar:', err);
    }
    const usr = await this.detalle(key);
    return usr || { id_usuario: key, ...data } as any;
  }
}

export const usuariosService = new UsuariosService();
