export type TerapeutaRole = 'TERAPEUTA';

export interface TerapeutaEntity {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  especialidad?: string;
  colegiatura?: string;
  activo: boolean;
}

