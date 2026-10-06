import React, { useState } from "react";
import {
  FileText,
  Plus,
  Eye,
  Download,
  Search,
  CheckCircle,
  X,
  RefreshCw,
  Trash2,
  Shield,
  Edit,
  Activity,
  Send,
} from "lucide-react";
import { B, Btn, Crd, Bdg, Av, adminUsers } from "@/components/shared";

export const adminMonthly = [
  { mes: "Feb", usuarios: 142, citas: 68,  ingresos: 2400 },
  { mes: "Mar", usuarios: 189, citas: 79,  ingresos: 2900 },
  { mes: "Abr", usuarios: 215, citas: 85,  ingresos: 3100 },
  { mes: "May", usuarios: 263, citas: 91,  ingresos: 3500 },
  { mes: "Jun", usuarios: 298, citas: 97,  ingresos: 3900 },
  { mes: "Jul", usuarios: 342, citas: 112, ingresos: 4450 },
];

export function AdminReportes() {
  const [dateRange, setDateRange] = useState("julio");
  const reports = [
    { title: "Resumen ejecutivo plataforma",      date: "30 Jul 2026", type: "Ejecutivo",  rows: 142, status: "disponible" },
    { title: "Ingresos y facturación julio",      date: "30 Jul 2026", type: "Financiero", rows: 89,  status: "disponible" },
    { title: "Terapeutas — actividad y sesiones", date: "29 Jul 2026", type: "Terapeutas", rows: 48,  status: "disponible" },
    { title: "Usuarios nuevos por período",       date: "28 Jul 2026", type: "Usuarios",   rows: 42,  status: "disponible" },
    { title: "Sesiones virtuales",date: "27 Jul 2026", type: "Sesiones",   rows: 89,  status: "generando"  },
  ];
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Centro de Reportes</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Exportación y análisis de datos administrativos</p>
        </div>
        <Btn variant="primary" size="sm"><Plus size={13} /> Generar reporte</Btn>
      </div>
      {/* Filter row */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select value={dateRange} onChange={e => setDateRange(e.target.value)}
          className="px-4 py-2 rounded-2xl border text-sm font-bold text-[#1C1135] focus:outline-none focus:border-violet-400"
          style={{ borderColor: B.border }}>
          <option value="julio">Julio 2026</option>
          <option value="junio">Junio 2026</option>
          <option value="q2">Q2 2026</option>
        </select>
        <select className="px-4 py-2 rounded-2xl border text-sm font-bold text-[#7C6F9A] focus:outline-none focus:border-violet-400" style={{ borderColor: B.border }}>
          <option>Todos los terapeutas</option>
          <option>Dra. Ana Ruiz</option>
          <option>Lic. Carlos Mendoza</option>
        </select>
        <select className="px-4 py-2 rounded-2xl border text-sm font-bold text-[#7C6F9A] focus:outline-none focus:border-violet-400" style={{ borderColor: B.border }}>
          <option>Todas las especialidades</option>
          <option>Terapia de lenguaje</option>
          <option>Articulación y Fonología</option>
        </select>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "vs mes anterior", val: "+22%",   color: B.teal,    bg: B.tealLight   },
          { label: "Pagos julio",     val: "—",      color: B.violet,  bg: B.violetLight },
          { label: "Nuevos usuarios", val: "42",     color: "#059669", bg: "#D1FAE5"     },
          { label: "Asistencia",      val: "94%",    color: B.orange,  bg: B.orangeLight },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg }}>
            <p className="font-black text-xl text-[#1C1135] mb-0.5">{s.val}</p>
            <p className="text-xs font-bold" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <Crd>
        <div className="p-5 border-b" style={{ borderColor: B.border }}>
          <h4 className="font-extrabold text-[#1C1135]">Reportes disponibles</h4>
        </div>
        <div className="divide-y" style={{ borderColor: B.border }}>
          {reports.map((r, i) => (
            <div key={i} className="p-4 flex items-center gap-4 flex-wrap hover:bg-[#F5F3FF] transition-colors">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: B.violetLight }}>
                <FileText size={18} style={{ color: B.violet }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#1C1135]">{r.title}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{r.date} · {r.rows} registros · {r.type}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: r.status === "disponible" ? "#D1FAE5" : B.orangeLight, color: r.status === "disponible" ? "#059669" : B.orange }}>
                {r.status}
              </span>
              {r.status === "disponible" && (
                <div className="flex gap-1">
                  <Btn size="sm" variant="ghost"><Eye size={12} /> Ver</Btn>
                  <Btn size="sm" variant="ghost"><Download size={12} /> PDF</Btn>
                  <Btn size="sm" variant="ghost"><Download size={12} /> CSV</Btn>
                </div>
              )}
            </div>
          ))}
        </div>
      </Crd>
    </div>
  );
}

