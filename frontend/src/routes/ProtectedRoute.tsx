/**
 * Componente contenedor que restringe el acceso a usuarios autenticados.
 * Redirige a /login conservando la ubicación de origen si no hay sesión.
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAF9]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
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
    return fallback ? <>{fallback}</> : <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
