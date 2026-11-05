import type { PlanData, WorldArea } from '@/modules/clinica/domain/clinical';

export type PlanFormState = Omit<PlanData, 'area' | 'codigo_diagnostico'> & {
  area: WorldArea | '';
  codigo_diagnostico: number | '';
};

export const emptyPlanForm = (): PlanFormState => ({
  nombre_tratamiento: '',
  descripcion: null,
  area: '',
  mundos_asignados: [],
  sesiones_recomendadas: 0,
  frecuencia_semanal: 0,
  fonemas_priorizados: [],
  codigo_diagnostico: '',
});

export const planSteps = ['Datos del plan', 'Línea base', 'Intervención', 'Recomendaciones'];

export const planInputClass = 'block w-full rounded-xl border border-[#E8E5F4] bg-white px-3 py-2.5 text-sm font-medium text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-violet-500';