export function AdminUsuarios() {
  type UserRecord = { id: number; name: string; code: string; role: string; email: string; status: string; date: string; };

  const [users, setUsers] = useState<UserRecord[]>([...adminUsers]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [viewingUser, setViewingUser] = useState<UserRecord | null>(null);
  const [resetMsg, setResetMsg] = useState(false);

  const filtered = users.filter(u =>
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.code.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === "todos" || u.role === roleFilter)
  );
  const roleColor: Record<string, "violet" | "teal" | "orange"> = { padre: "violet", terapeuta: "teal", admin: "orange" };
  const roleAvColor: Record<string, string> = { padre: B.violet, terapeuta: B.teal, admin: B.orange };

  const openView = (u: UserRecord) => setViewingUser(u);
  const deleteUser = (id: number) => setUsers(prev => prev.filter(u => u.id !== id));
  const triggerReset = () => { setResetMsg(true); setTimeout(() => setResetMsg(false), 3500); };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* ── Toast: reset de contraseña ── */}
      {resetMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold whitespace-nowrap"
          style={{ background: "#D1FAE5", color: "#059669", border: "1px solid #6EE7B7" }}>
          <CheckCircle size={16} />
          Solicitud de reinicio de contraseña enviada al correo
        </div>
      )}

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
            <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
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
        <p className="text-sm text-[#7C6F9A] font-medium">{users.length} usuarios en la plataforma</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
          <input placeholder="Buscar por nombre o código…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 font-medium" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
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
                      <button onClick={triggerReset} className="p-1.5 hover:bg-orange-50 rounded-xl text-[#9E95B7] hover:text-orange-500 transition-colors" title="Reiniciar contraseña"><RefreshCw size={14} /></button>
                      <button onClick={() => deleteUser(user.id)} title="Eliminar usuario"
                        className="p-1.5 hover:bg-red-50 rounded-xl text-[#9E95B7] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#F5F3FF] flex items-center justify-between text-sm flex-wrap gap-2">
          <span className="text-[#9E95B7] font-medium">Mostrando {filtered.length} de {users.length} usuarios</span>
          <div className="flex gap-1">
            {["Anterior", "1", "Siguiente"].map((l, i) => (
              <button key={l} className="px-3 py-1.5 rounded-xl text-sm font-bold transition-colors"
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

export function AdminPacientes() {
  const [search, setSearch] = useState("");
  // Operational profiles only — no clinical records
  const perfiles = [
    { id: "PRF-001", initials: "M.G.", av: "MG", color: B.violet,  parent: "Laura Gómez",   therapist: "Dra. Ana Ruiz",       accountStatus: "activo",      consentimiento: "registrado",  vinculacion: "confirmada",  soporte: 0 },
    { id: "PRF-002", initials: "V.L.", av: "VL", color: B.teal,    parent: "Rosa López",    therapist: "Dra. Ana Ruiz",       accountStatus: "activo",      consentimiento: "registrado",  vinculacion: "confirmada",  soporte: 0 },
    { id: "PRF-003", initials: "B.R.", av: "BR", color: "#22C55E", parent: "Andrés Ríos",   therapist: "Dra. Ana Ruiz",       accountStatus: "alta próxima", consentimiento: "registrado", vinculacion: "confirmada",  soporte: 0 },
    { id: "PRF-004", initials: "F.T.", av: "FT", color: B.orange,  parent: "Claudia Torres",therapist: "Lic. Carlos Mendoza", accountStatus: "nuevo",        consentimiento: "pendiente",   vinculacion: "en revisión", soporte: 1 },
    { id: "PRF-005", initials: "S.V.", av: "SV", color: "#8B5CF6", parent: "Jorge Vargas",  therapist: "Dra. María Torres",   accountStatus: "activo",       consentimiento: "registrado",  vinculacion: "confirmada",  soporte: 0 },
    { id: "PRF-006", initials: "C.P.", av: "CP", color: "#EC4899", parent: "Sofía Ponce",   therapist: "Lic. Pedro Sánchez",  accountStatus: "nuevo",        consentimiento: "pendiente",   vinculacion: "pendiente",   soporte: 0 },
  ];
  const filtered = perfiles.filter(p =>
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.parent.toLowerCase().includes(search.toLowerCase()) ||
    p.therapist.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Restriction notice */}
      <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-5 border" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
        <Shield size={14} className="text-blue-500 flex-shrink-0" />
        <p className="text-xs font-medium text-blue-700">
          <span className="font-extrabold">Acceso administrativo limitado a información operativa.</span> El contenido clínico permanece restringido.
        </p>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Perfiles Vinculados</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">{perfiles.length} perfiles · Estado de cuenta, vinculación y consentimientos</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
          <input className="pl-9 pr-4 py-2 rounded-2xl border border-[#E8E5F4] text-sm bg-white focus:outline-none focus:border-violet-400 font-medium w-56"
            placeholder="Buscar por ID o tutor…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <Crd>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F5F3FF]">
                {["ID / Iniciales", "Representante", "Terapeuta vinculado", "Cuenta", "Consentimiento", "Soporte", ""].map(h => (
                  <th key={h} className="text-left text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-[#FAFAF9] hover:bg-[#F5F3FF] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Av initials={p.av} color={p.color} size="sm" />
                      <div>
                        <span className="text-sm font-extrabold text-[#1C1135]">{p.initials}</span>
                        <p className="text-xs text-[#9E95B7]">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#7C6F9A] font-medium">{p.parent}</td>
                  <td className="px-5 py-3.5 text-sm text-[#1C1135] font-medium">{p.therapist}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: p.accountStatus === "activo" ? "#D1FAE5" : p.accountStatus === "nuevo" ? B.orangeLight : B.tealLight, color: p.accountStatus === "activo" ? "#059669" : p.accountStatus === "nuevo" ? B.orange : B.teal }}>
                      {p.accountStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: p.consentimiento === "registrado" ? "#D1FAE5" : B.orangeLight, color: p.consentimiento === "registrado" ? "#059669" : B.orange }}>
                      {p.consentimiento}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {p.soporte > 0
                      ? <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: B.orangeLight, color: B.orange }}>{p.soporte} pendiente</span>
                      : <span className="text-xs text-[#9E95B7] font-medium">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="p-1.5 rounded-xl text-[#9E95B7] hover:text-violet-600 hover:bg-violet-50 transition-colors" title="Ver detalle operativo"><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Crd>
      <p className="text-xs text-[#9E95B7] font-medium mt-3 text-center italic">
        Expediente clínico, objetivos terapéuticos y notas de sesión son de acceso exclusivo del terapeuta y representante legal.
      </p>
    </div>
  );
}

export function AdminCitas() {
  const [statusFilter, setStatusFilter] = useState("todas");
  const citas = [
    { patient: "Mateo Gómez",     therapist: "Dra. Ana Ruiz",       date: "Hoy 09:00",   type: "Virtual",    status: "confirmada",  dur: "45 min", av: "MG", color: B.violet  },
    { patient: "Valentina López", therapist: "Dra. Ana Ruiz",       date: "Hoy 11:30",   type: "Presencial", status: "confirmada",  dur: "60 min", av: "VL", color: B.teal    },
    { patient: "Bruno Ríos",      therapist: "Dra. Ana Ruiz",       date: "Hoy 15:00",   type: "Virtual",    status: "confirmada",  dur: "45 min", av: "BR", color: "#22C55E" },
    { patient: "Fernanda Torres", therapist: "Lic. Carlos Mendoza", date: "Mañana 10:00",type: "Presencial", status: "pendiente",   dur: "60 min", av: "FT", color: B.orange  },
    { patient: "Sebastián Vargas",therapist: "Dra. María Torres",  date: "Jue 02 Ago",  type: "Virtual",    status: "pendiente",   dur: "45 min", av: "SV", color: "#8B5CF6" },
    { patient: "Camila Ponce",    therapist: "Lic. Pedro Sánchez", date: "Lun 28 Jul",  type: "Presencial", status: "cancelada",   dur: "60 min", av: "CP", color: "#EC4899" },
  ];
  const scMap: Record<string, {bg:string; color:string}> = {
    confirmada: { bg: "#D1FAE5", color: "#059669" },
    pendiente:  { bg: B.orangeLight, color: B.orange },
    cancelada:  { bg: "#FEE2E2", color: "#DC2626" },
  };
  const statuses = ["todas", "confirmada", "pendiente", "cancelada"];
  const filtered = statusFilter === "todas" ? citas : citas.filter(c => c.status === statusFilter);
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Gestión de Citas</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Calendario global de la plataforma</p>
        </div>
        <Btn variant="primary" size="sm"><Plus size={13} /> Revisar solicitudes</Btn>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Confirmadas", val: citas.filter(c=>c.status==="confirmada").length, color: "#059669", bg: "#D1FAE5"     },
          { label: "Pendientes",  val: citas.filter(c=>c.status==="pendiente").length,  color: B.orange,  bg: B.orangeLight },
          { label: "Canceladas",  val: citas.filter(c=>c.status==="cancelada").length,  color: "#DC2626", bg: "#FEE2E2"     },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: s.bg }}>
            <p className="font-black text-2xl text-[#1C1135]">{s.val}</p>
            <p className="text-xs font-bold mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {statuses.map(s => (
          <button key={s} className="px-3 py-1.5 rounded-2xl text-xs font-bold capitalize transition-all"
            style={{ background: statusFilter === s ? B.violet : B.violetLight, color: statusFilter === s ? "white" : B.textMid }}
            onClick={() => setStatusFilter(s)}>{s}</button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map((c, i) => {
          const sc = scMap[c.status] || { bg: B.violetLight, color: B.violet };
          return (
            <Crd key={i} className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Av initials={c.av} color={c.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-[#1C1135]">{c.patient}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium">con {c.therapist}</p>
                </div>
                <div className="text-xs text-[#7C6F9A] font-medium">{c.date} · {c.dur}</div>
                <Bdg color={c.type === "Virtual" ? "violet" : "gray"}>{c.type}</Bdg>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>{c.status}</span>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-xl text-[#9E95B7] hover:text-violet-600 hover:bg-violet-50 transition-colors"><Edit size={13} /></button>
                  <button className="p-1.5 rounded-xl text-[#9E95B7] hover:text-red-500 hover:bg-red-50 transition-colors"><X size={13} /></button>
                </div>
              </div>
            </Crd>
          );
        })}
      </div>
    </div>
  );
}

