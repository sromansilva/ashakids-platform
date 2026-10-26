import { FamilyAppointmentDetail } from "@/shared/presentation/components/common/FamilyAppointmentDetail";
import type { usePadreAgenda } from "@/modules/padre/presentation/Padre/usePadreAgenda";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import { B } from "@/shared/presentation/theme/brand/B";
import { Bdg } from "@/shared/presentation/components/common/Bdg";
import { Av } from "@/shared/presentation/components/common/Av";
import { Toast } from "@/modules/padre/presentation/Padre/Toast";
import { ConfirmModal } from "@/modules/padre/presentation/Padre/ConfirmModal";
import { MONTHS } from "@/modules/padre/presentation/Padre/MONTHS";
import { DAYS_LABEL } from "@/modules/padre/presentation/Padre/DAYS_LABEL";

type Props = Pick<
  ReturnType<typeof usePadreAgenda>,
  | "toast"
  | "setToast"
  | "cancelId"
  | "cancelApt"
  | "setCancelId"
  | "month"
  | "year"
  | "pendingCount"
  | "setShowNew"
  | "prevMonth"
  | "nextMonth"
  | "firstDay"
  | "daysInMonth"
  | "today"
  | "aptDays"
  | "selDay"
  | "setSelDay"
  | "selectedApts"
  | "waitingApts"
  | "confirmedApts"
  | "expandedReservationIds"
  | "setExpandedReservationIds"
  | "timelineSel"
  | "setTimelineSel"
>;

