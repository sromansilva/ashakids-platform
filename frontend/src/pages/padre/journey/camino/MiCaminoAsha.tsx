import { FamilyTrackingPanel } from "@/components/common/FamilyTrackingPanel";
import type { View } from "@/types/navigation";

export function MiCaminoAsha({ go }: { go: (view: View) => void; padrePlan?: "exploracion" | "familia" }) {
  return <FamilyTrackingPanel mode="journey" go={go} />;
}
