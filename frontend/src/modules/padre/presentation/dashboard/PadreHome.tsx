import { FamilyCenter } from './FamilyCenter';
import type { View } from "@/shared/domain/types/navigation";
import type { PadreNotif } from "@/modules/padre/domain/PadreNotif";

export function PadreHome({ go, padreUserName }: { go: (view: View) => void; padreUserName?: string; padrePlan?: "exploracion" | "familia"; extraNotifs?: PadreNotif[]; onNotifsRead?: () => void }) {
  return <FamilyCenter go={go} familyName={padreUserName} />;
}
