import React, { useState } from "react";
import { Activity, ArrowRight, BarChart2, Bell, Calendar, CheckCircle, ChevronRight, Clock, Cpu, CreditCard, Database, Download, Edit, Eye, FileText, Globe, Heart, PlayCircle, Plus, RefreshCw, Search, Send, Server, Star, Stethoscope, Trash2, TrendingUp, UserPlus, Users, Video, X, Shield, Wifi, Lock, Bot, Layers, GitBranch, Zap } from "lucide-react";
import { B, View, Btn, Crd, Bdg, Av, Skeleton, EmptyState, AshiMsg, adminUsers, therapists } from "../shared";

// ─── Centro de Operaciones ASHA — Admin views ──────────────────────────────────

const adminMonthly = [
  { mes: "Feb", usuarios: 142, citas: 68,  ingresos: 2400 },
  { mes: "Mar", usuarios: 189, citas: 79,  ingresos: 2900 },
  { mes: "Abr", usuarios: 215, citas: 85,  ingresos: 3100 },
  { mes: "May", usuarios: 263, citas: 91,  ingresos: 3500 },
  { mes: "Jun", usuarios: 298, citas: 97,  ingresos: 3900 },
  { mes: "Jul", usuarios: 342, citas: 112, ingresos: 4450 },
];

