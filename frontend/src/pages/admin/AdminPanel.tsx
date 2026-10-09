import type { View } from "@/types/navigation";
import { OperationalDashboard } from "@/components/common/OperationalDashboard";

export function AdminPanel({ go }: { go: (v: View) => void }) {
  return <OperationalDashboard go={go} mode="admin" />;
}
