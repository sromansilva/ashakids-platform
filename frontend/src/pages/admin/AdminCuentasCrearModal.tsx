import React from "react";
import { AlertTriangle, Loader2, Mail, X } from "lucide-react";
import { B } from "@/theme/brand/B";
import { CrearPadrePayload, CrearTerapeutaPayload } from "@/types/auth";
import { TabRole } from "./AdminCuentas";

interface AdminCuentasCrearModalProps {
  isOpen: boolean;
  tab: TabRole;
  errorBanner: string | null;
  formPadre: CrearPadrePayload;
  formTerapeuta: CrearTerapeutaPayload;
  setFormPadre: React.Dispatch<React.SetStateAction<CrearPadrePayload>>;
  setFormTerapeuta: React.Dispatch<React.SetStateAction<CrearTerapeutaPayload>>;
  submitting: boolean;
  onClose: () => void;
  onCrear: () => void;
}

export function AdminCuentasCrearModal({
  isOpen,
  tab,
  errorBanner,
  formPadre,
  formTerapeuta,
  setFormPadre,
  setFormTerapeuta,
  submitting,
  onClose,
  onCrear,
}: AdminCuentasCrearModalProps) {
  if (!isOpen) return null;

  return (
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

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Nombres *</label>
              <input
                value={tab === "PADRE" ? formPadre.nombres : formTerapeuta.nombres}
                onChange={(e) =>
                  tab === "PADRE"
                    ? setFormPadre((f) => ({ ...f, nombres: e.target.value }))
                    : setFormTerapeuta((f) => ({ ...f, nombres: e.target.value }))
                }
                placeholder="Ej. Juan"
                className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Apellidos *</label>
              <input
                value={tab === "PADRE" ? formPadre.apellidos : formTerapeuta.apellidos}
                onChange={(e) =>
                  tab === "PADRE"
                    ? setFormPadre((f) => ({ ...f, apellidos: e.target.value }))
                    : setFormTerapeuta((f) => ({ ...f, apellidos: e.target.value }))
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
              onChange={(e) =>
                tab === "PADRE"
                  ? setFormPadre((f) => ({ ...f, email: e.target.value }))
                  : setFormTerapeuta((f) => ({ ...f, email: e.target.value }))
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
              onChange={(e) =>
                tab === "PADRE"
                  ? setFormPadre((f) => ({ ...f, password: e.target.value }))
                  : setFormTerapeuta((f) => ({ ...f, password: e.target.value }))
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
                    onChange={(e) => setFormPadre((f) => ({ ...f, parentesco: e.target.value }))}
                    placeholder="Ej. Madre, Padre, Tutor"
                    className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Teléfono</label>
                  <input
                    value={formPadre.telefono || ""}
                    onChange={(e) => setFormPadre((f) => ({ ...f, telefono: e.target.value }))}
                    placeholder="999999999"
                    className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#7C6F9A] mb-1">Dirección domiciliaria</label>
                <input
                  value={formPadre.direccion || ""}
                  onChange={(e) => setFormPadre((f) => ({ ...f, direccion: e.target.value }))}
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
                    onChange={(e) => setFormTerapeuta((f) => ({ ...f, especialidad: e.target.value }))}
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
                    onChange={(e) =>
                      setFormTerapeuta((f) => ({
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
                  onChange={(e) => setFormTerapeuta((f) => ({ ...f, idiomas: e.target.value }))}
                  placeholder="Ej. Español, Quechua"
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
              onClick={onCrear}
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
  );
}
