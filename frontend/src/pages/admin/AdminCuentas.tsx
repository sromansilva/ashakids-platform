import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  X,
  Mail,
  CheckCircle,
  Trash2,
  Pencil,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Power,
  Shield,
} from "lucide-react";
import { B, View } from "@/components/shared";
import { adminService } from "@/services/adminService";
import {
  ActualizarCuentaPayload,
  CrearPadrePayload,
  CrearTerapeutaPayload,
  CuentaItem,
} from "@/types/auth";
import { ApiError } from "@/api/client";

// ─── Tipos Locales y Mapeos ────────────────────────────────────────────────────────

export type TabRole = "PADRE" | "TERAPEUTA";

// Compatibilidad hacia atrás (re-exportado por Admin.tsx)
export type AccountRole = "familia" | "terapeuta";
export type AccountStatus = "activa" | "pendiente" | "suspendida";
export type ManagedAccount = {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
  createdAt: string;
  detail: string;
  avatar: string;
  phone?: string;
  specialty?: string;
};
export const INITIAL_ACCOUNTS: ManagedAccount[] = [];
export const STATUS_LABEL: Record<AccountStatus, string> = {
  activa: "Activa",
  pendiente: "Pendiente",
  suspendida: "Suspendida",
};
export const STATUS_COLOR: Record<AccountStatus, { bg: string; color: string }> = {
  activa: { bg: "#ECFDF5", color: "#059669" },
  pendiente: { bg: "#FFFBEB", color: "#D97706" },
  suspendida: { bg: "#FEF2F2", color: "#DC2626" },
};

