export type AdminRole = 'ADMIN';

export interface AdminEntity {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: AdminRole;
  activo: boolean;
}

