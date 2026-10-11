import React from "react";
import { AlertTriangle, Loader2, Save, UserCog } from "lucide-react";
import type { ActualizarCuentaPayload, CuentaItem } from "@/types/auth";
import { AdminFormDialog, adminFormInputClass, adminFormLabelClass } from "./AdminFormDialog";

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

export function AdminCuentasEditarModal({ isOpen, selected, errorBanner, editForm, setEditForm, submitting, onClose, onGuardar }: AdminCuentasEditarModalProps) {
  if (!isOpen || !selected) return null;

  const update = <K extends keyof ActualizarCuentaPayload>(key: K, value: ActualizarCuentaPayload[K]) => {
    setEditForm(current => ({ ...current, [key]: value }));
  };

  return (
    <AdminFormDialog
      ariaLabelledBy="edit-account-title"
      eyebrow={`Gestión de cuentas · ${selected.rol}`}
      title={`Editar cuenta ${selected.codigo_usuario}`}
      subtitle="Actualiza la información de la cuenta. Las contraseñas se gestionan por separado."
      icon={UserCog}
      onClose={onClose}
      footer={<>
        <button type="button" onClick={onClose} disabled={submitting} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#DDD6FE] px-5 text-sm font-black text-violet-700 transition hover:bg-[#F5F3FF] disabled:opacity-50">Cancelar</button>
        <button form="edit-account-form" type="submit" disabled={submitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 text-sm font-black text-white shadow-md transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}Guardar cambios</button>
      </>}
    >
      <form id="edit-account-form" autoComplete="off" onSubmit={(event) => { event.preventDefault(); onGuardar(); }} className="space-y-5">
        <div><h3 className="text-xl font-black text-[#1C1135]">Datos de la cuenta</h3><p className="mt-1 text-sm font-medium text-[#6B5E8A]">Revisa los campos antes de guardar.</p></div>
        {errorBanner && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800"><AlertTriangle size={17} className="mt-0.5 shrink-0" />{errorBanner}</div>}
        <div className="rounded-[20px] bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <label className={adminFormLabelClass}>Nombres<input required maxLength={60} disabled={submitting} value={editForm.nombres || ""} onChange={event => update("nombres", event.target.value)} className={adminFormInputClass} /></label>
            <label className={adminFormLabelClass}>Apellidos<input required maxLength={80} disabled={submitting} value={editForm.apellidos || ""} onChange={event => update("apellidos", event.target.value)} className={adminFormInputClass} /></label>
            <label className={`${adminFormLabelClass} sm:col-span-2`}>Correo electrónico<input required type="email" maxLength={150} disabled={submitting} value={editForm.email || ""} onChange={event => update("email", event.target.value)} className={adminFormInputClass} /></label>
            {selected.rol === "PADRE" && <>
              <label className={adminFormLabelClass}>Parentesco<select disabled={submitting} value={editForm.parentesco || "Padre"} onChange={event => update("parentesco", event.target.value)} className={adminFormInputClass}><option value="Padre">Padre</option><option value="Madre">Madre</option><option value="Tutor">Tutor</option></select></label>
              <label className={adminFormLabelClass}>Teléfono<input inputMode="tel" maxLength={12} disabled={submitting} value={editForm.telefono || ""} onChange={event => update("telefono", event.target.value)} className={adminFormInputClass} /></label>
              <label className={`${adminFormLabelClass} sm:col-span-2`}>Dirección<input maxLength={200} disabled={submitting} value={editForm.direccion || ""} onChange={event => update("direccion", event.target.value)} className={adminFormInputClass} /></label>
            </>}
            {selected.rol === "TERAPEUTA" && <>
              <label className={adminFormLabelClass}>Especialidad<input maxLength={100} disabled={submitting} value={editForm.especialidad || ""} onChange={event => update("especialidad", event.target.value)} className={adminFormInputClass} /></label>
              <label className={adminFormLabelClass}>Años de experiencia<input type="number" min="0" max="60" disabled={submitting} value={editForm.anios_experiencia ?? 0} onChange={event => update("anios_experiencia", Number(event.target.value) || 0)} className={adminFormInputClass} /></label>
              <label className={`${adminFormLabelClass} sm:col-span-2`}>Idiomas<input maxLength={100} disabled={submitting} value={editForm.idiomas || ""} onChange={event => update("idiomas", event.target.value)} className={adminFormInputClass} /></label>
            </>}
          </div>
        </div>
      </form>
    </AdminFormDialog>
  );
}
