/**
 * Contexto de autenticación para la gestión de sesión con FastAPI.
 */

import React, { createContext, useCallback, useEffect, useState, useRef } from "react";
import { authService } from "@/services/authService";
import { LoginCredentials, SemanticRole, User } from "@/types/auth";
import { ApiError } from "@/api/client";
import { clearIdentityData } from "@/app/providers/queryClient";

interface AuthContextValue {
  sessionError?: string | null;
  user: User | null;
  role: SemanticRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const requestVersion = useRef(0);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const version = ++requestVersion.current;
    setSessionError(null);
    setIsLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      if (version === requestVersion.current) setUser(currentUser);
    } catch (error) {
      if (version === requestVersion.current) {
        if (error instanceof ApiError && error.status === 401) { clearIdentityData(); setUser(null); }
        else setSessionError("No se pudo verificar la sesión. Comprueba la conexión e inténtalo nuevamente.");
      }
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const expire = () => { requestVersion.current++; clearIdentityData(); setUser(null); setSessionError(null); setIsLoading(false); };
    window.addEventListener("ashakids:session-expired", expire);
    return () => window.removeEventListener("ashakids:session-expired", expire);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    clearIdentityData();
    setSessionError(null);
    const version = ++requestVersion.current;
    const res = await authService.login(credentials);
    if (version === requestVersion.current) setUser(res.user);
    return res.user;
  };

  const logout = async (): Promise<void> => {
    ++requestVersion.current;
    setIsLoading(true);
    clearIdentityData();
    try {
      await authService.logout();
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        setSessionError("No se pudo cerrar la sesión en el servidor. Reintenta cuando vuelva la conexión.");
      }
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const role = user ? user.rol : null;
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
        sessionError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
