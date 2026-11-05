import { pool } from '../../../core/database.js';
import type { NotaIncidencia } from '../domain/nota.js';

export const notasRepository = {
  async listar(id: number, includeInternal: boolean) {
    const result = await pool.query<NotaIncidencia>(`SELECT id_nota, contenido, interna, fecha_creacion,
      CASE WHEN interna THEN 'Nota interna de soporte' ELSE 'Respuesta de soporte' END AS autor
      FROM incidencia_notas WHERE id_incidencia = $1 AND ($2::boolean OR interna = false) ORDER BY id_nota`, [id, includeInternal]);
    return result.rows;
  },
  async agregar(id: number, autorId: number, contenido: string, interna: boolean) {
    const result = await pool.query<NotaIncidencia>(`WITH inserted AS (
      INSERT INTO incidencia_notas (id_incidencia, id_autor, contenido, interna)
      VALUES ($1, $2, $3, $4) RETURNING id_nota, contenido, interna, fecha_creacion
    ) SELECT *, CASE WHEN interna THEN 'Nota interna de soporte' ELSE 'Respuesta de soporte' END AS autor FROM inserted`,
    [id, autorId, contenido, interna]);
    return result.rows[0];
  },
};
