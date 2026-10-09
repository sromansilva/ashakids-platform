import type { View } from "@/types/navigation";
import { AccountAccessInfo } from "./AccountAccessInfo";

export function RegisterPadre({ go }: { go: (v: View) => void; onNameSet?: (name: string) => void }) {
  return <AccountAccessInfo go={go} mode="registration" audience="familia" />;
}
