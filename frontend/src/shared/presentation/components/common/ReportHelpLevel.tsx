import { helpLevels } from './reportFormGuidance';

export function ReportHelpLevel({ id, value, disabled, onChange }: {
  id: string; value: string | null; disabled: boolean; onChange: (value: string) => void;
}) {
  const selected = helpLevels.find(level => level.value === value);
  return <fieldset disabled={disabled} className="space-y-2 text-sm text-[#1C1135]" aria-describedby={`${id}-description`}>
    <legend className="font-bold">Nivel de ayuda</legend>
    <p className="text-xs text-[#615274]">Selecciona la intensidad del apoyo brindado, de menor a mayor.</p>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
      {helpLevels.map((level, index) => <label key={level.value} className="relative cursor-pointer">
        <input type="radio" name={id} value={level.value} aria-label={level.value} checked={value === level.value}
          onChange={() => onChange(level.value)} className="peer sr-only"/>
        <span className="flex min-h-14 items-center gap-2 rounded-xl border border-[#C8C2DC] bg-white px-3 py-2 text-sm font-bold peer-checked:border-violet-700 peer-checked:bg-violet-50 peer-checked:text-violet-950 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet-700 peer-disabled:cursor-wait sm:flex-col sm:justify-center sm:text-center">
          <span aria-hidden="true" className="text-xs">{index + 1}</span>{level.value}
        </span>
      </label>)}
    </div>
    <p id={`${id}-description`} aria-live="polite" className="text-sm text-[#615274]">
      {selected?.description || (value ? `Nivel guardado: ${value}. Puedes conservarlo o elegir una de las cinco opciones.` : 'Aún no se ha seleccionado un nivel de ayuda.')}
    </p>
  </fieldset>;
}