export function PadreAgendaMiAgenda({
  toast,
  setToast,
  cancelId,
  cancelApt,
  setCancelId,
  month,
  year,
  pendingCount: _pendingCount,
  setShowNew,
  prevMonth,
  nextMonth,
  firstDay,
  daysInMonth,
  today,
  aptDays,
  selDay,
  setSelDay,
  selectedApts,
  waitingApts,
  confirmedApts,
  expandedReservationIds,
  setExpandedReservationIds,
  timelineSel: _timelineSel,
  setTimelineSel: _setTimelineSel,
}: Props) {
  const currentDay = selDay ?? today.getDate();

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      {cancelId !== null && (
        <ConfirmModal
          title="Cancelar cita"
          desc="¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer."
          onConfirm={() => cancelApt(cancelId!)}
          onClose={() => setCancelId(null)}
        />
      )}

      {/* Main Grid: Calendar & Day Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left: Calendar Card */}
        <div className="bg-white rounded-3xl border border-[#E8E5F4] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black text-[#1C1135]">
                {MONTHS[month]} {year}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  aria-label="Mes anterior"
                  className="p-2 hover:bg-violet-50 text-[#7C6F9A] hover:text-[#6B46FE] rounded-xl transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  aria-label="Mes siguiente"
                  className="p-2 hover:bg-violet-50 text-[#7C6F9A] hover:text-[#6B46FE] rounded-xl transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Days header: L M X J V S D */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-black text-[#8C82A8]">
              {DAYS_LABEL.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isToday =
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();
                const isSelected = selDay === day || (!selDay && isToday);
                const hasApt = aptDays.has(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelDay(day)}
                    className={`aspect-square flex flex-col items-center justify-center text-sm font-extrabold rounded-2xl transition-all relative ${
                      isSelected
                        ? "bg-[#6B46FE] text-white shadow-md shadow-[#6B46FE]/30"
                        : isToday
                        ? "bg-violet-100 text-[#6B46FE]"
                        : "hover:bg-violet-50 text-[#1C1135]"
                    }`}
                  >
                    <span>{day}</span>
                    {hasApt && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                          isSelected ? "bg-white" : "bg-orange-500"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Legend */}
          <div className="mt-6 pt-4 border-t border-[#F0EEF8] flex items-center justify-between text-xs font-bold text-[#8C82A8]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Cita agendada</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B46FE]" />
              <span>Hoy</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Day Appointments Card */}
        <div className="bg-white rounded-3xl border border-[#E8E5F4] p-6 shadow-xs flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EEF8]">
              <h3 className="text-xl font-black text-[#1C1135]">
                Citas del {currentDay} de {MONTHS[month]} ({selectedApts.length})
              </h3>
              {selDay && (
                <button
                  type="button"
                  onClick={() => setSelDay(null)}
                  className="text-xs font-extrabold text-[#6B46FE] hover:underline"
                >
                  Ver todas
                </button>
              )}
            </div>

            {/* List or Empty State */}
            {selectedApts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                {/* 3D Calendar illustration */}
                <div className="relative mb-4 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#FFF3E8] to-[#F1EDFE] flex items-center justify-center">
                    <CalendarDays size={44} className="text-[#6B46FE]" />
                  </div>
                </div>
                <h4 className="text-xl font-black text-[#1C1135] mb-1">Sin citas</h4>
                <p className="text-sm text-[#8C82A8] font-medium max-w-xs">
                  No hay citas para este período. ¿Quieres agendar una?
                </p>
                <button
                  type="button"
                  onClick={() => setShowNew(true)}
                  className="mt-5 flex items-center gap-2 bg-[#6B46FE] hover:bg-[#5835E5] text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-[#6B46FE]/20 transition-all active:scale-[.98]"
                >
                  <Plus size={16} />
                  <span>Reservar cita</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
                {waitingApts.map((apt) => (
                  <div
                    key={apt.id}
                    className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-sm text-[#1C1135]">
                          {apt.date} · {apt.time}
                        </p>
                        <p className="text-xs text-[#6B5E8A] mt-0.5 font-medium">
                          {apt.therapist} · {apt.child} · {apt.type === "presencial" ? "Presencial" : "Virtual"}
                        </p>
                      </div>
                      <Bdg color="orange">Por confirmar</Bdg>
                    </div>
                    <p className="mt-3 text-xs font-medium text-orange-800">
                      La confirmación corresponde al terapeuta asignado. El estado se actualizará desde el servidor.
                    </p>
                  </div>
                ))}

                {confirmedApts.map((apt) => {
                  const isExpanded = expandedReservationIds.includes(apt.id);
                  const detailsId = `reservation-details-${apt.id}`;
                  return (
                    <div
                      key={apt.id}
                      className="rounded-2xl border border-[#E8E5F4] bg-white overflow-hidden transition-all hover:border-violet-300 shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedReservationIds((cur) =>
                            cur.includes(apt.id)
                              ? cur.filter((id) => id !== apt.id)
                              : [...cur, apt.id]
                          )
                        }
                        aria-expanded={isExpanded}
                        aria-controls={detailsId}
                        className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
                      >
                        <Av
                          initials={apt.therapist
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)}
                          color={B.violet}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-sm text-[#1C1135] truncate">
                            {apt.date} · {apt.time}
                          </p>
                          <p className="text-xs text-[#8C82A8] font-medium truncate mt-0.5">
                            {apt.therapist} · {apt.child} · {apt.type === "presencial" ? "Presencial" : "Virtual"}
                          </p>
                        </div>
                        <Bdg
                          color={
                            apt.status === "confirmada"
                              ? "green"
                              : apt.status === "completada"
                              ? "teal"
                              : "orange"
                          }
                        >
                          {apt.status === "confirmada"
                            ? "Confirmada"
                            : apt.status === "completada"
                            ? "Completada"
                            : "Cancelada"}
                        </Bdg>
                        <ChevronRight
                          size={16}
                          className={`text-[#8C82A8] transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div
                          id={detailsId}
                          className="border-t border-[#F0EEF8] p-4 bg-[#FBFBFE]"
                        >
                          <FamilyAppointmentDetail
                            id={apt.id}
                            cancel={() => setCancelId(apt.id)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Timeline Card */}
      <div className="bg-white rounded-3xl border border-[#E8E5F4] p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="text-lg font-black text-[#1C1135]">Línea de tiempo</h3>
          <p className="text-xs text-[#8C82A8] font-bold mt-0.5">
            {currentDay} de {MONTHS[month]} {year} · {selectedApts.length} citas
          </p>
        </div>

        {/* Timeline Rail */}
        <div className="overflow-x-auto pb-2">
          <div className="relative min-w-[700px] h-20 border-t border-[#F0EEF8] pt-2">
            <div className="grid grid-cols-11 gap-0 h-full">
              {Array.from({ length: 11 }, (_, i) => 8 + i).map((hour) => (
                <div
                  key={hour}
                  className="border-l border-dashed border-[#E8E5F4] pl-2 text-[11px] font-bold text-[#8C82A8] h-full"
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
