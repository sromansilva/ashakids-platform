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
  Users,
} from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { adminService } from "@/services/adminService";
import {
  ActualizarCuentaPayload,
  CrearPadrePayload,
  CrearTerapeutaPayload,
  CuentaItem,
} from "@/types/auth";
import { PacienteItem } from "@/types/pacientes";
import { getAvatarInfo } from "@/config/avatars";
import { ApiError } from "@/api/client";
import { AdminCuentasHijosModal } from "./AdminCuentasHijosModal";
import { AdminCuentasCrearModal } from "./AdminCuentasCrearModal";
import { AdminCuentasEditarModal } from "./AdminCuentasEditarModal";
import { AdminCuentasDetalleModal } from "./AdminCuentasDetalleModal";
import { AdminCuentasTable } from "./AdminCuentasTable";
import { AdminCuentasStats } from "./AdminCuentasStats";
import { emptyChild } from "./FamilyChildrenFields";

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

  // Estado para gestión administrativa de hijos
  const [modalHijos, setModalHijos] = useState<boolean>(false);
  const [hijosPadre, setHijosPadre] = useState<PacienteItem[]>([]);
  const [loadingHijos, setLoadingHijos] = useState<boolean>(false);
  const [errorHijos, setErrorHijos] = useState<string | null>(null);
  const [hijoAReactivar, setHijoAReactivar] = useState<PacienteItem | null>(null);
  const [reactivando, setReactivando] = useState<boolean>(false);

  // Formulario de Creación
  const [formPadre, setFormPadre] = useState<CrearPadrePayload>({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    parentesco: "Padre",
    hijos: [emptyChild()],
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
      hijos: [emptyChild()],
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
        const res = await adminService.registrarFamilia(formPadre);
        setSuccessBanner(res.message);
      } else {
        const res = await adminService.crearTerapeuta(formTerapeuta);
        setSuccessBanner(res.message + " Debe cambiar su contraseña inicial al ingresar.");
      }
      setModal(null);
      setFormPadre(f => ({ ...f, password: "" }));
      setFormTerapeuta(f => ({ ...f, password: "" }));
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

  async function handleAbrirHijos(id_usuario: number) {
    setLoadingHijos(true);
    setErrorHijos(null);
    setModalHijos(true);
    try {
      const res = await adminService.getHijosDePadre(id_usuario);
      setHijosPadre(res.items || []);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Error al cargar los hijos.";
      setErrorHijos(msg);
    } finally {
      setLoadingHijos(false);
    }
  }

  async function handleConfirmarReactivacion() {
    if (!hijoAReactivar || !selected) return;
    setReactivando(true);
    try {
      const res = await adminService.reactivarHijo(hijoAReactivar.id_paciente);
      showToast(res.message);
      setHijoAReactivar(null);
      const updated = await adminService.getHijosDePadre(selected.id_usuario);
      setHijosPadre(updated.items || []);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Error al reactivar el paciente.";
      setErrorHijos(msg);
    } finally {
      setReactivando(false);
    }
  }

  return (
    <div className="admin-accounts p-4 sm:p-6 max-w-4xl mx-auto">
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
      <div className="admin-page-heading flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#1C1135]">Gestión de Cuentas</h1>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
              Gestión de accesos
            </span>
          </div>
          <p className="text-sm text-[#7C6F9A] font-medium mt-1">
            Registra familias y terapeutas, consulta sus datos y administra el acceso.
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

      {/* Stats Cards & Tabs/Search */}
      <AdminCuentasStats
        famCount={famCount}
        terCount={terCount}
        activasCount={cuentas.filter((a) => a.activo).length}
        suspCount={suspCount}
        tab={tab}
        search={search}
        onTabChange={(t) => {
          setTab(t);
          setSearch("");
        }}
        onSearchChange={setSearch}
      />

      {/* Listado de Cuentas */}
      <AdminCuentasTable
        loading={loading}
        visible={visible}
        openDetail={openDetail}
        openEditar={openEditar}
        formatDate={formatDate}
      />

      {/* ── Modales de Administración de Cuentas e Hijos ── */}
      <AdminCuentasDetalleModal
        modal={modal}
        selected={selected}
        errorBanner={errorBanner}
        submitting={submitting}
        formatDate={formatDate}
        onClose={() => setModal(null)}
        onOpenEditar={openEditar}
        onOpenHijos={handleAbrirHijos}
        onSetModal={setModal}
        onConfirmSuspender={handleSuspenderConfirmado}
        onConfirmActivar={handleActivarConfirmado}
        onConfirmEliminar={handleEliminarConfirmado}
      />

      <AdminCuentasCrearModal
        isOpen={modal === "nueva"}
        tab={tab}
        errorBanner={errorBanner}
        formPadre={formPadre}
        formTerapeuta={formTerapeuta}
        setFormPadre={setFormPadre}
        setFormTerapeuta={setFormTerapeuta}
        submitting={submitting}
        onClose={() => setModal(null)}
        onCrear={handleCrear}
      />

      <AdminCuentasEditarModal
        isOpen={modal === "editar"}
        selected={selected}
        errorBanner={errorBanner}
        editForm={editForm}
        setEditForm={setEditForm}
        submitting={submitting}
        onClose={() => setModal("detail")}
        onGuardar={handleGuardarEdicion}
      />

      <AdminCuentasHijosModal
        modalHijos={modalHijos}
        selected={selected}
        loadingHijos={loadingHijos}
        errorHijos={errorHijos}
        hijosPadre={hijosPadre}
        hijoAReactivar={hijoAReactivar}
        reactivando={reactivando}
        onClose={() => setModalHijos(false)}
        onSelectReactivar={(hijo) => setHijoAReactivar(hijo)}
        onCancelReactivar={() => setHijoAReactivar(null)}
        onConfirmReactivar={handleConfirmarReactivacion}
      />
    </div>
  );
}
