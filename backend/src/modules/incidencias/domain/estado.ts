export const estadosIncidencia = ['RECIBIDA', 'EN ATENCIÓN', 'RESUELTA'] as const;
export type EstadoIncidencia = typeof estadosIncidencia[number];

/** Read compatibility for historical rows; API writes accept only the three current states. */
export function normalizarEstadoPersistido(estado: string): EstadoIncidencia {
  if (['RECIBIDA', 'NUEVA', 'ABIERTA'].includes(estado)) return 'RECIBIDA';
  if (['EN ATENCIÓN', 'LEIDA', 'LEÍDA', 'EN PROCESO', 'EN_PROCESO', 'EN_REVISION'].includes(estado)) return 'EN ATENCIÓN';
  if (['RESUELTA', 'SOLUCIONADA', 'ATENDIDA'].includes(estado)) return 'RESUELTA';
  throw new Error('Estado de incidencia almacenado no reconocido.');
}
