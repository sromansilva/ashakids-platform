/**
 * Página principal de dashboard para el rol TERAPEUTA.
 * Protegida con RoleRoute ('TERAPEUTA').
 */

import React from "react";
import { View } from "@/shared/domain/types/navigation";
import { TerapeutaHome } from "@/modules/terapeuta/presentation/TerapeutaHome";
import { RoleRoute } from "@/core/router/RoleRoute";

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
