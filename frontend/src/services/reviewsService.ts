import { apiClient, ApiError, type QueryParams } from '@/api/client';

export interface SessionReview {
  id_valoracion: number; id_sesion: number; calificacion: number;
  comentario: string | null; fecha_creacion: string;
}
export interface TherapistReview extends SessionReview { autor_nombre: string; fecha_sesion: string }
export const reviewsService = {
  list: (params?: QueryParams, signal?: AbortSignal) => apiClient.page<TherapistReview>('/valoraciones', params, signal),
  get: (id: number, signal?: AbortSignal) => apiClient.get<SessionReview | null>(`/sesiones/${id}/valoracion`, { signal }),
  create: (id: number, calificacion: number, comentario: string) => apiClient.post<SessionReview>(`/sesiones/${id}/valoracion`, { calificacion, comentario: comentario.trim() || null }),
};
export const reviewsPending = (error: unknown) => error instanceof ApiError && error.status === 503 && error.message === 'Valoraciones: próximamente.';
