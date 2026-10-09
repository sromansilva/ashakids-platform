import { useState } from "react";
import { Eye, Search, CheckCircle, X, RefreshCw, Trash2 } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";
import { usersService } from "@/services/clinicalService";
import { useRemote, useWrite } from "@/hooks/useRemoteData";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import { Btn } from "@/components/common/Btn";
import { UserEditor } from "./UserEditor";
import type { Account } from "@/types/clinical";

export function AdminUsuarios() {
  type UserRecord = { id: number; name: string; code: string; role: string; email: string; status: string; date: string; };

  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState<Account | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [viewingUser, setViewingUser] = useState<UserRecord | null>(null);
  const list = useRemote(["users", search, roleFilter, offset], signal => usersService.list({ q: search, rol: roleFilter === "todos" ? undefined : roleFilter.toUpperCase(), offset }, signal));
  const users: UserRecord[] = (list.data?.items ?? []).map(u => ({ id: u.id_usuario, name: `${u.nombres} ${u.apellidos}`, code: u.codigo_usuario, role: u.roles[0]?.toLowerCase() ?? "", email: u.email, status: u.activo ? "activo" : "inactivo", date: "—" }));
  const toggle = useWrite((id: number) => usersService.edit(id, { activo: !list.data?.items.find(u => u.id_usuario === id)?.activo }));
  const detail = useRemote(["user", viewingUser?.id], signal => usersService.get(viewingUser!.id, signal), !!viewingUser);

  const filtered = users.filter(u =>
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.code.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === "todos" || u.role === roleFilter)
  );
  const roleColor: Record<string, "violet" | "teal" | "orange"> = { padre: "violet", terapeuta: "teal", admin: "orange" };
  const roleAvColor: Record<string, string> = { padre: B.violet, terapeuta: B.teal, admin: B.orange };

  const openView = (u: UserRecord) => setViewingUser(u);
  const deleteUser = (id: number) => { if (window.confirm("¿Cambiar el estado de esta cuenta? Desactivar revoca sus sesiones.")) void toggle.submit(id); };
  const triggerReset = (id: number) => setEditing(list.data?.items.find(u => u.id_usuario === id) ?? null);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <RemoteFeedback pending={list.isPending} error={list.error || toggle.error} retry={() => void list.refetch()} />
      <Btn size="sm" onClick={() => setEditing("new")}>Crear usuario</Btn>
      {editing && <UserEditor user={editing === "new" ? undefined : editing} close={() => setEditing(null)} />}
      {/* ── Modal ver usuario (solo lectura) ── */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingUser(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-[calc(100vw-2rem)] max-w-md max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4] flex-shrink-0">
              <h2 className="font-extrabold text-[#1C1135] text-lg">Detalles del usuario</h2>
              <button onClick={() => setViewingUser(null)} className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1"><RemoteFeedback pending={detail.isPending} error={detail.error} retry={() => void detail.refetch()} />
              {([
                { label: "Usuario", value: viewingUser.name },
                { label: "Código", value: viewingUser.code },
                { label: "Rol", value: viewingUser.role },
                { label: "Correo electrónico", value: viewingUser.email },
                { label: "Estado", value: viewingUser.status },
                { label: "Fecha de registro", value: viewingUser.date },
              ] as { label: string; value: string }[]).map(f => (
                <div key={f.label}>
                  <label className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wider mb-1.5 block">{f.label}</label>
                  <div className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium bg-[#F5F3FF] text-[#1C1135]">
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-5">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Gestión de Usuarios</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">{list.data?.total ?? "—"} usuarios en la plataforma</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
          <input placeholder="Buscar por nombre o código…" value={search} onChange={e => { setSearch(e.target.value); setOffset(0); }}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 font-medium" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setOffset(0); }}
          className="px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm bg-white focus:outline-none font-bold text-[#1C1135]">
          <option value="todos">Todos los roles</option>
          <option value="padre">Padres</option>
          <option value="terapeuta">Terapeutas</option>
          <option value="admin">Administradores</option>
        </select>
      </div>
      <Crd>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F5F3FF]">
                {["Usuario", "Código", "Rol", "Email", "Estado", "Desde", ""].map(h => (
                  <th key={h} className="text-left text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-[#9E95B7] font-medium">Sin resultados</td>
                </tr>
              )}
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-[#FAFAF9] hover:bg-[#F5F3FF] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Av initials={user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)} color={roleAvColor[user.role] || B.textMid} size="sm" />
                      <span className="text-sm font-extrabold text-[#1C1135]">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm font-bold text-[#7C6F9A]">{user.code}</td>
                  <td className="px-5 py-3.5"><Bdg color={roleColor[user.role] || "gray"}>{user.role}</Bdg></td>
                  <td className="px-5 py-3.5 text-sm text-[#7C6F9A] font-medium">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: user.status === "activo" ? "#D1FAE5" : "#FEE2E2", color: user.status === "activo" ? "#059669" : "#DC2626" }}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#9E95B7] font-medium">{user.date}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      <button onClick={() => openView(user)} title="Ver usuario"
                        className="p-1.5 hover:bg-violet-50 rounded-xl text-[#9E95B7] hover:text-violet-600 transition-colors"><Eye size={14} /></button>
                      <button onClick={() => triggerReset(user.id)} className="p-1.5 hover:bg-orange-50 rounded-xl text-[#9E95B7] hover:text-orange-500 transition-colors" title="Editar usuario y contraseña"><RefreshCw size={14} /></button>
                      <button onClick={() => deleteUser(user.id)} disabled={toggle.isPending} title="Activar o desactivar usuario"
                        className="p-1.5 hover:bg-red-50 rounded-xl text-[#9E95B7] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#F5F3FF] flex items-center justify-between text-sm flex-wrap gap-2">
          <span className="text-[#9E95B7] font-medium">Mostrando {filtered.length} de {list.data?.total ?? 0} usuarios</span>
          <div className="flex gap-1">
            {["Anterior", "1", "Siguiente"].map((l, i) => (
              <button key={l} disabled={i === 0 ? offset === 0 : i === 2 ? offset + 20 >= (list.data?.total ?? 0) : true} onClick={() => setOffset(value => Math.max(0, value + (i === 0 ? -20 : 20)))} className="px-3 py-1.5 rounded-xl text-sm font-bold transition-colors"
                style={{ background: i === 1 ? B.violet : "white", color: i === 1 ? "white" : B.textMid, border: i !== 1 ? `1px solid ${B.border}` : "none" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </Crd>
    </div>
  );
}
