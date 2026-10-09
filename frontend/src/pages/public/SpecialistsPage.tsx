/**
 * Página pública de Especialistas (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/types/navigation";
import { PublicEspecialistas } from "@/pages/public/Public/PublicEspecialistas";

interface SpecialistsPageProps {
  go: (v: View) => void;
}

export const SpecialistsPage: React.FC<SpecialistsPageProps> = ({ go }) => {
  return <PublicEspecialistas go={go} />;
};
