import { FamilyCenter } from './FamilyCenter';
import type { View } from "@/types/navigation";
import type { PadreNotif } from "@/types/PadreNotif";

export function PadreHome({ go, padreUserName }: { go: (view: View) => void; padreUserName?: string; padrePlan?: "exploracion" | "familia"; extraNotifs?: PadreNotif[]; onNotifsRead?: () => void }) {
  return <FamilyCenter go={go} familyName={padreUserName} />;
}
