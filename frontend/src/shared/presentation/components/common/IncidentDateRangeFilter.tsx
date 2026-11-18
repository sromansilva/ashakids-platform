import { useState, useRef, useEffect } from 'react';
import { Calendar, X, ChevronDown, Check } from 'lucide-react';

export interface IncidentDateRangeFilterProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  className?: string;
}

function toLocalISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0].slice(-2)}`;
}

export function IncidentDateRangeFilter({
  startDate,
  endDate,
  onChange,
  className = '',
}: IncidentDateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const hasFilter = Boolean(startDate || endDate);

  const handleApply = () => {
    onChange(tempStart, tempEnd);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStart('');
    setTempEnd('');
    onChange('', '');
    setIsOpen(false);
  };

  const applyPreset = (daysBack: number) => {
    const today = new Date();
    const endStr = toLocalISODate(today);
    if (daysBack === 0) {
      setTempStart(endStr);
      setTempEnd(endStr);
      onChange(endStr, endStr);
    } else {
      const past = new Date();
      past.setDate(today.getDate() - daysBack);
      const startStr = toLocalISODate(past);
      setTempStart(startStr);
      setTempEnd(endStr);
      onChange(startStr, endStr);
    }
    setIsOpen(false);
  };

  const applyThisMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const startStr = toLocalISODate(firstDay);
    const endStr = toLocalISODate(today);
    setTempStart(startStr);
    setTempEnd(endStr);
    onChange(startStr, endStr);
    setIsOpen(false);
  };

  const getButtonLabel = () => {
    if (startDate && endDate) {
      if (startDate === endDate) return formatDisplayDate(startDate);
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
    }
    if (startDate) return `Desde ${formatDisplayDate(startDate)}`;
    if (endDate) return `Hasta ${formatDisplayDate(endDate)}`;
    return 'Filtrar por fecha';
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={popoverRef}>
      {/* Trigger Button */}
      <div className="inline-flex items-center rounded-2xl border transition-all shadow-2xs">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            hasFilter
              ? 'bg-[#EDE9FE] border-[#C4B5FD] text-[#6B46FE]'
              : 'bg-white border-[#E8E5F4] text-[#615274] hover:text-[#6B46FE] hover:bg-[#F8F7FC]'
          }`}
          aria-expanded={isOpen}
          aria-label="Abrir filtro de calendario por fecha"
        >
          <Calendar size={15} className={hasFilter ? 'text-[#6B46FE]' : 'text-[#8C82A8]'} />
          <span className="whitespace-nowrap">{getButtonLabel()}</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {hasFilter && (
          <button
            type="button"
            onClick={handleClear}
            title="Quitar filtro de fecha"
            className="p-2 -ml-1 text-[#6B46FE] hover:text-[#4F2FD4] hover:bg-[#DDD6FE] rounded-r-2xl transition cursor-pointer"
            aria-label="Limpiar filtro de fecha"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 z-50 w-72 sm:w-80 bg-white rounded-3xl border border-[#E8E5F4] p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EEF8] mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-[#6B46FE]" />
              <h4 className="text-xs font-black text-[#1C1135] uppercase tracking-wider">
                Rango de fechas
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#9E95B7] hover:text-[#1C1135] p-1 rounded-lg transition"
            >
              <X size={14} />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="mb-4">
            <p className="text-[11px] font-bold text-[#8C82A8] mb-2">Accesos rápidos:</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset(0)}
                className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-[#F8F7FC] hover:bg-[#EDE9FE] text-[#615274] hover:text-[#6B46FE] transition text-left"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => applyPreset(7)}
                className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-[#F8F7FC] hover:bg-[#EDE9FE] text-[#615274] hover:text-[#6B46FE] transition text-left"
              >
                Últimos 7 días
              </button>
              <button
                type="button"
                onClick={() => applyPreset(30)}
                className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-[#F8F7FC] hover:bg-[#EDE9FE] text-[#615274] hover:text-[#6B46FE] transition text-left"
              >
                Últimos 30 días
              </button>
              <button
                type="button"
                onClick={applyThisMonth}
                className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-[#F8F7FC] hover:bg-[#EDE9FE] text-[#615274] hover:text-[#6B46FE] transition text-left"
              >
                Este mes
              </button>
            </div>
          </div>

          {/* Custom Date Pickers */}
          <div className="space-y-2.5 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-[#615274] mb-1">Desde:</label>
              <input
                type="date"
                value={tempStart}
                max={tempEnd || undefined}
                onChange={(e) => setTempStart(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-[#F8F7FC] border border-[#E8E5F4] rounded-xl text-[#1C1135] focus:outline-hidden focus:border-[#6B46FE] cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#615274] mb-1">Hasta:</label>
              <input
                type="date"
                value={tempEnd}
                min={tempStart || undefined}
                onChange={(e) => setTempEnd(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-[#F8F7FC] border border-[#E8E5F4] rounded-xl text-[#1C1135] focus:outline-hidden focus:border-[#6B46FE] cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F0EEF8]">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-xs font-bold text-[#615274] hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black bg-[#6B46FE] text-white hover:bg-[#5833EA] rounded-xl shadow-xs transition cursor-pointer"
            >
              <Check size={14} /> Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

