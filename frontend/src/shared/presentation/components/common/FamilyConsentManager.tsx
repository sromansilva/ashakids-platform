import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, Check, X, Info } from 'lucide-react';
import { clinicaService } from '@/modules/clinica/infrastructure/clinicalService';
import { Btn } from './Btn';

interface FamilyConsentManagerProps {
  patientId: number;
  patientName?: string;
  onConsentChange?: (granted: boolean) => void;
}
export function FamilyConsentManager({
  patientId,
  patientName = 'tu hijo(a)',
  onConsentChange,
}: FamilyConsentManagerProps) {
  const [consentGranted, setConsentGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchConsent = async () => {
      setLoading(true);
      try {
        const res = await clinicaService.getConsent(patientId);
        if (active) {
          setConsentGranted(res.consentido);
        }
      } catch {
        if (active) setConsentGranted(false);
      } finally {
        if (active) setLoading(false);
      }
    };
    if (patientId > 0) void fetchConsent();
    return () => {
      active = false;
    };
  }, [patientId]);

  const handleToggleConsent = async (grant: boolean) => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await clinicaService.grantConsent({
        id_paciente: patientId,
        tipo_consentimiento: 'EVALUACION_FONOLOGICA_IA',
        estado: grant ? 'CONCEDIDO' : 'REVOCADO',
      });
      setConsentGranted(res.consentido);
      onConsentChange?.(res.consentido);
      setNotice(
        grant
          ? 'Consentimiento otorgado con éxito para evaluaciones fonológicas asistidas.'
          : 'Consentimiento revocado. La plataforma utilizará únicamente evaluación fonoaudiológica manual.'
      );
    } catch {
      setNotice('No se pudo actualizar el estado de consentimiento. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-violet-100 bg-[#FBFAFE] p-4 transition-all">
      <div className="flex items-start gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            consentGranted
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {consentGranted ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-extrabold text-[#1C1135] flex items-center gap-1.5">
              Consentimiento para evaluación asistida por IA
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  consentGranted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {loading
                  ? 'Consultando…'
                  : consentGranted
                  ? 'Autorización Activa'
                  : 'Sin Autorización'}
              </span>
            </h4>
          </div>

          <p className="mt-1 text-xs text-[#615274] leading-relaxed">
            Permite el reconocimiento de voz experimental para actividades clínicas y juegos de voz de <strong>{patientName}</strong>.
          </p>

          <div className="mt-2.5 rounded-xl bg-violet-50/60 p-2.5 text-[11px] text-[#4B4264] flex items-start gap-2">
            <Info size={14} className="text-violet-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              El audio se procesa temporalmente para obtener una transcripción y no se guarda como archivo. En una evaluación clínica, la transcripción queda pendiente de revisión profesional; en los juegos no se registra como resultado clínico. Puedes revocar este
              permiso en cualquier momento sin afectar la atención presencial ni virtual tradicional.
            </p>
          </div>

          {notice && (
            <p className="mt-2 text-xs font-bold text-violet-700">
              {notice}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {consentGranted ? (
              <button
                type="button"
                disabled={saving || loading}
                onClick={() => void handleToggleConsent(false)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
              >
                <X size={13} />
                Revocar autorización
              </button>
            ) : (
              <Btn
                variant="cta"
                size="sm"
                disabled={saving || loading}
                onClick={() => void handleToggleConsent(true)}
                className="text-xs"
              >
                <Sparkles size={13} className="mr-1" />
                {saving ? 'Guardando…' : 'Autorizar uso de IA fonológica'}
              </Btn>
            )}

            {consentGranted && (
              <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <Check size={13} /> El terapeuta puede aplicar pruebas rápidas en vivo
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
