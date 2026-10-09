import { QueryClient } from "@tanstack/react-query";
import { invalidateIdentityRequests } from "@/api/client";

export const queryClient = new QueryClient({ defaultOptions: {
  queries: { retry: false, staleTime: 15_000, refetchOnWindowFocus: false },
  mutations: { retry: false },
} });

export function clearIdentityData() {
  invalidateIdentityRequests();
  void queryClient.cancelQueries();
  queryClient.clear();
}
