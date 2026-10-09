/**
 * Página pública Sobre Nosotros (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/types/navigation";
import { PublicNosotros } from "@/pages/public/Public/PublicNosotros";

interface AboutUsPageProps {
  go: (v: View) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ go }) => {
  return <PublicNosotros go={go} />;
};
