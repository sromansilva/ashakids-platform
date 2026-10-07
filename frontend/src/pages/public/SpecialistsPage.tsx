/**
 * Página pública de Especialistas (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/components/shared";
import { PublicEspecialistas } from "./Public";

interface SpecialistsPageProps {
  go: (v: View) => void;
}

export const SpecialistsPage: React.FC<SpecialistsPageProps> = ({ go }) => {
  return <PublicEspecialistas go={go} />;
};
