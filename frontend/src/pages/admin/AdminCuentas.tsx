import React, { useState } from "react";
import { Plus, Search, X, Mail, CheckCircle, Trash2 } from "lucide-react";
import { B, View } from "@/components/shared";

// ─── Gestión de Cuentas ────────────────────────────────────────────────────────

export type AccountRole = "familia" | "terapeuta";
export type AccountStatus = "activa" | "pendiente" | "suspendida";

export type ManagedAccount = {
  id: number;
  role: AccountRole;
  name: string;
  email: string;
  phone: string;
  status: AccountStatus;
  plan?: "exploracion" | "familia";
  especialidad?: string;
  licencia?: string;
  createdAt: string;
};

export const INITIAL_ACCOUNTS: ManagedAccount[] = [
  { id: 1, role: "familia",    name: "Laura Gómez",       email: "laura.gomez@demo.com",      phone: "+51 987 654 321", status: "activa",     plan: "familia",     createdAt: "12 Ene 2026" },
  { id: 2, role: "familia",    name: "Carlos Díaz",        email: "carlos.diaz@demo.com",       phone: "+51 912 345 678", status: "activa",     plan: "exploracion", createdAt: "18 Feb 2026" },
  { id: 3, role: "familia",    name: "Sofía Ramírez",      email: "sofia.ramirez@demo.com",     phone: "+51 945 678 901", status: "pendiente",  plan: "exploracion", createdAt: "03 Mar 2026" },
  { id: 4, role: "terapeuta",  name: "Dra. Ana Ruiz",      email: "ana.ruiz@demo.com",          phone: "+51 998 765 432", status: "activa",     especialidad: "Lenguaje", licencia: "COP-00412", createdAt: "05 Nov 2025" },
  { id: 5, role: "terapeuta",  name: "Lic. Marco Torres",  email: "marco.torres@demo.com",      phone: "+51 977 123 456", status: "activa",     especialidad: "Psicomotricidad", licencia: "COP-00589", createdAt: "14 Dic 2025" },
  { id: 6, role: "terapeuta",  name: "Ps. Valeria Ríos",   email: "valeria.rios@demo.com",      phone: "+51 966 789 012", status: "suspendida", especialidad: "Psicología", licencia: "COP-00731", createdAt: "22 Ene 2026" },
];

export const STATUS_LABEL: Record<AccountStatus, string> = { activa: "Activa", pendiente: "Pendiente", suspendida: "Suspendida" };
export const STATUS_COLOR: Record<AccountStatus, { bg: string; color: string }> = {
  activa:     { bg: "#ECFDF5", color: "#059669" },
  pendiente:  { bg: "#FFFBEB", color: "#D97706" },
  suspendida: { bg: "#FEF2F2", color: "#DC2626" },
};

const BLANK_FAMILIA: Omit<ManagedAccount, "id" | "createdAt"> = {
  role: "familia", name: "", email: "", phone: "", status: "activa", plan: "exploracion",
};
const BLANK_TERAPEUTA: Omit<ManagedAccount, "id" | "createdAt"> = {
  role: "terapeuta", name: "", email: "", phone: "", status: "activa", especialidad: "", licencia: "",
};

