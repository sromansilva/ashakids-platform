import { helpLevels } from './reportFormGuidance';
import { Star } from 'lucide-react';

export function ReportHelpLevel({ id, value, disabled, onChange }: {
  id: string; value: string | null; disabled: boolean; onChange: (value: string) => void;
}) {
  const selected = helpLevels.find(level => level.value === value);
  const selectedIndex = helpLevels.findIndex(level => level.value === value);
  return <fieldset disabled={disabled} className="space-y-2 text-sm text-[#1C1135]" aria-describedby={`${id}-description`}>
    <legend className="font-bold">Nivel de ayuda</legend>
    <div className="flex items-center gap-1">
      {helpLevels.map((level, index) => <label key={level.value} className="relative cursor-pointer" title={`${index + 1} de 5 estrellas: ${level.value}`}>
        <input type="radio" name={id} value={level.value} aria-label={level.value} checked={value === level.value}
          onChange={() => onChange(level.value)} className="peer sr-only"/>
        <span className={`grid h-11 w-11 place-items-center rounded-lg transition-colors hover:bg-violet-50 hover:text-[#6B46FE] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-violet-700 peer-disabled:cursor-wait ${index <= selectedIndex ? 'text-[#6B46FE]' : 'text-[#A79DBB]'}`}>
          <Star size={28} strokeWidth={2} fill={index <= selectedIndex ? 'currentColor' : 'none'} aria-hidden="true" />
          <span className="sr-only">{index + 1} estrellas · {level.value}</span>
        </span>
      </label>)}
    </div>
    <p id={`${id}-description`} aria-live="polite" className="text-sm text-[#615274]">
      {selected?.description || (value ? `Nivel guardado: ${value}. Puedes conservarlo o elegir una de las cinco opciones.` : 'Elige estrellas según el apoyo brindado; más estrellas representan mayor ayuda.')}
    </p>
  </fieldset>;
}
