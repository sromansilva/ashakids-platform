import { useAuth } from "./useAuth";
import { useRemote } from "./useRemoteData";
import { padresService } from "@/services/padresService";
import { terapeutasService } from "@/services/terapeutasService";
import { adminService } from "@/services/adminService";
export function useRoleProfile() {
  const { role } = useAuth();
  return useRemote(["profile", role], async () => role === "PADRE" ? padresService.getMe() : role === "TERAPEUTA" ? terapeutasService.getMe() : adminService.getMe());
}
