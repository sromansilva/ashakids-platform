import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getRequiredRoleForPath } from "@/routes/paths";
import type { View } from "@/types/navigation";
import type { Role } from "@/types/navigation";
import { DashLayout } from "@/app/layouts/DashLayout";
import { titles } from "@/app/routeTitles";
import { isUpcomingModule } from "@/app/routeCapabilities";
import { ComingSoon } from '@/components/common/ComingSoon';

type Props = {
  view: View; role: Role; go: (view: View) => void; logout: () => void;
  padreUserName: string; padrePlan: "exploracion" | "familia";
};
export function PageFrame(props: Props) {
  const { pathname } = useLocation();
  const { role } = useAuth();
  const fullScreen = ["session/waiting", "session/active", "session/end"].includes(props.view);
  const content = isUpcomingModule(pathname) ? <ComingSoon title={titles[props.view] || 'ASHAKids'}/> : <Outlet />;
  if (!getRequiredRoleForPath(pathname, role) || fullScreen) return content;
  return <DashLayout {...props} cur={props.view} title={titles[props.view] || "ASHAKids"}>{content}</DashLayout>;
}
