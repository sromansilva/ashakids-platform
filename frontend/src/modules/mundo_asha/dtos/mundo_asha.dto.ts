/**
 * Data Transfer Objects (DTOs) para Mundo Asha (Juegos y Actividades del Niño).
 */

export interface GuardarProgresoJuegoDTO {
  id_paciente: number;
  juego_slug: string;
  mundo: string;
  nivel: number;
  puntaje: number;
  aciertos: number;
  errores: number;
  duracion_segundos: number;
}

export interface ReconocimientoVozDTO {
  audio_base64: string;
  palabra_objetivo: string;
  idioma?: string;
}

export interface ResultadoVozDTO {
  reconocido: boolean;
  transcripcion: string;
  similitud: number;
  feedback: string;
}

export interface JuegoConfigDTO {
  mundo_id: string;
  nombre: string;
  niveles_desbloqueados: number;
  estrellas_obtenidas: number;
}

