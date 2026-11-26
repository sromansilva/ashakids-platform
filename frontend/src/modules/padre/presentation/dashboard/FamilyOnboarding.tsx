import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, X } from 'lucide-react';
import { useSelectedFamilyPatient } from '@/modules/padre/application/useSelectedFamilyPatient';
import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { clinicaService, appointmentsService } from '@/modules/clinica/infrastructure/clinicalService';
import { readAllPages } from '@/core/api/readAllPages';
import { BookingDialog } from '@/shared/presentation/components/common/BookingDialog';

export function FamilyOnboarding() {
  const navigate = useNavigate();
  const { patients, children, patient } = useSelectedFamilyPatient();
  const [showBooking, setShowBooking] = useState(false);
  const [dismissedLocally, setDismissedLocally] = useState<Record<number, boolean>>({});

  // Cálculo síncrono de descarte / cierre en render para deshabilitar queries desde el primer frame
  const isDismissed = useMemo(() => {
    if (!patient?.id_paciente) return false;
    if (dismissedLocally[patient.id_paciente]) return true;
    try {
      return localStorage.getItem(`ashakids:onboarding-dismissed:${patient.id_paciente}`) === 'true';
    } catch {
      return false;
    }
  }, [patient?.id_paciente, dismissedLocally]);

  const hasChildren = children.length > 0;
  const step1Complete = hasChildren;

  // Consulta de consentimiento: solo si no está cerrado y hay paciente activo
  const consentEnabled = Boolean(patient?.id_paciente && !isDismissed);
  const consentQuery = useRemote(
    ['family-consent', patient?.id_paciente],
    (signal) => clinicaService.getConsent(patient!.id_paciente, signal),
    consentEnabled,
  );

  const hasConsent = Boolean(consentQuery.data?.consentido);
  const step2Complete = step1Complete && hasConsent;

  // Consulta de citas: solo si el paso 2 ya está completo y no está cerrado
  const appointmentsEnabled = Boolean(patient?.id_paciente && !isDismissed && step1Complete && hasConsent);
  const appointmentsQuery = useRemote(
    ['family-onboarding-appointments', patient?.id_paciente],
    (signal) => readAllPages((offset) => appointmentsService.list({ limit: 100, offset }, signal), signal),
    appointmentsEnabled,
  );

  const handleDismiss = () => {
    if (patient?.id_paciente) {
      try {
        localStorage.setItem(`ashakids:onboarding-dismissed:${patient.id_paciente}`, 'true');
      } catch {
        // En caso de modo incógnito o storage restringido
      }
      setDismissedLocally((prev) => ({ ...prev, [patient.id_paciente]: true }));
    }
  };

  const hasIntroductoryAppointment = Boolean(
    appointmentsQuery.data?.some(
      (a) =>
        a.id_paciente === patient?.id_paciente &&
        a.tipo_cita === 'INTRODUCTORIA' &&
        a.estado_reserva !== 'CANCELADA',
    ),
  );
  const step3Complete = step1Complete && hasIntroductoryAppointment;

  const completedCount = (step1Complete ? 1 : 0) + (step2Complete ? 1 : 0) + (step3Complete ? 1 : 0);
  const allComplete = step1Complete && step2Complete && step3Complete;

  // Si no hay datos de pacientes aún, hubo error, o el aviso ya fue cerrado para este hijo: null
  if (patients.isPending || patients.error || isDismissed) {
    return null;
  }

  // Al completar los 3 pasos: mensaje corto de confirmación
  if (allComplete) {
    return (
      <aside
        aria-label="Estado de primeros pasos"
        className="mb-8 flex items-center justify-between gap-4 rounded-3xl border border-[#E8E5F4] bg-white p-5 sm:p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Check size={22} className="stroke-[3]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#1C1135]">
              ¡Todo listo! Te esperamos en la sesión introductoria
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-[#615274]">
              Ya completaste los pasos iniciales para comenzar tu acompañamiento en ASHA.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar aviso de primeros pasos"
          className="shrink-0 rounded-xl p-2 text-[#9E95B7] hover:bg-[#F3F1F8] hover:text-[#1C1135] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B46FE]"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </aside>
    );
  }

  // Determinación del paso actual y bloqueos
  const step1Current = !step1Complete;
  const step2Current = step1Complete && !step2Complete;
  const step3Current = step1Complete && step2Complete && !step3Complete;

  const step2Blocked = !step1Complete;
  const step3Blocked = !step1Complete || !step2Complete;

  const childName = patient?.nombres_paciente;

  const step3BlockedReason = !step1Complete
    ? 'Primero registra a tu hijo'
    : childName
      ? `Primero autoriza la voz de ${childName}`
      : 'Primero autoriza las muestras de voz';

  return (
    <>
      <section
        aria-label="Primeros pasos en ASHA"
        className="mb-8 rounded-3xl border border-[#E8E5F4] bg-white p-6 sm:p-8 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#1C1135] tracking-tight">
              Tus primeros pasos en ASHA
            </h2>
            <p className="mt-1 text-sm sm:text-base text-[#615274]">
              Sigue estos tres pasos para comenzar tu acompañamiento personalizado.
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#615274]">
                <span>{completedCount} de 3 completados</span>
                <span>{Math.round((completedCount / 3) * 100)}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#EDE9FE]">
                <div
                  className="h-full rounded-full bg-[#6B46FE] transition-all duration-300 ease-out"
                  style={{ width: `${(completedCount / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <img
            src="/illustrations/ashi-hero-v1.png"
            alt=""
            width={72}
            height={72}
            className="hidden sm:block h-16 w-16 sm:h-20 sm:w-20 object-contain shrink-0"
          />
        </div>

        <ol className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6 list-none p-0">
          {/* PASO 1 */}
          <li
            className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
              step1Current
                ? 'border-[#6B46FE] bg-[#F8F7FC] shadow-sm'
                : 'border-[#E8E5F4] bg-white'
            }`}
            aria-current={step1Current ? 'step' : undefined}
          >
            <div>
              <div className="flex items-center justify-between">
                {step1Complete ? (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                    <Check size={16} className="stroke-[3]" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6B46FE] text-white font-extrabold text-sm shadow-sm">
                    1
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-base font-extrabold text-[#1C1135] leading-snug">
                Registra a tu hijo o hija
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#615274] leading-relaxed">
                Crea su perfil para personalizar su camino y actividades.
              </p>
            </div>

            <div>
              {step1Complete ? (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <Check size={14} className="stroke-[3]" aria-hidden="true" />
                  <span>Listo</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/padre/config?tab=hijos')}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B46FE] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5833EA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B46FE]"
                >
                  <span>Registrar hijo</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </li>

          {/* PASO 2 */}
          <li
            className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
              step2Current
                ? 'border-[#6B46FE] bg-[#F8F7FC] shadow-sm'
                : step2Blocked
                  ? 'border-[#E8E5F4] bg-[#FAFAFC] opacity-90'
                  : 'border-[#E8E5F4] bg-white'
            }`}
            aria-current={step2Current ? 'step' : undefined}
          >
            <div>
              <div className="flex items-center justify-between">
                {step2Complete ? (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                    <Check size={16} className="stroke-[3]" aria-hidden="true" />
                  </span>
                ) : step2Current ? (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6B46FE] text-white font-extrabold text-sm shadow-sm">
                    2
                  </span>
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F1F8] text-[#9E95B7] border border-[#E8E5F4] font-bold text-sm">
                    2
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-base font-extrabold text-[#1C1135] leading-snug">
                {childName ? `Autoriza las muestras de voz de ${childName}` : 'Autoriza las muestras de voz'}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#615274] leading-relaxed">
                Es para que el terapeuta pueda pedir muestras breves de voz durante la sesión; se puede revocar.
              </p>
            </div>

            <div>
              {step2Complete ? (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <Check size={14} className="stroke-[3]" aria-hidden="true" />
                  <span>Listo</span>
                </div>
              ) : step2Current ? (
                <button
                  type="button"
                  onClick={() => navigate('/padre/consentimiento')}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B46FE] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5833EA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B46FE]"
                >
                  <span>Autorizar muestras</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-4 inline-flex items-center justify-center rounded-xl border border-[#E8E5F4] bg-[#F3F1F8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#9E95B7] cursor-not-allowed"
                >
                  Primero registra a tu hijo
                </button>
              )}
            </div>
          </li>

          {/* PASO 3 */}
          <li
            className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
              step3Current
                ? 'border-[#6B46FE] bg-[#F8F7FC] shadow-sm'
                : step3Blocked
                  ? 'border-[#E8E5F4] bg-[#FAFAFC] opacity-90'
                  : 'border-[#E8E5F4] bg-white'
            }`}
            aria-current={step3Current ? 'step' : undefined}
          >
            <div>
              <div className="flex items-center justify-between">
                {step3Complete ? (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                    <Check size={16} className="stroke-[3]" aria-hidden="true" />
                  </span>
                ) : step3Current ? (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6B46FE] text-white font-extrabold text-sm shadow-sm">
                    3
                  </span>
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F1F8] text-[#9E95B7] border border-[#E8E5F4] font-bold text-sm">
                    3
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-base font-extrabold text-[#1C1135] leading-snug">
                {childName ? `Reserva la sesión introductoria de ${childName}` : 'Reserva la sesión introductoria'}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#615274] leading-relaxed">
                Coordina tu primer encuentro con el equipo clínico para evaluar sus necesidades.
              </p>
            </div>

            <div>
              {step3Complete ? (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <Check size={14} className="stroke-[3]" aria-hidden="true" />
                  <span>Listo</span>
                </div>
              ) : step3Current ? (
                <button
                  type="button"
                  onClick={() => setShowBooking(true)}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B46FE] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5833EA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B46FE]"
                >
                  <span>Reservar cita</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-4 inline-flex items-center justify-center rounded-xl border border-[#E8E5F4] bg-[#F3F1F8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#9E95B7] cursor-not-allowed"
                >
                  {step3BlockedReason}
                </button>
              )}
            </div>
          </li>
        </ol>
      </section>

      {showBooking && patient && (
        <BookingDialog
          patientId={patient.id_paciente}
          close={() => {
            setShowBooking(false);
            void appointmentsQuery.refetch();
          }}
        />
      )}
    </>
  );
}
