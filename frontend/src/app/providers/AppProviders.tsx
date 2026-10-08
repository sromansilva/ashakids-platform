import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
export function AppProviders({ children }: { children: ReactNode }) {
  return <BrowserRouter><AuthProvider>{children}</AuthProvider></BrowserRouter>;
}