export function AdminSesiones() {
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  // Operational data only — no clinical content
  const sessions = [
    { id: "SES-2026-0741", therapistAv: "AR", therapistColor: B.violet,  started: "08:52", dur: "8 min",  quality: "excelente", type: "Virtual",    status: "activa",     latency: "42 ms",  incidents: 0 },
    { id: "SES-2026-0742", therapistAv: "CM", therapistColor: B.teal,    started: "09:00", dur: "2 min",  quality: "buena",     type: "Virtual",    status: "activa",     latency: "87 ms",  incidents: 0 },
    { id: "SES-2026-0743", therapistAv: "MT", therapistColor: "#EC4899", started: "08:45", dur: "17 min", quality: "excelente", type: "Virtual",    status: "activa",     latency: "38 ms",  incidents: 0 },
    { id: "SES-2026-0738", therapistAv: "AR", therapistColor: B.violet,  started: "15:00", dur: "45 min", quality: "excelente", type: "Virtual",    status: "finalizada", latency: "45 ms",  incidents: 0 },
    { id: "SES-2026-0735", therapistAv: "CM", therapistColor: B.teal,    started: "10:00", dur: "60 min", quality: "buena",     type: "Presencial", status: "finalizada", latency: "—",      incidents: 1 },
  ];
  const sel = selectedSession !== null ? sessions[selectedSession] : null;
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Operational restriction notice */}
      <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-5 border" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
        <Shield size={14} className="text-blue-500 flex-shrink-0" />
        <p className="text-xs font-medium text-blue-700">
          <span className="font-extrabold">Acceso administrativo limitado a información operativa.</span> El contenido clínico permanece restringido.
        </p>
      </div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Estado Técnico · ASHA Session</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Datos operativos de sesiones · Hoy · <span className="italic">Simulado para demostración</span></p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Activas ahora",    val: "3",      color: "#059669", bg: "#D1FAE5"     },
          { label: "Finalizadas hoy",  val: "9",      color: B.violet,  bg: B.violetLight },
          { label: "Duración promedio",val: "47 min", color: B.teal,    bg: B.tealLight   },
          { label: "Incidencias",      val: "1",      color: B.orange,  bg: B.orangeLight },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg }}>
            <p className="font-black text-2xl text-[#1C1135] mb-0.5">{s.val}</p>
            <p className="text-xs font-bold" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Crd>
            <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: B.border }}>
              <h3 className="font-extrabold text-[#1C1135]">Sesiones del día</h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>3 en vivo</span>
            </div>
            <div className="divide-y" style={{ borderColor: B.border }}>
              {sessions.map((s, i) => (
                <div key={i} className={`p-4 flex items-center gap-4 flex-wrap transition-colors cursor-pointer ${selectedSession === i ? "bg-[#F5F3FF]" : "hover:bg-[#FAFAF9]"}`}
                  onClick={() => setSelectedSession(selectedSession === i ? null : i)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Av initials={s.therapistAv} color={s.therapistColor} size="sm" />
                    <div>
                      <p className="font-extrabold text-sm text-[#1C1135]">ID: {s.id}</p>
                      <p className="text-xs text-[#7C6F9A] font-medium">{s.started} · {s.dur}</p>
                    </div>
                  </div>
                  <Bdg color="violet">{s.type}</Bdg>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: s.status === "activa" ? "#D1FAE5" : B.violetLight, color: s.status === "activa" ? "#059669" : B.violet }}>
                    {s.status}
                  </span>
                  <span className="text-xs font-medium" style={{ color: s.quality === "excelente" ? "#059669" : B.teal }}>📶 {s.quality}</span>
                  {s.status === "activa" && (
                    <Btn size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setSelectedSession(i); }}>
                      <Activity size={12} /> Estado técnico
                    </Btn>
                  )}
                </div>
              ))}
            </div>
          </Crd>
        </div>
        {/* Operational detail panel */}
        <div>
          {sel ? (
            <Crd className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-[#1C1135] text-sm">Detalle operativo</h4>
                <button onClick={() => setSelectedSession(null)} className="p-1 rounded-lg text-[#9E95B7] hover:bg-[#F5F3FF]"><X size={14} /></button>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { label: "ID de sesión",        val: sel.id },
                  { label: "Horario de inicio",   val: sel.started },
                  { label: "Duración",            val: sel.dur },
                  { label: "Modalidad",           val: sel.type },
                  { label: "Estado",              val: sel.status },
                  { label: "Calidad técnica",     val: sel.quality },
                  { label: "Latencia (sim.)",     val: sel.latency },
                  { label: "Incidencias",         val: sel.incidents > 0 ? `${sel.incidents} registrada(s)` : "Ninguna" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-2 border-b border-[#F5F3FF] last:border-0">
                    <span className="text-[#9E95B7] font-medium">{r.label}</span>
                    <span className="font-extrabold text-[#1C1135]">{r.val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl border text-xs font-medium" style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1D4ED8" }}>
                🔒 Audio, video, chat y notas clínicas son accesibles solo para terapeuta y representante legal.
              </div>
            </Crd>
          ) : (
            <Crd className="p-5 flex flex-col items-center justify-center text-center" style={{ minHeight: 220 }}>
              <Activity size={32} className="text-[#C4B5FD] mb-3" />
              <p className="text-sm font-extrabold text-[#9E95B7]">Selecciona una sesión</p>
              <p className="text-xs text-[#9E95B7] font-medium mt-1">Ver datos operativos</p>
            </Crd>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminAnaliticas() {
  const growthData = [
    { mes: "Feb", usuarios: 142 }, { mes: "Mar", usuarios: 189 }, { mes: "Abr", usuarios: 215 },
    { mes: "May", usuarios: 263 }, { mes: "Jun", usuarios: 298 }, { mes: "Jul", usuarios: 342 },
  ];
  const maxU = 342;
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Analíticas</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Métricas globales de la plataforma · 2026</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Usuarios nuevos (Jul)", val: "42",    color: B.violet,  bg: B.violetLight, trend: "+35% vs Jun" },
          { label: "Retención mensual",     val: "87%",   color: "#059669", bg: "#D1FAE5",     trend: "+2% vs Jun"  },
          { label: "Sesiones completadas",  val: "68%",   color: B.teal,    bg: B.tealLight,   trend: "del total"   },
          { label: "Sesiones virtuales",    val: "100%",  color: B.orange,  bg: B.orangeLight, trend: "del total"   },
          { label: "Uso Mundo ASHA",        val: "2,834", color: "#8B5CF6", bg: "#EDE9FE",     trend: "actividades" },
          { label: "Pagos (simulado)",      val: "—",     color: "#059669", bg: "#D1FAE5",     trend: "en definición"},
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: s.bg }}>
            <p className="font-black text-2xl text-[#1C1135] mb-0.5">{s.val}</p>
            <p className="text-xs text-[#7C6F9A] font-medium mb-1">{s.label}</p>
            <p className="text-xs font-bold" style={{ color: s.color }}>{s.trend}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Crd className="p-5">
          <h4 className="font-extrabold text-[#1C1135] mb-5">Crecimiento de usuarios</h4>
          <div className="flex items-end gap-2 h-36 mb-3">
            {growthData.map((d, i) => {
              const pct = Math.round((d.usuarios / maxU) * 100);
              const isLast = i === growthData.length - 1;
              return (
                <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold" style={{ color: isLast ? B.violet : B.textMuted }}>{d.usuarios}</span>
                  <div className="w-full rounded-t-xl" style={{ height: `${pct}%`, background: isLast ? B.violet : B.violetLight, minHeight: 6 }} />
                  <span className="text-xs font-bold" style={{ color: isLast ? B.violet : B.textMuted }}>{d.mes}</span>
                </div>
              );
            })}
          </div>
        </Crd>
        <Crd className="p-5">
          <h4 className="font-extrabold text-[#1C1135] mb-4">Distribución de uso por módulo</h4>
          {[
            { label: "Centro Familiar",  val: 78, color: B.violet  },
            { label: "Mundo ASHA",       val: 65, color: "#8B5CF6" },
            { label: "ASHA Session",     val: 89, color: B.teal    },
            { label: "Pagos",            val: 72, color: "#059669" },
            { label: "Mensajes",         val: 55, color: B.orange  },
          ].map(a => (
            <div key={a.label} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#7C6F9A] font-medium">{a.label}</span>
                <span className="font-extrabold text-[#1C1135]">{a.val}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: B.violetLight }}>
                <div className="h-full rounded-full" style={{ width: `${a.val}%`, backgroundColor: a.color }} />
              </div>
            </div>
          ))}
        </Crd>
      </div>
    </div>
  );
}

