import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getRequiredRoleForPath } from "@/routes/paths";
import type { View } from "@/types/navigation";
import type { Role } from "@/types/navigation";
import { DashLayout } from "@/app/layouts/DashLayout";
import { titles } from "@/app/routeTitles";

type Props = {
  view: View; role: Role; go: (view: View) => void; logout: () => void;
  padreUserName: string; padrePlan: "exploracion" | "familia";
};
export function PageFrame(props: Props) {
  const { pathname } = useLocation();
  const { role } = useAuth();
  const fullScreen = ["session/waiting", "session/active", "session/end"].includes(props.view);
  const demoNotice = <p className="bg-amber-50 text-amber-900 text-xs px-4 py-2" role="note">Demostración: las operaciones clínicas, registros y pagos aún no se guardan en el servidor.</p>;
  if (!getRequiredRoleForPath(pathname, role) || fullScreen) return <>{pathname.startsWith("/register") && demoNotice}<Outlet /></>;
  return <DashLayout {...props} cur={props.view} title={titles[props.view] || "ASHAKids"}>{demoNotice}<Outlet /></DashLayout>;
}
