import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.string().optional().default('1').transform((v) => Math.max(1, parseInt(v, 10))),
  limit: z.string().optional().default('20').transform((v) => Math.min(100, Math.max(1, parseInt(v, 10)))),
  search: z.string().optional(),
  sort_by: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type PaginationQueryDTO = z.infer<typeof paginationQuerySchema>;

export interface ApiResponseDTO<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResultDTO<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_paginas: number;
}