export function AdminMensajes() {
  const campaigns = [
    { title: "Bienvenida nuevos usuarios",   type: "Email",        sent: 42, opened: 38, date: "28 Jul 2026", status: "enviado"   },
    { title: "Recordatorio de sesión",       type: "Notificación", sent: 89, opened: 82, date: "29 Jul 2026", status: "enviado"   },
    { title: "Nuevas actividades Mundo ASHA",type: "Push",         sent: 0,  opened: 0,  date: "01 Ago 2026", status: "pendiente" },
    { title: "Informe mensual terapeutas",   type: "Email",        sent: 48, opened: 41, date: "01 Jul 2026", status: "enviado"   },
  ];
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Centro de Mensajes</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Anuncios, campañas y comunicaciones masivas</p>
        </div>
        <Btn variant="primary" size="sm"><Plus size={13} /> Nueva campaña</Btn>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Emails enviados", val: "342",   color: B.violet  },
          { label: "Tasa de apertura",val: "89%",   color: "#059669" },
          { label: "Push activos",    val: "1,248", color: B.teal    },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: `${s.color}15` }}>
            <p className="font-black text-2xl text-[#1C1135]">{s.val}</p>
            <p className="text-xs font-bold mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <Crd>
        <div className="p-5 border-b" style={{ borderColor: B.border }}>
          <h4 className="font-extrabold text-[#1C1135]">Campañas recientes</h4>
        </div>
        <div className="divide-y" style={{ borderColor: B.border }}>
          {campaigns.map((c, i) => (
            <div key={i} className="p-4 flex items-center gap-4 flex-wrap hover:bg-[#F5F3FF] transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#1C1135]">{c.title}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{c.type} · {c.date}</p>
              </div>
              {c.status === "enviado" && <div className="text-xs text-[#7C6F9A] font-medium">{c.sent} enviados · {c.opened} abiertos</div>}
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: c.status === "enviado" ? "#D1FAE5" : B.orangeLight, color: c.status === "enviado" ? "#059669" : B.orange }}>
                {c.status}
              </span>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-xl text-[#9E95B7] hover:text-violet-600 hover:bg-violet-50 transition-colors"><Eye size={13} /></button>
                {c.status === "pendiente" && <button className="p-1.5 rounded-xl text-[#9E95B7] hover:text-green-600 hover:bg-green-50 transition-colors"><Send size={13} /></button>}
              </div>
            </div>
          ))}
        </div>
      </Crd>
    </div>
  );
}

