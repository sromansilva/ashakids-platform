import type { View } from "@/shared/domain/types/navigation";
import { OperationalDashboard } from "@/shared/presentation/components/common/OperationalDashboard";

export function AdminPanel({ go }: { go: (v: View) => void }) {
  return <OperationalDashboard go={go} mode="admin" />;
}
