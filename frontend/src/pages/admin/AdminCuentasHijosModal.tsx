import React from "react";
import { Loader2, Power, X } from "lucide-react";
import { PacienteItem } from "@/types/pacientes";
import { CuentaItem } from "@/types/auth";
import { getAvatarInfo } from "@/config/avatars";

interface AdminCuentasHijosModalProps {
  modalHijos: boolean;
  selected: CuentaItem | null;
  loadingHijos: boolean;
  errorHijos: string | null;
  hijosPadre: PacienteItem[];
  hijoAReactivar: PacienteItem | null;
  reactivando: boolean;
  onClose: () => void;
  onSelectReactivar: (hijo: PacienteItem) => void;
  onCancelReactivar: () => void;
  onConfirmReactivar: () => void;
}

export function AdminCuentasHijosModal({
  modalHijos,
  selected,
  loadingHijos,
  errorHijos,
  hijosPadre,
  hijoAReactivar,
  reactivando,
  onClose,
  onSelectReactivar,
  onCancelReactivar,
  onConfirmReactivar,
}: AdminCuentasHijosModalProps) {
  if (!modalHijos || !selected) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#E8E5F4] flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E8E5F4]">
            <div>
              <h2 className="font-black text-lg text-[#1C1135]">
                Hijos de {selected.nombres} {selected.apellidos}
              </h2>
              <p className="text-xs text-[#9E95B7] font-semibold mt-0.5">
                Cuenta: {selected.codigo_usuario} · Total: {hijosPadre.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7] hover:text-[#1C1135] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-3">
            {loadingHijos ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-violet-600" size={28} />
                <p className="text-sm font-bold text-[#7C6F9A]">Cargando hijos del padre...</p>
              </div>
            ) : errorHijos ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
                {errorHijos}
              </div>
            ) : hijosPadre.length === 0 ? (
              <div className="py-12 text-center text-[#7C6F9A]">
                <span className="text-4xl block mb-2">👧</span>
                <p className="font-extrabold text-sm text-[#1C1135]">Sin hijos registrados</p>
                <p className="text-xs text-[#9E95B7] mt-1">Este tutor aún no tiene hijos asociados.</p>
              </div>
            ) : (
              hijosPadre.map((hijo) => {
                const av = getAvatarInfo(hijo.avatar_nombre);
                return (
                  <div
                    key={hijo.id_paciente}
                    className="p-4 rounded-2xl border border-[#E8E5F4] bg-[#FAFAF9] flex items-center justify-between gap-3 hover:border-violet-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: av.bgColor, border: `1.5px solid ${av.color}40` }}
                      >
                        {av.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-sm text-[#1C1135] truncate">
                            {hijo.nombres_paciente} {hijo.apellidos_paciente}
                          </p>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              hijo.activo
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {hijo.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <p className="text-xs text-[#7C6F9A] font-medium mt-0.5">
                          {hijo.edad} años · {hijo.sexo} · Avatar: {av.name}
                        </p>
                        <p className="text-[10px] text-[#9E95B7]">
                          Nacimiento: {hijo.fecha_nacimiento}
                        </p>
                      </div>
                    </div>

                    {!hijo.activo && (
                      <button
                        onClick={() => onSelectReactivar(hijo)}
                        className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs font-extrabold hover:bg-emerald-100 transition-colors flex items-center gap-1 flex-shrink-0"
                      >
                        <Power size={13} /> Reactivar
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="px-6 py-4 border-t border-[#E8E5F4] bg-[#FAFAF9] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-[#E8E5F4] bg-white text-sm font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal Confirmar Reactivación */}
      {hijoAReactivar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 border border-[#E8E5F4]">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Power size={24} />
            </div>
            <h3 className="font-black text-lg text-center text-[#1C1135] mb-2">
              Reactivar a {hijoAReactivar.nombres_paciente}
            </h3>
            <p className="text-xs text-center text-[#7C6F9A] font-medium leading-relaxed mb-5">
              El paciente volverá a figurar como <strong>Activo</strong> y estará disponible nuevamente en los listados y selectores del tutor. Todo su historial clínico se conservará.
            </p>
            <div className="flex gap-2">
              <button
                disabled={reactivando}
                onClick={onCancelReactivar}
                className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-xs font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={reactivando}
                onClick={onConfirmReactivar}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {reactivando && <Loader2 size={13} className="animate-spin" />}
                Sí, reactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
