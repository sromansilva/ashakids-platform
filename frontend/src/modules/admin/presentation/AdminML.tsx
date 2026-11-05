import { useCallback, useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Cpu, Mic, RotateCw, Settings, ShieldCheck } from 'lucide-react';
import type { View } from '@/shared/domain/types/navigation';
import { clinicaService, type MlServiceHealth } from '@/modules/clinica/infrastructure/clinicalService';

type MlTab = 'USO_CLINICO' | 'ESTADO_SERVICIO';

export function AdminML({ go: _go }: { go: (view: View) => void }) {
  const [tab, setTab] = useState<MlTab>('USO_CLINICO');
  const [health, setHealth] = useState<MlServiceHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setHealth(await clinicaService.mlHealth());
    } catch (cause) {
      setHealth(null);
      setError(cause instanceof Error ? cause.message : 'No se pudo consultar el servicio ML.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'ESTADO_SERVICIO') void refreshHealth();
  }, [tab, refreshHealth]);

  const online = health?.status === 'online';

  return (
    <section className="mx-auto max-w-7xl p-4 text-[#1C1135] sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-6 rounded-3xl border border-[#E8E5F4] bg-white p-6 shadow-sm sm:p-8 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Machine Learning</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800">
              <Activity size={13} /> Supervisado por el terapeuta
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-[#615274] sm:text-base">
            Consulta el estado de los modelos y las reglas del flujo clínico conectado a la plataforma.
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-4 md:flex">
          <Cpu size={25} className="text-[#6B46FE]" />
          <span className="text-sm font-extrabold text-[#1C1135]">Servicio interno de Ashakids</span>
        </div>
      </div>

      <div className="mb-6 inline-flex gap-1 rounded-2xl border border-[#E8E5F4] bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setTab('USO_CLINICO')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold transition ${tab === 'USO_CLINICO' ? 'bg-[#6B46FE] text-white shadow-md' : 'text-[#615274] hover:bg-violet-50'}`}
        >
          <ShieldCheck size={16} /> Uso clínico
        </button>
        <button
          type="button"
          onClick={() => setTab('ESTADO_SERVICIO')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold transition ${tab === 'ESTADO_SERVICIO' ? 'bg-[#6B46FE] text-white shadow-md' : 'text-[#615274] hover:bg-violet-50'}`}
        >
          <Settings size={16} /> Estado de servicios
        </button>
      </div>

      {error && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="text-sm"><p className="font-bold">Servicio ML no disponible</p><p className="mt-0.5 text-xs">{error}</p></div>
        </div>
      )}

      {tab === 'USO_CLINICO' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-[#E8E5F4] bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-[#6B46FE]"><Mic size={20} /></div>
              <div><h2 className="text-base font-extrabold">Evaluación fonológica en sesión</h2><p className="text-xs text-[#615274]">Transcripción tentativa con revisión humana obligatoria.</p></div>
            </div>
            <ol className="space-y-3 text-sm text-[#615274]">
              <li><strong className="text-[#1C1135]">1.</strong> El tutor debe tener consentimiento vigente para el uso de IA acústica.</li>
              <li><strong className="text-[#1C1135]">2.</strong> El terapeuta inicia una sesión activa y elige el objetivo fonológico.</li>
              <li><strong className="text-[#1C1135]">3.</strong> El micrófono de este dispositivo captura una muestra breve de 2 a 3 segundos.</li>
              <li><strong className="text-[#1C1135]">4.</strong> El terapeuta corrige o descarta la transcripción antes de añadirla al reporte.</li>
            </ol>
          </article>
          <article className="rounded-3xl border border-violet-200 bg-violet-50/60 p-6 shadow-sm sm:p-7">
            <div className="mb-3 flex items-center gap-2 text-[#6B46FE]"><ShieldCheck size={19} /><h2 className="text-base font-extrabold text-[#1C1135]">Controles de privacidad y alcance</h2></div>
            <ul className="space-y-2 text-sm text-[#615274]">
              <li>El panel de administración no recibe ni procesa archivos de voz.</li>
              <li>El audio viaja en paquetes temporales y se elimina de memoria al completar, cancelar o expirar la captura.</li>
              <li>Wav2Vec propone texto. Los indicadores de apoyo (similitud de texto, tipo de error e hipótesis) se calculan desde ese texto, no tienen validación clínica, solo los ve el equipo clínico y el terapeuta debe confirmarlos; no diagnostican.</li>
              <li>La predicción de tratamiento solo puede orientar un plan tras una decisión expresa del terapeuta.</li>
            </ul>
            <p className="mt-4 border-t border-violet-200 pt-3 text-xs font-semibold text-[#615274]">
              Para evaluar una muestra, usa el widget de fonología dentro de la sesión clínica activa del terapeuta.
            </p>
          </article>
        </div>
      )}

      {tab === 'ESTADO_SERVICIO' && (
        <div className="rounded-3xl border border-[#E8E5F4] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#E8E5F4] pb-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-[#6B46FE]"><Cpu size={22} /></div>
              <div><h2 className="text-lg font-extrabold">Estado del servicio de inferencia</h2><p className="text-xs text-[#615274]">Consulta protegida a través del backend de Ashakids.</p></div>
            </div>
            <button type="button" onClick={() => void refreshHealth()} disabled={isLoading} className="inline-flex items-center gap-2 rounded-xl border border-[#E8E5F4] px-4 py-2 text-xs font-bold text-[#1C1135] transition hover:bg-violet-50 disabled:opacity-60">
              <RotateCw size={14} className={isLoading ? 'animate-spin text-[#6B46FE]' : 'text-[#6B46FE]'} /> Actualizar estado
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard label="Conexión" value={online ? 'Servicio en línea' : 'Sin verificar'} ready={online} />
            <StatusCard label="Transcripción Wav2Vec" value={health?.modelo_listo ? health.modelo : 'Modelo no disponible'} ready={health?.modelo_listo === true} />
            <StatusCard label="Revisión configurada" value={health?.modelo_revision || 'No informada'} ready={Boolean(health?.modelo_revision)} />
            <StatusCard label="Predictor de tratamiento" value={health?.predictor_listo ? 'Artefacto cargado' : 'Modelo clínico no disponible'} ready={health?.predictor_listo === true} />
            <StatusCard label="Dispositivo" value={health?.dispositivo || 'No informado'} ready={online} />
          </div>
        </div>
      )}
    </section>
  );
}

function StatusCard({ label, value, ready }: { label: string; value: string; ready: boolean }) {
  return (
    <div className="rounded-2xl border border-[#E8E5F4] bg-[#F8F7FD] p-4">
      <p className="mb-1 text-xs font-bold text-[#615274]">{label}</p>
      <p className={`flex items-center gap-2 text-sm font-black ${ready ? 'text-emerald-700' : 'text-[#615274]'}`}>
        {ready ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
        <span className="min-w-0 break-words">{value}</span>
      </p>
    </div>
  );
}

export default AdminML;
