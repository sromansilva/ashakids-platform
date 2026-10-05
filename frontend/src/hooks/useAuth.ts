/**
 * Hook para consumir el estado y acciones de autenticación.
 */

import { useContext } from "react";
import { AuthContext } from "@/auth/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}
