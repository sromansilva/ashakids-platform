export const incidentStates = ['RECIBIDA', 'EN ATENCIÓN', 'RESUELTA'] as const;
export type IncidentState = typeof incidentStates[number];