export function AdminCuentas({ go: _go }: { go: (v: View) => void }) {
  const [tab, setTab] = useState<AccountRole>("familia");
  const [accounts, setAccounts] = useState<ManagedAccount[]>(INITIAL_ACCOUNTS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"nueva" | "detail" | null>(null);
  const [form, setForm] = useState<Omit<ManagedAccount, "id" | "createdAt">>(BLANK_FAMILIA);
  const [selected, setSelected] = useState<ManagedAccount | null>(null);
  const [saved, setSaved] = useState(false);
  const [nextId, setNextId] = useState(100);

  const visible = accounts.filter(a =>
    a.role === tab &&
    (search === "" || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()))
  );

  function openNueva() {
    setForm(tab === "familia" ? { ...BLANK_FAMILIA } : { ...BLANK_TERAPEUTA });
    setSaved(false);
    setModal("nueva");
  }

  function openDetail(acc: ManagedAccount) {
    setSelected(acc);
    setModal("detail");
  }

  function handleCreate() {
    if (!form.name.trim() || !form.email.trim()) return;
    const now = new Date();
    const fecha = now.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
    setAccounts(prev => [{ ...form, id: nextId, createdAt: fecha } as ManagedAccount, ...prev]);
    setNextId(n => n + 1);
    setSaved(true);
  }

  function handleToggleStatus(id: number) {
    setAccounts(prev => prev.map(a => {
      if (a.id !== id) return a;
      const next: AccountStatus = a.status === "activa" ? "suspendida" : "activa";
      return { ...a, status: next };
    }));
    if (selected?.id === id) setSelected(s => s ? { ...s, status: s.status === "activa" ? "suspendida" : "activa" } : s);
  }

  function handleDelete(id: number) {
    setAccounts(prev => prev.filter(a => a.id !== id));
    setModal(null);
    setSelected(null);
  }

  const famCount = accounts.filter(a => a.role === "familia").length;
  const terCount = accounts.filter(a => a.role === "terapeuta").length;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#1C1135]">Gestión de Cuentas</h1>
          <p className="text-sm text-[#7C6F9A] font-medium mt-1">Sistema cerrado — solo el administrador crea accesos.</p>
        </div>
        <button
          onClick={openNueva}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-sm text-white"
          style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}
        >
          <Plus size={16} /> Nueva cuenta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Familias",    value: famCount, icon: "👨‍👩‍👧‍👦", bg: B.violetLight, color: B.violet },
          { label: "Terapeutas",  value: terCount, icon: "👩‍⚕️", bg: "#F0FDFA",       color: B.teal },
          { label: "Total cuentas", value: accounts.length, icon: "🔐", bg: "#FFFBEB", color: B.orange },
          { label: "Suspendidas", value: accounts.filter(a => a.status === "suspendida").length, icon: "⛔", bg: "#FEF2F2", color: "#DC2626" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: s.bg }}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-bold text-[#7C6F9A]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex rounded-2xl border border-[#E8E5F4] bg-white overflow-hidden">
          {(["familia", "terapeuta"] as AccountRole[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch(""); }}
              className={`flex-1 px-5 py-2.5 text-sm font-extrabold transition-all ${tab === t ? "text-white" : "text-[#7C6F9A] hover:bg-violet-50"}`}
              style={tab === t ? { background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` } : {}}
            >
              {t === "familia" ? "👨‍👩‍👧‍👦 Familias" : "👩‍⚕️ Terapeutas"}
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E8E5F4] rounded-2xl px-3">
          <Search size={15} className="text-[#9E95B7]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email…"
            className="flex-1 bg-transparent text-sm font-medium text-[#1C1135] placeholder-[#C4BDD8] py-2.5 outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {visible.length === 0 && (
          <div className="text-center py-16 text-[#9E95B7] font-medium text-sm">Sin cuentas que coincidan.</div>
        )}
        {visible.map(acc => {
          const sc = STATUS_COLOR[acc.status];
          return (
            <button
              key={acc.id}
              onClick={() => openDetail(acc)}
              className="w-full text-left bg-white border border-[#E8E5F4] rounded-2xl px-4 py-3.5 flex items-center gap-4 hover:border-violet-300 hover:bg-violet-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm text-white flex-shrink-0"
                style={{ background: acc.role === "familia" ? B.violet : B.teal }}>
                {acc.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#1C1135] truncate">{acc.name}</p>
                <p className="text-xs text-[#9E95B7] font-medium truncate">{acc.email}</p>
              </div>
              {acc.role === "terapeuta" && acc.especialidad && (
                <span className="hidden sm:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                  style={{ background: "#F0FDFA", color: B.teal }}>
                  {acc.especialidad}
                </span>
              )}
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: sc.bg, color: sc.color }}>
                {STATUS_LABEL[acc.status]}
              </span>
              <p className="hidden sm:block text-[11px] text-[#C4BDD8] font-medium flex-shrink-0">{acc.createdAt}</p>
            </button>
          );
        })}
      </div>

      {/* ── Modal: Nueva cuenta ── */}
      {modal === "nueva" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E8E5F4]">
              <h2 className="font-black text-lg text-[#1C1135]">
                {tab === "familia" ? "Nueva cuenta familiar" : "Nueva cuenta terapeuta"}
              </h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center rounded-xl text-[#9E95B7] hover:bg-[#F5F3FF] transition-colors">
                <X size={18} />
              </button>
            </div>

            {!saved ? (
              <div className="px-6 py-5 flex flex-col gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wider mb-1.5">Nombre completo *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={tab === "familia" ? "ej. Laura Gómez" : "ej. Dra. Ana Ruiz"}
                    className="w-full border border-[#E8E5F4] rounded-2xl px-4 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-400 transition-colors"
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="block text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wider mb-1.5">Correo electrónico *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                    className="w-full border border-[#E8E5F4] rounded-2xl px-4 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-400 transition-colors"
                  />
                </div>
                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wider mb-1.5">Teléfono</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+51 9XX XXX XXX"
                    className="w-full border border-[#E8E5F4] rounded-2xl px-4 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-400 transition-colors"
                  />
                </div>

                {tab === "terapeuta" && (
                  <>
                    <div>
                      <label className="block text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wider mb-1.5">Especialidad</label>
                      <select
                        value={(form as any).especialidad}
                        onChange={e => setForm(f => ({ ...f, especialidad: e.target.value }))}
                        className="w-full border border-[#E8E5F4] rounded-2xl px-4 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-400 bg-white transition-colors"
                      >
                        <option value="">Seleccionar…</option>
                        {["Lenguaje", "Psicomotricidad", "Psicología", "Terapia Ocupacional", "Fonoaudiología"].map(e => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wider mb-1.5">N° Licencia / Colegiatura</label>
                      <input
                        value={(form as any).licencia}
                        onChange={e => setForm(f => ({ ...f, licencia: e.target.value }))}
                        placeholder="ej. COP-00412"
                        className="w-full border border-[#E8E5F4] rounded-2xl px-4 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-400 transition-colors"
                      />
                    </div>
                  </>
                )}

                <p className="text-xs text-[#9E95B7] font-medium bg-[#F5F3FF] rounded-xl px-3 py-2.5">
                  Se enviará un correo de bienvenida con las credenciales de acceso al usuario.
                </p>

                <div className="flex gap-2 pt-1">
                  <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!form.name.trim() || !form.email.trim()}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}
                  >
                    <Mail size={14} /> Crear y enviar acceso
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle size={36} className="text-green-500" />
                </div>
                <div className="text-center">
                  <p className="font-black text-[#1C1135] text-lg">Cuenta creada</p>
                  <p className="text-sm text-[#7C6F9A] font-medium mt-1">
                    Se envió el acceso a <span className="font-extrabold text-[#1C1135]">{form.email}</span>
                  </p>
                </div>
                <button
                  onClick={() => setModal(null)}
                  className="px-8 py-2.5 rounded-2xl font-extrabold text-sm text-white"
                  style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}
                >
                  Listo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Detalle de cuenta ── */}
      {modal === "detail" && selected && (() => {
        const sc = STATUS_COLOR[selected.status];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E8E5F4]">
                <h2 className="font-black text-base text-[#1C1135]">Detalle de cuenta</h2>
                <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center rounded-xl text-[#9E95B7] hover:bg-[#F5F3FF] transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 py-5 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-lg text-white flex-shrink-0"
                    style={{ background: selected.role === "familia" ? B.violet : B.teal }}>
                    {selected.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-[#1C1135]">{selected.name}</p>
                    <p className="text-xs text-[#9E95B7] font-medium">{selected.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                      style={{ background: sc.bg, color: sc.color }}>
                      {STATUS_LABEL[selected.status]}
                    </span>
                  </div>
                </div>

                <div className="bg-[#F8F7FF] rounded-2xl p-4 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#9E95B7] font-bold">Tipo</span><span className="font-extrabold text-[#1C1135] capitalize">{selected.role === "familia" ? "Familia" : "Terapeuta"}</span></div>
                  {selected.phone && <div className="flex justify-between"><span className="text-[#9E95B7] font-bold">Teléfono</span><span className="font-extrabold text-[#1C1135]">{selected.phone}</span></div>}
                  {selected.especialidad && <div className="flex justify-between"><span className="text-[#9E95B7] font-bold">Especialidad</span><span className="font-extrabold text-[#1C1135]">{selected.especialidad}</span></div>}
                  {selected.licencia && <div className="flex justify-between"><span className="text-[#9E95B7] font-bold">Licencia</span><span className="font-extrabold text-[#1C1135]">{selected.licencia}</span></div>}
                  <div className="flex justify-between"><span className="text-[#9E95B7] font-bold">Creada</span><span className="font-extrabold text-[#1C1135]">{selected.createdAt}</span></div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(selected.id)}
                    className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold transition-colors hover:bg-[#F5F3FF]"
                    style={{ color: selected.status === "activa" ? "#DC2626" : "#059669" }}
                  >
                    {selected.status === "activa" ? "Suspender" : "Reactivar"}
                  </button>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="flex-1 py-2.5 rounded-2xl border border-red-100 text-sm font-extrabold text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
