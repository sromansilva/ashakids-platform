import { Pencil, Plus, Save, Trash2, UserRound } from "lucide-react";
import type { RegistroHijo } from "@/types/auth";

export const emptyChild = (): RegistroHijo => ({
  nombres_paciente: "",
  apellidos_paciente: "",
  fecha_nacimiento: "",
  sexo: "Masculino",
  edad: undefined,
});

interface FamilyChildrenFieldsProps {
  children: RegistroHijo[];
  /** Legacy controlled API kept for existing form tests and callers. */
  onChange?: (children: RegistroHijo[]) => void;
  draft?: RegistroHijo;
  onDraftChange?: (next: RegistroHijo) => void;
  onSaveChild?: () => void;
  onEditChild?: (index: number) => void;
  onRemoveChild?: (index: number) => void;
  draftError?: string | null;
  disabled: boolean;
}

const inputClass = "mt-1.5 w-full min-h-11 rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50";

export function FamilyChildrenFields({ children, onChange, draft, onDraftChange, onSaveChild, onEditChild, onRemoveChild, draftError, disabled }: FamilyChildrenFieldsProps) {
  if (!draft || !onDraftChange || !onSaveChild || !onEditChild || !onRemoveChild) {
    return <LegacyFamilyChildrenFields children={children} onChange={onChange} disabled={disabled} />;
  }
  const draftHasValue = Boolean(draft.nombres_paciente || draft.apellidos_paciente || draft.fecha_nacimiento || draft.edad);

  return (
    <fieldset disabled={disabled} className="mt-2 border-t border-violet-100 pt-4">
      <legend className="pt-4 font-black text-slate-900">Hijos registrados ({children.length})</legend>
      <p className="mb-4 text-sm text-slate-700">Registra un niño por vez. Al guardar su ficha se habilitará un formulario nuevo.</p>

      {children.length > 0 && (
        <div className="mb-5 space-y-2" aria-label="Perfiles de hijos guardados">
          <p className="text-xs font-black uppercase tracking-wide text-violet-700">Perfiles guardados</p>
          {children.map((child, index) => (
            <div key={`${child.nombres_paciente}-${index}`} className="flex flex-col gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><UserRound size={18} /></span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">{child.nombres_paciente} {child.apellidos_paciente}</p>
                  <p className="text-xs font-semibold text-slate-600">{child.edad} años · {child.sexo} · Nacimiento {child.fecha_nacimiento}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => onEditChild(index)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3 text-xs font-black text-violet-700 transition hover:bg-violet-50"><Pencil size={14} />Editar</button>
                <button type="button" onClick={() => onRemoveChild(index)} aria-label={`Quitar a ${child.nombres_paciente}`} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <fieldset className="space-y-3 rounded-2xl border border-violet-100 bg-white p-4">
        <legend className="px-1 font-black text-slate-900">{children.length > 0 ? `Nuevo niño ${children.length + 1}` : "Niño 1"}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-extrabold text-slate-700">Nombres del niño {draftHasValue && "*"}<input required={draftHasValue} maxLength={60} value={draft.nombres_paciente} onChange={(event) => onDraftChange({ ...draft, nombres_paciente: event.target.value })} className={inputClass} placeholder="Ej. Valentina" /></label>
          <label className="text-sm font-extrabold text-slate-700">Apellidos del niño {draftHasValue && "*"}<input required={draftHasValue} maxLength={80} value={draft.apellidos_paciente} onChange={(event) => onDraftChange({ ...draft, apellidos_paciente: event.target.value })} className={inputClass} placeholder="Ej. Pérez" /></label>
          <label className="text-sm font-extrabold text-slate-700">Fecha de nacimiento {draftHasValue && "*"}<input type="date" required={draftHasValue} value={draft.fecha_nacimiento} onChange={(event) => onDraftChange({ ...draft, fecha_nacimiento: event.target.value })} className={inputClass} /></label>
          <label className="text-sm font-extrabold text-slate-700">Edad {draftHasValue && "*"}<input type="number" required={draftHasValue} min={3} max={12} value={draft.edad ?? ""} onChange={(event) => onDraftChange({ ...draft, edad: event.target.value ? Number(event.target.value) : undefined })} className={inputClass} placeholder="Entre 3 y 12" /></label>
          <label className="text-sm font-extrabold text-slate-700 sm:col-span-2">Sexo {draftHasValue && "*"}<select required={draftHasValue} value={draft.sexo} onChange={(event) => onDraftChange({ ...draft, sexo: event.target.value })} className={inputClass}><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option></select></label>
        </div>
        {draftError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800">{draftError}</p>}
        <div className="flex flex-col gap-2 border-t border-violet-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">La edad permitida para este registro es de 3 a 12 años.</p>
          <button type="button" onClick={onSaveChild} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-100 px-4 text-sm font-black text-violet-800 transition hover:bg-violet-200"><Save size={16} />Guardar niño</button>
        </div>
      </fieldset>
      <button type="button" disabled className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl text-sm font-black text-violet-400 opacity-70"><Plus size={16} />Se abrirá otro formulario al guardar</button>
    </fieldset>
  );
}

/**
 * Compatibility view for older consumers. The account modal uses the sequential
 * draft API above; this keeps the original add-another-child contract intact.
 */
function LegacyFamilyChildrenFields({ children, onChange, disabled }: Pick<FamilyChildrenFieldsProps, "children" | "onChange" | "disabled">) {
  const active = children[0] ?? emptyChild();
  const updateActive = (patch: Partial<RegistroHijo>) => {
    onChange?.(children.length ? children.map((child, index) => index === 0 ? { ...child, ...patch } : child) : [{ ...active, ...patch }]);
  };
  const addChild = () => onChange?.([...children, emptyChild()]);

  return (
    <fieldset disabled={disabled} className="mt-2 border-t border-violet-100 pt-4">
      <legend className="pt-4 font-black text-slate-900">Hijos a cargo ({children.length || 1})</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-extrabold text-slate-700">Nombres del niño *<input required value={active.nombres_paciente} onChange={(event) => updateActive({ nombres_paciente: event.target.value })} className={inputClass} /></label>
        <label className="text-sm font-extrabold text-slate-700">Apellidos del niño *<input required value={active.apellidos_paciente} onChange={(event) => updateActive({ apellidos_paciente: event.target.value })} className={inputClass} /></label>
        <label className="text-sm font-extrabold text-slate-700">Fecha de nacimiento *<input required type="date" value={active.fecha_nacimiento} onChange={(event) => updateActive({ fecha_nacimiento: event.target.value })} className={inputClass} /></label>
        <label className="text-sm font-extrabold text-slate-700">Sexo *<select required value={active.sexo} onChange={(event) => updateActive({ sexo: event.target.value })} className={inputClass}><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option></select></label>
      </div>
      <button type="button" onClick={addChild} className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-black text-violet-700"><Plus size={16} />Añadir otro hijo</button>
    </fieldset>
  );
}