export function AdminPanel({ go }: { go: (v: View) => void }) {
  const kpis = [
    { icon: <UserPlus size={17}/>,    val: "7",           label: "Postulaciones pendientes",    urgency: "alta",   color: B.orange,  bg: B.orangeLight },
    { icon: <Stethoscope size={17}/>, val: "3",           label: "Terapeutas por habilitar",    urgency: "alta",   color: B.violet,  bg: B.violetLight },
    { icon: <Calendar size={17}/>,    val: "24",          label: "Reservas de hoy",             urgency: "info",   color: B.teal,    bg: B.tealLight   },
    { icon: <Zap size={17}/>,         val: "2",           label: "Incidencias técnicas abiertas",urgency: "alta",  color: "#DC2626", bg: "#FEE2E2"     },
    { icon: <CreditCard size={17}/>,  val: "4",           label: "Pagos con incidencia",        urgency: "media",  color: "#D97706", bg: "#FEF3C7"     },
    { icon: <Star size={17}/>,        val: "5",           label: "Contenidos pendientes",       urgency: "media",  color: "#8B5CF6", bg: "#EDE9FE"     },
    { icon: <Globe size={17}/>,       val: "96.4 %",      label: "Disponibilidad del sistema",  urgency: "ok",     color: "#059669", bg: "#D1FAE5"     },
    { icon: <Bot size={17}/>,         val: "En validación",label: "Modelo ML",                  urgency: "info",   color: B.violet,  bg: B.violetLight },
  ];

  const alerts = [
    { level: "alta",  icon: "🔴", text: "2 incidencias técnicas sin resolver en sesiones activas.", action: "Operación" },
    { level: "media", icon: "🟡", text: "4 pagos requieren conciliación manual.", action: "Pagos" },
    { level: "media", icon: "🟡", text: "3 terapeutas han completado la entrevista y esperan habilitación.", action: "Terapeutas" },
    { level: "info",  icon: "🔵", text: "Modelo ML v0.3-demo en fase de validación — sin publicar.", action: "Machine Learning" },
  ];

  const actionMap: Record<string, View> = {
    "Operación": "admin/operacion",
    "Pagos": "admin/pagos",
    "Terapeutas": "admin/terapeutas",
    "Machine Learning": "admin/ml",
  };

  const sessions = [
    { id: "SES-A7F2", therapist: "Dra. Ana Ruiz",       av: "AR", color: B.violet,  hora: "09:00", dur: "18 min", conectividad: "Estable",  estado: "Normal"   },
    { id: "SES-B3C8", therapist: "Lic. Carlos Mendoza", av: "CM", color: B.teal,    hora: "09:15", dur: "12 min", conectividad: "Degradada", estado: "Revisión" },
    { id: "SES-D1E4", therapist: "Dra. María Torres",   av: "MT", color: "#EC4899", hora: "08:45", dur: "24 min", conectividad: "Estable",  estado: "Normal"   },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>

      {/* Page head */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <p className="text-xs font-black text-[#9E95B7] uppercase tracking-widest mb-0.5">Admin · Dashboard</p>
          <h1 className="text-2xl font-black text-[#1C1135]">Centro de operaciones</h1>
          <p className="text-sm text-[#7C6F9A] font-medium">30 Jul 2026 · Información operativa y técnica</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => go("admin/terapeutas")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"><Stethoscope size={13}/> Terapeutas</button>
          <button onClick={() => go("admin/operacion")}  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"><Activity size={13}/> Operación</button>
          <button onClick={() => go("admin/ml")}         className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"><Bot size={13}/> ML</button>
          <button onClick={() => go("admin/auditoria")}  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"><Shield size={13}/> Auditoría</button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"><Download size={13}/> Exportar resumen</button>
        </div>
      </div>

      {/* Simulated data notice */}
      <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 mb-5 border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700">
        <span>⚠️</span> Datos simulados para demostración · No corresponden a usuarios ni sesiones reales
      </div>

      {/* 8 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map((k, i) => (
          <div key={i} className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: k.bg }}>
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/70" style={{ color: k.color }}>{k.icon}</div>
              {k.urgency === "alta"  && <span className="text-xs font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600">Atención</span>}
              {k.urgency === "media" && <span className="text-xs font-black px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Revisar</span>}
              {k.urgency === "ok"    && <span className="text-xs font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">OK</span>}
            </div>
            <p className="font-black text-xl text-[#1C1135] leading-none">{k.val}</p>
            <p className="text-xs font-medium text-[#7C6F9A] leading-tight">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Alertas operativas */}
        <Crd className="p-5">
          <h3 className="font-extrabold text-[#1C1135] mb-4 flex items-center gap-2"><Bell size={15}/> Alertas operativas</h3>
          <div className="flex flex-col gap-2.5">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl p-3 border border-[#F0EEF9]">
                <span className="text-base flex-shrink-0 mt-0.5">{a.icon}</span>
                <p className="text-xs font-medium text-[#1C1135] flex-1 leading-relaxed">{a.text}</p>
                <button onClick={() => go(actionMap[a.action])} className="text-xs font-bold text-violet-600 hover:underline flex-shrink-0 whitespace-nowrap">Ver →</button>
              </div>
            ))}
          </div>
        </Crd>

        {/* Sesiones activas — solo datos técnicos */}
        <Crd>
          <div className="p-4 pb-3 border-b border-[#E8E5F4] flex items-center justify-between">
            <h3 className="font-extrabold text-[#1C1135] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" style={{ boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
              Sesiones activas
            </h3>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-50 text-green-700">{sessions.length} en curso</span>
          </div>
          <div className="text-xs text-[#9E95B7] font-medium px-4 py-2 bg-[#FAFAF9] border-b border-[#F0EEF9]">
            Datos técnicos únicamente · Sin contenido clínico
          </div>
          <div className="divide-y divide-[#F5F3FF]">
            {sessions.map((s, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3 flex-wrap hover:bg-[#F9F8FE] transition-colors">
                <Av initials={s.av} color={s.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-[#1C1135] font-mono">{s.id}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium">{s.therapist}</p>
                </div>
                <div className="text-xs text-[#7C6F9A] font-medium text-right">
                  <p>{s.hora} · {s.dur}</p>
                  <p className={s.conectividad === "Estable" ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>📶 {s.conectividad}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.estado === "Normal" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{s.estado}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[#E8E5F4]">
            <button onClick={() => go("admin/operacion")} className="text-xs font-bold text-violet-600 hover:underline w-full text-center">Ver Operación completa →</button>
          </div>
        </Crd>
      </div>
    </div>
  );
}

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

export function AdminTerapias() {
  return <AdminTerapeutas go={() => {}} />;
}

export function AdminTerapeutas({ go }: { go: (v: View) => void }) {
  const [filter, setFilter] = useState("todos");
  type TerapeutaRec = { name: string; specialty: string; rating: number; patients: number; sessions: number; income: string; status: string; verified: boolean; av: string; color: string; };
  const [viewProfile, setViewProfile] = useState<TerapeutaRec | null>(null);
  const terapeutas: TerapeutaRec[] = [
    { name: "Dra. Ana Ruiz",       specialty: "Terapia del Lenguaje", rating: 4.9, patients: 18, sessions: 143, income: "—", status: "verificado",  verified: true,  av: "AR", color: B.violet  },
    { name: "Lic. Carlos Mendoza", specialty: "Terapia del Lenguaje", rating: 4.7, patients: 12, sessions: 98,  income: "—", status: "verificado",  verified: true,  av: "CM", color: B.teal    },
    { name: "Dra. María Torres",   specialty: "Terapia del Lenguaje", rating: 4.8, patients: 15, sessions: 121, income: "—", status: "verificado",  verified: true,  av: "MT", color: "#EC4899" },
    { name: "Lic. Pedro Sánchez",  specialty: "Terapia del Lenguaje", rating: 4.5, patients: 8,  sessions: 62,  income: "—", status: "pendiente",   verified: false, av: "PS", color: B.orange  },
    { name: "Dra. Laura Vega",     specialty: "Terapia del Lenguaje", rating: 0,   patients: 0,  sessions: 0,   income: "—", status: "en revisión", verified: false, av: "LV", color: "#8B5CF6" },
  ];
  const statuses = ["todos", "verificado", "pendiente", "en revisión"];
  const filtered = filter === "todos" ? terapeutas : terapeutas.filter(t => t.status === filter);
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Gestión de Terapeutas</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">{terapeutas.length} terapeutas registrados</p>
        </div>
        <Btn variant="primary" size="sm"><UserPlus size={13} /> Invitar terapeuta</Btn>
      </div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {statuses.map(s => (
          <button key={s} className="px-3 py-1.5 rounded-2xl text-xs font-bold capitalize transition-all"
            style={{ background: filter === s ? B.violet : B.violetLight, color: filter === s ? "white" : B.textMid }}
            onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>
      {/* ── Perfil modal ── */}
      {viewProfile && (() => {
        const shared = therapists.find(th => th.name === viewProfile.name);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-[calc(100vw-2rem)] max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4] flex-shrink-0">
                <h2 className="font-extrabold text-[#1C1135] text-lg">Perfil del terapeuta</h2>
                <button onClick={() => setViewProfile(null)} className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-start gap-5 mb-6">
                  <Av initials={viewProfile.av} color={viewProfile.color} size="xl" />
                  <div className="flex-1">
                    <h3 className="font-black text-2xl text-[#1C1135]">{viewProfile.name}</h3>
                    <p className="text-sm text-[#7C6F9A] font-medium">{viewProfile.specialty}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {viewProfile.rating > 0 && (
                        <><Star size={14} className="text-amber-400 fill-amber-400" /><span className="font-black text-[#1C1135]">{viewProfile.rating}</span></>
                      )}
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: viewProfile.status === "verificado" ? "#D1FAE5" : viewProfile.status === "pendiente" ? "#FEF3C7" : "#FEF9C3", color: viewProfile.status === "verificado" ? "#059669" : "#D97706" }}>
                        {viewProfile.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "Pacientes",   value: String(viewProfile.patients) },
                    { label: "Sesiones",    value: String(viewProfile.sessions) },
                    { label: "Ingresos",    value: viewProfile.income },
                    { label: "Experiencia", value: shared?.experience ?? "N/A" },
                  ].map(f => (
                    <div key={f.label} className="rounded-2xl p-3" style={{ background: B.bg }}>
                      <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider">{f.label}</p>
                      <p className="font-bold text-[#1C1135] text-sm mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
                {shared && (
                  <div className="mb-5">
                    <p className="font-extrabold text-[#1C1135] mb-2 text-sm">Especialidades</p>
                    <div className="flex flex-wrap gap-2">
                      {shared.tags.map(tag => <Bdg key={tag} color="violet">{tag}</Bdg>)}
                      <Bdg color="gray">Tarifa: ${shared.price}/h</Bdg>
                    </div>
                  </div>
                )}
                <div className="mb-5 p-4 rounded-2xl" style={{ background: B.violetLight }}>
                  <p className="text-sm font-medium text-[#1C1135] leading-relaxed">
                    "Especialista en terapia infantil con enfoque lúdico y familiar. Trabajo con niños desde los 2 años usando metodologías basadas en evidencia, adaptando cada sesión al ritmo y necesidades del niño."
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {!viewProfile.verified && <Btn variant="primary" className="flex-1 justify-center"><CheckCircle size={14} /> Aprobar cuenta</Btn>}
                  {viewProfile.verified && <Btn variant="secondary" className="flex-1 justify-center"><FileText size={14} /> Solicitar documentos</Btn>}
                  <Btn variant="danger" className="flex-1 justify-center"><Trash2 size={14} /> Suspender</Btn>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex flex-col gap-4">
        {filtered.map(t => (
          <Crd key={t.name} className="p-5">
            <div className="flex items-start gap-4 flex-wrap">
              <Av initials={t.av} color={t.color} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-[#1C1135]">{t.name}</p>
                      {t.verified && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>✓ Verificado</span>}
                    </div>
                    <p className="text-xs text-[#7C6F9A] font-medium mt-0.5">{t.specialty}</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: t.status === "verificado" ? "#D1FAE5" : t.status === "pendiente" ? B.orangeLight : "#FEF3C7", color: t.status === "verificado" ? "#059669" : t.status === "pendiente" ? B.orange : "#D97706" }}>
                    {t.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Pacientes",    val: String(t.patients) },
                    { label: "Sesiones",     val: String(t.sessions) },
                    { label: "Ingresos",     val: t.income           },
                    { label: "Calificación", val: t.rating > 0 ? `★ ${t.rating}` : "Sin datos" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-2.5" style={{ background: B.violetLight }}>
                      <p className="text-xs text-[#9E95B7] font-medium">{s.label}</p>
                      <p className="font-extrabold text-sm text-[#1C1135]">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end flex-wrap pt-3 mt-3 border-t" style={{ borderColor: B.border }}>
              <Btn size="sm" variant="ghost" onClick={() => setViewProfile(t)}><Eye size={12} /> Ver perfil</Btn>
              {!t.verified && <Btn size="sm" variant="primary"><CheckCircle size={12} /> Aprobar</Btn>}
              {t.verified && <Btn size="sm" variant="secondary"><FileText size={12} /> Solicitar docs</Btn>}
              <Btn size="sm" variant="danger"><Trash2 size={12} /> Suspender</Btn>
            </div>
          </Crd>
        ))}
      </div>
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

export function AdminFinanzas() {
  const monthlyIncome = [
    { mes: "Feb", val: 2800 }, { mes: "Mar", val: 3100 }, { mes: "Abr", val: 2950 },
    { mes: "May", val: 3600 }, { mes: "Jun", val: 4100 }, { mes: "Jul", val: 4450 },
  ];
  const maxIncome = 4450;
  const transactions = [
    { user: "Laura Gómez",   concept: "Paquete 4 sesiones", amount: "—",  date: "28 Jul", status: "cobrado",   av: "LG", color: B.violet  },
    { user: "Andrés Ríos",   concept: "Paquete 4 sesiones", amount: "—",  date: "26 Jul", status: "cobrado",   av: "AR", color: "#22C55E" },
    { user: "Rosa López",    concept: "Paquete 4 sesiones", amount: "—",  date: "22 Jul", status: "pendiente", av: "RL", color: B.teal    },
    { user: "Claudia Torres",concept: "Paquete 2 sesiones", amount: "—",  date: "20 Jul", status: "cobrado",   av: "CT", color: B.orange  },
    { user: "Jorge Vargas",  concept: "Reembolso",          amount: "—",  date: "18 Jul", status: "reembolso", av: "JV", color: "#8B5CF6" },
  ];
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Información de Pagos</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Gestión de pagos · Julio 2026 · <span className="font-extrabold text-orange-500">Datos simulados</span></p>
        </div>
        <Btn size="sm" variant="ghost"><Download size={13} /> Exportar reporte</Btn>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Pagos julio",        val: "—",  color: "#059669", bg: "#D1FAE5",     trend: "simulado" },
          { label: "Sesiones cobradas",  val: "22", color: B.violet,  bg: B.violetLight, trend: "de 25 sesiones" },
          { label: "Reembolsos",         val: "1",  color: "#DC2626", bg: "#FEE2E2",     trend: "1 solicitud" },
          { label: "Comisión plataforma",val: "—",  color: B.orange,  bg: B.orangeLight, trend: "por definir" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg }}>
            <p className="font-black text-2xl text-[#1C1135] mb-0.5">{s.val}</p>
            <p className="text-xs text-[#7C6F9A] font-medium mb-1">{s.label}</p>
            <p className="text-xs font-bold" style={{ color: s.color }}>{s.trend}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Crd className="p-5">
          <h4 className="font-extrabold text-[#1C1135] mb-5">Ingresos mensuales</h4>
          <div className="flex items-end gap-2 h-32 mb-3">
            {monthlyIncome.map((d, i) => {
              const pct = Math.round((d.val / maxIncome) * 100);
              const isLast = i === monthlyIncome.length - 1;
              return (
                <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold" style={{ color: isLast ? "#059669" : B.textMuted }}>—</span>
                  <div className="w-full rounded-t-xl" style={{ height: `${pct}%`, background: isLast ? "#059669" : "#D1FAE5", minHeight: 6 }} />
                  <span className="text-xs font-bold" style={{ color: isLast ? "#059669" : B.textMuted }}>{d.mes}</span>
                </div>
              );
            })}
          </div>
        </Crd>
        <Crd className="p-5">
          <h4 className="font-extrabold text-[#1C1135] mb-4">Estado de pagos · Julio</h4>
          {[
            { label: "Cobrados",  pct: 88, val: "88%",  color: "#059669" },
            { label: "Pendientes",pct: 8,  val: "8%",   color: B.orange  },
            { label: "Reembolsos",pct: 4,  val: "4%",   color: "#DC2626" },
          ].map(s => (
            <div key={s.label} className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[#7C6F9A] font-medium">{s.label}</span>
                <div className="flex gap-2">
                  <span className="font-extrabold text-[#1C1135]">{s.val}</span>
                  <span className="font-bold" style={{ color: s.color }}>{s.pct}%</span>
                </div>
              </div>
              <div className="h-3 rounded-full" style={{ background: B.violetLight }}>
                <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
              </div>
            </div>
          ))}
        </Crd>
      </div>
      <Crd>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: B.border }}>
          <h4 className="font-extrabold text-[#1C1135]">Últimas transacciones</h4>
          <Btn size="sm" variant="ghost"><Download size={12} /> Exportar CSV</Btn>
        </div>
        <div className="divide-y" style={{ borderColor: B.border }}>
          {transactions.map((t, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <Av initials={t.av} color={t.color} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#1C1135]">{t.user}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{t.concept}</p>
              </div>
              <div className="text-right">
                <p className="font-black" style={{ color: t.amount.startsWith("+") ? "#059669" : "#DC2626" }}>{t.amount}</p>
                <p className="text-xs text-[#9E95B7]">{t.date}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: t.status === "cobrado" ? "#D1FAE5" : t.status === "pendiente" ? B.orangeLight : "#FEE2E2", color: t.status === "cobrado" ? "#059669" : t.status === "pendiente" ? B.orange : "#DC2626" }}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </Crd>
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

export function AdminContenido() {
  const [catFilter, setCatFilter] = useState("todos");
  const cats = ["todos", "cuentos", "canciones", "juegos", "trabalenguas", "adivinanzas"];
  const contenido = [
    { title: "El bosque de los cuentos",         cat: "cuentos",      views: 1842, status: "publicado", level: "1-2" },
    { title: "Canción del abecedario",            cat: "canciones",    views: 2134, status: "publicado", level: "1"   },
    { title: "Trabalenguas del sol",              cat: "trabalenguas", views: 987,  status: "publicado", level: "2-3" },
    { title: "Adivinanza del elefante",           cat: "adivinanzas",  views: 754,  status: "publicado", level: "2"   },
    { title: "Juego de las sílabas",              cat: "juegos",       views: 1230, status: "publicado", level: "1-3" },
    { title: "El viaje al mundo de los sonidos",  cat: "cuentos",      views: 0,    status: "borrador",  level: "2"   },
  ];
  const filtered = catFilter === "todos" ? contenido : contenido.filter(c => c.cat === catFilter);
  const iconMap: Record<string, string> = { cuentos: "📖", canciones: "🎵", juegos: "🎮", trabalenguas: "💬", adivinanzas: "🧩" };
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Gestión de Contenido</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Mundo ASHA · {contenido.length} elementos</p>
        </div>
        <Btn variant="primary" size="sm"><Plus size={13} /> Nuevo contenido</Btn>
      </div>
      <div className="flex gap-2 flex-wrap mb-5">
        {cats.map(c => (
          <button key={c} className="px-3 py-1.5 rounded-2xl text-xs font-bold capitalize transition-all"
            style={{ background: catFilter === c ? B.violet : B.violetLight, color: catFilter === c ? "white" : B.textMid }}
            onClick={() => setCatFilter(c)}>{c}</button>
        ))}
      </div>
      <Crd>
        <div className="divide-y" style={{ borderColor: B.border }}>
          {filtered.map((item, i) => (
            <div key={i} className="p-4 flex items-center gap-4 hover:bg-[#F5F3FF] transition-colors">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: B.violetLight }}>
                {iconMap[item.cat] || "📄"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#1C1135]">{item.title}</p>
                <p className="text-xs text-[#7C6F9A] font-medium capitalize">{item.cat} · Nivel {item.level}</p>
              </div>
              <div className="text-xs text-[#7C6F9A] font-medium">{item.views > 0 ? `${item.views.toLocaleString()} vistas` : "—"}</div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: item.status === "publicado" ? "#D1FAE5" : B.orangeLight, color: item.status === "publicado" ? "#059669" : B.orange }}>
                {item.status}
              </span>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-xl text-[#9E95B7] hover:text-violet-600 hover:bg-violet-50 transition-colors"><Edit size={13} /></button>
                <button className="p-1.5 rounded-xl text-[#9E95B7] hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </Crd>
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

export function AdminConfig() {
  const sections = [
    { title: "Parámetros del sistema",  icon: "⚙️", items: ["Logo y marca", "Colores corporativos", "Nombre de la plataforma"] },
    { title: "Integraciones",           icon: "🔗", items: ["Zoom / videoconferencia", "Pasarela de pago (Stripe)", "Email (SendGrid)"] },
    { title: "Seguridad",               icon: "🛡️", items: ["Autenticación 2FA", "Políticas de contraseñas", "Logs de acceso"] },
    { title: "Roles y permisos",        icon: "👤", items: ["Definir roles", "Asignar permisos", "Auditoría de accesos"] },
    { title: "Respaldos y datos",       icon: "💾", items: ["Backup automático", "Exportar datos", "Restaurar versión"] },
  ];
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Configuración del sistema</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Parámetros globales de ASHAKids</p>
      </div>
      <div className="flex flex-col gap-4">
        {sections.map(s => (
          <Crd key={s.title} className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{s.icon}</span>
              <h4 className="font-extrabold text-[#1C1135]">{s.title}</h4>
            </div>
            <div className="flex flex-col gap-1">
              {s.items.map(item => (
                <div key={item} className="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-[#F5F3FF] transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-[#1C1135]">{item}</p>
                  <ChevronRight size={16} style={{ color: B.textMuted }} />
                </div>
              ))}
            </div>
          </Crd>
        ))}
      </div>
    </div>
  );
}

// ─── ASHA Core ────────────────────────────────────────────────────────────────

export function AshaCore() {
  const coreStyles = `
    @keyframes asha-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
    @keyframes asha-flow  { 0%{transform:translateY(-8px);opacity:0} 40%{opacity:1} 100%{transform:translateY(48px);opacity:0} }
    @keyframes asha-scan  { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }
    @keyframes asha-glow  { 0%,100%{opacity:.4} 50%{opacity:1} }
    @keyframes asha-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .core-pulse { animation: asha-pulse 2s ease-in-out infinite; }
    .core-flow  { animation: asha-flow  2.4s ease-in-out infinite; }
    .core-scan  { animation: asha-scan  2.8s linear infinite; }
    .core-glow  { animation: asha-glow  1.6s ease-in-out infinite; }
    .core-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(124,58,237,.14); transition: all .25s; }
    .core-card { transition: all .25s; }
  `;

  const statusItems = [
    { label: "API REST",   ok: true  }, { label: "Base de Datos", ok: true  },
    { label: "Zoom",       ok: true  }, { label: "Email",         ok: true  },
    { label: "Pagos",      ok: true  }, { label: "IA Engine",     ok: true  },
    { label: "CDN",        ok: true  }, { label: "Auth",          ok: true  },
  ];

  const mainServices = [
    {
      icon: "🤖", label: "ASHI AI", tag: "Inteligencia Artificial", color: "#7C3AED", bg: "#F5F3FF",
      status: "Operativo",
      metrics: [{ k: "Consultas hoy", v: "2,847" }, { k: "Tiempo respuesta", v: "98 ms" }, { k: "Uso del día", v: "73%" }, { k: "Modelos activos", v: "3" }],
      bar: 73,
    },
    {
      icon: "📧", label: "Centro de Correos", tag: "SMTP Engine", color: "#0D9488", bg: "#F0FDFA",
      status: "Operativo",
      metrics: [{ k: "Enviados", v: "1,248" }, { k: "Pendientes", v: "12" }, { k: "Fallidos", v: "3" }, { k: "Plantillas", v: "18" }],
      bar: 91,
    },
    {
      icon: "🔔", label: "Notificaciones", tag: "Push & In-App", color: "#F97316", bg: "#FFF7ED",
      status: "Operativo",
      metrics: [{ k: "Enviadas", v: "4,821" }, { k: "Push", v: "3,102" }, { k: "Email", v: "1,248" }, { k: "Recordatorios", v: "471" }],
      bar: 88,
    },
    {
      icon: "💬", label: "Mensajería", tag: "Chat Engine", color: "#2563EB", bg: "#EFF6FF",
      status: "Operativo",
      metrics: [{ k: "Conversaciones", v: "38" }, { k: "Archivos", v: "142" }, { k: "Mensajes hoy", v: "891" }, { k: "Usuarios en línea", v: "24" }],
      bar: 62,
    },
  ];

  const opsServices = [
    {
      icon: "📄", label: "Gestor de Documentos", tag: "Document Engine", color: "#DC2626", bg: "#FFF5F5",
      metrics: [{ k: "PDFs", v: "487" }, { k: "Archivos", v: "2,341" }, { k: "Reportes", v: "89" }, { k: "Espacio", v: "2.4 GB" }],
      bar: 48,
    },
    {
      icon: "🗓", label: "Agenda Engine", tag: "Scheduler", color: "#7C3AED", bg: "#F5F3FF",
      metrics: [{ k: "Sesiones prog.", v: "156" }, { k: "Conflictos", v: "2" }, { k: "Recordatorios", v: "48" }, { k: "Sincronizado", v: "Sí" }],
      bar: 82,
    },
    {
      icon: "🎥", label: "ASHA Session Engine", tag: "Videollamadas", color: "#0D9488", bg: "#F0FDFA",
      metrics: [{ k: "Activas", v: "3" }, { k: "Promedio", v: "47 min" }, { k: "Calidad", v: "98.2%" }, { k: "Grabadas", v: "142" }],
      bar: 95,
    },
    {
      icon: "💳", label: "Módulo de Pagos", tag: "Pagos & Cobros", color: "#059669", bg: "#F0FDF4",
      metrics: [{ k: "Procesados", v: "89" }, { k: "Reembolsos", v: "1" }, { k: "Métodos", v: "3" }, { k: "Estado", v: "activo" }],
      bar: 78,
    },
  ];

  const smartServices = [
    {
      icon: "📊", label: "Analytics Engine", tag: "Datos & KPIs", color: "#7C3AED", bg: "#F5F3FF",
      metrics: [{ k: "Eventos proc.", v: "48,291" }, { k: "KPIs", v: "24" }, { k: "Reportes auto.", v: "12" }, { k: "Gráficos", v: "38" }],
      bar: 84,
    },
    {
      icon: "🎮", label: "Mundo ASHA Engine", tag: "Gamificación", color: "#F97316", bg: "#FFF7ED",
      metrics: [{ k: "Actividades", v: "234" }, { k: "XP otorgado", v: "12,847" }, { k: "Insignias", v: "891" }, { k: "Videos", v: "48" }],
      bar: 67,
    },
    {
      icon: "🔐", label: "Security Center", tag: "Auth & Logs", color: "#DC2626", bg: "#FFF5F5",
      metrics: [{ k: "Conectados", v: "42" }, { k: "Sesiones", v: "38" }, { k: "Intentos fall.", v: "3" }, { k: "Dispositivos", v: "67" }],
      bar: 99,
    },
  ];

  const eventFlow = [
    { label: "Padre agenda sesión",  icon: "👨‍👩‍👧", color: "#7C3AED" },
    { label: "Agenda Engine",        icon: "🗓",       color: "#2563EB" },
    { label: "Módulo de Pagos",      icon: "💳",       color: "#059669" },
    { label: "Centro de Correos",    icon: "📧",       color: "#0D9488" },
    { label: "Notificaciones",       icon: "🔔",       color: "#F97316" },
    { label: "Calendario",           icon: "📅",       color: "#7C3AED" },
    { label: "Terapeuta",            icon: "👩‍⚕️",     color: "#EC4899" },
    { label: "Administrador",        icon: "🛡️",       color: "#DC2626" },
    { label: "Analytics",            icon: "📊",       color: "#8B5CF6" },
    { label: "Base de Datos",        icon: "🗄️",       color: "#374151" },
  ];

  const systemMetrics = [
    { label: "CPU",         val: 34, unit: "%",    color: "#059669", ok: true  },
    { label: "RAM",         val: 61, unit: "%",    color: "#2563EB", ok: true  },
    { label: "API REST",    val: 99, unit: "% up", color: "#059669", ok: true  },
    { label: "Base Datos",  val: 98, unit: "% up", color: "#059669", ok: true  },
    { label: "Zoom",        val: 100,unit: "% up", color: "#059669", ok: true  },
    { label: "Email SMTP",  val: 100,unit: "% up", color: "#059669", ok: true  },
    { label: "Pagos",       val: 100,unit: "% up", color: "#059669", ok: true  },
    { label: "IA Engine",   val: 97, unit: "% up", color: "#059669", ok: true  },
  ];

  const archLayers = [
    { label: "Sitio Público",        icon: <Globe size={16} />,    color: "#2563EB", bg: "#EFF6FF" },
    { label: "Centro Familiar",      icon: <Heart size={16} />,    color: "#EC4899", bg: "#FDF2F8" },
    { label: "Centro Profesional",   icon: <Stethoscope size={16}/>,color: "#0D9488", bg: "#F0FDFA" },
    { label: "Centro de Operaciones",icon: <BarChart2 size={16} />,color: "#F97316", bg: "#FFF7ED" },
    { label: "ASHA Core",            icon: <Cpu size={16} />,      color: "#7C3AED", bg: "#F5F3FF" },
    { label: "Spring Boot API",      icon: <Server size={16} />,   color: "#374151", bg: "#F9FAFB" },
    { label: "MySQL",                icon: <Database size={16} />, color: "#059669", bg: "#F0FDF4" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <style>{coreStyles}</style>

      {/* ── Header ── */}
      <div className="rounded-3xl p-5 mb-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${B.violetDeep} 0%, #1e3a5f 60%, #0D9488 100%)` }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-4 right-8 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent)" }} />
          <div className="absolute -bottom-8 left-1/3 w-64 h-32 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #0D9488, transparent)" }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.15)" }}>
                  <Cpu size={18} color="white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white leading-none">ASHA Core</h2>
                  <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,.6)" }}>Sistema de servicios integrados · v2.4.1</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="core-pulse inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">Todos los servicios operativos</span>
                <span className="text-xs font-medium ml-2" style={{ color: "rgba(255,255,255,.45)" }}>Última sync: hace 2 min</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-2xl px-3 py-2 cursor-pointer" style={{ background: "rgba(255,255,255,.1)" }}>
                <Search size={13} color="rgba(255,255,255,.7)" />
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,.5)" }}>Buscar servicios…</span>
              </div>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center cursor-pointer" style={{ background: "rgba(255,255,255,.1)" }}>
                <Bell size={15} color="rgba(255,255,255,.8)" />
              </div>
            </div>
          </div>
          {/* Status strip */}
          <div className="flex flex-wrap gap-2">
            {statusItems.map(s => (
              <div key={s.label} className="flex items-center gap-1.5 rounded-xl px-2.5 py-1" style={{ background: "rgba(255,255,255,.08)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,.75)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 1: Servicios Principales ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: B.violet }} />
          <h3 className="font-black text-[#1C1135]">Servicios Principales</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: B.violetLight, color: B.violet }}>4 activos</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainServices.map(s => (
            <div key={s.label} className="core-card rounded-3xl p-5 cursor-pointer" style={{ background: s.bg, border: `1px solid ${s.color}18` }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${s.color}18`, color: s.color }}>● {s.status}</span>
              </div>
              <p className="font-black text-sm text-[#1C1135] mb-0.5">{s.label}</p>
              <p className="text-xs font-medium text-[#7C6F9A] mb-3">{s.tag}</p>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {s.metrics.map(m => (
                  <div key={m.k} className="rounded-xl p-2" style={{ background: "rgba(255,255,255,.7)" }}>
                    <p className="text-xs text-[#9E95B7] font-medium leading-none mb-0.5">{m.k}</p>
                    <p className="font-black text-xs text-[#1C1135]">{m.v}</p>
                  </div>
                ))}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${s.color}20` }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${s.bar}%`, background: s.color }} />
              </div>
              <p className="text-xs font-bold mt-1 text-right" style={{ color: s.color }}>{s.bar}% capacidad</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Servicios Operativos ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: B.teal }} />
          <h3 className="font-black text-[#1C1135]">Servicios Operativos</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: B.tealLight, color: B.teal }}>4 activos</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {opsServices.map(s => (
            <div key={s.label} className="core-card rounded-3xl p-5 cursor-pointer" style={{ background: s.bg, border: `1px solid ${s.color}18` }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${s.color}15`, color: s.color }}>● Activo</span>
              </div>
              <p className="font-black text-sm text-[#1C1135] mb-0.5">{s.label}</p>
              <p className="text-xs font-medium text-[#7C6F9A] mb-3">{s.tag}</p>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {s.metrics.map(m => (
                  <div key={m.k} className="rounded-xl p-2" style={{ background: "rgba(255,255,255,.7)" }}>
                    <p className="text-xs text-[#9E95B7] font-medium leading-none mb-0.5">{m.k}</p>
                    <p className="font-black text-xs text-[#1C1135]">{m.v}</p>
                  </div>
                ))}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${s.color}20` }}>
                <div className="h-full rounded-full" style={{ width: `${s.bar}%`, background: s.color }} />
              </div>
              <p className="text-xs font-bold mt-1 text-right" style={{ color: s.color }}>{s.bar}% eficiencia</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Servicios Inteligentes ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: B.orange }} />
          <h3 className="font-black text-[#1C1135]">Servicios Inteligentes</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: B.orangeLight, color: B.orange }}>3 activos</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {smartServices.map(s => (
            <div key={s.label} className="core-card rounded-3xl p-5 cursor-pointer" style={{ background: s.bg, border: `1px solid ${s.color}18` }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${s.color}15`, color: s.color }}>● Activo</span>
              </div>
              <p className="font-black text-sm text-[#1C1135] mb-0.5">{s.label}</p>
              <p className="text-xs font-medium text-[#7C6F9A] mb-3">{s.tag}</p>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {s.metrics.map(m => (
                  <div key={m.k} className="rounded-xl p-2" style={{ background: "rgba(255,255,255,.7)" }}>
                    <p className="text-xs text-[#9E95B7] font-medium leading-none mb-0.5">{m.k}</p>
                    <p className="font-black text-xs text-[#1C1135]">{m.v}</p>
                  </div>
                ))}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${s.color}20` }}>
                <div className="h-full rounded-full" style={{ width: `${s.bar}%`, background: s.color }} />
              </div>
              <p className="text-xs font-bold mt-1 text-right" style={{ color: s.color }}>{s.bar}% rendimiento</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: ASHA Event Center ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: "#2563EB" }} />
          <h3 className="font-black text-[#1C1135]">ASHA Event Center</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#2563EB" }}>Flujo en tiempo real</span>
        </div>
        <div className="rounded-3xl p-6 overflow-hidden" style={{ background: `linear-gradient(145deg, ${B.violetDeep}, #1a3461)` }}>
          <p className="text-xs font-medium mb-6 text-center" style={{ color: "rgba(255,255,255,.5)" }}>
            Ciclo de vida de una sesión terapéutica — todos los servicios coordinados automáticamente
          </p>
          <div className="flex flex-col items-center gap-0 max-w-sm mx-auto">
            {eventFlow.map((node, i) => (
              <div key={node.label} className="flex flex-col items-center w-full">
                {/* Node */}
                <div className="flex items-center gap-3 w-full max-w-xs">
                  <div className="flex-1 h-px opacity-20" style={{ background: node.color }} />
                  <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 min-w-0"
                    style={{ background: `${node.color}22`, border: `1px solid ${node.color}44` }}>
                    <span className="text-base">{node.icon}</span>
                    <span className="text-xs font-bold text-white whitespace-nowrap">{node.label}</span>
                  </div>
                  <div className="flex-1 h-px opacity-20" style={{ background: node.color }} />
                </div>
                {/* Connector */}
                {i < eventFlow.length - 1 && (
                  <div className="flex flex-col items-center my-1" style={{ height: 28 }}>
                    <div className="w-px flex-1 opacity-30" style={{ background: `linear-gradient(to bottom, ${node.color}, ${eventFlow[i+1].color})` }} />
                    <div className="core-flow w-1.5 h-1.5 rounded-full" style={{ background: eventFlow[i+1].color, marginTop: -3 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs font-medium mt-5" style={{ color: "rgba(255,255,255,.4)" }}>
            11 microservicios · &lt;200 ms de latencia · 99.98% uptime
          </p>
        </div>
      </div>

      {/* ── Section 5: System Monitor ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: "#059669" }} />
          <h3 className="font-black text-[#1C1135]">Monitoreo del Sistema</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>Todo en verde</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {systemMetrics.map(m => (
            <div key={m.label} className="core-card rounded-2xl p-4 text-center" style={{ background: "white", border: `1px solid ${B.border}` }}>
              <div className="relative w-12 h-12 mx-auto mb-2">
                <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#E8E5F4" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke={m.color} strokeWidth="3"
                    strokeDasharray={`${(m.val / 100) * 94.2} 94.2`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-[#1C1135]">{m.val}</span>
                </div>
              </div>
              <p className="text-xs font-bold text-[#7C6F9A]">{m.label}</p>
              <p className="text-xs font-medium" style={{ color: m.color }}>{m.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 6: Architecture ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: B.textMid }} />
          <h3 className="font-black text-[#1C1135]">Arquitectura del Ecosistema</h3>
        </div>
        <div className="rounded-3xl p-6" style={{ background: "white", border: `1px solid ${B.border}` }}>
          <div className="flex flex-col items-center gap-0 max-w-lg mx-auto">
            {archLayers.map((layer, i) => (
              <div key={layer.label} className="flex flex-col items-center w-full">
                <div className="core-card flex items-center gap-3 rounded-2xl px-5 py-3 w-full max-w-xs justify-center cursor-pointer"
                  style={{ background: layer.bg, border: `1px solid ${layer.color}22` }}>
                  <span style={{ color: layer.color }}>{layer.icon}</span>
                  <span className="font-extrabold text-sm text-[#1C1135]">{layer.label}</span>
                </div>
                {i < archLayers.length - 1 && (
                  <div className="flex flex-col items-center my-1" style={{ height: 24 }}>
                    <div className="w-px flex-1" style={{ background: `linear-gradient(to bottom, ${layer.color}60, ${archLayers[i+1].color}60)` }} />
                    <svg width="10" height="6" viewBox="0 0 10 6" style={{ color: archLayers[i+1].color }}>
                      <path d="M0 0 L5 5 L10 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#9E95B7] font-medium mt-5">
            ASHAKids · Arquitectura de microservicios · Spring Boot + React · MySQL 8.0
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Auditoría Operativa ──────────────────────────────────────────────────────

export function AdminAuditoria() {
  const [filter, setFilter] = useState<"todos" | "acceso" | "cambio" | "excepcion">("todos");
  const entries = [
    { actor: "Dra. Ana Ruiz",     tipo: "acceso",    accion: "Lectura de expediente clínico",         fecha: "30 Jul 2026 · 10:14", resultado: "Autorizado", motivo: "Vinculación activa" },
    { actor: "Laura Gómez",       tipo: "acceso",    accion: "Acceso a resumen compartido",            fecha: "30 Jul 2026 · 09:45", resultado: "Autorizado", motivo: "Acceso propio" },
    { actor: "Admin · Sistema",   tipo: "cambio",    accion: "Verificación de estado de cuenta",       fecha: "30 Jul 2026 · 09:00", resultado: "Completado", motivo: "Soporte operativo" },
    { actor: "ASHI · Sistema",    tipo: "acceso",    accion: "Lectura de datos de perfil operativo",   fecha: "29 Jul 2026 · 18:00", resultado: "Autorizado", motivo: "Contextual · mínimo necesario" },
    { actor: "Admin · Sistema",   tipo: "cambio",    accion: "Modificación de estado de terapeuta",    fecha: "29 Jul 2026 · 16:45", resultado: "Completado", motivo: "Verificación de credenciales" },
    { actor: "Lic. Carlos M.",    tipo: "acceso",    accion: "Lectura de expediente clínico",          fecha: "29 Jul 2026 · 11:20", resultado: "Autorizado", motivo: "Vinculación activa" },
    { actor: "Admin · Soporte",   tipo: "excepcion", accion: "Acceso a log de sesión técnica",         fecha: "28 Jul 2026 · 15:30", resultado: "Autorizado", motivo: "Incidente técnico reportado · ticket #4821" },
    { actor: "Admin · Sistema",   tipo: "cambio",    accion: "Desactivación de cuenta inactiva",       fecha: "28 Jul 2026 · 09:00", resultado: "Completado", motivo: "90 días sin actividad · aviso previo enviado" },
    { actor: "ASHI · Sistema",    tipo: "acceso",    accion: "Análisis de métricas de plataforma",     fecha: "27 Jul 2026 · 08:00", resultado: "Autorizado", motivo: "Función operativa" },
    { actor: "Admin · Sistema",   tipo: "cambio",    accion: "Activación de cuenta por reactivación",  fecha: "26 Jul 2026 · 14:15", resultado: "Completado", motivo: "Verificación de identidad superada" },
  ];

  const filtered = filter === "todos" ? entries : entries.filter(e => e.tipo === filter);

  const tipoColor: Record<string, { bg: string; color: string; label: string }> = {
    acceso:    { bg: "#EDE9FE", color: "#7C3AED", label: "Acceso" },
    cambio:    { bg: "#D1FAE5", color: "#059669", label: "Cambio" },
    excepcion: { bg: "#FEF3C7", color: "#D97706", label: "Excepción" },
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Notice */}
      <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-5 border" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
        <Shield size={14} className="text-blue-500 flex-shrink-0" />
        <p className="text-xs font-medium text-blue-700">
          <span className="font-extrabold">Registro operativo sin contenido clínico.</span> Solo se muestran actor, acción, fecha/hora, resultado y motivo de acceso. Los detalles clínicos están restringidos.
        </p>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135]">Auditoría operativa</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Registro de accesos y acciones · Datos simulados para demostración</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full border" style={{ background: B.orangeLight, color: B.orange, borderColor: "#FDBA74" }}>
          ⚠️ Datos simulados
        </span>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        {(["todos", "acceso", "cambio", "excepcion"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              background: filter === f ? B.violet : B.violetLight,
              color: filter === f ? "white" : B.violet,
            }}>
            {f === "todos" ? "Todos" : tipoColor[f].label}
          </button>
        ))}
      </div>

      {/* Audit table */}
      <div className="flex flex-col gap-2">
        {filtered.map((entry, i) => (
          <div key={i} className="rounded-2xl border border-[#E8E5F4] p-4 hover:bg-[#F5F3FF] transition-colors">
            <div className="flex items-start gap-3 flex-wrap">
              <span className="text-xs font-black px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5"
                style={{ background: tipoColor[entry.tipo].bg, color: tipoColor[entry.tipo].color }}>
                {tipoColor[entry.tipo].label}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <p className="font-extrabold text-sm text-[#1C1135]">{entry.accion}</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "#D1FAE5", color: "#059669" }}>
                    {entry.resultado}
                  </span>
                </div>
                <p className="text-xs text-[#4B4869] font-medium mb-0.5">
                  Actor: <span className="font-bold">{entry.actor}</span>
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-xs text-[#9E95B7] font-medium">{entry.fecha}</p>
                  <p className="text-xs font-medium text-[#7C6F9A]">Motivo: {entry.motivo}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-[#9E95B7] font-medium mt-5 italic">
        Política de retención del registro de auditoría: pendiente de aprobación. · {filtered.length} registros mostrados.
      </p>
    </div>
  );
}

// ── Alias ──────────────────────────────────────────────────────────────────────
export const AdminPagos = AdminFinanzas;

// ── Placeholder: Operación ─────────────────────────────────────────────────────
export function AdminOperacion({ go: _go }: { go: (v: View) => void }) {
  return (
    <div className="p-6 max-w-4xl mx-auto" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="mb-6">
        <p className="text-xs font-black text-[#9E95B7] uppercase tracking-widest mb-1">Admin · Operación</p>
        <h1 className="text-2xl font-black text-[#1C1135]">Operación</h1>
        <p className="text-sm text-[#7C6F9A] font-medium mt-1">Reservas, sesiones (estado técnico) e incidencias operativas.</p>
      </div>
      <div className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-6 border border-amber-200 bg-amber-50 text-sm font-bold text-amber-700">
        <span>⚙️</span> Datos simulados — esta sección está en construcción.
      </div>
      <Crd className="p-5">
        <p className="text-sm font-bold text-[#7C6F9A]">Próximamente: reservas del día, estado técnico de sesiones (sin contenido clínico) e incidencias con acciones operativas proporcionales.</p>
      </Crd>
    </div>
  );
}

// ── Placeholder: Machine Learning ──────────────────────────────────────────────
export function AdminML({ go: _go }: { go: (v: View) => void }) {
  const [modal, setModal] = useState<null | "ficha" | "dataset" | "comparar" | "decision">(null);
  const [decisionText, setDecisionText] = useState("");
  const [decisionSaved, setDecisionSaved] = useState(false);

  const versions = [
    { ver: "v0.3-demo", estado: "Validación", fecha: "30 Jul 2026", responsable: "Equipo autorizado",  activa: true  },
    { ver: "v0.2-demo", estado: "Aprobado",   fecha: "15 Jun 2026", responsable: "Equipo autorizado",  activa: false },
    { ver: "v0.1-demo", estado: "Retirado",   fecha: "02 May 2026", responsable: "Equipo autorizado",  activa: false },
  ];

  const estadoColor: Record<string, { bg: string; text: string }> = {
    "Borrador":   { bg: "#F3F4F6", text: "#6B7280" },
    "Validación": { bg: "#EDE9FE", text: "#5B21B6" },
    "Aprobado":   { bg: "#D1FAE5", text: "#059669" },
    "Retirado":   { bg: "#FEE2E2", text: "#DC2626" },
  };

  const metrics = [
    { label: "Sensibilidad",   val: "82 %", note: "Umbral pendiente de aprobación" },
    { label: "Especificidad",  val: "79 %", note: "Umbral pendiente de aprobación" },
    { label: "Falsos negativos", val: "8 %",  note: "Umbral pendiente de aprobación" },
    { label: "Calibración",    val: "0.84",  note: "Umbral pendiente de aprobación" },
  ];

  const perfEdad = [
    { grupo: "3–5 años",  val: 78, idioma: "Español (es-MX)" },
    { grupo: "6–8 años",  val: 84, idioma: "Español (es-AR)" },
    { grupo: "9–12 años", val: 81, idioma: "Español (es-CO)" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>

      {/* Page head */}
      <div className="mb-5">
        <p className="text-xs font-black text-[#9E95B7] uppercase tracking-widest mb-0.5">Admin · Machine Learning</p>
        <h1 className="text-2xl font-black text-[#1C1135]">Machine Learning</h1>
        <p className="text-sm text-[#7C6F9A] font-medium">Gobernanza y validación de modelos · Ninguna acción automática</p>
      </div>

      {/* Dual banner */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2.5 rounded-2xl px-4 py-3 border border-violet-300 bg-violet-50 text-sm font-bold text-violet-800">
          <span className="text-lg">⚠️</span>
          <span><strong>Orientación no diagnóstica</strong> · Los modelos apoyan la evaluación inicial; no sustituyen el criterio clínico ni emiten diagnósticos ni tratamientos.</span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl px-4 py-3 border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700 whitespace-nowrap">
          🔬 Datos simulados
        </div>
      </div>

      {/* Model card */}
      <Crd className="p-5 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="font-extrabold text-[#1C1135] text-lg">Evaluación Inicial ASHA</h3>
            <p className="text-xs text-[#9E95B7] font-medium mt-0.5">Modelo de orientación · v0.3-demo</p>
          </div>
          <span className="text-xs font-black px-3 py-1.5 rounded-full" style={estadoColor["Validación"]}>En validación</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {[
            { label: "Versión",      val: "v0.3-demo"       },
            { label: "Estado",       val: "En validación"   },
            { label: "Fecha",        val: "30 Jul 2026"     },
            { label: "Responsable",  val: "Equipo autorizado" },
            { label: "Publicado",    val: "No — pendiente"  },
            { label: "Diagnóstico",  val: "No aplica"       },
          ].map(f => (
            <div key={f.label} className="rounded-xl p-3" style={{ background: B.violetLight }}>
              <p className="text-xs font-bold text-[#9E95B7] mb-0.5">{f.label}</p>
              <p className="text-sm font-extrabold text-[#1C1135]">{f.val}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ["ficha",    "Ver ficha del modelo",  "📋"],
            ["dataset",  "Revisar dataset",        "🗂️"],
            ["comparar", "Comparar versión",       "⚖️"],
            ["decision", "Registrar decisión",     "✍️"],
          ] as const).map(([key, label, icon]) => (
            <button key={key} onClick={() => setModal(key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors">
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
      </Crd>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Gobernanza de datos */}
        <Crd className="p-5">
          <h3 className="font-extrabold text-[#1C1135] mb-4 flex items-center gap-2"><Lock size={15}/> Gobernanza de datos</h3>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: "✅", label: "Consentimiento verificable",        detail: "Registrado por familia antes de cualquier uso de datos." },
              { icon: "🔒", label: "Seudonimización",                   detail: "Ningún dato identificable llega al modelo." },
              { icon: "🏷️", label: "Etiquetado profesional",           detail: "Supervisado por terapeutas certificados." },
              { icon: "🚫", label: "Conversaciones ASHI excluidas",     detail: "Excluidas por defecto · requiere decisión explícita para inclusión." },
            ].map(g => (
              <div key={g.label} className="flex items-start gap-3 rounded-xl p-3 border border-[#F0EEF9]">
                <span className="text-base mt-0.5">{g.icon}</span>
                <div>
                  <p className="text-sm font-bold text-[#1C1135]">{g.label}</p>
                  <p className="text-xs text-[#9E95B7] font-medium mt-0.5">{g.detail}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Experimental source */}
          <div className="mt-4 rounded-xl p-4 border-2 border-dashed border-violet-300 bg-violet-50">
            <p className="text-xs font-black text-violet-700 uppercase tracking-wider mb-1">Fuente experimental separada</p>
            <p className="text-sm font-bold text-[#1C1135] mb-1">Señales agregadas de Mundo ASHA</p>
            <p className="text-xs text-[#7C6F9A] font-medium leading-relaxed">Origen: patrones agregados de juegos · Consentimiento explícito requerido · Minimización estricta · Sin resultados individuales · Sin identificación de niños.</p>
          </div>
        </Crd>

        {/* Métricas de validación */}
        <div className="flex flex-col gap-5">
          <Crd className="p-5">
            <h3 className="font-extrabold text-[#1C1135] mb-1 flex items-center gap-2"><BarChart2 size={15}/> Métricas de validación</h3>
            <p className="text-xs text-[#9E95B7] font-medium mb-4">Datos de demostración · v0.3-demo</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {metrics.map(m => (
                <div key={m.label} className="rounded-xl p-3" style={{ background: B.violetLight }}>
                  <p className="font-black text-xl text-[#1C1135]">{m.val}</p>
                  <p className="text-xs font-bold text-[#7C6F9A]">{m.label}</p>
                  <p className="text-xs text-amber-600 font-medium mt-1">{m.note}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3 border border-[#F0EEF9]">
              <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">Desempeño por edad e idioma</p>
              {perfEdad.map(p => (
                <div key={p.grupo} className="flex items-center gap-2 mb-2 last:mb-0">
                  <span className="text-xs font-bold text-[#7C6F9A] w-16 flex-shrink-0">{p.grupo}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: B.violetLight }}>
                    <div className="h-full rounded-full" style={{ width: `${p.val}%`, background: B.violet }} />
                  </div>
                  <span className="text-xs font-bold text-[#1C1135] w-8 text-right">{p.val}%</span>
                </div>
              ))}
              <p className="text-xs text-amber-600 font-medium mt-2">Umbrales pendientes de aprobación</p>
              <p className="text-xs text-[#9E95B7] font-medium mt-1">Idiomas: {perfEdad.map(p => p.idioma).join(" · ")}</p>
            </div>
          </Crd>

          {/* Sesgo y deriva */}
          <Crd className="p-4">
            <h3 className="font-extrabold text-[#1C1135] mb-3 flex items-center gap-2"><GitBranch size={14}/> Sesgo y deriva</h3>
            {[
              { label: "Revisión de sesgo",   estado: "Pendiente",   color: "#D97706", bg: "#FEF3C7" },
              { label: "Monitoreo de deriva", estado: "Activo (demo)", color: "#059669", bg: "#D1FAE5" },
              { label: "Auditoría externa",   estado: "No iniciada", color: "#6B7280", bg: "#F3F4F6" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-[#F5F3FF] last:border-0">
                <p className="text-sm font-bold text-[#1C1135]">{s.label}</p>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{s.estado}</span>
              </div>
            ))}
          </Crd>
        </div>
      </div>

      {/* Version history */}
      <Crd className="p-5">
        <h3 className="font-extrabold text-[#1C1135] mb-4 flex items-center gap-2"><Layers size={15}/> Historial de versiones</h3>
        <p className="text-xs text-[#9E95B7] font-medium mb-4">El rollback solo es posible mediante decisión registrada por responsable autorizado.</p>
        <div className="flex flex-col gap-2">
          {versions.map(v => (
            <div key={v.ver} className="flex items-center gap-3 rounded-xl p-3 border border-[#F0EEF9] flex-wrap min-w-0">
              <code className="text-xs font-black text-[#1C1135] bg-[#F5F3FF] px-2 py-1 rounded-lg">{v.ver}</code>
              <span className="text-xs font-black px-2.5 py-1 rounded-full" style={estadoColor[v.estado]}>{v.estado}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#7C6F9A] font-medium">{v.fecha} · {v.responsable}</p>
              </div>
              {!v.activa && v.estado !== "Retirado" && (
                <button onClick={() => setModal("decision")}
                  className="text-xs font-bold text-violet-600 hover:underline whitespace-nowrap">Rollback →</button>
              )}
              {v.activa && <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">Activa</span>}
            </div>
          ))}
        </div>
      </Crd>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(28,17,53,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-[calc(100vw-2rem)] max-w-md max-h-[85vh] overflow-y-auto p-6" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[#1C1135]">
                {modal === "ficha"    && "Ficha del modelo"}
                {modal === "dataset"  && "Revisión de dataset"}
                {modal === "comparar" && "Comparar versiones"}
                {modal === "decision" && "Registrar decisión"}
              </h2>
              <button onClick={() => { setModal(null); setDecisionSaved(false); setDecisionText(""); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#F5F3FF] transition-colors" aria-label="Cerrar">
                <X size={16} className="text-[#7C6F9A]" />
              </button>
            </div>

            {modal === "ficha" && (
              <div className="flex flex-col gap-3 text-sm">
                {[["Nombre", "Evaluación Inicial ASHA"], ["Versión", "v0.3-demo"], ["Tipo", "Clasificación orientativa"], ["Entrenado con", "Datos seudonimizados con consentimiento"], ["Salida", "Recomendación de derivación — no diagnóstico"], ["Publicado", "No · pendiente de aprobación"]].map(([k,v]) => (
                  <div key={k} className="flex gap-3 rounded-xl p-3" style={{ background: B.violetLight }}>
                    <span className="font-bold text-[#7C6F9A] w-28 flex-shrink-0">{k}</span>
                    <span className="font-extrabold text-[#1C1135]">{v}</span>
                  </div>
                ))}
                <p className="text-xs text-amber-600 font-bold mt-1">⚠️ Datos simulados · Valores de demostración</p>
              </div>
            )}

            {modal === "dataset" && (
              <div className="flex flex-col gap-3 text-sm">
                <div className="rounded-xl p-3 border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700">⚠️ Datos simulados · No corresponden a usuarios reales</div>
                {[["Registros", "4,200 (demo)"], ["Etiquetado", "Profesional supervisado"], ["Idiomas", "es-MX, es-AR, es-CO"], ["Consentimiento", "Verificado en todos los registros"], ["ASHI excluido", "Sí — por defecto"], ["Actualizado", "30 Jul 2026 (demo)"]].map(([k,v]) => (
                  <div key={k} className="flex gap-3 rounded-xl p-3" style={{ background: B.violetLight }}>
                    <span className="font-bold text-[#7C6F9A] w-32 flex-shrink-0">{k}</span>
                    <span className="font-extrabold text-[#1C1135]">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {modal === "comparar" && (
              <div className="flex flex-col gap-3 text-sm">
                <div className="rounded-xl p-3 border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700">⚠️ Datos simulados de demostración</div>
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold text-center min-w-[260px]">
                    {["Métrica", "v0.2", "v0.3"].map(h => <div key={h} className="rounded-lg p-2 bg-[#F5F3FF] text-[#7C6F9A]">{h}</div>)}
                    {[["Sensibilidad", "78%", "82%"], ["Especificidad", "75%", "79%"], ["F. negativos", "10%", "8%"], ["Calibración", "0.80", "0.84"]].map(([m, a, b]) => (
                      <React.Fragment key={m}>
                        <div className="rounded-lg p-2 border border-[#F0EEF9] font-medium text-[#1C1135]">{m}</div>
                        <div className="rounded-lg p-2 border border-[#F0EEF9] text-[#7C6F9A]">{a}</div>
                        <div className="rounded-lg p-2 border border-[#F0EEF9] text-violet-700 font-extrabold">{b}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {modal === "decision" && !decisionSaved && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[#7C6F9A] font-medium">La decisión quedará registrada en el log de auditoría con fecha, responsable y motivo. No activa ningún cambio automático.</p>
                <textarea value={decisionText} onChange={e => setDecisionText(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E5F4] p-3 text-sm font-medium text-[#1C1135] resize-none focus:outline-none focus:border-violet-400"
                  rows={4} placeholder="Describe la decisión, motivo y alcance..." />
                <button onClick={() => { if (decisionText.trim()) setDecisionSaved(true); }}
                  disabled={!decisionText.trim()}
                  className="w-full py-3 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
                  Registrar decisión
                </button>
              </div>
            )}
            {modal === "decision" && decisionSaved && (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle size={40} className="text-green-500" />
                <p className="font-extrabold text-[#1C1135] text-center">Decisión registrada</p>
                <p className="text-xs text-[#9E95B7] font-medium text-center">Quedó asentada en el log de auditoría · 30 Jul 2026 · Equipo autorizado</p>
                <button onClick={() => { setModal(null); setDecisionSaved(false); setDecisionText(""); }}
                  className="px-6 py-2 rounded-2xl border border-[#E8E5F4] text-sm font-bold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors">
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

