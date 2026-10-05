/**
 * Componente que restringe el acceso según el rol semántico del usuario (PADRE, TERAPEUTA, ADMIN).
 */

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { SemanticRole } from "@/types/auth";

interface RoleRouteProps {
  allowedRole: SemanticRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allowedRole,
  children,
  fallback,
}) => {
  const { role } = useAuth();

  if (role !== allowedRole) {
    return (
      fallback || (
        <div className="flex h-screen items-center justify-center p-6 text-center bg-[#FAFAF9]">
          <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <span className="text-3xl">🚫</span>
            <h2 className="mt-3 text-xl font-black text-[#1C1135]">
              Permisos Insuficientes
            </h2>
            <p className="mt-2 text-sm text-[#6B5E8A]">
              Tu rol actual ({role || "Sin sesión"}) no tiene autorización para
              acceder a la sección de {allowedRole}.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};
