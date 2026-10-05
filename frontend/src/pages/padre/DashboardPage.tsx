/**
 * Página principal de dashboard para el rol PADRE / TUTOR.
 * Protegida con RoleRoute ('PADRE').
 */

import React from "react";
import { RoleRoute } from "@/routes/RoleRoute";

interface PadreDashboardPageProps {
  children: React.ReactNode;
}

export const PadreDashboardPage: React.FC<PadreDashboardPageProps> = ({
  children,
}) => {
  return (
    <RoleRoute allowedRole="PADRE">
      {children}
    </RoleRoute>
  );
};
