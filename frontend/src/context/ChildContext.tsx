/**
 * Contexto de gestión y sincronización del paciente infantil (hijo) activo.
 * Proporciona el estado del hijo seleccionado a Centro Familiar, Mi Camino ASHA y Header.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "@/auth/AuthContext";
import { pacientesService } from "@/services/pacientesService";
import { PacienteItem } from "@/types/pacientes";

interface ChildContextValue {
  children: PacienteItem[];
  activeChild: PacienteItem | null;
  selectChild: (id_paciente: number) => void;
  isLoadingChildren: boolean;
  refreshChildren: () => Promise<void>;
  error: string | null;
}

const ChildContext = createContext<ChildContextValue | undefined>(undefined);

const SELECTED_CHILD_KEY = "ashakids_active_child_id";

export const ChildProvider: React.FC<{ children: React.ReactNode }> = ({
  children: componentChildren,
}) => {
  const auth = useContext(AuthContext);
  const [childrenList, setChildrenList] = useState<PacienteItem[]>([]);
  const [activeChild, setActiveChild] = useState<PacienteItem | null>(null);
  const [isLoadingChildren, setIsLoadingChildren] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isPadre = auth?.isAuthenticated && auth?.role === "PADRE";

  const refreshChildren = useCallback(async () => {
    if (!isPadre) {
      setChildrenList([]);
      setActiveChild(null);
      return;
    }

    setIsLoadingChildren(true);
    setError(null);
    try {
      const res = await pacientesService.getHijos();
      const activeList = (res.items || []).filter((c) => c.activo);
      setChildrenList(activeList);

      // Determinar selección activa
      const savedIdStr = sessionStorage.getItem(SELECTED_CHILD_KEY);
      const savedId = savedIdStr ? parseInt(savedIdStr, 10) : null;

      const matching = savedId
        ? activeList.find((c) => c.id_paciente === savedId)
        : null;

      if (matching) {
        setActiveChild(matching);
      } else if (activeList.length > 0) {
        setActiveChild(activeList[0]);
        sessionStorage.setItem(
          SELECTED_CHILD_KEY,
          String(activeList[0].id_paciente)
        );
      } else {
        setActiveChild(null);
        sessionStorage.removeItem(SELECTED_CHILD_KEY);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los hijos."
      );
    } finally {
      setIsLoadingChildren(false);
    }
  }, [isPadre]);

  useEffect(() => {
    refreshChildren();
  }, [refreshChildren]);

  const selectChild = useCallback(
    (id_paciente: number) => {
      const target = childrenList.find((c) => c.id_paciente === id_paciente);
      if (target) {
        setActiveChild(target);
        sessionStorage.setItem(SELECTED_CHILD_KEY, String(id_paciente));
      }
    },
    [childrenList]
  );

  return (
    <ChildContext.Provider
      value={{
        children: childrenList,
        activeChild,
        selectChild,
        isLoadingChildren,
        refreshChildren,
        error,
      }}
    >
      {componentChildren}
    </ChildContext.Provider>
  );
};

export function useChild(): ChildContextValue {
  const context = useContext(ChildContext);
  if (!context) {
    throw new Error("useChild debe ser utilizado dentro de un <ChildProvider>");
  }
  return context;
}
