import type { TerapeutaOption } from '@/modules/comunicacion/infrastructure/incidenciasService';

interface IncidentTherapistSelectorProps {
  terapeutasPrevios: TerapeutaOption[];
  terapeutasDisponibles: TerapeutaOption[];
  terapeutaMode: 'PREVIO' | 'OTRO';
  setTerapeutaMode: (mode: 'PREVIO' | 'OTRO') => void;
  selectedTerapeutaId: number | null;
  onSelectTerapeuta: (id: number) => void;
  fieldStyle: string;
}

export function IncidentTherapistSelector({
  terapeutasPrevios,
  terapeutasDisponibles,
  terapeutaMode,
  setTerapeutaMode,
  selectedTerapeutaId,
  onSelectTerapeuta,
  fieldStyle,
}: IncidentTherapistSelectorProps) {
  return (
    <div className="pt-3 border-t border-[#E8E5F4] space-y-2">
      <label htmlFor="incident-therapist" className="block text-xs font-bold text-[#1C1135]">
        Terapeuta asignado
      </label>
      {terapeutasPrevios.length > 0 ? (
        <>
          <select
            id="incident-therapist"
            className={fieldStyle}
            value={terapeutaMode === 'OTRO' ? 'OTRO' : String(selectedTerapeutaId || '')}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'OTRO') {
                setTerapeutaMode('OTRO');
                if (terapeutasDisponibles.length > 0) {
                  onSelectTerapeuta(terapeutasDisponibles[0].id_terapeuta);
                }
              } else {
                setTerapeutaMode('PREVIO');
                onSelectTerapeuta(parseInt(val, 10));
              }
            }}
          >
            <optgroup label="Terapeutas con sesiones previas">
              {terapeutasPrevios.map((t) => (
                <option key={t.id_terapeuta} value={t.id_terapeuta}>
                  {t.nombre} — {t.especialidad} (Sesión previa)
                </option>
              ))}
            </optgroup>
            <option value="OTRO">Otro terapeuta disponible en la plataforma...</option>
          </select>

          {terapeutaMode === 'OTRO' && (
            <div className="pt-2">
              <span className="block text-xs font-semibold text-[#6B5E8A] mb-1.5">
                Selecciona un especialista registrado:
              </span>
              <select
                aria-label="Directorio de terapeutas"
                className={fieldStyle}
                value={String(selectedTerapeutaId || '')}
                onChange={(e) => onSelectTerapeuta(parseInt(e.target.value, 10))}
              >
                {terapeutasDisponibles.map((t) => (
                  <option key={t.id_terapeuta} value={t.id_terapeuta}>
                    {t.nombre} — {t.especialidad}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      ) : (
        <div>
          <select
            id="incident-therapist"
            className={fieldStyle}
            value={String(selectedTerapeutaId || '')}
            onChange={(e) => onSelectTerapeuta(parseInt(e.target.value, 10))}
          >
            {terapeutasDisponibles.length === 0 ? (
              <option value="">Cargando terapeutas registrados...</option>
            ) : (
              terapeutasDisponibles.map((t) => (
                <option key={t.id_terapeuta} value={t.id_terapeuta}>
                  {t.nombre} — {t.especialidad}
                </option>
              ))
            )}
          </select>
          <span className="block text-[11px] text-[#6B5E8A] font-medium mt-1">
            Selecciona el terapeuta registrado al que deseas remitir esta incidencia.
          </span>
        </div>
      )}
    </div>
  );
}
