import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarDays,
  MessageCircle,
  HeartHandshake,
  FileText,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import type { View } from '@/shared/domain/types/navigation';
import './family-sub-nav.css';

export interface FamilySubNavItem {
  id: string;
  label: string;
  path: string;
  view?: View;
  icon: React.ElementType;
}

export const FAMILY_SUBNAV_ITEMS: FamilySubNavItem[] = [
  { id: 'family', label: 'Para mi familia', path: '/padre?section=family', icon: Users },
  { id: 'agenda', label: 'Agenda y sesiones', path: '/padre/agenda', view: 'padre/agenda', icon: CalendarDays },
  { id: 'mensajes', label: 'Mensajes', path: '/padre/mensajes', view: 'padre/mensajes', icon: MessageCircle },
  { id: 'psicologos', label: 'Terapeutas', path: '/padre/psicologos', view: 'padre/psicologos', icon: HeartHandshake },
  { id: 'reportes', label: 'Reportes', path: '/padre/reportes', view: 'padre/reportes', icon: FileText },
  { id: 'config', label: 'Gestionar familia', path: '/padre/config', view: 'padre/config', icon: Settings },
  { id: 'incidencias', label: 'Incidencias', path: '/padre/incidencias', view: 'padre/incidencias', icon: AlertTriangle },
];

export interface FamilySubNavProps {
  go?: (v: View) => void;
}

export function FamilySubNav({ go: _go }: FamilySubNavProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isItemActive = (item: FamilySubNavItem): boolean => {
    if (item.id === 'family') {
      return location.pathname === '/padre' && searchParams.get('section') === 'family';
    }
    if (item.id === 'agenda') {
      return location.pathname.startsWith('/padre/agenda');
    }
    if (item.id === 'mensajes') {
      return location.pathname.startsWith('/padre/mensajes');
    }
    if (item.id === 'psicologos') {
      return location.pathname.startsWith('/padre/psicologos');
    }
    if (item.id === 'reportes') {
      return location.pathname.startsWith('/padre/reportes');
    }
    if (item.id === 'config') {
      return (
        location.pathname.startsWith('/padre/config') ||
        location.pathname.startsWith('/padre/perfil')
      );
    }
    if (item.id === 'incidencias') {
      return location.pathname.startsWith('/padre/incidencias');
    }
    return false;
  };

  const handleClick = (item: FamilySubNavItem) => {
    navigate(item.path);
  };

  return (
    <nav className="family-sub-nav" aria-label="Herramientas para mi familia">
      <div className="family-sub-nav-track">
        {FAMILY_SUBNAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);
          return (
            <button
              key={item.id}
              type="button"
              className={`family-sub-nav-btn ${active ? 'family-sub-nav-btn--active' : ''}`}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              onClick={() => handleClick(item)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

