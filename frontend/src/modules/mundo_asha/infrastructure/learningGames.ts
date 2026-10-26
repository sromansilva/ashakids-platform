import { apiClient } from '@/core/api/client';
import type { WorldArea } from '@/modules/clinica/domain/clinical';
export interface BasicLevel { number: number; title: string; prompt: string; choices: string[]; sequence: boolean }
export interface BasicWorld { id: WorldArea; version: string; name: string; description: string; levels: BasicLevel[] }
export type PublicWorld = Omit<BasicWorld, "levels"> & { levels: Pick<BasicLevel, "number">[] };
export interface WorldProgress extends BasicWorld { asignado: boolean; completados: number[]; intentos: number; medalla: boolean }
export interface GameProgress {
  id_paciente: number; version: string; experiencia: number; nivel: number;
  mundos: WorldProgress[]; medallas: { codigo: WorldArea; nombre: string; fecha: string }[];
  intentos_totales: number; experiencia_siguiente_nivel: number;
}
export interface AttemptData { clave_intento: string; version: string; nivel: number; respuestas: string[]; duracion_segundos: number; ayudas_usadas: number }
export interface AttemptResult { id_intento: number; correcto: boolean; experiencia_otorgada: number; repetido: boolean; resumen: GameProgress }
export const learningGames = {
  catalog: (signal?: AbortSignal) => apiClient.get<PublicWorld[]>('/juegos/catalogo', { signal }),
  progress: (patient: number, signal?: AbortSignal) => apiClient.get<GameProgress>(`/pacientes/${patient}/juegos`, { signal }),
  attempt: (patient: number, world: WorldArea, data: AttemptData) => apiClient.post<AttemptResult>(`/pacientes/${patient}/juegos/${world}/intentos`, data),
};
