import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Users, LogOut, CalendarDays, MessageCircle, HeartHandshake, Settings, FileText, Sparkles, Compass, AlertTriangle, CircleHelp } from 'lucide-react';
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
  const { children, patient, selectPatient } = useSelectedFamilyPatient();
  const pickerRef = useRef<HTMLDetailsElement>(null);

  // Cerrar selector al hacer click fuera
  useEffect(() => {
    const handleOutside = (event: PointerEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        pickerRef.current.open = false;
      }
    };
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, []);

  const displayName = padreUserName || (user ? `${user.nombres} ${user.apellidos}`.trim() : 'Familia / Tutor');

  const navLinks: { label: string; view?: View; section?: 'world' | 'journey' | 'family'; icon: React.ElementType }[] = [
    { label: 'Mi Mundo', section: 'world', icon: Sparkles },
    { label: 'Mi Camino', section: 'journey', icon: Compass },
    { label: 'Para mi familia', section: 'family', icon: Users },
    { label: 'Agenda y sesiones', view: 'padre/agenda', icon: CalendarDays },
    { label: 'Mensajes', view: 'padre/mensajes', icon: MessageCircle },
    { label: 'Terapeutas', view: 'padre/psicologos', icon: HeartHandshake },
    { label: 'Reportes', view: 'padre/reportes', icon: FileText },
    { label: 'Gestionar familia', view: 'padre/config', icon: Settings },
    { label: 'Incidencias', view: 'padre/incidencias', icon: AlertTriangle },
    { label: 'Ayuda', view: 'padre/ayuda', icon: CircleHelp },
  ];

  const handleNavClick = (item: typeof navLinks[number]) => {
    if (item.section) {
      if (cur === 'padre' && onSelectSection) {
        onSelectSection(item.section);
      } else {
        navigate(`/padre?section=${item.section}`);
      }
      return;
    }
    if (item.view) {
      go(item.view);
    }
  };

  const isItemActive = (item: typeof navLinks[number]) => {
    if (item.section) {
      return cur === 'padre' && activeSection === item.section;
    }
    if (item.view) {
      return cur === item.view;
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
          onClick={() => {
            if (cur === 'padre' && onSelectSection) {
              onSelectSection(null);
            } else {
              navigate('/padre');
            }
          }}
        >
          Centro Familiar
        </button>

        {patient && (
          <details
            className="fc-profile ftn-child-picker"
            ref={pickerRef}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                pickerRef.current!.open = false;
                pickerRef.current?.querySelector('summary')?.focus();
              }
            }}
          >
            <summary aria-label={`Perfil activo: ${patient.nombres_paciente}`}>
              <img
                src={getPacienteAvatarImage(patient.avatar_nombre)}
                alt=""
                width={40}
                height={40}
              />
              <strong className="ftn-child-name">{patient.nombres_paciente}</strong>
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <div className="fc-profile-menu">
              <p>¿Quién va a explorar?</p>
              {children.map((child) => (
                <div
                  role="button"
                  tabIndex={0}
                  key={child.id_paciente}
                  className="ftn-child-option"
                  aria-label={`Seleccionar perfil de ${child.nombres_paciente}`}
                  aria-pressed={child.id_paciente === patient.id_paciente}
                  onClick={() => {
                    selectPatient(child.id_paciente);
                    pickerRef.current!.open = false;
                    pickerRef.current?.querySelector('summary')?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectPatient(child.id_paciente);
                      pickerRef.current!.open = false;
                      pickerRef.current?.querySelector('summary')?.focus();
                    }
                  }}
                >
                  <span className="ftn-option-text">Perfil: {child.nombres_paciente}</span>
                  {child.id_paciente === patient.id_paciente && <Check size={16} aria-hidden="true" />}
                </div>
              ))}
            </div>
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

