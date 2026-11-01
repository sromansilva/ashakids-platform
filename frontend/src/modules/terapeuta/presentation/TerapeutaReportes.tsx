import { useState } from 'react';
import { Download, Eye, Send, Edit, Plus, X, FileText, ChevronRight, Mic } from 'lucide-react';
import type { View } from '@/shared/domain/types/navigation';
import type { Session } from '@/modules/clinica/domain/clinical';
import { Btn } from '@/shared/presentation/components/common/Btn';
import { RemoteFeedback } from '@/shared/presentation/components/common/RemoteFeedback';
import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { sessionsService } from '@/modules/clinica/infrastructure/clinicalService';
import { readAllPages } from '@/core/api/readAllPages';
import { ReportWorkspace } from './reports/ReportWorkspace';
import { downloadPdf } from './downloadPdf';

const dateLabel = (session: Session) =>
  new Date(session.cita.fecha_hora_inicio).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export function TerapeutaReportes({ go: _go }: { go: (v: View) => void }) {
  const sessions = useRemote(['report-sessions'], (signal) =>
    readAllPages((offset) => sessionsService.list({ limit: 100, offset }, signal), signal)
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newReportOpen, setNewReportOpen] = useState(false);
  const [candidate, setCandidate] = useState(0);
  const rows = sessions.error ? [] : sessions.data ?? [];
  const reports = rows.filter((s) => s.reporte_disponible);
  const eligible = rows.filter(
    (s) => !s.reporte_disponible && ['EN_CURSO', 'FINALIZADA'].includes(s.estado_sesion) && s.asistencia !== 'NO_ASISTIO'
  );

  // Auto-selecciona la primera sesión con reporte o elegible para que el terapeuta nunca vea la pantalla vacía
  const selected = rows.find((s) => s.id_sesion === selectedId) ?? reports[0] ?? eligible[0];

  const templates = [
    'Evaluación inicial',
    'Seguimiento mensual',
    'Alta terapéutica',
    'Informe psicológico',
    'Informe de lenguaje',
  ];

  return (
    <div className="w-full max-w-none px-4 py-4 sm:px-6 sm:py-5 2xl:px-8 text-[#1C1135]">
      <div className="mb-4 flex flex-col gap-3 border-b border-[#E8E5F4] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-[#615274]">Redacción y seguimiento de sesiones</p>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {sessions.isSuccess && (
            <span className="hidden md:inline-flex items-center gap-2 rounded-xl border border-[#E8E5F4] bg-white px-3 py-2 text-xs font-extrabold text-[#615274]">
              <span className="h-2 w-2 rounded-full bg-[#0D9488]" />
              {rows.length} sesiones clínicas
            </span>
          )}
          <button
            onClick={() => setNewReportOpen(true)}
            disabled={sessions.isPending || !!sessions.error}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6B46FE] px-4 py-2 text-sm font-extrabold text-white shadow-[0_6px_14px_rgba(107,70,254,0.2)] transition-all hover:bg-[#5833EA] active:scale-[.98] disabled:opacity-50 cursor-pointer"
          >
            <Plus size={16} />
            Nuevo reporte
          </button>
        </div>
      </div>

      <RemoteFeedback pending={sessions.isPending} error={sessions.error} retry={() => void sessions.refetch()} />

      {/* Main Grid: Left sidebar (saved & templates) + Right Editor */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(320px,0.88fr)_minmax(0,1.65fr)] 2xl:gap-6">
        <div className="space-y-4">
          {/* Sesiones Listas para Redactar Reporte */}
          {eligible.length > 0 && (
            <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/80 via-white to-white p-5 shadow-[0_10px_26px_rgba(95,68,170,0.08)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#6B46FE] animate-pulse" />
                  <h2 className="text-base font-extrabold text-[#1C1135]">Sesiones por redactar</h2>
                </div>
                <span className="text-xs font-bold text-[#6B46FE] bg-violet-100 px-2 py-0.5 rounded-full">
                  {eligible.length} {eligible.length === 1 ? 'pendiente' : 'pendientes'}
                </span>
              </div>
              <div className="space-y-3">
                {eligible.map((s) => {
                  const isCur = (selected?.id_sesion ?? 0) === s.id_sesion;
                  return (
                    <button
                      key={s.id_sesion}
                      onClick={() => setSelectedId(s.id_sesion)}
                      className={`group w-full rounded-xl p-3.5 text-left transition-all border flex items-center justify-between gap-3 cursor-pointer ${
                        isCur
                          ? 'bg-[#F8F7FC] border-[#6B46FE] ring-2 ring-[#6B46FE]/30'
                          : 'bg-white border-[#E8E5F4] hover:border-violet-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-sm text-[#1C1135] truncate">
                          Sesión #{s.id_sesion} — {s.cita.paciente_nombre}
                        </p>
                        <div className="flex items-center gap-2.5 mt-1">
                          <span className="text-xs text-[#615274]">{dateLabel(s)}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#EDE9FE] text-[#6B46FE]">
                            Redactar ahora
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className={isCur ? 'text-[#6B46FE]' : 'text-[#9E95B7]'} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Saved Reports Card */}
          <div className="rounded-2xl border border-[#E8E5F4] bg-white p-5 shadow-[0_8px_24px_rgba(48,33,87,0.045)]">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50"><FileText size={17} className="text-[#6B46FE]" /></span>
              <div>
                <h2 className="text-base font-extrabold text-[#1C1135]">Reportes guardados</h2>
                <p className="text-xs text-[#8C82A8]">Sesiones con informe registrado</p>
              </div>
            </div>
            <div className="space-y-3">
              {reports.map((s) => {
                const isCur = (selected?.id_sesion ?? 0) === s.id_sesion;
                return (
                  <button
                    key={s.id_sesion}
                    onClick={() => setSelectedId(s.id_sesion)}
                    className={`w-full rounded-xl p-3.5 text-left transition-all border flex items-center justify-between gap-3 cursor-pointer ${
                      isCur
                        ? 'bg-[#F8F7FC] border-[#6B46FE] ring-1 ring-[#6B46FE]'
                        : 'bg-white border-[#E8E5F4] hover:border-violet-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-sm text-[#1C1135] truncate">
                        Reporte #{s.id_sesion} — {s.cita.paciente_nombre}
                      </p>
                      <div className="flex items-center gap-2.5 mt-1">
                        <span className="text-xs text-[#615274]">{dateLabel(s)}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#DCFCE7] text-[#16A34A]">
                          Guardado
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className={isCur ? 'text-[#6B46FE]' : 'text-[#9E95B7]'} />
                  </button>
                );
              })}
              {sessions.isSuccess && !sessions.error && reports.length === 0 && (
                <p className="text-xs text-[#615274] py-2">No hay reportes guardados en tus sesiones autorizadas.</p>
              )}
            </div>
          </div>

          {/* Downloadable Templates Card */}
          <div className="rounded-2xl border border-[#E8E5F4] bg-white p-5 shadow-[0_8px_24px_rgba(48,33,87,0.045)]">
            <div className="flex items-center gap-2.5 mb-1">
              <Download size={18} className="text-[#6B46FE]" />
              <h2 className="text-base font-extrabold text-[#1C1135]">Plantillas descargables</h2>
            </div>
            <p className="text-xs text-[#615274] mb-3">Plantillas en blanco, no son reportes clínicos guardados.</p>
            <div className="grid gap-2 2xl:grid-cols-2">
              {templates.map((template) => (
                <button
                  key={template}
                  onClick={() =>
                    downloadPdf(`${template.toLowerCase().replaceAll(' ', '-')}.pdf`, template, [
                      'Plantilla en blanco ASHAKids - no constituye un reporte guardado',
                      '',
                      'Paciente: _____________________',
                      'Fecha: ________________________',
                      '',
                      'Observaciones: _________________',
                      '',
                      'Objetivos: _____________________',
                      '',
                      'Nivel de ayuda: _________________',
                      '',
                      'Próximos pasos: _________________',
                    ])
                  }
                  className="w-full min-w-0 flex items-center justify-between gap-2 rounded-xl border border-transparent bg-[#F8F7FC] px-3 py-2.5 text-left text-xs font-extrabold text-[#1C1135] transition-all hover:border-[#E8E5F4] hover:bg-violet-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Download size={14} className="text-[#6B46FE]" />
                    <span className="truncate">{template}</span>
                  </div>
                  <ChevronRight size={14} className="text-[#9E95B7]" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-[26px] border border-[#E8E5F4] bg-white shadow-[0_14px_36px_rgba(48,33,87,0.07)]">
          {selected && !sessions.error ? (
            <div>
              {/* Editor Header */}
              <div className="flex flex-col items-start justify-between gap-3 border-b border-[#E8E5F4] bg-gradient-to-r from-white via-white to-violet-50/60 px-5 py-4 sm:flex-row sm:items-center 2xl:px-6">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#615274]">Sesión clínica · {selected.cita.paciente_nombre}</p>
                  </div>
                  <h2 className="text-lg font-black text-[#1C1135] mt-0.5 sm:text-xl">
                    Reporte de sesión #{selected.id_sesion}
                  </h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setPreviewOpen(true)}
                    disabled={!selected.reporte_disponible}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8E5F4] text-xs font-extrabold text-[#1C1135] hover:bg-violet-50 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <Eye size={14} className="text-[#6B46FE]" />
                    Vista previa
                  </button>
                  <button
                    disabled
                    title="No existe API de envío por correo"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8E5F4] text-xs font-extrabold text-[#9E95B7] cursor-not-allowed"
                  >
                    <Send size={14} />
                    Enviar
                  </button>
                  <button
                    disabled
                    title="No existe API de firma digital"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EDE9FE] text-xs font-extrabold text-[#6B46FE] cursor-not-allowed"
                  >
                    <Edit size={14} />
                    Firmar
                  </button>
                </div>
              </div>

              {/* Editor Body */}
              <ReportWorkspace key={selected.id_sesion} session={selected} />
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-violet-50 border border-violet-100 flex items-center justify-center text-[#6B46FE]">
                <Mic size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1C1135]">Selecciona una sesión clínica</h3>
                <p className="text-xs font-bold text-[#615274] max-w-sm mt-1">
                  Los reportes y sus resultados se guardan únicamente en sesiones reales autorizadas. Inicia o finaliza una sesión desde la agenda para redactar su reporte.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Report Modal */}
      {newReportOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-[#1C1135]/45 backdrop-blur-sm cursor-pointer"
            onClick={() => setNewReportOpen(false)}
            aria-label="Cerrar"
          />
          <div role="dialog" aria-label="Nuevo reporte" className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-black text-[#1C1135]">Nuevo reporte</h3>
            <p className="my-2.5 text-xs text-[#615274]">
              Selecciona una sesión iniciada o finalizada. El reporte solo se creará al guardar los cuatro campos.
            </p>
            <label className="block text-xs font-extrabold text-[#1C1135] mt-4">
              Sesión
              <select
                value={candidate}
                onChange={(e) => setCandidate(Number(e.target.value))}
                className="mt-1.5 w-full rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] px-4 py-3 text-xs font-bold text-[#1C1135] focus:ring-2 focus:ring-[#6B46FE]"
              >
                <option value={0}>Selecciona una sesión</option>
                {eligible.map((s) => (
                  <option key={s.id_sesion} value={s.id_sesion}>
                    #{s.id_sesion} · {s.cita.paciente_nombre} · {dateLabel(s)}
                  </option>
                ))}
              </select>
            </label>
            {!eligible.length && (
              <p className="text-xs text-[#615274] mt-2">
                No hay sesiones elegibles sin reporte. Registra e inicia una sesión desde la agenda.
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setNewReportOpen(false)}>
                Cancelar
              </Btn>
              <Btn
                variant="cta"
                disabled={!eligible.some((s) => s.id_sesion === candidate)}
                onClick={() => {
                  setSelectedId(candidate);
                  setNewReportOpen(false);
                }}
              >
                <Plus size={14} /> Crear reporte
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-[#1C1135]/45 backdrop-blur-sm cursor-pointer"
            onClick={() => setPreviewOpen(false)}
            aria-label="Cerrar vista previa"
          />
          <div
            role="dialog"
            aria-label="Vista previa del reporte"
            className="relative max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl p-6"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E8E5F4] bg-white pb-4 mb-4">
              <h3 className="font-black text-lg text-[#1C1135]">Reporte de sesión #{selected.id_sesion}</h3>
              <button aria-label="Cerrar vista previa" onClick={() => setPreviewOpen(false)} className="cursor-pointer text-[#615274]">
                <X size={20} />
              </button>
            </div>
            <ReportWorkspace session={selected} readOnly />
          </div>
        </div>
      )}
    </div>
  );
}
