/**
 * Página pública de Mundo ASHA (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/shared/domain/types/navigation";
import { PublicMundo } from "@/modules/public/presentation/Public/PublicMundo";

interface MundoASHAPageProps {
  go: (v: View) => void;
}

export const MundoASHAPage: React.FC<MundoASHAPageProps> = ({ go }) => {
  return <PublicMundo go={go} />;
};
