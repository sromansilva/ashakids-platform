/**
 * Página pública de Especialistas (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/app/shared";
import { PublicEspecialistas } from "@/app/views/Public";

interface SpecialistsPageProps {
  go: (v: View) => void;
}

export const SpecialistsPage: React.FC<SpecialistsPageProps> = ({ go }) => {
  return <PublicEspecialistas go={go} />;
};
