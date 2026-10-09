import type { View } from "@/types/navigation";
import { AccountAccessInfo } from "./AccountAccessInfo";

export function Onboarding({ go }: { go: (v: View) => void; onComplete?: () => void }) {
  return <AccountAccessInfo go={go} mode="registration" />;
}
