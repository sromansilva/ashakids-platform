import React, { useEffect, useRef } from "react";
import { AlertTriangle, Loader2, Mail, X } from "lucide-react";
import { B } from "@/theme/brand/B";
import { CrearPadrePayload, CrearTerapeutaPayload } from "@/types/auth";
import { TabRole } from "./AdminCuentas";
import { FamilyChildrenFields } from "./FamilyChildrenFields";

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
  const dialog = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(submitting);
  closeRef.current = onClose;
  busyRef.current = submitting;
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLElement>("input")?.focus();
    function keyboard(event: KeyboardEvent) {
      if (event.key === "Escape" && !busyRef.current) closeRef.current();
      if (event.key !== "Tab") return;
      const controls = dialog.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), select:not(:disabled)");
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("keydown", keyboard); previous?.focus(); };
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="create-account-title" className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] border border-[#E8E5F4]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E8E5F4]">
          <div>
            <h2 id="create-account-title" className="font-black text-lg text-[#1C1135]">
              {tab === "PADRE" ? "Nueva cuenta de Padre / Familia" : "Nueva cuenta de Terapeuta"}
            </h2>
            <p className="text-xs text-[#7C6F9A] font-medium mt-0.5">
              El código de 6 caracteres ({tab === "PADRE" ? "P00001" : "T00001"}) se generará automáticamente.
            </p>
          </div>
          <button
            aria-label="Cerrar formulario"
            disabled={submitting}
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[#9E95B7] hover:bg-[#F5F3FF] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form autoComplete="off" onSubmit={e => { e.preventDefault(); if (!submitting) onCrear(); }} className="px-6 py-5 flex flex-col gap-3.5">
          {errorBanner && (
            <div role="alert" className="bg-red-50 text-red-800 border border-red-200 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-600 flex-shrink-0" />
              <span>{errorBanner}</span>
            </div>
          )}

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="account-names" className="block text-xs font-extrabold text-slate-700 mb-1">Nombres *</label>
              <input
                id="account-names" autoComplete="given-name" required maxLength={60} disabled={submitting}
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
              <label htmlFor="account-surnames" className="block text-xs font-extrabold text-slate-700 mb-1">Apellidos *</label>
              <input
                id="account-surnames" required maxLength={80} disabled={submitting}
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
            <label htmlFor="account-email" className="block text-xs font-extrabold text-slate-700 mb-1">Correo electrónico *</label>
            <input
              id="account-email" required maxLength={150} disabled={submitting}
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
            <label htmlFor="account-dni" className="block text-xs font-extrabold text-slate-700 mb-1">
              DNI — contraseña inicial *
            </label>
            <input
              type="password"
              id="account-dni" disabled={submitting}
              aria-label="DNI — contraseña inicial"
              required
              inputMode="numeric"
              pattern="[0-9]{8}"
              minLength={8}
              maxLength={8}
              autoComplete="new-password"
              value={tab === "PADRE" ? formPadre.password : formTerapeuta.password}
              onChange={(e) =>
                tab === "PADRE"
                  ? setFormPadre((f) => ({ ...f, password: e.target.value }))
                  : setFormTerapeuta((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="8 dígitos"
              className="w-full border border-[#E8E5F4] rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[#1C1135] outline-none focus:border-violet-500"
            />
            <p className="mt-2 text-sm text-slate-700">Se usará solo para el primer ingreso. El usuario deberá crear su contraseña personal antes de continuar.</p>
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

          {tab === "PADRE" && <FamilyChildrenFields children={formPadre.hijos ?? []} disabled={submitting} onChange={hijos => setFormPadre(f => ({ ...f, hijos }))} />}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
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
        </form>
      </div>
    </div>
  );
}
