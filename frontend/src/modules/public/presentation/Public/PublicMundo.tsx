import { Navigate } from 'react-router-dom';
import type { View } from '@/shared/domain/types/navigation';
// Keep historical public links; AppRouter still serves the family module to PADRE.
export function PublicMundo(_props: { go: (v: View) => void }) {
  return <Navigate to="/#landing-worlds" replace/>;
}
