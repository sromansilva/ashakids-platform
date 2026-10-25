import { FamilyTrackingPanel } from "@/shared/presentation/components/common/FamilyTrackingPanel";
import type { View } from "@/shared/domain/types/navigation";

export function MiCaminoAsha({ go }: { go: (view: View) => void; padrePlan?: "exploracion" | "familia" }) {
  return <FamilyTrackingPanel mode="journey" go={go} />;
}
