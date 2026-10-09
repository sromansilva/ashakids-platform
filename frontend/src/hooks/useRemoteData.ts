import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useAuth } from "./useAuth";

export function useRemote<T>(key: readonly unknown[], read: (signal: AbortSignal) => Promise<T>, enabled = true) {
  const { user } = useAuth();
  return useQuery({ queryKey: [user?.id_usuario, ...key], queryFn: ({ signal }) => read(signal),
    enabled: !!user && enabled });
}

/** Every domain write invalidates identity-scoped lists/counters; writes never retry. */
export function useWrite<T>(write: (data: T) => Promise<unknown>, onSuccess?: () => void) {
  const client = useQueryClient();
  const { user } = useAuth();
  const owner = user?.id_usuario;
  const current = useRef(owner);
  current.current = owner;
  const lock = useRef(false);
  const mutation = useMutation({ mutationFn: write, retry: false,
    onSuccess: async () => {
      if (current.current !== owner) return;
      await client.invalidateQueries({ queryKey: [owner] });
      onSuccess?.();
    },
  });
  const submit = async (data: T) => {
    if (lock.current) return;
    lock.current = true;
    try { await mutation.mutateAsync(data); } catch { /* Exposed through mutation.error, keep form. */ }
    finally { lock.current = false; }
  };
  return { ...mutation, submit };
}