export function AdminModeracion() {
  const incidents = [
    { title: "Reporte de usuario: comentario inapropiado", user: "Anónimo",      date: "29 Jul", severity: "media", status: "pendiente"   },
    { title: "Incidencia técnica: sesión interrumpida",    user: "Laura Gómez",  date: "28 Jul", severity: "alta",  status: "en revisión" },
    { title: "Solicitud de eliminación de cuenta",         user: "Carlos Mendez",date: "27 Jul", severity: "baja",  status: "resuelto"    },
    { title: "Contenido inapropiado reportado",            user: "Sistema",      date: "26 Jul", severity: "media", status: "resuelto"    },
  ];
  const svStyle: Record<string, {bg:string; color:string}> = {
    alta:  { bg: "#FEE2E2", color: "#DC2626" },
    media: { bg: B.orangeLight, color: B.orange },
    baja:  { bg: B.violetLight, color: B.violet },
  };
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Moderación</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Gestión de incidencias y reportes de usuarios</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Pendientes",  val: incidents.filter(i=>i.status==="pendiente").length,  color: B.orange,  bg: B.orangeLight },
          { label: "En revisión", val: incidents.filter(i=>i.status==="en revisión").length, color: B.violet,  bg: B.violetLight },
          { label: "Resueltos",   val: incidents.filter(i=>i.status==="resuelto").length,   color: "#059669", bg: "#D1FAE5"     },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: s.bg }}>
            <p className="font-black text-2xl text-[#1C1135]">{s.val}</p>
            <p className="text-xs font-bold mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {incidents.map((item, i) => {
          const sv = svStyle[item.severity] || svStyle.baja;
          return (
            <Crd key={i} className="p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-[#1C1135] mb-1">{item.title}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium">Reportado por: {item.user} · {item.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: sv.bg, color: sv.color }}>{item.severity}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: item.status === "resuelto" ? "#D1FAE5" : item.status === "pendiente" ? B.orangeLight : B.violetLight, color: item.status === "resuelto" ? "#059669" : item.status === "pendiente" ? B.orange : B.violet }}>
                    {item.status}
                  </span>
                </div>
              </div>
              {item.status !== "resuelto" && (
                <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: B.border }}>
                  <Btn size="sm" variant="secondary"><Eye size={12} /> Revisar</Btn>
                  <Btn size="sm" variant="primary"><CheckCircle size={12} /> Resolver</Btn>
                </div>
              )}
            </Crd>
          );
        })}
      </div>
    </div>
  );
}
