/**
 * Página pública Sobre Nosotros (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/app/shared";
import { PublicNosotros } from "@/app/views/Public";

interface AboutUsPageProps {
  go: (v: View) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ go }) => {
  return <PublicNosotros go={go} />;
};
