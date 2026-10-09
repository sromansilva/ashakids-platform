import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getRequiredRoleForPath } from "@/routes/paths";
import type { View } from "@/types/navigation";
import type { Role } from "@/types/navigation";
import { DashLayout } from "@/app/layouts/DashLayout";
import { titles } from "@/app/routeTitles";
import { capabilityNotice } from "@/app/routeCapabilities";

type Props = {
  view: View; role: Role; go: (view: View) => void; logout: () => void;
  padreUserName: string; padrePlan: "exploracion" | "familia";
};
export function PageFrame(props: Props) {
  const { pathname } = useLocation();
  const { role } = useAuth();
  const fullScreen = ["session/waiting", "session/active", "session/end"].includes(props.view);
  const notice = capabilityNotice(pathname);
  const demoNotice = notice && <p className="bg-amber-50 text-amber-900 text-sm px-4 py-3" role="note">{notice}</p>;
  if (!getRequiredRoleForPath(pathname, role) || fullScreen) return <>{notice && (pathname.startsWith("/mundo-asha") || pathname.startsWith("/session")) && demoNotice}<Outlet /></>;
  return <DashLayout {...props} cur={props.view} title={titles[props.view] || "ASHAKids"}>{demoNotice}<Outlet /></DashLayout>;
}
