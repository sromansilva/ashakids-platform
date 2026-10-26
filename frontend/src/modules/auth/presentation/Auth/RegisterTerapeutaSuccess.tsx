import type { View } from "@/shared/domain/types/navigation";
import { AccountAccessInfo } from "./AccountAccessInfo";

export function RegisterTerapeutaSuccess({ go }: { go: (v: View) => void }) {
  return <AccountAccessInfo go={go} mode="registration" audience="terapeuta" />;
}
