/** Compatibilidad con las reservas virtuales registradas antes de usar VIRTUAL. */
export function isVirtualModality(modalidad: unknown): boolean {
  return modalidad === 'VIRTUAL' || modalidad === 'ONLINE';
}
