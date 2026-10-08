import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { ChildProvider } from "@/context/ChildContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChildProvider>{children}</ChildProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
