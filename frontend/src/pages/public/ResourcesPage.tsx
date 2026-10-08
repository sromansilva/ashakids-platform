/**
 * Página pública de Recursos (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/types/navigation";
import { PublicRecursos } from "@/pages/public/Public/PublicRecursos";

interface ResourcesPageProps {
  go: (v: View) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ go }) => {
  return <PublicRecursos go={go} />;
};
