import type { View } from '@/shared/domain/types/navigation';
import { useSelectedFamilyPatient } from '@/modules/padre/application/useSelectedFamilyPatient';
import { FamilyConsentManager } from '@/shared/presentation/components/common/FamilyConsentManager';
import { RemoteFeedback } from '@/shared/presentation/components/common/RemoteFeedback';
import { Btn } from '@/shared/presentation/components/common/Btn';

export function PadreConsentimiento({ go }: { go: (view: View) => void }) {
  const { patients, children } = useSelectedFamilyPatient();
  return (
    <section className="mx-auto max-w-4xl space-y-5 p-4 text-[#1C1135] sm:p-6">
      <header>
        <h1 className="text-2xl font-black">Privacidad y consentimientos</h1>
        <p className="mt-2 text-base leading-relaxed text-[#4B4264]">
          Revisa y cambia, por separado para cada hijo, el permiso opcional para procesar audio con reconocimiento de voz en actividades clínicas y juegos de voz. La atención y las actividades sin micrófono siguen disponibles si no autorizas o si revocas el permiso.
        </p>
      </header>
      <RemoteFeedback pending={patients.isPending} error={patients.error} retry={() => void patients.refetch()} />
      {patients.isSuccess && !patients.error && children.length === 0 && (
        <div className="rounded-2xl border border-[#E8E5F4] bg-white p-5">
          <p className="text-sm text-[#4B4264]">Aún no hay perfiles infantiles activos en esta cuenta.</p>
          <Btn className="mt-4" onClick={() => go('padre/config')}>Gestionar hijos</Btn>
        </div>
      )}
      {children.map((child) => (
        <FamilyConsentManager
          key={child.id_paciente}
          patientId={child.id_paciente}
          patientName={`${child.nombres_paciente} ${child.apellidos_paciente ?? ''}`.trim()}
        />
      ))}
      <p className="text-xs leading-relaxed text-[#615274]">
        El permiso se guarda por hijo y puede revocarse en cualquier momento. La aplicación no guarda la grabación como archivo. En una sesión clínica, la transcripción tentativa queda pendiente de revisión del terapeuta; no se comparte con la familia hasta que el profesional la confirme. Junto a la transcripción, el terapeuta puede ver indicadores de apoyo calculados desde el texto, sin validación clínica; esos indicadores no se muestran a la familia.
      </p>
    </section>
  );
}
