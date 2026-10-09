import { FamilyTrackingPanel } from "@/components/common/FamilyTrackingPanel";
import type { View } from "@/types/navigation";
import type { PadreNotif } from "@/types/PadreNotif";

export function PadreHome({ go, padreUserName }: { go: (view: View) => void; padreUserName?: string; padrePlan?: "exploracion" | "familia"; extraNotifs?: PadreNotif[]; onNotifsRead?: () => void }) {
  return <FamilyTrackingPanel mode="home" go={go} familyName={padreUserName} />;
}
