/**
 * Página principal de dashboard para el rol ADMIN.
 * Protegida con RoleRoute ('ADMIN').
 */

import React from "react";
import { View } from "@/app/shared";
import { AdminPanel } from "@/app/views/Admin";
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