export function AdminCuentas({ go: _go }: { go: (v: View) => void }) {
  const [tab, setTab] = useState<TabRole>("PADRE");
  const [cuentas, setCuentas] = useState<CuentaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Modales
  const [modal, setModal] = useState<
    "nueva" | "detail" | "editar" | "suspender" | "activar" | "eliminar" | null
  >(null);
  const [selected, setSelected] = useState<CuentaItem | null>(null);

  // Formulario de Creación
  const [formPadre, setFormPadre] = useState<CrearPadrePayload>({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    parentesco: "Padre",
    telefono: "",
    direccion: "",
  });

  const [formTerapeuta, setFormTerapeuta] = useState<CrearTerapeutaPayload>({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    especialidad: "Terapia de lenguaje",
    anios_experiencia: 1,
    idiomas: "Español",
    descripcion_profesional: "",
  });

  // Formulario de Edición
  const [editForm, setEditForm] = useState<ActualizarCuentaPayload>({});

  // Carga inicial y refresco de cuentas
  async function cargarCuentas() {
    setLoading(true);
    setErrorBanner(null);
    try {
      const res = await adminService.getCuentas();
      setCuentas(res.items || []);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError ? err.message : "Error al cargar las cuentas del sistema.";
      setErrorBanner(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarCuentas();
  }, []);

  // Notificación temporal
  function showToast(msg: string) {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4000);
  }

  // Filtrado
  const visible = cuentas.filter(a => {
    const matchRole = a.rol === tab;
    const term = search.toLowerCase().trim();
    const matchSearch =
      !term ||
      a.nombres.toLowerCase().includes(term) ||
      a.apellidos.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term) ||
      a.codigo_usuario.toLowerCase().includes(term);
    return matchRole && matchSearch;
  });

  const famCount = cuentas.filter(a => a.rol === "PADRE").length;
  const terCount = cuentas.filter(a => a.rol === "TERAPEUTA").length;
  const suspCount = cuentas.filter(a => !a.activo).length;

  function formatDate(dStr: string) {
    try {
      return new Date(dStr).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dStr;
    }
  }

  // Apertura de Modales
  function openNueva() {
    setFormPadre({
      nombres: "",
      apellidos: "",
      email: "",
      password: "",
      parentesco: "Padre",
      telefono: "",
      direccion: "",
    });
    setFormTerapeuta({
      nombres: "",
      apellidos: "",
      email: "",
      password: "",
      especialidad: "Terapia de lenguaje",
      anios_experiencia: 1,
      idiomas: "Español",
      descripcion_profesional: "",
    });
    setErrorBanner(null);
    setModal("nueva");
  }

  function openDetail(acc: CuentaItem) {
    setSelected(acc);
    setModal("detail");
  }

  function openEditar(acc: CuentaItem) {
    setSelected(acc);
    if (acc.rol === "PADRE") {
      setEditForm({
        nombres: acc.nombres,
        apellidos: acc.apellidos,
        email: acc.email,
        parentesco: acc.tutor?.parentesco || "",
        telefono: acc.tutor?.telefono || "",
        direccion: acc.tutor?.direccion || "",
      });
    } else {
      setEditForm({
        nombres: acc.nombres,
        apellidos: acc.apellidos,
        email: acc.email,
        especialidad: acc.terapeuta?.especialidad || "",
        anios_experiencia: acc.terapeuta?.anios_experiencia || 0,
        idiomas: acc.terapeuta?.idiomas || "",
        descripcion_profesional: acc.terapeuta?.descripcion_profesional || "",
      });
    }
    setErrorBanner(null);
    setModal("editar");
  }

  // Acciones CRUD
  async function handleCrear() {
    setSubmitting(true);
    setErrorBanner(null);
    try {
      if (tab === "PADRE") {
        const res = await adminService.crearPadre(formPadre);
        showToast(res.message);
      } else {
        const res = await adminService.crearTerapeuta(formTerapeuta);
        showToast(res.message);
      }
      setModal(null);
      await cargarCuentas();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Error al crear la cuenta.";
      setErrorBanner(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGuardarEdicion() {
    if (!selected) return;
    setSubmitting(true);
    setErrorBanner(null);
    try {
      const res = await adminService.actualizarCuenta(selected.id_usuario, editForm);
      showToast(res.message);
      setModal(null);
      await cargarCuentas();
      if (res.cuenta) setSelected(res.cuenta);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Error al actualizar la cuenta.";
      setErrorBanner(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSuspenderConfirmado() {
    if (!selected) return;
    setSubmitting(true);
    setErrorBanner(null);
    try {
      const res = await adminService.suspenderCuenta(selected.id_usuario);
      showToast(res.message);
      setModal(null);
      await cargarCuentas();
      if (res.cuenta) setSelected(res.cuenta);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Error al suspender la cuenta.";
      setErrorBanner(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleActivarConfirmado() {
    if (!selected) return;
    setSubmitting(true);
    setErrorBanner(null);
    try {
      const res = await adminService.activarCuenta(selected.id_usuario);
      showToast(res.message);
      setModal(null);
      await cargarCuentas();
      if (res.cuenta) setSelected(res.cuenta);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Error al activar la cuenta.";
      setErrorBanner(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEliminarConfirmado() {
    if (!selected) return;
    setSubmitting(true);
    setErrorBanner(null);
    try {
      const res = await adminService.eliminarCuenta(selected.id_usuario);
      showToast(res.message);
      setModal(null);
      setSelected(null);
      await cargarCuentas();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Error al eliminar la cuenta.";
      setErrorBanner(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Notificación de éxito */}
      {successBanner && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-4 py-3 flex items-center justify-between text-sm font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-600 hover:text-emerald-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Notificación de error global */}
      {errorBanner && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl px-4 py-3 flex items-center justify-between text-sm font-bold shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)} className="text-red-600 hover:text-red-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#1C1135]">Gestión de Cuentas</h1>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
              FastAPI + PostgreSQL
            </span>
          </div>
          <p className="text-sm text-[#7C6F9A] font-medium mt-1">
            Sistema cerrado con control de acceso por roles, contraseñas Argon2id y auditoría centralizada.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cargarCuentas}
            disabled={loading}
            title="Actualizar listado"
            className="p-2.5 rounded-2xl border border-[#E8E5F4] bg-white text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openNueva}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-sm text-white shadow-md hover:opacity-95 transition-all"
            style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}
          >
            <Plus size={16} /> Nueva cuenta
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Familias", value: famCount, icon: "👨‍👩‍👧‍👦", bg: B.violetLight, color: B.violet },
          { label: "Terapeutas", value: terCount, icon: "👩‍⚕️", bg: "#F0FDFA", color: B.teal },
          { label: "Total activas", value: cuentas.filter(a => a.activo).length, icon: "🔐", bg: "#FFFBEB", color: B.orange },
          { label: "Suspendidas", value: suspCount, icon: "⛔", bg: "#FEF2F2", color: "#DC2626" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3 border border-[#E8E5F4]/60 bg-white" style={{ background: s.bg }}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-bold text-[#7C6F9A]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex rounded-2xl border border-[#E8E5F4] bg-white overflow-hidden p-1 gap-1">
          {(["PADRE", "TERAPEUTA"] as TabRole[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch(""); }}
              className={`flex-1 px-5 py-2 rounded-xl text-sm font-extrabold transition-all ${
                tab === t
                  ? "text-white shadow-sm"
                  : "text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700"
              }`}
              style={tab === t ? { background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` } : {}}
            >
              {t === "PADRE" ? "👨‍👩‍👧‍👦 Familias / Padres" : "👩‍⚕️ Terapeutas"}
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E8E5F4] rounded-2xl px-3 shadow-sm">
          <Search size={15} className="text-[#9E95B7]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por código (ej. p00001), nombre o email…"
            className="flex-1 bg-transparent text-sm font-medium text-[#1C1135] placeholder-[#C4BDD8] py-2.5 outline-none"
          />
        </div>
      </div>

      {/* Listado de Cuentas */}
      <div className="flex flex-col gap-2.5">
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-[#7C6F9A]">
            <Loader2 className="animate-spin text-violet-600" size={24} />
            <span className="text-sm font-extrabold">Cargando cuentas desde FastAPI…</span>
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="text-center py-16 text-[#9E95B7] font-medium text-sm bg-white border border-[#E8E5F4] rounded-2xl">
            Sin cuentas que coincidan con los criterios.
          </div>
        )}

        {!loading &&
          visible.map(acc => {
            const initials = `${acc.nombres[0] || ""}${acc.apellidos[0] || ""}`.toUpperCase();
            return (
              <div
                key={acc.id_usuario}
                className="w-full bg-white border border-[#E8E5F4] rounded-2xl px-4 py-3.5 flex items-center gap-4 hover:border-violet-300 hover:shadow-sm transition-all"
              >
                {/* Avatar */}
                <button
                  onClick={() => openDetail(acc)}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white flex-shrink-0 shadow-sm"
                  style={{ background: acc.rol === "PADRE" ? B.violet : B.teal }}
                >
                  {initials}
                </button>

                {/* Información Principal */}
                <div
                  onClick={() => openDetail(acc)}
                  className="flex-1 min-w-0 cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-sm text-[#1C1135] truncate hover:text-violet-700 transition-colors">
                      {acc.nombres} {acc.apellidos}
                    </p>
                    <span className="font-mono text-[11px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                      {acc.codigo_usuario}
                    </span>
                  </div>
                  <p className="text-xs text-[#9E95B7] font-medium truncate">{acc.email}</p>
                </div>

                {/* Especialidad de terapeuta si existe */}
                {acc.rol === "TERAPEUTA" && acc.terapeuta?.especialidad && (
                  <span
                    className="hidden sm:inline-block text-[11px] font-extrabold px-2.5 py-1 rounded-full"
                    style={{ background: "#F0FDFA", color: B.teal }}
                  >
                    {acc.terapeuta.especialidad}
                  </span>
                )}

                {/* Badge de estado Activo / Suspendido */}
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    acc.activo
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {acc.activo ? "Activa" : "Suspendida"}
                </span>

                <p className="hidden md:block text-[11px] text-[#C4BDD8] font-medium flex-shrink-0">
                  {formatDate(acc.fecha_creacion)}
                </p>

                {/* Acciones Rápidas */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditar(acc)}
                    title="Editar cuenta"
                    className="p-2 rounded-xl text-gray-500 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => openDetail(acc)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#E8E5F4] text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"
                  >
                    Ver
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* ── Modal: Detalle de Cuenta ── */}
      {modal === "detail" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-[#E8E5F4]">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E8E5F4]">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-violet-600" />
                <h2 className="font-black text-base text-[#1C1135]">Detalle de cuenta</h2>
              </div>
              <button
                onClick={() => setModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-[#9E95B7] hover:bg-[#F5F3FF] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-white flex-shrink-0 shadow-md"
                  style={{ background: selected.rol === "PADRE" ? B.violet : B.teal }}
                >
                  {`${selected.nombres[0] || ""}${selected.apellidos[0] || ""}`.toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-[#1C1135] text-base">
                    {selected.nombres} {selected.apellidos}
                  </p>
                  <p className="text-xs text-[#9E95B7] font-medium">{selected.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                      {selected.codigo_usuario}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        selected.activo
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {selected.activo ? "Activa" : "Suspendida"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ficha de datos */}
              <div className="bg-[#F8F7FF] rounded-2xl p-4 flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#9E95B7] font-bold">Rol en el sistema</span>
                  <span className="font-extrabold text-[#1C1135]">{selected.rol}</span>
                </div>
                {selected.rol === "PADRE" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#9E95B7] font-bold">Parentesco</span>
                      <span className="font-extrabold text-[#1C1135]">
                        {selected.tutor?.parentesco || "No especificado"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9E95B7] font-bold">Teléfono de contacto</span>
                      <span className="font-extrabold text-[#1C1135]">
                        {selected.tutor?.telefono || "No especificado"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9E95B7] font-bold">Dirección</span>
                      <span className="font-extrabold text-[#1C1135] truncate max-w-[200px]">
                        {selected.tutor?.direccion || "No especificada"}
                      </span>
                    </div>
                  </>
                )}
                {selected.rol === "TERAPEUTA" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#9E95B7] font-bold">Especialidad</span>
                      <span className="font-extrabold text-[#1C1135]">
                        {selected.terapeuta?.especialidad || "No especificada"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9E95B7] font-bold">Años de experiencia</span>
                      <span className="font-extrabold text-[#1C1135]">
                        {selected.terapeuta?.anios_experiencia ?? "No especificado"} años
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9E95B7] font-bold">Idiomas</span>
                      <span className="font-extrabold text-[#1C1135]">
                        {selected.terapeuta?.idiomas || "Español"}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t border-[#E8E5F4]/70 pt-2">
                  <span className="text-[#9E95B7] font-bold">Fecha de registro</span>
                  <span className="font-extrabold text-[#1C1135]">
                    {formatDate(selected.fecha_creacion)}
                  </span>
                </div>
              </div>

              {/* Botonera de acciones */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditar(selected)}
                    className="flex-1 py-2.5 rounded-2xl border border-violet-200 bg-violet-50 text-violet-800 text-sm font-extrabold hover:bg-violet-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Pencil size={15} /> Editar datos
                  </button>
                  <button
                    onClick={() => setModal(selected.activo ? "suspender" : "activar")}
                    className={`flex-1 py-2.5 rounded-2xl border text-sm font-extrabold transition-colors flex items-center justify-center gap-1.5 ${
                      selected.activo
                        ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    <Power size={15} />
                    {selected.activo ? "Suspender" : "Activar"}
                  </button>
                </div>
                <button
                  onClick={() => setModal("eliminar")}
                  className="w-full py-2.5 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-sm font-extrabold hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={15} /> Eliminar cuenta permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Crear Cuenta ── */}
      {modal === "nueva" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] border border-[#E8E5F4]">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E8E5F4]">
              <div>
                <h2 className="font-black text-lg text-[#1C1135]">
                  {tab === "PADRE" ? "Nueva cuenta de Padre / Familia" : "Nueva cuenta de Terapeuta"}
                </h2>
                <p className="text-xs text-[#7C6F9A] font-medium mt-0.5">
                  El código de 6 caracteres ({tab === "PADRE" ? "pXXXXX" : "tXXXXX"}) se generará automáticamente.
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-[#9E95B7] hover:bg-[#F5F3FF] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-3.5">
              {errorBanner && (
                <div className="bg-red-50 text-red-800 border border-red-200 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-600 flex-shrink-0" />
                  <span>{errorBanner}</span>
                </div>
              )}

              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Nombres *</label>
                  <input
                    value={tab === "PADRE" ? formPadre.nombres : formTerapeuta.nombres}
                    onChange={e =>
                      tab === "PADRE"
                        ? setFormPadre(f => ({ ...f, nombres: e.target.value }))
                        : setFormTerapeuta(f => ({ ...f, nombres: e.target.value }))
                    }
                    placeholder="Ej. Juan"
                    className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Apellidos *</label>
                  <input
                    value={tab === "PADRE" ? formPadre.apellidos : formTerapeuta.apellidos}
                    onChange={e =>
                      tab === "PADRE"
                        ? setFormPadre(f => ({ ...f, apellidos: e.target.value }))
                        : setFormTerapeuta(f => ({ ...f, apellidos: e.target.value }))
                    }
                    placeholder="Ej. Pérez"
                    className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Correo electrónico *</label>
                <input
                  type="email"
                  value={tab === "PADRE" ? formPadre.email : formTerapeuta.email}
                  onChange={e =>
                    tab === "PADRE"
                      ? setFormPadre(f => ({ ...f, email: e.target.value }))
                      : setFormTerapeuta(f => ({ ...f, email: e.target.value }))
                  }
                  placeholder="correo@ejemplo.com"
                  className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                />
              </div>

              {/* Contraseña Inicial */}
              <div>
                <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">
                  Contraseña inicial (Argon2id) *
                </label>
                <input
                  type="password"
                  value={tab === "PADRE" ? formPadre.password : formTerapeuta.password}
                  onChange={e =>
                    tab === "PADRE"
                      ? setFormPadre(f => ({ ...f, password: e.target.value }))
                      : setFormTerapeuta(f => ({ ...f, password: e.target.value }))
                  }
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                />
              </div>

              {/* Campos específicos Padre */}
              {tab === "PADRE" && (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Parentesco</label>
                      <input
                        value={formPadre.parentesco || ""}
                        onChange={e => setFormPadre(f => ({ ...f, parentesco: e.target.value }))}
                        placeholder="Ej. Madre, Padre, Tutor"
                        className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Teléfono</label>
                      <input
                        value={formPadre.telefono || ""}
                        onChange={e => setFormPadre(f => ({ ...f, telefono: e.target.value }))}
                        placeholder="999999999"
                        className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Dirección domiciliaria</label>
                    <input
                      value={formPadre.direccion || ""}
                      onChange={e => setFormPadre(f => ({ ...f, direccion: e.target.value }))}
                      placeholder="Calle / Av. y número"
                      className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                    />
                  </div>
                </>
              )}

              {/* Campos específicos Terapeuta */}
              {tab === "TERAPEUTA" && (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Especialidad</label>
                      <input
                        value={formTerapeuta.especialidad || ""}
                        onChange={e => setFormTerapeuta(f => ({ ...f, especialidad: e.target.value }))}
                        placeholder="Ej. Terapia de lenguaje"
                        className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Años experiencia</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={formTerapeuta.anios_experiencia ?? 1}
                        onChange={e =>
                          setFormTerapeuta(f => ({
                            ...f,
                            anios_experiencia: parseInt(e.target.value, 10) || 0,
                          }))
                        }
                        className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Idiomas</label>
                    <input
                      value={formTerapeuta.idiomas || ""}
                      onChange={e => setFormTerapeuta(f => ({ ...f, idiomas: e.target.value }))}
                      placeholder="Ej. Español, Quechua"
                      className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setModal(null)}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrear}
                  disabled={
                    submitting ||
                    (tab === "PADRE"
                      ? !formPadre.nombres.trim() || !formPadre.email.trim() || !formPadre.password
                      : !formTerapeuta.nombres.trim() || !formTerapeuta.email.trim() || !formTerapeuta.password)
                  }
                  className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md"
                  style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Mail size={16} />
                  )}
                  Crear cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Editar Cuenta ── */}
      {modal === "editar" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] border border-[#E8E5F4]">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E8E5F4]">
              <div>
                <h2 className="font-black text-lg text-[#1C1135]">
                  Editar cuenta: {selected.codigo_usuario}
                </h2>
                <p className="text-xs text-[#7C6F9A] font-medium mt-0.5">
                  Rol {selected.rol}. Las contraseñas se gestionan por separado.
                </p>
              </div>
              <button
                onClick={() => setModal("detail")}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-[#9E95B7] hover:bg-[#F5F3FF] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-3.5">
              {errorBanner && (
                <div className="bg-red-50 text-red-800 border border-red-200 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-600 flex-shrink-0" />
                  <span>{errorBanner}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Nombres</label>
                  <input
                    value={editForm.nombres || ""}
                    onChange={e => setEditForm(f => ({ ...f, nombres: e.target.value }))}
                    className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Apellidos</label>
                  <input
                    value={editForm.apellidos || ""}
                    onChange={e => setEditForm(f => ({ ...f, apellidos: e.target.value }))}
                    className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                />
              </div>

              {selected.rol === "PADRE" && (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Parentesco</label>
                      <input
                        value={editForm.parentesco || ""}
                        onChange={e => setEditForm(f => ({ ...f, parentesco: e.target.value }))}
                        className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Teléfono</label>
                      <input
                        value={editForm.telefono || ""}
                        onChange={e => setEditForm(f => ({ ...f, telefono: e.target.value }))}
                        className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Dirección</label>
                    <input
                      value={editForm.direccion || ""}
                      onChange={e => setEditForm(f => ({ ...f, direccion: e.target.value }))}
                      className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                    />
                  </div>
                </>
              )}

              {selected.rol === "TERAPEUTA" && (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Especialidad</label>
                      <input
                        value={editForm.especialidad || ""}
                        onChange={e => setEditForm(f => ({ ...f, especialidad: e.target.value }))}
                        className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Años exp.</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={editForm.anios_experiencia ?? 0}
                        onChange={e =>
                          setEditForm(f => ({
                            ...f,
                            anios_experiencia: parseInt(e.target.value, 10) || 0,
                          }))
                        }
                        className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Idiomas</label>
                    <input
                      value={editForm.idiomas || ""}
                      onChange={e => setEditForm(f => ({ ...f, idiomas: e.target.value }))}
                      className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setModal("detail")}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarEdicion}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white transition-all flex items-center justify-center gap-2 shadow-md"
                  style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Confirmación: Suspender Cuenta ── */}
      {modal === "suspender" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-[#E8E5F4] p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <Power size={28} />
            </div>
            <h3 className="font-black text-lg text-[#1C1135]">¿Suspender esta cuenta?</h3>
            <p className="text-xs text-[#7C6F9A] font-medium mt-2 leading-relaxed">
              Vas a suspender la cuenta de{" "}
              <strong className="text-[#1C1135]">
                {selected.nombres} ({selected.codigo_usuario})
              </strong>
              . Sus sesiones activas serán revocadas de inmediato y no podrá ingresar a la plataforma hasta que sea reactivada.
            </p>
            {errorBanner && (
              <div className="mt-3 bg-red-50 text-red-800 text-xs font-bold p-2.5 rounded-xl text-left">
                {errorBanner}
              </div>
            )}
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setModal("detail")}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSuspenderConfirmado}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-2xl bg-amber-600 text-white text-sm font-extrabold hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Sí, suspender"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Confirmación: Activar Cuenta ── */}
      {modal === "activar" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-[#E8E5F4] p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle size={28} />
            </div>
            <h3 className="font-black text-lg text-[#1C1135]">¿Reactivar esta cuenta?</h3>
            <p className="text-xs text-[#7C6F9A] font-medium mt-2 leading-relaxed">
              Vas a reactivar la cuenta de{" "}
              <strong className="text-[#1C1135]">
                {selected.nombres} ({selected.codigo_usuario})
              </strong>
              . El usuario podrá iniciar sesión nuevamente con sus credenciales habituales.
            </p>
            {errorBanner && (
              <div className="mt-3 bg-red-50 text-red-800 text-xs font-bold p-2.5 rounded-xl text-left">
                {errorBanner}
              </div>
            )}
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setModal("detail")}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF]"
              >
                Cancelar
              </button>
              <button
                onClick={handleActivarConfirmado}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-600 text-white text-sm font-extrabold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Sí, reactivar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Confirmación: Eliminar Cuenta Permanentemente ── */}
      {modal === "eliminar" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-[#E8E5F4] p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
              <Trash2 size={28} />
            </div>
            <h3 className="font-black text-lg text-[#1C1135]">¿Eliminar permanentemente?</h3>
            <p className="text-xs text-[#7C6F9A] font-medium mt-2 leading-relaxed">
              Esta acción no se puede deshacer. Se eliminará la cuenta de{" "}
              <strong className="text-[#1C1135]">
                {selected.nombres} ({selected.codigo_usuario})
              </strong>
              . Si la cuenta posee pacientes, tratamientos o historial relacionado, el sistema rechazará la eliminación por integridad clínica.
            </p>
            {errorBanner && (
              <div className="mt-3 bg-red-50 text-red-800 text-xs font-bold p-2.5 rounded-xl text-left">
                {errorBanner}
              </div>
            )}
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setModal("detail")}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF]"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarConfirmado}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 text-white text-sm font-extrabold hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Confirmar eliminación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
