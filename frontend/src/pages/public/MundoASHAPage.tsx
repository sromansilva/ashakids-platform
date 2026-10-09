/**
 * Página pública de Mundo ASHA (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/types/navigation";
import { PublicMundo } from "@/pages/public/Public/PublicMundo";

interface MundoASHAPageProps {
  go: (v: View) => void;
}

export const MundoASHAPage: React.FC<MundoASHAPageProps> = ({ go }) => {
  return <PublicMundo go={go} />;
};
