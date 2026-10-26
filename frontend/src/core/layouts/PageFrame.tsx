import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/application/useAuth";
import { getRequiredRoleForPath } from "@/core/router/paths";
import type { View } from "@/shared/domain/types/navigation";
import type { Role } from "@/shared/domain/types/navigation";
import { DashLayout } from "@/core/layouts/DashLayout";
import { titles } from "@/core/router/routeTitles";
import { isUpcomingModule } from "@/core/router/routeCapabilities";
import { ComingSoon } from '@/shared/presentation/components/common/ComingSoon';

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
