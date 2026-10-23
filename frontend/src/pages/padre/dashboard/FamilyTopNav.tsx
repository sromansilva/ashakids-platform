import { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronDown, Check, Users, LogOut, Sparkles, Compass } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSelectedFamilyPatient } from '@/hooks/useSelectedFamilyPatient';
import { getPacienteAvatarImage } from '@/config/avatars';
import type { View } from '@/types/navigation';
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
  cur,
  go,
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
  const [open, setOpen] = useState(false);

  // Cerrar selector al hacer click fuera
  useEffect(() => {
    const handleOutside = (event: PointerEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        pickerRef.current.open = false;
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, []);

  const displayName = padreUserName || (user ? `${user.nombres} ${user.apellidos}`.trim() : 'Familia / Tutor');

  const navLinks: {
    label: string;
    path: string;
    section: 'world' | 'journey' | 'family';
    icon: React.ElementType;
    key: string;
  }[] = [
    { label: 'Mi Mundo', path: '/padre?section=world', section: 'world', icon: Sparkles, key: 'world' },
    { label: 'Mi Camino ASHA', path: '/padre?section=journey', section: 'journey', icon: Compass, key: 'journey' },
    { label: 'Para mi familia', path: '/padre?section=family', section: 'family', icon: Users, key: 'family' },
  ];

  const currentSection = activeSection || searchParams.get('section');
  const isFamilySubmodule = location.pathname.startsWith('/padre/') && location.pathname !== '/padre/welcome';

  const handleNavClick = (item: typeof navLinks[number]) => {
    if (item.section) {
      if (location.pathname === '/padre' && onSelectSection) {
        onSelectSection(item.section);
      } else {
        navigate(item.path);
      }
      return;
    }
    navigate(item.path);
  };

  const isItemActive = (item: typeof navLinks[number]) => {
    if (item.section === 'world') {
      return location.pathname === '/padre' && currentSection === 'world';
    }
    if (item.section === 'journey') {
      return location.pathname === '/padre' && currentSection === 'journey';
    }
    if (item.section === 'family') {
      return (location.pathname === '/padre' && currentSection === 'family') || isFamilySubmodule;
    }
    return false;
  };

  return (
    <header className="ftn-header" role="banner">
      {/* Fila Superior: Centro Familiar / Selector Niño / Nombre Padre / Salir */}
      <div className="ftn-top-row">
        <button
          className="ftn-brand-btn"
          type="button"
          aria-label="Volver al inicio"
          onClick={() => {
            navigate('/padre/welcome');
          }}
        >
          Centro Familiar
        </button>

        {patient && (
          <details
            className="fc-profile ftn-child-picker"
            ref={pickerRef}
            open={open}
            onToggle={(event) => {
              setOpen(event.currentTarget.open);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                pickerRef.current!.open = false;
                setOpen(false);
                pickerRef.current?.querySelector('summary')?.focus();
              }
            }}
          >
            <summary
              className="ftn-child-summary"
              aria-label={`Elegir perfil: ${patient.nombres_paciente} ${patient.apellidos_paciente}`}
              onClick={(e) => {
                e.preventDefault();
                setOpen((prev) => !prev);
              }}
            >
              <img
                src={getPacienteAvatarImage(patient.avatar_nombre)}
                alt=""
                width={40}
                height={40}
              />
              <strong className="ftn-child-name">
                <span>{patient.nombres_paciente}</span>
              </strong>
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            {open && (
              <div className="fc-profile-menu">
                <p>¿Quién va a explorar?</p>
                {children.map((child) => (
                  <button
                    type="button"
                    key={child.id_paciente}
                    className="ftn-child-option"
                    aria-label={`${child.nombres_paciente} ${child.apellidos_paciente}`}
                    aria-pressed={child.id_paciente === patient.id_paciente}
                    onClick={() => {
                      selectPatient(child.id_paciente);
                      if (searchParams.has('world')) {
                        const nextParams = new URLSearchParams(searchParams);
                        nextParams.delete('world');
                        setSearchParams(nextParams, { replace: true });
                      }
                      setOpen(false);
                      if (pickerRef.current) pickerRef.current.open = false;
                      pickerRef.current?.querySelector('summary')?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectPatient(child.id_paciente);
                        if (searchParams.has('world')) {
                          const nextParams = new URLSearchParams(searchParams);
                          nextParams.delete('world');
                          setSearchParams(nextParams, { replace: true });
                        }
                        setOpen(false);
                        if (pickerRef.current) pickerRef.current.open = false;
                        pickerRef.current?.querySelector('summary')?.focus();
                      }
                    }}
                  >
                    <span className="ftn-option-text">
                      {child.nombres_paciente} {child.apellidos_paciente}
                    </span>
                    {child.id_paciente === patient.id_paciente && <Check size={16} aria-hidden="true" />}
                  </button>
                ))}
              </div>
            )}
          </details>
        )}

        <div className="ftn-user-section">
          <div className="ftn-parent-info" title={displayName}>
            <span className="ftn-parent-label">Tutor / Familia</span>
            <span className="ftn-parent-name">{displayName}</span>
          </div>

          <button
            type="button"
            className="ftn-logout-btn"
            onClick={logout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={20} aria-hidden="true" />
            <span className="ftn-logout-text">Salir</span>
          </button>
        </div>
      </div>

      {/* Fila Inferior: Navbar de Navegación Rápida */}
      <nav className="ftn-nav-bar" aria-label="Navegación del Centro Familiar">
        <div className="ftn-nav-scroll">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <button
                key={item.label}
                type="button"
                className={`ftn-nav-btn ${active ? 'ftn-nav-btn--active' : ''}`}
                aria-current={active ? 'page' : undefined}
                aria-label={`Ir a ${item.label}`}
                onClick={() => handleNavClick(item)}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
