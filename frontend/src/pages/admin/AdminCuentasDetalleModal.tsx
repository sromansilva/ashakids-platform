import React from "react";
import {
  CheckCircle,
  Loader2,
  Pencil,
  Power,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { B } from "@/theme/brand/B";
import { CuentaItem } from "@/types/auth";

interface AdminCuentasDetalleModalProps {
  modal: "nueva" | "detail" | "editar" | "suspender" | "activar" | "eliminar" | null;
  selected: CuentaItem | null;
  errorBanner: string | null;
  submitting: boolean;
  formatDate: (iso?: string | null) => string;
  onClose: () => void;
  onOpenEditar: (item: CuentaItem) => void;
  onOpenHijos: (idUsuario: number) => void;
  onSetModal: (modal: "nueva" | "detail" | "editar" | "suspender" | "activar" | "eliminar" | null) => void;
  onConfirmSuspender: () => void;
  onConfirmActivar: () => void;
  onConfirmEliminar: () => void;
}

export function AdminCuentasDetalleModal({
  modal,
  selected,
  errorBanner,
  submitting,
  formatDate,
  onClose,
  onOpenEditar,
  onOpenHijos,
  onSetModal,
  onConfirmSuspender,
  onConfirmActivar,
  onConfirmEliminar,
}: AdminCuentasDetalleModalProps) {
  if (!modal || !selected) return null;

  return (
    <>
      {/* ── Modal: Detalle de Cuenta ── */}
      {modal === "detail" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-[#E8E5F4]">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E8E5F4]">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-violet-600" />
                <h2 className="font-black text-base text-[#1C1135]">Detalle de cuenta</h2>
              </div>
              <button
                onClick={onClose}
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
                {selected.rol === "PADRE" && (
                  <button
                    onClick={() => onOpenHijos(selected.id_usuario)}
                    className="w-full py-2.5 rounded-2xl border border-violet-200 bg-violet-600 text-white text-sm font-extrabold hover:bg-violet-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Users size={15} /> Ver hijos
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => onOpenEditar(selected)}
                    className="flex-1 py-2.5 rounded-2xl border border-violet-200 bg-violet-50 text-violet-800 text-sm font-extrabold hover:bg-violet-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Pencil size={15} /> Editar datos
                  </button>
                  <button
                    onClick={() => onSetModal(selected.activo ? "suspender" : "activar")}
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
                  onClick={() => onSetModal("eliminar")}
                  className="w-full py-2.5 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-sm font-extrabold hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={15} /> Eliminar cuenta permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Confirmación: Suspender Cuenta ── */}
      {modal === "suspender" && (
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
                onClick={() => onSetModal("detail")}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF]"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmSuspender}
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
      {modal === "activar" && (
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
                onClick={() => onSetModal("detail")}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF]"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmActivar}
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
      {modal === "eliminar" && (
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
                onClick={() => onSetModal("detail")}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF]"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmEliminar}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 text-white text-sm font-extrabold hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Confirmar eliminación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
