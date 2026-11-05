import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { readAllPages } from '@/core/api/readAllPages';
import { clinicaService, treatmentsService } from '@/modules/clinica/infrastructure/clinicalService';
import type { Treatment } from '@/modules/clinica/domain/clinical';
import { useRemote, useWrite } from '@/shared/application/hooks/useRemoteData';
import { Btn } from '@/shared/presentation/components/common/Btn';

type Outcome = 'ALTA' | 'ABANDONO';
const outcomeLabels: Record<string, string> = { ACTIVO: 'Plan activo', ALTA: 'Alta terapéutica', ABANDONO: 'Abandono' };

/** Plan profesional vigente; si no hay uno activo, el más reciente. */
export function currentTreatment(treatments: Treatment[]): Treatment | null {
  const professional = treatments.filter((treatment) => treatment.id_sesion_origen);
  return professional.find((treatment) => treatment.estado_tratamiento === 'ACTIVO') ?? professional[0] ?? null;
}

function CloseTreatmentDialog({ treatment, onClose }: { treatment: Treatment; onClose: () => void }) {
  const [outcome, setOutcome] = useState<Outcome>('ALTA');
  const [note, setNote] = useState('');
  const [pendingAppointments, setPendingAppointments] = useState<number | null>(null);
  const close = useWrite(
    (data: { desenlace: Outcome; observacion?: string }) => clinicaService.closeTreatment(treatment.id_tratamiento, data).then((result) => {
      setPendingAppointments(result.citas_futuras_pendientes);
      return result;
    }),
  );
  const done = close.isSuccess;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 cursor-default bg-[#1C1135]/45" onClick={onClose} aria-label="Cerrar sin guardar" />
      <section role="dialog" aria-modal="true" aria-labelledby="close-treatment-title" className="relative z-10 w-full max-w-md space-y-4 rounded-3xl border border-violet-100 bg-white p-5 shadow-2xl">
        <h2 id="close-treatment-title" className="text-lg font-black text-[#1C1135]">Cerrar tratamiento</h2>
        {done ? (
          <>
            <p role="status" className="text-sm text-[#4B4264]">El tratamiento quedó cerrado ({outcomeLabels[outcome].toLowerCase()}). No puede volver a activarse.</p>
            {!!pendingAppointments && (
              <p role="note" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                Quedan {pendingAppointments} cita(s) futura(s) vinculadas a este plan. Revísalas en la agenda; no se cancelaron automáticamente.
              </p>
            )}
            <div className="flex justify-end"><Btn onClick={onClose}>Entendido</Btn></div>
          </>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void close.submit({ desenlace: outcome, ...(note.trim() ? { observacion: note.trim() } : {}) });
            }}
          >
            <p className="text-sm text-[#615274]">
              Plan «{treatment.nombre_tratamiento}». Al cerrarlo se detienen la práctica asignada y la reserva de nuevas citas del plan. Esta acción no se puede deshacer.
            </p>
            <fieldset className="space-y-2">
              <legend className="text-sm font-bold text-[#1C1135]">Desenlace</legend>
              {(['ALTA', 'ABANDONO'] as const).map((value) => (
                <label key={value} className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#F8F7FC] px-3 py-2.5 text-sm text-[#4B4264]">
                  <input type="radio" name="desenlace" value={value} checked={outcome === value} onChange={() => setOutcome(value)} />
                  {outcomeLabels[value]}
                </label>
              ))}
            </fieldset>
            <label className="block text-sm font-bold text-[#1C1135]">
              Observación (opcional)
              <textarea maxLength={2000} rows={3} value={note} onChange={(event) => setNote(event.target.value)} className="mt-1.5 block w-full rounded-xl border border-[#E8E5F4] bg-white px-3 py-2.5 text-sm font-medium text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </label>
            {close.error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{close.error.message || 'No se pudo cerrar el tratamiento.'}</p>}
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" disabled={close.isPending} onClick={onClose}>Cancelar</Btn>
              <Btn type="submit" disabled={close.isPending}>{close.isPending ? 'Cerrando…' : 'Confirmar cierre'}</Btn>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

/** Celda del expediente: «Sesión X de N», estado del plan y cierre del tratamiento. */
export function PatientTreatmentStatus({ patientId }: { patientId: number }) {
  const query = useRemote(['treatments', patientId], (signal) => readAllPages((offset) => treatmentsService.list(patientId, { limit: 100, offset }, signal), signal));
  const [closing, setClosing] = useState(false);
  const treatment = query.data ? currentTreatment(query.data) : null;
  const attended = treatment?.sesiones_realizadas ?? 0;
  return (
    <div className="flex items-center gap-3.5">
      <div className="w-12 h-12 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
        <BarChart3 size={20} />
      </div>
      <div>
        <p className="text-xs font-bold text-[#615274]">Plan terapéutico</p>
        {query.isPending && <p className="text-base font-extrabold text-[#1C1135] mt-0.5">Cargando…</p>}
        {query.error && <p className="text-base font-extrabold text-[#1C1135] mt-0.5">No disponible</p>}
        {query.isSuccess && !treatment && <p className="text-base font-extrabold text-[#1C1135] mt-0.5">Sin plan publicado</p>}
        {treatment && (
          <>
            <p className="text-base font-extrabold text-[#1C1135] mt-0.5">
              Sesión {attended}{treatment.sesiones_recomendadas != null ? ` de ${treatment.sesiones_recomendadas}` : ''}
            </p>
            <p className="text-xs text-[#615274]">{outcomeLabels[treatment.estado_tratamiento] ?? treatment.estado_tratamiento}</p>
            {treatment.estado_tratamiento === 'ACTIVO' && (
              <button type="button" onClick={() => setClosing(true)} className="mt-1 text-xs font-bold text-[#6B46FE] hover:underline">
                Cerrar tratamiento
              </button>
            )}
          </>
        )}
      </div>
      {closing && treatment && <CloseTreatmentDialog treatment={treatment} onClose={() => setClosing(false)} />}
    </div>
  );
}
