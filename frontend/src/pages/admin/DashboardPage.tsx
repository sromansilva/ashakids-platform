/**
 * Página principal de dashboard para el rol ADMIN.
 * Protegida con RoleRoute ('ADMIN').
 */

import React from "react";
import { View } from "@/types/navigation";
import { AdminPanel } from "@/pages/admin/AdminPanel";
import { RoleRoute } from "@/routes/RoleRoute";

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
