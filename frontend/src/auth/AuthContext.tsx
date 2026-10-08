/**
 * Contexto de autenticación para la gestión de sesión con FastAPI.
 */

import React, { createContext, useCallback, useEffect, useState, useRef } from "react";
import { authService } from "@/services/authService";
import { LoginCredentials, SemanticRole, User } from "@/types/auth";

interface AuthContextValue {
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

  const refreshUser = useCallback(async () => {
    const version = ++requestVersion.current;
    try {
      const currentUser = await authService.getCurrentUser();
      if (version === requestVersion.current) setUser(currentUser);
    } catch {
      if (version === requestVersion.current) setUser(null);
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const expire = () => { requestVersion.current++; setUser(null); setIsLoading(false); };
    window.addEventListener("ashakids:session-expired", expire);
    return () => window.removeEventListener("ashakids:session-expired", expire);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const version = ++requestVersion.current;
    const res = await authService.login(credentials);
    if (version === requestVersion.current) setUser(res.user);
    return res.user;
  };

  const logout = async (): Promise<void> => {
    ++requestVersion.current;
    setIsLoading(true);
    try {
      await authService.logout();
    } catch {
      // Ignorar errores al cerrar sesión si el token ya expiró
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
