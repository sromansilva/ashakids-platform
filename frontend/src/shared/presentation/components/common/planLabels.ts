import type { WorldArea } from '@/modules/clinica/domain/clinical';

export const areaLabels: Record<WorldArea, string> = {
  FLUIDEZ: 'Fluidez y ritmo',
  HABLA: 'Habla y articulación',
  LENGUAJE: 'Comprensión y expresión',
  VOZ: 'Voz',
  OROFACIAL: 'Motricidad orofacial',
};

export const predictionDecisionLabels = {
  SUGERIDO: 'Pendiente de decisión',
  CONFIRMADO_CLINICO: 'Aceptado por el terapeuta',
  MODIFICADO_MANUAL: 'Ajustado manualmente por el terapeuta',
  DESCARTADO: 'No utilizado en el plan',
} as const;
