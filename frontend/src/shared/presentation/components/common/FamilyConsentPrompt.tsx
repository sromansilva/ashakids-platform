import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clinicaService } from '@/modules/clinica/infrastructure/clinicalService';

export function FamilyConsentPrompt({ patientId, patientName }: { patientId: number; patientName: string }) {
  const client = useQueryClient();
  const consent = useQuery({
    queryKey: ['appointment-ai-consent', patientId],
    queryFn: () => clinicaService.getConsent(patientId),
    enabled: Number.isInteger(patientId) && patientId > 0,
    retry: false,
  });
  const [dismissed, setDismissed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (dismissed || consent.data?.estado !== 'NO_SOLICITADO') return null;

  const respond = async (estado: 'CONCEDIDO' | 'REVOCADO') => {
    setSaving(true);
    setError('');
    try {
      await clinicaService.grantConsent({
        id_paciente: patientId,
        tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
        estado,
      });
      client.setQueryData(['appointment-ai-consent', patientId], {
        id_paciente: patientId,
        consentido: estado === 'CONCEDIDO',
        estado,
        tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
        fecha_concesion: estado === 'CONCEDIDO' ? new Date().toISOString() : null,
      });
      client.invalidateQueries({ queryKey: ['appointment-ai-consent', patientId] });
      setDismissed(true);
    } catch {
      setError('No se pudo guardar tu decisión. Puedes intentarlo de nuevo o cambiarla en Privacidad.');
    } finally {
      setSaving(false);
    }
  };

  if (consent.isPending || consent.error || consent.data?.estado !== 'NO_SOLICITADO') return null;

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-[#1C1135]/55 p-4" role="presentation">
      <section className="w-full max-w-lg rounded-3xl border border-[#E8E5F4] bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="family-ai-consent-title" aria-describedby="family-ai-consent-description">
        <p className="text-xs font-black uppercase tracking-wide text-violet-700">Antes de tu primera cita</p>
        <h2 id="family-ai-consent-title" className="mt-2 text-xl font-black text-[#1C1135]">¿Autorizas una prueba breve de voz?</h2>
        <p id="family-ai-consent-description" className="mt-3 text-sm leading-relaxed text-[#615274]">
          Si aceptas, durante la sesión el terapeuta podrá solicitar una muestra de 2 a 3 segundos de la voz de {patientName}. Se procesa para obtener una transcripción preliminar que el profesional revisa. El audio no se guarda y nunca se toma de Google Meet.
        </p>
        <p className="mt-3 rounded-2xl bg-violet-50 p-3 text-xs leading-relaxed text-violet-950">
          Es opcional y puedes revocar el permiso desde Privacidad. Tu decisión no cambia el acceso a la atención ni a la sesión.
        </p>
        {error && <p role="alert" className="mt-3 text-sm font-bold text-red-800">{error}</p>}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="rounded-xl px-4 py-2 text-sm font-bold text-[#615274] hover:bg-[#F8F7FC]" disabled={saving} onClick={() => setDismissed(true)}>Decidir más tarde</button>
          <button type="button" className="rounded-xl border border-[#E8E5F4] px-4 py-2 text-sm font-bold text-[#615274] hover:bg-[#F8F7FC] disabled:opacity-50" disabled={saving} onClick={() => void respond('REVOCADO')}>No autorizar IA</button>
          <button type="button" className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-bold text-white hover:bg-violet-800 disabled:opacity-50" disabled={saving} onClick={() => void respond('CONCEDIDO')}>{saving ? 'Guardando…' : 'Sí, autorizo'}</button>
        </div>
      </section>
    </div>
  );
}
