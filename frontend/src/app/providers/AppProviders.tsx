import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
export function AppProviders({ children }: { children: ReactNode }) {
  return <BrowserRouter><QueryClientProvider client={queryClient}><AuthProvider>{children}</AuthProvider></QueryClientProvider></BrowserRouter>;
}
