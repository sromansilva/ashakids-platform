import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/modules/auth/application/AuthContext";
import { ChildProvider } from "@/modules/padre/application/ChildContext";
import { queryClient } from "./queryClient";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ChildProvider>{children}</ChildProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
