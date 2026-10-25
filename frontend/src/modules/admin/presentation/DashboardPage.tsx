/**
 * Página principal de dashboard para el rol ADMIN.
 * Protegida con RoleRoute ('ADMIN').
 */

import React from "react";
import { View } from "@/shared/domain/types/navigation";
import { AdminPanel } from "@/modules/admin/presentation/AdminPanel";
import { RoleRoute } from "@/core/router/RoleRoute";

interface AdminDashboardPageProps {
  go: (v: View) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  go,
}) => {
  return (
    <RoleRoute allowedRole="ADMIN">
      <AdminPanel go={go} />
    </RoleRoute>
  );
};
