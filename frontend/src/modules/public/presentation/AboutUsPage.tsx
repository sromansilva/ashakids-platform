/**
 * Página pública Sobre Nosotros (sin autenticación requerida).
 */

import React from "react";
import { View } from "@/shared/domain/types/navigation";
import { PublicNosotros } from "@/modules/public/presentation/Public/PublicNosotros";

interface AboutUsPageProps {
  go: (v: View) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ go }) => {
  return <PublicNosotros go={go} />;
};
