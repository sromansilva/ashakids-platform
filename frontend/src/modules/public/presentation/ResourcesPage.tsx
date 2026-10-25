/**
 * Página pública de Recursos (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/shared/domain/types/navigation";
import { PublicRecursos } from "@/modules/public/presentation/Public/PublicRecursos";

interface ResourcesPageProps {
  go: (v: View) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ go }) => {
  return <PublicRecursos go={go} />;
};
