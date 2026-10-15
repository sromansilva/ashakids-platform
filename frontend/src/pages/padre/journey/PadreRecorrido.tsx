import type { View } from "@/types/navigation";
import { FamilyTrackingPanel } from "@/components/common/FamilyTrackingPanel";

export function PadreRecorrido({ go }: { go: (v: View) => void }) {
  return <FamilyTrackingPanel go={go} mode="journey" />;
}
