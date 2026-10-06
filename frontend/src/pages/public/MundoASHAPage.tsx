/**
 * Página pública de Mundo ASHA (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/components/shared";
import { PublicMundo } from "./Public";

interface MundoASHAPageProps {
  go: (v: View) => void;
}

export const MundoASHAPage: React.FC<MundoASHAPageProps> = ({ go }) => {
  return <PublicMundo go={go} />;
};
