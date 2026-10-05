/**
 * Componente contenedor que restringe el acceso a usuarios autenticados.
 */

import React from "react";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRedirectToLogin?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  onRedirectToLogin,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAF9]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#7C3AED] border-t-transparent" />
          <p className="text-sm font-semibold text-[#6B5E8A]">
            Verificando sesión segura...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (onRedirectToLogin) {
      onRedirectToLogin();
      return null;
    }
    return (
      fallback || (
        <div className="flex h-screen items-center justify-center p-6 text-center bg-[#FAFAF9]">
          <div className="max-w-md rounded-2xl border border-[#E8E5F4] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-black text-[#1C1135]">
              Acceso Restringido
            </h2>
            <p className="mt-2 text-sm text-[#6B5E8A]">
              Debes iniciar sesión para acceder a esta área de ASHAKids.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};
