import type { View } from '@/shared/domain/types/navigation';
import { ComingSoon } from '@/shared/presentation/components/common/ComingSoon';
export function TerapeutaDatosActividad(_props: { go: (v: View) => void }) {
  return <ComingSoon title="Datos de actividad · Mundo ASHA" description="Aquí podrás consultar los registros de actividad de tus pacientes cuando estén disponibles."/>;
}
