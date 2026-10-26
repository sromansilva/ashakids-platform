import type { View } from "@/shared/domain/types/navigation";
import { AccountAccessInfo } from "./AccountAccessInfo";

export function ForgotPassword({ go }: { go: (v: View) => void }) {
  return <AccountAccessInfo go={go} mode="recovery" />;
}
