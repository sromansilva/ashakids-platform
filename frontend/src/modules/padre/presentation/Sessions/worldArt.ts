import type { WorldArea } from '@/modules/clinica/domain/clinical';

export const worldArt: Record<WorldArea, { image: string; color: string; soft: string; label: string }> = {
  HABLA: { image: 'habla', color: '#6D28D9', soft: '#EDE9FE', label: 'Sonidos' },
  LENGUAJE: { image: 'lenguaje', color: '#0F766E', soft: '#CCFBF1', label: 'Palabras' },
  FLUIDEZ: { image: 'fluidez', color: '#9A3412', soft: '#FFEDD5', label: 'Ritmo' },
  VOZ: { image: 'voz', color: '#1D4ED8', soft: '#DBEAFE', label: 'Voz' },
  OROFACIAL: { image: 'orofacial', color: '#A21CAF', soft: '#FAE8FF', label: 'Gestos' },
};
