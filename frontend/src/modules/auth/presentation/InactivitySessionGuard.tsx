import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, LogOut, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/modules/auth/application/useAuth';

// Configuración por defecto: 5 minutos de inactividad (al minuto 4 sale el modal de advertencia durante 60s)
const DEFAULT_TIMEOUT_SEC = 5 * 60;

function getTimeoutSettings() {
  let timeoutSec = DEFAULT_TIMEOUT_SEC;
  if (typeof window !== 'undefined') {
    // Permite definir un tiempo menor en localStorage para pruebas manuales rápidas en desarrollo
    // Ej: localStorage.setItem('ashakids:dev-timeout-sec', '30');
    const override = Number(window.localStorage.getItem('ashakids:dev-timeout-sec'));
    if (override && !isNaN(override) && override >= 5) {
      timeoutSec = override;
    }
  }
  const timeoutMs = timeoutSec * 1000;
  const warningMs = timeoutSec <= 30 ? Math.max(5000, Math.floor(timeoutMs / 2)) : 60 * 1000;
  const warningTriggerMs = timeoutMs - warningMs;
  return { timeoutSec, timeoutMs, warningMs, warningTriggerMs };
}

export const InactivitySessionGuard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const lastActivityRef = useRef<number>(Date.now());
  const isWarningActiveRef = useRef<boolean>(false);
  const isLoggingOutRef = useRef<boolean>(false);

  // Manejador explícito de "¡Sigo aquí!"
  const handleStayActive = useCallback(() => {
    lastActivityRef.current = Date.now();
    isWarningActiveRef.current = false;
    setShowWarning(false);
    const { warningMs } = getTimeoutSettings();
    setSecondsRemaining(Math.round(warningMs / 1000));
  }, []);

  // Manejador explícito de cierre de sesión manual
  const handleManualLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    isWarningActiveRef.current = false;
    setShowWarning(false);
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  }, [logout, navigate]);

  // Registro de interacción del usuario
  const recordActivity = useCallback(() => {
    // Cuando el modal de advertencia ya está visible, exigimos que el usuario interactúe
    // con el modal (botón "¡Sigo aquí!") para que un leve movimiento de mouse involuntario
    // no cierre el aviso sin que la persona se haya percatado.
    if (isWarningActiveRef.current) return;

    const now = Date.now();
    if (now - lastActivityRef.current > 500) {
      lastActivityRef.current = now;
    }
  }, []);

  // Escucha de eventos de interacción global
  useEffect(() => {
    if (!isAuthenticated) return;

    const eventNames: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
    ];

    const onUserInteraction = () => recordActivity();

    for (const eventName of eventNames) {
      window.addEventListener(eventName, onUserInteraction, { passive: true });
    }

    return () => {
      for (const eventName of eventNames) {
        window.removeEventListener(eventName, onUserInteraction);
      }
    };
  }, [isAuthenticated, recordActivity]);

  // Temporizador de verificación cada segundo
  useEffect(() => {
    if (!isAuthenticated) {
      isWarningActiveRef.current = false;
      setShowWarning(false);
      return;
    }

    lastActivityRef.current = Date.now();
    isWarningActiveRef.current = false;
    isLoggingOutRef.current = false;

    const timer = setInterval(() => {
      const { timeoutMs, warningTriggerMs } = getTimeoutSettings();
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= timeoutMs) {
        // Tiempo límite alcanzado: cerrar sesión automáticamente
        if (!isLoggingOutRef.current) {
          isLoggingOutRef.current = true;
          isWarningActiveRef.current = false;
          setShowWarning(false);
          clearInterval(timer);
          void logout().finally(() => {
            navigate('/login', {
              replace: true,
              state: {
                inactivityNotice: 'Tu sesión se ha cerrado automáticamente tras 5 minutos de inactividad por tu seguridad.',
              },
            });
          });
        }
      } else if (elapsed >= warningTriggerMs) {
        // En la ventana de advertencia: mostrar modal con cuenta regresiva
        const remaining = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));
        setSecondsRemaining(remaining);
        if (!isWarningActiveRef.current) {
          isWarningActiveRef.current = true;
          setShowWarning(true);
        }
      } else {
        if (isWarningActiveRef.current) {
          isWarningActiveRef.current = false;
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, logout, navigate]);

  // Si no está autenticado o estamos en login o no hay advertencia activa, no renderizar
  if (!isAuthenticated || !showWarning || location.pathname === '/login') {
    return null;
  }

  const { warningMs } = getTimeoutSettings();
  const totalWarningSec = Math.max(1, Math.round(warningMs / 1000));
  const progressPercentage = Math.min(100, Math.max(0, (secondsRemaining / totalWarningSec) * 100));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inactivity-modal-title"
      aria-describedby="inactivity-modal-desc"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#E8E5F4] flex flex-col p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
        {/* Ilustración de Ashi e Ícono */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#EDE9FE] flex items-center justify-center p-2 shadow-inner">
              <img
                src="/illustrations/ashi-hero-v1.png"
                alt="Ashi preguntando si sigues ahí"
                className="w-full h-full object-contain drop-shadow-sm"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/illustrations/family-ashi-wave-v88.png';
                }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#6B46FE] text-white flex items-center justify-center shadow-md animate-pulse">
              <Clock size={16} />
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black uppercase tracking-wider mt-3">
            <ShieldAlert size={14} className="text-amber-600" />
            Inactividad detectada
          </span>
        </div>

        {/* Textos Principales */}
        <h2 id="inactivity-modal-title" className="text-2xl font-black text-[#1C1135] tracking-tight">
          ¿Sigues ahí?
        </h2>

        <p id="inactivity-modal-desc" className="text-sm font-semibold text-[#615274] mt-2 leading-relaxed">
          Por motivos de seguridad y para proteger la información del paciente, tu sesión se cerrará automáticamente en:
        </p>

        {/* Contador y Barra de Progreso */}
        <div className="my-5 p-4 rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl font-black text-[#6B46FE] font-mono">
              {secondsRemaining}s
            </span>
          </div>
          <div className="w-full bg-[#E8E5F4] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                secondsRemaining <= 15 ? 'bg-red-500' : 'bg-[#6B46FE]'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#9E95B7] mt-2 block">
            {secondsRemaining <= 15 ? '¡Cierre de sesión inminente!' : 'Haz clic en continuar para seguir trabajando'}
          </span>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-2.5 mt-1">
          <button
            type="button"
            onClick={handleStayActive}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-bold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <span>¡Sigo aquí!</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={handleManualLogout}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#F8F7FC] hover:bg-red-50 text-[#615274] hover:text-red-600 border border-[#E8E5F4] hover:border-red-200 font-bold text-sm transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
