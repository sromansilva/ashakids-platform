/**
 * Página pública de Mundo ASHA (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/app/shared";
import { PublicMundo } from "@/app/views/Public";

interface MundoASHAPageProps {
  go: (v: View) => void;
}

export const MundoASHAPage: React.FC<MundoASHAPageProps> = ({ go }) => {
  return <PublicMundo go={go} />;
};
