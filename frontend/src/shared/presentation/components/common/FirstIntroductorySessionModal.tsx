import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Sparkles, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { useSelectedFamilyPatient } from '@/modules/padre/application/useSelectedFamilyPatient';
import { patientsService } from '@/modules/clinica/infrastructure/clinicalService';
import { View } from '@/shared/domain/types/navigation';

interface Props {
  go?: (v: View) => void;
}

export function FirstIntroductorySessionModal({ go }: Props) {
  const navigate = useNavigate();
  const { patient } = useSelectedFamilyPatient();
  const [isOpen, setIsOpen] = useState(false);
  const [targetChild, setTargetChild] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (!patient?.id_paciente) return;
    const childId = patient.id_paciente;
    const childName = patient.nombres_paciente;

    const alreadyShown = localStorage.getItem(`ashakids:first-intro-shown:${childId}`) === 'true';
    if (alreadyShown) return;

    const isPending = localStorage.getItem(`ashakids:pending-first-intro:${childId}`) === 'true';
    if (!isPending) return;

    let cancelled = false;
    async function checkChildJourney() {
      try {
        const journey = await patientsService.journey(childId);
        if (cancelled) return;
        if (!journey.introduccion_atendida && !journey.introduccion_pendiente) {
          localStorage.setItem(`ashakids:first-intro-shown:${childId}`, 'true');
          localStorage.removeItem(`ashakids:pending-first-intro:${childId}`);
          setTargetChild({ id: childId, name: childName });
          setIsOpen(true);
        } else {
          // If the child already has an appointment/attended session, mark as shown
          localStorage.setItem(`ashakids:first-intro-shown:${childId}`, 'true');
          localStorage.removeItem(`ashakids:pending-first-intro:${childId}`);
        }
      } catch {
        // If query fails, keep pending
      }
    }

    void checkChildJourney();

    return () => {
      cancelled = true;
    };
  }, [patient?.id_paciente, patient?.nombres_paciente]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen || !targetChild) return null;

  const handleBookSession = () => {
    setIsOpen(false);
    if (go) {
      go('padre/agenda' as View);
    }
    navigate('/padre/agenda?booking=true');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-intro-modal-title"
        aria-describedby="first-intro-modal-desc"
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#E8E5F4] overflow-hidden flex flex-col p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar aviso de sesión introductoria"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#F8F7FC] hover:bg-violet-100 text-[#615274] hover:text-[#1C1135] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#EDE9FE] flex items-center justify-center p-2 shadow-inner">
              <img
                src="/illustrations/family-ashi-wave-v88.png"
                alt="Ashi te da la bienvenida"
                className="w-full h-full object-contain drop-shadow-sm"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/illustrations/ashi-hero-v1.png';
                }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#6B46FE] text-white flex items-center justify-center shadow-md">
              <Sparkles size={14} />
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-[#6B46FE] text-xs font-black uppercase tracking-wider mb-2">
            Primer paso para {targetChild.name}
          </span>

          <h2 id="first-intro-modal-title" className="text-xl sm:text-2xl font-black text-[#1C1135] tracking-tight">
            Reserva su primera sesión introductoria
          </h2>

          <p id="first-intro-modal-desc" className="text-sm font-semibold text-[#615274] mt-2.5 leading-relaxed max-w-md">
            Para iniciar el recorrido de <strong className="text-[#1C1135]">{targetChild.name}</strong>, el primer paso es agendar una sesión inicial de evaluación. Un especialista revisará sus necesidades de comunicación y creará su plan de trabajo.
          </p>

          <div className="w-full bg-[#F8F7FC] rounded-2xl p-4 my-5 border border-[#E8E5F4] text-left space-y-2.5">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#6B46FE] mt-0.5 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-[#1C1135]">
                Evaluación integral de habla, lenguaje y motricidad
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#6B46FE] mt-0.5 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-[#1C1135]">
                Modalidad virtual (Meet) o presencial a tu elección
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#6B46FE] mt-0.5 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-[#1C1135]">
                Elige el profesional de tu preferencia y el horario ideal
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleBookSession}
              className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-extrabold text-sm shadow-md shadow-violet-200 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              <CalendarDays size={17} />
              <span>Reservar sesión</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl border border-[#E8E5F4] hover:bg-slate-50 text-[#615274] hover:text-[#1C1135] font-extrabold text-sm transition-colors cursor-pointer"
            >
              En otro momento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

