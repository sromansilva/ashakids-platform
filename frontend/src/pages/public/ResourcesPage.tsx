/**
 * Página pública de Recursos (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/app/shared";
import { PublicRecursos } from "@/app/views/Public";

interface ResourcesPageProps {
  go: (v: View) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ go }) => {
  return <PublicRecursos go={go} />;
};
