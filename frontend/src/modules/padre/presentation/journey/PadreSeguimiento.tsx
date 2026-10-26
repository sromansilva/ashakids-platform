import type { View } from "@/shared/domain/types/navigation";
import { FamilyTrackingPanel } from "@/shared/presentation/components/common/FamilyTrackingPanel";

export function PadreSeguimiento({ go }: { go: (v: View) => void }) {
  return <FamilyTrackingPanel go={go} mode="journey" />;
}
