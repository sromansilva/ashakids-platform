/**
 * Página pública de Especialistas (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/shared/domain/types/navigation";
import { PublicEspecialistas } from "@/modules/public/presentation/Public/PublicEspecialistas";

interface SpecialistsPageProps {
  go: (v: View) => void;
}

export const SpecialistsPage: React.FC<SpecialistsPageProps> = ({ go }) => {
  return <PublicEspecialistas go={go} />;
};
