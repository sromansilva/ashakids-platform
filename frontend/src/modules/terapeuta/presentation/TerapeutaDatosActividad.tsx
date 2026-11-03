import { useEffect, useState, type CSSProperties } from 'react';
import { Gamepad2, Info } from 'lucide-react';
import { patientsService, type PhonemeActivityAnalytics } from '@/modules/clinica/infrastructure/clinicalService';
import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { RemoteFeedback } from '@/shared/presentation/components/common/RemoteFeedback';

const dateLabel = (value: string | null) => value
  ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(value))
  : 'Sin intentos en este periodo';
const worldLabels: Record<string, string> = {
  HABLA: 'Taller de los Sonidos',
  LENGUAJE: 'La Isla de las Palabras',
  FLUIDEZ: 'Ritmo de las Palabras',
};

export function TerapeutaDatosActividad() {
  const patients = useRemote(['activity-patients'], (signal) => patientsService.list({ limit: 100 }, signal));
  const [patientId, setPatientId] = useState<number | null>(null);
  const activePatients = patients.data?.items.filter((patient) => patient.activo) ?? [];

  useEffect(() => {
    if (activePatients.length && !activePatients.some((patient) => patient.id_paciente === patientId)) {
      setPatientId(activePatients[0].id_paciente);
    }
  }, [activePatients, patientId]);

  const analytics = useRemote<PhonemeActivityAnalytics>(
    ['phoneme-activity-analytics', patientId, 30],
    (signal) => patientsService.phonemeAnalytics(patientId!, 30, signal),
    patientId !== null,
  );
  const selectedPatient = activePatients.find((patient) => patient.id_paciente === patientId);
  const clinicalRows = analytics.data?.resultados_clinicos ?? [];
  const practiceByPhoneme = new Map<string, { attempts: number; correct: number; words: string[]; latest: string | null }>();
  for (const item of analytics.data?.practica_ludica ?? []) {
    const row = practiceByPhoneme.get(item.fonema_objetivo) ?? { attempts: 0, correct: 0, words: [], latest: null };
    row.attempts += item.intentos;
    row.correct += item.respuestas_correctas;
    if (item.intentos) row.words.push(`${worldLabels[item.mundo] ?? item.mundo}: ${item.palabra_objetivo}`);
    if (item.ultima_practica && (!row.latest || item.ultima_practica > row.latest)) row.latest = item.ultima_practica;
    practiceByPhoneme.set(item.fonema_objetivo, row);
  }
  const practiceRows = Array.from(practiceByPhoneme.entries()).map(([phoneme, row]) => ({ fonema_objetivo: phoneme, ...row }));
  const maxPractice = Math.max(1, ...practiceRows.map((row) => row.attempts));
  const maxClinical = Math.max(1, ...clinicalRows.map((row) => row.total));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 text-[#1C1135] sm:p-6 lg:p-8">
      <header className="rounded-3xl border border-[#E8E5F4] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#EDE9FE] text-[#6B46FE]">
            <Gamepad2 size={25} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Datos de actividad</h1>
            <p className="mt-2 text-sm font-bold text-[#615274]">Seguimiento clínico y práctica de juegos, presentados por separado.</p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4" role="note">
        <div className="flex items-start gap-3">
          <Info size={19} className="mt-0.5 shrink-0 text-blue-700" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-blue-900">
            Los resultados clínicos son decisiones registradas por el terapeuta. Los intentos de juego reflejan práctica en casa; no se promedian ni determinan un resultado clínico.
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-[#E8E5F4] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="phoneme-activity-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="phoneme-activity-title" className="text-xl font-black">Actividad por fonema</h2>
            <p className="mt-1 text-sm text-[#615274]">Decisiones clínicas y práctica de los últimos 30 días.</p>
          </div>
          <label className="min-w-64 text-sm font-bold text-[#1C1135]">
            Paciente
            <select
              value={patientId ?? ''}
              onChange={(event) => setPatientId(event.target.value ? Number(event.target.value) : null)}
              disabled={patients.isPending || !activePatients.length}
              className="mt-1 block min-h-11 w-full rounded-xl border border-[#E8E5F4] bg-white px-3 py-2"
            >
              <option value="">Selecciona un paciente</option>
              {activePatients.map((patient) => (
                <option key={patient.id_paciente} value={patient.id_paciente}>
                  {patient.nombres_paciente} {patient.apellidos_paciente}
                </option>
              ))}
            </select>
          </label>
        </div>
        <RemoteFeedback pending={patients.isPending} error={patients.error} retry={() => void patients.refetch()} />
        <RemoteFeedback pending={analytics.isPending} error={analytics.error} retry={() => void analytics.refetch()} />
        {!patients.isPending && !patients.error && !activePatients.length && (
          <p className="rounded-xl bg-[#F8F7FC] p-4 text-sm text-[#615274]">No hay pacientes activos vinculados a esta cuenta profesional.</p>
        )}
        {selectedPatient && analytics.data && (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4" aria-label="Resultados clínicos revisados por fonema">
              <h3 className="font-extrabold">Evaluación clínica</h3>
              <p className="mt-1 text-xs text-[#615274]">Muestras confirmadas por el terapeuta · {selectedPatient.nombres_paciente}</p>
              <div className="mt-4 space-y-4">
                {clinicalRows.map((row) => (
                  <article key={row.fonema_objetivo}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-black">{row.fonema_objetivo}</span>
                      <span className="text-xs font-bold text-[#615274]">{row.total} muestras revisadas</span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-white" aria-label={`${row.fonema_objetivo}: ${row.alcanzado} alcanzado, ${row.en_proceso} en proceso, ${row.requiere_apoyo} requiere apoyo`}>
                      <span className="bg-emerald-500" style={{ width: `${(row.alcanzado / maxClinical) * 100}%` }} />
                      <span className="bg-amber-400" style={{ width: `${(row.en_proceso / maxClinical) * 100}%` }} />
                      <span className="bg-orange-500" style={{ width: `${(row.requiere_apoyo / maxClinical) * 100}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-[#615274]">Alcanzado {row.alcanzado} · En proceso {row.en_proceso} · Requiere apoyo {row.requiere_apoyo}</p>
                  </article>
                ))}
              </div>
              {!clinicalRows.some((row) => row.total > 0) && (
                <p className="mt-4 rounded-xl bg-white p-3 text-xs text-[#615274]">Aún no hay muestras con resultado clínico confirmado en este periodo.</p>
              )}
            </section>

            <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4" aria-label="Práctica lúdica guardada por fonema">
              <h3 className="font-extrabold">Práctica en juegos</h3>
              <p className="mt-1 text-xs text-[#615274]">Intentos y aciertos de niveles con corrección automática en La Isla de las Palabras y el Laberinto; no equivalen a logro clínico.</p>
              <div className="mt-4 space-y-4">
                {practiceRows.map((row) => {
                  const width = `${(row.attempts / maxPractice) * 100}%`;
                  return (
                    <article key={row.fonema_objetivo}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                        <span className="font-black">{row.fonema_objetivo}</span>
                        <span className="text-xs font-bold text-[#615274]">{row.correct}/{row.attempts} aciertos · {row.attempts ? Math.round(row.correct / row.attempts * 100) : 0}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white" role="img" aria-label={`${row.fonema_objetivo}: ${row.attempts} intentos de práctica`}>
                        <span className="block h-full rounded-full bg-amber-500" style={{ width } as CSSProperties} />
                      </div>
                      <p className="mt-1 text-[11px] text-[#615274]">
                        {row.words.length ? `Palabras y niveles: ${row.words.join(', ')}` : 'Sin intentos guardados'} · {dateLabel(row.latest)}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-[#E8E5F4] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="adaptive-activities-title">
        <h2 id="adaptive-activities-title" className="text-lg font-black">Participación en actividades adaptativas</h2>
        <p className="mt-1 text-sm text-[#615274]">Registra juegos completados y su duración. Estas actividades no generan puntuación clínica ni XP.</p>
        {analytics.data?.actividades_adaptativas.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-[#E8E5F4] text-xs text-[#615274]"><tr><th className="py-2 pr-3">Mundo</th><th className="py-2 pr-3">Juego</th><th className="py-2 pr-3">Completados</th><th className="py-2 pr-3">Tiempo total</th><th className="py-2">Último juego</th></tr></thead>
              <tbody>{analytics.data.actividades_adaptativas.map((activity) => (
                <tr key={`${activity.mundo}:${activity.actividad}`} className="border-b border-[#F0EDF6] last:border-0">
                  <td className="py-3 pr-3 font-bold">{worldLabels[activity.mundo] ?? activity.mundo}</td>
                  <td className="py-3 pr-3">{activity.actividad.replace(/^(word|sound|fluency):/, '').replaceAll('_', ' ')}</td>
                  <td className="py-3 pr-3">{activity.completadas}/{activity.intentos}</td>
                  <td className="py-3 pr-3">{Math.floor(activity.duracion_segundos / 60)} min {activity.duracion_segundos % 60} s</td>
                  <td className="py-3">{dateLabel(activity.ultima_practica)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p className="mt-3 rounded-xl bg-[#F8F7FC] p-3 text-sm text-[#615274]">Aún no hay actividades adaptativas registradas en este periodo.</p>}
      </section>

      <section className="rounded-2xl border border-[#E8E5F4] bg-white p-5" role="note">
        <h2 className="font-extrabold">Acceso a las actividades</h2>
        <p className="mt-1 text-sm leading-relaxed text-[#615274]">
          La familia abre los mundos y juegos desde su Centro Familiar. Aquí se muestran únicamente los intentos que el sistema registra para el paciente seleccionado; la práctica lúdica no se interpreta como avance clínico.
        </p>
      </section>
    </div>
  );
}
