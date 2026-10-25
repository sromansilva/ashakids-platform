import { useAuth } from "../../../modules/auth/application/useAuth";
import { useRemote } from "./useRemoteData";
import { padresService } from "@/modules/padre/infrastructure/padresService";
import { terapeutasService } from "@/modules/public/infrastructure/terapeutasService";
import { adminService } from "@/modules/admin/infrastructure/adminService";
export function useRoleProfile() {
  const { role } = useAuth();
  return useRemote(["profile", role], async () => role === "PADRE" ? padresService.getMe() : role === "TERAPEUTA" ? terapeutasService.getMe() : adminService.getMe());
}
