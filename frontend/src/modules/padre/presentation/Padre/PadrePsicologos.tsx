import { useState } from "react";
import type { View } from "@/shared/domain/types/navigation";
import type { AppointmentRequest } from "@/shared/domain/types/AppointmentRequest";
import { useRemote } from "@/shared/application/hooks/useRemoteData";
import { agendaService } from "@/modules/clinica/infrastructure/clinicalService";
import { readAllPages } from "@/core/api/readAllPages";
import { RemoteFeedback } from "@/shared/presentation/components/common/RemoteFeedback";
import { BookingDialog } from "@/shared/presentation/components/common/BookingDialog";
import { ArrowRight, Calendar, MessageCircle, CalendarDays, Sparkles } from "lucide-react";

export function PadrePsicologos({
  go,
}: {
  go: (view: View) => void;
  onRequest: (request: AppointmentRequest) => void;
  bookedSlots?: { therapist: string; date: string; time: string }[];
}) {
  const data = useRemote(['professionals'], (s) =>
    readAllPages((o) => agendaService.professionals({ limit: 100, offset: o }, s), s)
  );
  const [booking, setBooking] = useState<number | null>(null);

  // Avatar pastel backgrounds for therapists
  const avatarColors = ["bg-[#E8F0FE]", "bg-[#E6F4EA]", "bg-[#FEF7E0]", "bg-[#FCE8E6]", "bg-[#F3E8FD]"];

  return (
    <section className="p-4 sm:p-8 max-w-5xl text-[#1C1135]">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-wider text-[#6B46FE] mb-2 flex items-center gap-1.5">
          <Sparkles size={14} /> TERAPEUTAS
        </p>
        <h1 className="text-3xl font-black text-[#1C1135] tracking-tight">Encuentra a tu terapeuta</h1>
        <p className="text-sm font-medium text-[#6B5E8A] mt-1.5 max-w-2xl leading-relaxed">
          Elige un profesional para la introducción o para continuar el plan de tu hijo. Al reservar verás sus horarios disponibles.
        </p>
      </div>

      <RemoteFeedback pending={data.isPending} error={data.error} retry={() => void data.refetch()} />

      {/* 3-Column Grid */}
      {!data.error && data.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((t, idx) => {
            const initials = `${t.nombres?.[0] || 'T'}${t.apellidos?.[0] || 'L'}`.toUpperCase();
            const bgClass = avatarColors[idx % avatarColors.length];

            return (
              <div
                key={t.id_terapeuta}
                className="bg-white rounded-3xl border border-[#E8E5F4] p-6 shadow-xs flex flex-col items-center text-center justify-between min-h-[330px] hover:border-violet-300 transition-all"
              >
                <div className="flex flex-col items-center w-full">
                  {/* Avatar circle with chat icon badge */}
                  <div className="relative mb-4">
                    <div className={`w-24 h-24 rounded-full ${bgClass} flex items-center justify-center text-2xl font-black text-[#6B46FE] shadow-inner`}>
                      {initials}
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-[#E8E5F4] flex items-center justify-center text-[#6B46FE] shadow-xs">
                      <MessageCircle size={15} />
                    </div>
                  </div>

                  {/* Name */}
                  <h2 className="text-xl font-black text-[#1C1135] mb-1">
                    {t.nombres} {t.apellidos}
                  </h2>

                  {/* Specialty / Bio */}
                  <p className="text-xs font-semibold text-[#6B5E8A] mb-2">
                    {t.especialidad ?? 'Terapia de lenguaje'}
                  </p>
                  {t.descripcion_profesional && (
                    <p className="text-xs text-[#8C82A8] font-medium leading-relaxed line-clamp-2 px-2">
                      {t.descripcion_profesional}
                    </p>
                  )}
                </div>

                {/* Booking Button */}
                <button
                  type="button"
                  onClick={() => setBooking(t.id_terapeuta)}
                  className="w-full mt-6 flex items-center justify-center gap-2 bg-[#6B46FE] hover:bg-[#5835E5] text-white py-3 px-4 rounded-2xl font-extrabold text-sm shadow-sm shadow-[#6B46FE]/20 transition-all active:scale-[.98]"
                >
                  <span>Ver horarios y reservar</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {data.isSuccess && !data.data.length && (
        <div className="bg-white rounded-3xl border border-[#E8E5F4] p-8 text-center">
          <p className="text-base text-[#6B5E8A] font-bold">Por ahora no hay profesionales activos disponibles en el directorio.</p>
        </div>
      )}

      {/* Bottom Agenda Banner */}
      <div className="mt-10 rounded-3xl border border-[#FFE3CA] bg-gradient-to-r from-[#FFF8F0] via-[#FFF3EB] to-[#F4EFFE] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-[#6B46FE] mb-2 flex items-center gap-1.5">
            <Calendar size={14} /> TU AGENDA
          </p>
          <h3 className="text-2xl font-black text-[#1C1135]">Consulta tu agenda</h3>
          <p className="text-sm font-medium text-[#6B5E8A] mt-1 mb-6 max-w-md leading-relaxed">
            Revisa tus próximas citas y sesiones, o agenda una nueva sesión con el terapeuta que elijas.
          </p>
          <button
            type="button"
            onClick={() => go('padre/agenda')}
            className="inline-flex items-center gap-2 bg-white border-2 border-[#6B46FE] text-[#6B46FE] hover:bg-violet-50 font-black px-6 py-2.5 rounded-2xl text-sm transition-colors shadow-xs"
          >
            <span>Consultar mi agenda</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Right calendar illustration */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="w-28 h-28 rounded-3xl bg-white/80 border border-[#FFDFC0] flex items-center justify-center shadow-md">
            <CalendarDays size={56} className="text-[#6B46FE]" />
          </div>
        </div>
      </div>

      {booking !== null && <BookingDialog therapistId={booking} close={() => setBooking(null)} />}
    </section>
  );
}
