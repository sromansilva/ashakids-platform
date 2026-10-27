import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Calendar, MessageSquare, Heart, FileText, Settings, AlertTriangle, HelpCircle, ChevronDown, Check } from 'lucide-react';
import { Isotipo } from '@/shared/presentation/components/illustrations/Isotipo';
import { useSelectedFamilyPatient } from '@/modules/padre/application/useSelectedFamilyPatient';
import { getPacienteAvatarImage } from '@/core/config/avatars';
import type { View } from '@/shared/domain/types/navigation';

export function FamilySidebar({ go }: { go: (view: View) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { children, patient, selectPatient } = useSelectedFamilyPatient();
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const navItems = [
    { label: 'Para mi familia', icon: Users, view: 'padre' as View, path: '/padre?section=family' },
    { label: 'Agenda y sesiones', icon: Calendar, view: 'padre/agenda' as View, path: '/padre/agenda' },
    { label: 'Mensajes', icon: MessageSquare, view: 'padre/mensajes' as View, path: '/padre/mensajes' },
    { label: 'Terapeutas', icon: Heart, view: 'padre/psicologos' as View, path: '/padre/psicologos' },
    { label: 'Reportes', icon: FileText, view: 'padre/reportes' as View, path: '/padre/reportes' },
    { label: 'Gestionar familia', icon: Settings, view: 'padre/config' as View, path: '/padre/config' },
    { label: 'Incidencias', icon: AlertTriangle, view: 'padre/incidencias' as View, path: '/padre/incidencias' },
  ];

  const isActive = (item: typeof navItems[number]) => {
    if (item.path.includes('section=family')) {
      return location.pathname === '/padre' && (new URLSearchParams(location.search).get('section') === 'family' || !new URLSearchParams(location.search).get('section'));
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside className="family-role-sidebar hidden md:flex h-full min-h-0 sticky top-0 border-r border-[#E8E5F4] flex-col bg-white overflow-y-auto flex-shrink-0 w-64 z-30" aria-label="Navegación familiar">
      {/* Brand Header */}
      <div className="family-sidebar-brand flex items-center gap-2.5 px-6 py-5 shrink-0">
        <Isotipo size={34} />
        <span className="font-black text-[#1C1135] text-xl tracking-tight">AshaKids</span>
        <span className="text-xs font-bold text-[#8C82A8] border-l border-[#E8E5F4] pl-2.5">Centro Familiar</span>
      </div>

      {/* Child Selector Pill */}
      {patient && (
        <div className="family-sidebar-picker px-5 mb-4 relative shrink-0" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={`Perfil de ${patient.nombres_paciente}. Cambiar hijo`}
            className="w-full flex items-center justify-between gap-2.5 bg-[#FFF7EE] hover:bg-[#FFEED8] border border-[#FFDFC0] rounded-full px-3.5 py-1.5 transition-colors shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={getPacienteAvatarImage(patient.avatar_nombre)}
                alt=""
                className="w-7 h-7 rounded-full object-cover bg-orange-100 p-0.5 shrink-0"
              />
              <span className="font-extrabold text-sm text-[#1C1135] truncate">{patient.nombres_paciente}</span>
            </div>
            <ChevronDown size={15} className={`text-[#8C82A8] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute left-5 right-5 top-full mt-1.5 bg-white rounded-2xl border border-[#E8E5F4] py-1.5 z-50 shadow-xl">
              <p className="px-3.5 py-1 text-[10px] font-bold text-[#8C82A8] uppercase tracking-wider">Perfiles de la familia</p>
              {children.map((child) => (
                <button
                  key={child.id_paciente}
                  type="button"
                  onClick={() => {
                    selectPatient(child.id_paciente);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-violet-50 transition-colors ${
                    child.id_paciente === patient.id_paciente ? 'bg-violet-50 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={getPacienteAvatarImage(child.avatar_nombre)} alt="" className="w-6 h-6 rounded-full shrink-0" />
                    <span className="text-xs text-[#1C1135] truncate">{child.nombres_paciente} {child.apellidos_paciente}</span>
                  </div>
                  {child.id_paciente === patient.id_paciente && <Check size={14} className="text-[#6B46FE] shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto py-2 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                if (item.path.startsWith('/padre?')) {
                  navigate(item.path);
                } else {
                  go(item.view);
                }
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-150 w-full text-left active:scale-[.98] ${
                active
                  ? 'bg-[#F3EFFE] text-[#6B46FE]'
                  : 'text-[#5C5378] hover:bg-violet-50 hover:text-[#6B46FE]'
              }`}
            >
              <Icon size={19} className={`flex-shrink-0 ${active ? 'text-[#6B46FE]' : 'text-[#7C6F9A]'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Ayuda */}
      <div className="p-3 border-t border-[#E8E5F4] shrink-0">
        <button
          type="button"
          onClick={() => go('padre/ayuda')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all w-full text-left ${
            location.pathname.startsWith('/padre/ayuda')
              ? 'bg-[#F3EFFE] text-[#6B46FE]'
              : 'text-[#5C5378] hover:bg-violet-50 hover:text-[#6B46FE]'
          }`}
        >
          <HelpCircle size={19} className="text-[#7C6F9A] shrink-0" />
          <span>Ayuda</span>
        </button>
      </div>
    </aside>
  );
}

