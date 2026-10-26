import { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronDown, Check, Users, LogOut, Sparkles, Compass, User } from 'lucide-react';
import { useAuth } from '@/modules/auth/application/useAuth';
import { useSelectedFamilyPatient } from '@/modules/padre/application/useSelectedFamilyPatient';
import { getPacienteAvatarImage } from '@/core/config/avatars';
import { Isotipo } from '@/shared/presentation/components/illustrations/Isotipo';
import type { View } from '@/shared/domain/types/navigation';

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
  const pickerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const displayName = padreUserName || (user ? `${user.nombres} ${user.apellidos || ''}`.trim() : 'Piero Anticona');

  const navLinks: {
    label: string;
    path: string;
    section: 'world' | 'journey' | 'family';
    icon: React.ElementType;
  }[] = [
    { label: 'Mi mundo', path: '/padre?section=world', section: 'world', icon: Sparkles },
    { label: 'Mi camino ASHA', path: '/padre?section=journey', section: 'journey', icon: Compass },
    { label: 'Para mi familia', path: '/padre?section=family', section: 'family', icon: Users },
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
    <header className="flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur-md border-b border-[#E8E5F4] shrink-0 sticky top-0 z-20" role="banner">
      {/* Left side: Brand + Child picker if NO sidebar */}
      {!hasSidebar ? (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/padre/welcome')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden"
          >
            <Isotipo size={34} />
            <span className="font-black text-[#1C1135] text-xl tracking-tight hidden sm:inline">AshaKids</span>
            <span className="text-xs font-bold text-[#8C82A8] border-l border-[#E8E5F4] pl-2.5 hidden md:inline">Centro Familiar</span>
          </button>

          {patient && (
            <div className="relative" ref={pickerRef}>
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-[#FFF7EE] hover:bg-[#FFEED8] border border-[#FFDFC0] rounded-full px-3 py-1.5 transition-colors shadow-xs"
              >
                <img
                  src={getPacienteAvatarImage(patient.avatar_nombre)}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover bg-orange-100 p-0.5"
                />
                <span className="font-extrabold text-sm text-[#1C1135]">{patient.nombres_paciente}</span>
                <ChevronDown size={15} className={`text-[#8C82A8] transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
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
                        setOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-violet-50 transition-colors ${
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
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm font-bold text-[#625779] md:hidden">
          <Isotipo size={28} />
          <span className="text-[#1C1135] font-black">AshaKids</span>
        </div>
      )}

      {/* Center Nav Pills */}
      <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Secciones del Centro Familiar">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavClick(item)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-150 ${
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
      </nav>

      {/* Right side: User Profile Badge + Salir Button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-violet-100/80 border border-violet-200 flex items-center justify-center text-[#6B46FE] font-black text-sm shrink-0">
            <User size={18} />
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-xs sm:text-sm font-extrabold text-[#1C1135] leading-tight truncate max-w-[150px]">
              {displayName}
            </p>
            <p className="text-[11px] font-semibold text-[#8C82A8]">Tutor / Familia</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          aria-label="Cerrar sesión"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-extrabold transition-colors"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
