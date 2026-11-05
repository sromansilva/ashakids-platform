import { pool } from '../../../core/database.js';
import type { FiltrosSoporte, TicketSoporte, EstadoSoporte } from '../domain/soporte.js';

const normalizedState = `CASE
  WHEN estado IN ('NUEVA', 'ABIERTA') THEN 'RECIBIDA'
  WHEN estado IN ('LEIDA', 'LEÍDA', 'EN PROCESO', 'EN_PROCESO', 'EN_REVISION') THEN 'EN ATENCIÓN'
  WHEN estado IN ('ATENDIDA', 'SOLUCIONADA') THEN 'RESUELTA'
  ELSE estado END`;
const projection = `id_incidencia, ticket, tipo, solicitud AS descripcion, rol_solicitante,
  prioridad, ${normalizedState} AS estado, fecha_creacion, fecha_actualizacion`;

export const soporteRepository = {
  async listar(filters: FiltrosSoporte) {
    const values: unknown[] = [];
    const where = ["area_destino = 'SOPORTE_TECNICO'"];
    for (const [column, value] of [['estado', filters.estado], ['prioridad', filters.prioridad]] as const) {
      if (value !== undefined) { values.push(value); where.push(`${column === 'estado' ? normalizedState : column} = $${values.length}`); }
    }
    if (filters.search) {
      values.push(`%${filters.search.replace(/[\\%_]/g, '\\$&')}%`);
      where.push(`(ticket ILIKE $${values.length} OR tipo ILIKE $${values.length} OR solicitud ILIKE $${values.length})`);
    }
    const predicate = where.join(' AND ');
    const total = await pool.query<{ total: number }>(`SELECT COUNT(*)::int AS total FROM incidencias WHERE ${predicate}`, values);
    const result = await pool.query<TicketSoporte>(`SELECT ${projection} FROM incidencias WHERE ${predicate}
      ORDER BY prioridad DESC, fecha_creacion DESC, id_incidencia DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, filters.limit, filters.offset]);
    return { items: result.rows, total: total.rows[0].total };
  },
  async obtener(id: number) {
    const result = await pool.query<TicketSoporte>(`SELECT ${projection} FROM incidencias
      WHERE id_incidencia = $1 AND area_destino = 'SOPORTE_TECNICO'`, [id]);
    return result.rows[0];
  },
  async estado(id: number, estado: EstadoSoporte) {
    const result = await pool.query<TicketSoporte>(`UPDATE incidencias SET estado = $2, fecha_actualizacion = now()
      WHERE id_incidencia = $1 AND area_destino = 'SOPORTE_TECNICO' RETURNING ${projection}`, [id, estado]);
    return result.rows[0];
  },
};
