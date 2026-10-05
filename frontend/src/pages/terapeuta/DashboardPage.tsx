/**
 * Página principal de dashboard para el rol TERAPEUTA.
 * Protegida con RoleRoute ('TERAPEUTA').
 */

import React from "react";
import { View } from "@/app/shared";
import { TerapeutaHome } from "@/app/views/Terapeuta";
import { RoleRoute } from "@/routes/RoleRoute";

interface TerapeutaDashboardPageProps {
  go: (v: View) => void;
}

export const TerapeutaDashboardPage: React.FC<TerapeutaDashboardPageProps> = ({
  go,
}) => {
  return (
    <RoleRoute allowedRole="TERAPEUTA">
      <TerapeutaHome go={go} />
    </RoleRoute>
  );
};
