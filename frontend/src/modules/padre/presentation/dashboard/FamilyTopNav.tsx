import { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronDown, Check, Users, LogOut, Sparkles, Compass, User } from 'lucide-react';
import { useAuth } from '@/modules/auth/application/useAuth';
import { useSelectedFamilyPatient } from '@/modules/padre/application/useSelectedFamilyPatient';
import { getPacienteAvatarImage } from '@/core/config/avatars';
import { Isotipo } from '@/shared/presentation/components/illustrations/Isotipo';
import type { View } from '@/shared/domain/types/navigation';
import './family-top-nav.css';

export interface FamilyTopNavProps {
  cur?: View;
  go: (view: View) => void;
  logout: () => void;
  padreUserName?: string;
  activeSection?: 'world' | 'journey' | 'family' | null;
  onSelectSection?: (section: 'world' | 'journey' | 'family' | null) => void;
}

export function FamilyTopNav({
  cur: _cur,
  go: _go,
  logout,
  padreUserName,
  activeSection,
  onSelectSection,
}: FamilyTopNavProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { children, patient, selectPatient } = useSelectedFamilyPatient();
  const pickerRef = useRef<HTMLDetailsElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        pickerRef.current.open = false;
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const displayName = padreUserName || (user ? `${user.nombres} ${user.apellidos || ''}`.trim() : 'Piero Anticona');

  const navLinks = [
    { label: 'Mi Mundo', path: '/padre?section=world', section: 'world' as const, icon: Sparkles },
    { label: 'Mi Camino ASHA', path: '/padre?section=journey', section: 'journey' as const, icon: Compass },
    { label: 'Para mi familia', path: '/padre?section=family', section: 'family' as const, icon: Users },
  ];

  const currentSection = activeSection || searchParams.get('section');
  const isFamilySubmodule = location.pathname.startsWith('/padre/') && location.pathname !== '/padre/welcome';
  const hasSidebar = isFamilySubmodule || (location.pathname === '/padre' && (currentSection === 'family' || !currentSection));

  const handleNavClick = (item: typeof navLinks[number]) => {
    if (location.pathname === '/padre' && onSelectSection) {
      onSelectSection(item.section);
    } else {
      navigate(item.path);
    }
  };

  const isItemActive = (item: typeof navLinks[number]) => {
    if (item.section === 'world') {
      return location.pathname === '/padre' && currentSection === 'world';
    }
    if (item.section === 'journey') {
      return location.pathname === '/padre' && currentSection === 'journey';
    }
    if (item.section === 'family') {
      return (location.pathname === '/padre' && (currentSection === 'family' || !currentSection)) || isFamilySubmodule;
    }
    return false;
  };

  return (
    <header className="ftn-header flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur-md border-b border-[#E8E5F4] shrink-0 sticky top-0 z-20" role="banner">
      {/* Left side: Brand + Child picker */}
      <div className="ftn-top-row flex items-center gap-4">
        <button
          type="button"
          aria-label="Volver al inicio"
          onClick={() => {
            navigate('/padre/welcome');
          }}
          className="ftn-brand-btn flex items-center gap-2.5 text-left focus:outline-hidden cursor-pointer"
        >
          <Isotipo size={34} />
          <span className="font-black text-[#1C1135] text-xl tracking-tight hidden sm:inline">AshaKids</span>
          <span className="text-xs font-bold text-[#8C82A8] border-l border-[#E8E5F4] pl-2.5 hidden md:inline">Centro Familiar</span>
        </button>

        {patient && (
          <details
            className="ftn-child-picker relative"
            ref={pickerRef}
            open={pickerOpen}
            onToggle={(e) => {
              if (e.currentTarget.open !== pickerOpen) {
                setPickerOpen(e.currentTarget.open);
              }
            }}
          >
            <summary
              aria-label={`Elegir perfil: ${patient.nombres_paciente}${patient.apellidos_paciente ? ` ${patient.apellidos_paciente}` : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setPickerOpen(!pickerOpen);
              }}
              className="ftn-child-summary flex items-center gap-2 bg-[#FFF7EE] hover:bg-[#FFEED8] border border-[#FFDFC0] rounded-full px-3 py-1.5 transition-colors shadow-xs list-none cursor-pointer"
            >
              <img
                src={getPacienteAvatarImage(patient.avatar_nombre)}
                alt=""
                className="w-7 h-7 rounded-full object-cover bg-orange-100 p-0.5"
              />
              <span className="ftn-child-name font-extrabold text-sm text-[#1C1135]">{patient.nombres_paciente}</span>
              <ChevronDown size={15} className={`text-[#8C82A8] transition-transform ${pickerOpen ? 'rotate-180' : ''}`} />
            </summary>

            {pickerOpen && (
              <div className="absolute left-0 top-full mt-1.5 bg-white rounded-2xl border border-[#E8E5F4] py-1.5 z-50 shadow-xl min-w-[200px]">
                <p className="px-3.5 py-1 text-[10px] font-bold text-[#8C82A8] uppercase tracking-wider">Perfiles de la familia</p>
                {children.map((child) => (
                  <button
                    key={child.id_paciente}
                    type="button"
                    onClick={() => {
                      selectPatient(child.id_paciente);
                      if (searchParams.has('world')) {
                        const nextParams = new URLSearchParams(searchParams);
                        nextParams.delete('world');
                        setSearchParams(nextParams, { replace: true });
                      }
                      setPickerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-violet-50 transition-colors cursor-pointer ${
                      child.id_paciente === patient.id_paciente ? 'bg-violet-50 font-bold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={getPacienteAvatarImage(child.avatar_nombre)} alt="" className="w-6 h-6 rounded-full" />
                      <span className="text-xs text-[#1C1135]">{child.nombres_paciente} {child.apellidos_paciente}</span>
                    </div>
                    {child.id_paciente === patient.id_paciente && <Check size={14} className="text-[#6B46FE]" />}
                  </button>
                ))}
              </div>
            )}
          </details>
        )}
      </div>

      {/* Center Nav Pills */}
      <nav className="ftn-nav-bar flex items-center gap-1.5 sm:gap-2" aria-label="Navegación del Centro Familiar">
        <div className="ftn-nav-scroll">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);
          return (
            <button
              key={item.label}
              type="button"
              aria-label={`Ir a ${item.label}`}
              onClick={() => handleNavClick(item)}
              className={`ftn-nav-btn flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-150 ${active ? 'ftn-nav-btn--active' : ''} ${
                active
                  ? 'bg-[#F3EFFE] text-[#6B46FE] shadow-xs'
                  : 'text-[#625779] hover:bg-violet-50/70 hover:text-[#6B46FE]'
              }`}
            >
              <Icon size={17} className={active ? 'text-[#6B46FE]' : 'text-[#8C82A8]'} />
              <span>{item.label}</span>
            </button>
          );
        })}
        </div>
      </nav>

      {/* Right side: User Profile Badge + Salir Button */}
      <div className="ftn-user-section flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-violet-100/80 border border-violet-200 flex items-center justify-center text-[#6B46FE] font-black text-sm shrink-0">
            <User size={18} />
          </div>
          <div className="ftn-parent-info text-left hidden lg:block">
            <p className="ftn-parent-name text-xs sm:text-sm font-extrabold text-[#1C1135] leading-tight truncate max-w-[150px]">
              {displayName}
            </p>
            <p className="ftn-parent-label text-[11px] font-semibold text-[#8C82A8]">Tutor / Familia</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          aria-label="Cerrar sesión"
          className="ftn-logout-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-extrabold transition-colors"
        >
          <LogOut size={15} />
          <span className="ftn-logout-text hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
