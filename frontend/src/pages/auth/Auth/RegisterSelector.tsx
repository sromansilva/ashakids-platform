import type { View } from "@/types/navigation";
import { AccountAccessInfo } from "./AccountAccessInfo";

export function RegisterSelector({ go }: { go: (v: View) => void }) {
  return <AccountAccessInfo go={go} mode="registration" />;
}
