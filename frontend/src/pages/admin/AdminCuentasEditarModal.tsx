import React from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { B } from "@/theme/brand/B";
import { ActualizarCuentaPayload, CuentaItem } from "@/types/auth";

interface AdminCuentasEditarModalProps {
  isOpen: boolean;
  selected: CuentaItem | null;
  errorBanner: string | null;
  editForm: ActualizarCuentaPayload;
  setEditForm: React.Dispatch<React.SetStateAction<ActualizarCuentaPayload>>;
  submitting: boolean;
  onClose: () => void;
  onGuardar: () => void;
}

export function AdminCuentasEditarModal({
  isOpen,
  selected,
  errorBanner,
  editForm,
  setEditForm,
  submitting,
  onClose,
  onGuardar,
}: AdminCuentasEditarModalProps) {
  if (!isOpen || !selected) return null;

  return (
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
            onClick={onClose}
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
                onChange={(e) => setEditForm((f) => ({ ...f, nombres: e.target.value }))}
                className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Apellidos</label>
              <input
                value={editForm.apellidos || ""}
                onChange={(e) => setEditForm((f) => ({ ...f, apellidos: e.target.value }))}
                className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Correo electrónico</label>
            <input
              type="email"
              value={editForm.email || ""}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
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
                    onChange={(e) => setEditForm((f) => ({ ...f, parentesco: e.target.value }))}
                    className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Teléfono</label>
                  <input
                    value={editForm.telefono || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, telefono: e.target.value }))}
                    className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Dirección</label>
                <input
                  value={editForm.direccion || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, direccion: e.target.value }))}
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
                    onChange={(e) => setEditForm((f) => ({ ...f, especialidad: e.target.value }))}
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
                    onChange={(e) =>
                      setEditForm((f) => ({
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
                  onChange={(e) => setEditForm((f) => ({ ...f, idiomas: e.target.value }))}
                  className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onGuardar}
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
  );
}
