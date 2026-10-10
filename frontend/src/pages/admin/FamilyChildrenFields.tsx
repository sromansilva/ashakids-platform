import type { RegistroHijo } from "@/types/auth";

export const emptyChild = (): RegistroHijo => ({ nombres_paciente: "", apellidos_paciente: "", fecha_nacimiento: "", sexo: "Masculino" });

export function FamilyChildrenFields({ children, onChange, disabled }: {
  children: RegistroHijo[]; onChange: (next: RegistroHijo[]) => void; disabled: boolean;
}) {
  const inputClass = "mt-1 w-full rounded-xl border border-violet-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600";
  function update(index: number, field: keyof RegistroHijo, value: string) {
    onChange(children.map((child, i) => i === index ? { ...child, [field]: value } : child));
  }
  return <fieldset disabled={disabled} className="mt-2 border-t border-violet-100 pt-4">
    <legend className="pt-4 font-bold text-slate-900">Hijos a cargo ({children.length})</legend>
    <p className="mb-4 text-sm text-slate-700">Cada niño tendrá su propio historial y consulta introductoria.</p>
    {children.map((child, index) => <fieldset key={index} className="mb-5 space-y-3">
      <legend className="mb-2 font-semibold text-slate-900">Niño {index + 1}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Nombres del niño *<input required maxLength={60} value={child.nombres_paciente} onChange={e => update(index, "nombres_paciente", e.target.value)} className={inputClass} /></label>
        <label className="text-sm font-semibold text-slate-700">Apellidos del niño *<input required maxLength={80} value={child.apellidos_paciente} onChange={e => update(index, "apellidos_paciente", e.target.value)} className={inputClass} /></label>
        <label className="text-sm font-semibold text-slate-700">Fecha de nacimiento *<input type="date" required value={child.fecha_nacimiento} onInput={e => update(index, "fecha_nacimiento", e.currentTarget.value)} onChange={e => update(index, "fecha_nacimiento", e.target.value)} className={inputClass} /></label>
        <label className="text-sm font-semibold text-slate-700">Sexo *<select value={child.sexo} onChange={e => update(index, "sexo", e.target.value)} className={inputClass}><option>Masculino</option><option>Femenino</option><option>Otro</option></select></label>
      </div>
      {children.length > 1 && <button type="button" onClick={() => onChange(children.filter((_, i) => i !== index))} className="min-h-11 text-sm font-semibold text-red-800 underline underline-offset-4">Quitar niño {index + 1}</button>}
    </fieldset>)}
    <button type="button" disabled={children.length >= 20} onClick={() => onChange([...children, emptyChild()])} className="min-h-11 text-sm font-semibold text-violet-800 underline underline-offset-4 disabled:opacity-60">Añadir otro hijo</button>
  </fieldset>;
}
