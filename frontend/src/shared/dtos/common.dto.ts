/**
 * DTOs comunes y compartidos de la plataforma.
 */

export interface ApiResponseDTO<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginacionParamsDTO {
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
}

export interface PaginacionMetaDTO {
  total: number;
  page: number;
  limit: number;
  total_paginas: number;
}

