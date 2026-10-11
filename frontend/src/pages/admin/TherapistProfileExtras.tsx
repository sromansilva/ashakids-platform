import type { CrearTerapeutaPayload } from '@/types/auth';
import { AccountSelect } from './AccountSelect';

const languages = ['Español', 'Quechua', 'Aimara', 'Inglés', 'Portugués'];
const strengths = ['Trabajo en equipo', 'Comunicación con familias', 'Escucha activa', 'Adaptación de actividades', 'Organización y seguimiento'];
const prefix = 'Habilidades: ';

export function TherapistProfileExtras({ form, onChange, disabled }: {
  form: CrearTerapeutaPayload;
  onChange: (patch: Partial<CrearTerapeutaPayload>) => void;
  disabled: boolean;
}) {
  const spoken = (form.idiomas || '').split(',').map(item => item.trim()).filter(Boolean);
  const description = form.descripcion_profesional || '';
  const skillLine = description.split('\n').find(line => line.startsWith(prefix));
  const skills = skillLine?.slice(prefix.length).split('; ').filter(Boolean) ?? [];
  const updateLanguage = (index: number, value: string) => {
    const next = [...spoken]; next[index] = value === 'Sin idioma adicional' ? '' : value;
    onChange({ idiomas: [...new Set(next.filter(Boolean))].join(', ') });
  };
  const updateSkill = (index: number, value: string) => {
    const next = [...skills]; next[index] = value === 'Sin habilidad adicional' ? '' : value;
    const selected = [...new Set(next.filter(Boolean))];
    const otherLines = description.split('\n').filter(line => !line.startsWith(prefix)).join('\n').trim();
    onChange({ descripcion_profesional: [otherLines, selected.length ? prefix + selected.join('; ') : ''].filter(Boolean).join('\n') });
  };
  return <div className="mt-5 space-y-5">
    <fieldset><legend className="mb-2 text-sm font-extrabold text-[#1C1135]">Idiomas</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2].filter(index => index <= spoken.length).map(index => <label key={index} className="text-sm font-bold text-[#615274]">{index === 0 ? 'Idioma principal' : `Idioma adicional ${index}`}
          <AccountSelect label={index === 0 ? 'Idioma principal' : `Idioma adicional ${index}`} disabled={disabled} value={spoken[index] || (index === 0 ? 'Selecciona un idioma' : 'Sin idioma adicional')}
            options={[...(index > 0 ? ['Sin idioma adicional'] : []), ...languages.filter(language => !spoken.includes(language) || spoken[index] === language)]}
            onChange={value => updateLanguage(index, value)} />
        </label>)}
      </div>
    </fieldset>
    <fieldset><legend className="mb-2 text-sm font-extrabold text-[#1C1135]">Habilidades profesionales</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1].filter(index => index <= skills.length).map(index => <label key={index} className="text-sm font-bold text-[#615274]">{index === 0 ? 'Habilidad principal' : 'Habilidad complementaria'}
          <AccountSelect label={index === 0 ? 'Habilidad principal' : 'Habilidad complementaria'} disabled={disabled} value={skills[index] || 'Sin habilidad adicional'}
            options={['Sin habilidad adicional', ...strengths.filter(skill => !skills.includes(skill) || skills[index] === skill)]}
            onChange={value => updateSkill(index, value)} />
        </label>)}
      </div>
    </fieldset>
  </div>;
}
