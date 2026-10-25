import { IncidentForm } from '@/shared/presentation/components/common/IncidentForm';
import { View } from '@/shared/domain/types/navigation';
export function TerapeutaIncidencias({ go: _go }: { go: (v: View) => void }) { return <IncidentForm />; }
