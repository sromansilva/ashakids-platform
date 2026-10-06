/**
 * Página pública de Recursos (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/components/shared";
import { PublicRecursos } from "./Public";

interface ResourcesPageProps {
  go: (v: View) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ go }) => {
  return <PublicRecursos go={go} />;
};
