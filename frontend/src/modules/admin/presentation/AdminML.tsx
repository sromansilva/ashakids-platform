import { useState } from 'react';
import { View } from '@/shared/domain/types/navigation';
import { Mic, Clock, Settings, UploadCloud, Play, Pause, X, FileText, Check, Save, RotateCw, Eye, Sparkles, CheckCircle2 } from 'lucide-react';

export function AdminML({ go: _go }: { go: (v: View) => void }) {
  const [tab, setTab] = useState<'ANALISIS' | 'HISTORIAL' | 'CONFIG'>('ANALISIS');
  const [actividad, setActividad] = useState('El Estudio de la Voz');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>({
    name: 'audio_ejemplo.wav',
    size: '1.2 MB',
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcription, setTranscription] = useState('Hola, vamos a jugar.');
  const [observacion, setObservacion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([
    {
      id: 1,
      archivo: 'audio_ejemplo.wav',
      actividad: 'El Estudio de la Voz',
      fecha: '15 dic 2024, 10:24',
      estado: 'Por revisar',
    },
    {
      id: 2,
      archivo: 'muestra_voz.wav',
      actividad: 'El Estudio de la Voz',
      fecha: '14 dic 2024, 16:18',
      estado: 'Revisado',
    },
  ]);

  const handleProcesar = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setTranscription('Hola, vamos a jugar con los sonidos.');
    }, 1200);
  };

  const handleGuardarRevision = () => {
    alert('Revisión guardada satisfactoriamente.');
  };

  return (
    <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-[#1C1135]">
      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5F4] shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-xl z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1135] tracking-tight">
              Machine Learning
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-50 text-[#6B46FE] text-xs font-bold">
              Vista demostrativa
            </span>
          </div>
          <p className="text-sm sm:text-base text-[#615274] mt-2 font-medium">
            Gestiona el análisis de audio y la revisión profesional.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-4 z-10 shrink-0">
          <div className="p-3 bg-violet-50 rounded-2xl border border-violet-100 flex items-center gap-2">
            <Mic size={24} className="text-[#6B46FE]" />
            <div className="flex gap-0.5 items-center h-5">
              <span className="w-1 h-3 bg-[#6B46FE] rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-[#6B46FE] rounded-full animate-pulse" />
              <span className="w-1 h-2 bg-[#6B46FE] rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-[#6B46FE] rounded-full animate-pulse" />
            </div>
          </div>
          <img
            src="/illustrations/ashi-hero-v1.png"
            alt="Robot ML"
            className="w-36 h-auto object-contain max-h-32 drop-shadow-md"
          />
        </div>
      </div>

      {/* Tabs Row */}
      <div className="inline-flex rounded-2xl border border-[#E8E5F4] bg-white p-1 gap-1 shadow-sm mb-6">
        <button
          onClick={() => setTab('ANALISIS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
            tab === 'ANALISIS'
              ? 'bg-[#6B46FE] text-white shadow-md shadow-violet-200'
              : 'text-[#615274] hover:bg-violet-50 hover:text-[#6B46FE]'
          }`}
        >
          <Mic size={16} />
          <span>Análisis de audio</span>
        </button>
        <button
          onClick={() => setTab('HISTORIAL')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
            tab === 'HISTORIAL'
              ? 'bg-[#6B46FE] text-white shadow-md shadow-violet-200'
              : 'text-[#615274] hover:bg-violet-50 hover:text-[#6B46FE]'
          }`}
        >
          <Clock size={16} />
          <span>Historial</span>
        </button>
        <button
          onClick={() => setTab('CONFIG')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
            tab === 'CONFIG'
              ? 'bg-[#6B46FE] text-white shadow-md shadow-violet-200'
              : 'text-[#615274] hover:bg-violet-50 hover:text-[#6B46FE]'
          }`}
        >
          <Settings size={16} />
          <span>Configuración</span>
        </button>
      </div>

      {/* Upper 2-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Card: Nuevo análisis */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E5F4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#6B46FE] flex items-center justify-center shrink-0">
                <Mic size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#1C1135]">Nuevo análisis</h2>
                <p className="text-xs text-[#615274]">Carga un archivo de audio para analizarlo.</p>
              </div>
            </div>

            {/* Actividad selector */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#1C1135] mb-1.5">Actividad</label>
              <select
                aria-label="Seleccionar actividad"
                value={actividad}
                onChange={e => setActividad(e.target.value)}
                className="w-full bg-white border border-[#E8E5F4] rounded-2xl px-4 py-2.5 text-sm font-bold text-[#1C1135] shadow-sm outline-none cursor-pointer"
              >
                <option value="El Estudio de la Voz">El Estudio de la Voz</option>
                <option value="Taller de los Sonidos">Taller de los Sonidos</option>
                <option value="La Isla de las Palabras">La Isla de las Palabras</option>
              </select>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-violet-200 bg-violet-50/40 rounded-3xl p-6 text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#6B46FE] flex items-center justify-center mx-auto mb-2 shadow-sm">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-extrabold text-[#1C1135]">Arrastra un archivo de audio</p>
              <p className="text-xs text-[#615274] mt-0.5 mb-3">o haz clic para seleccionar</p>
              <button
                type="button"
                onClick={() => setSelectedFile({ name: 'nuevo_audio.wav', size: '2.4 MB' })}
                className="px-5 py-2 rounded-xl bg-[#6B46FE] hover:bg-[#5833EA] text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Seleccionar archivo
              </button>
              <p className="text-[11px] text-[#8C82A8] mt-2">MP3 o WAV (máx. 50 MB)</p>
            </div>

            {/* File Audio Player Box */}
            {selectedFile && (
              <div className="bg-[#F8F7FD] border border-[#E8E5F4] rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 text-[#6B46FE] flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1C1135]">{selectedFile.name}</p>
                      <p className="text-[11px] text-[#8C82A8]">{selectedFile.size} · WAV</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-[#8C82A8] hover:text-red-500 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Audio Waveform visualization */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-9 h-9 rounded-full bg-[#6B46FE] text-white flex items-center justify-center shrink-0 hover:bg-[#5833EA] transition shadow-sm cursor-pointer"
                  >
                    {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                  </button>
                  <div className="flex-1 flex items-center gap-1 h-6">
                    {[12, 18, 14, 22, 28, 16, 20, 24, 15, 10, 18, 26, 22, 14, 18, 24, 12, 16, 20, 15].map((h, i) => (
                      <span
                        key={i}
                        style={{ height: `${h}px` }}
                        className={`w-1 rounded-full transition-all ${
                          i < 8 ? 'bg-[#6B46FE]' : 'bg-[#D8CFEA]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#615274]">0:00 / 0:08</span>
                </div>
              </div>
            )}
          </div>

          {/* Process audio button */}
          <button
            onClick={handleProcesar}
            disabled={isProcessing || !selectedFile}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-extrabold text-sm shadow-md shadow-violet-200 transition-all active:scale-[.98] cursor-pointer disabled:opacity-50"
          >
            <Play size={16} />
            {isProcessing ? 'Procesando audio…' : 'Procesar audio'}
          </button>
        </div>

        {/* Right Card: Resultado de ejemplo */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E5F4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#6B46FE] flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#1C1135]">Resultado de ejemplo</h2>
                  <p className="text-xs text-[#615274]">Los resultados requieren revisión profesional.</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF4E5] text-[#FF8A00] shrink-0">
                <Clock size={13} />
                Pendiente de revisión
              </span>
            </div>

            {/* Suggested Transcription */}
            <div className="mb-5">
              <label className="block text-xs font-extrabold text-[#1C1135] mb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#6B46FE]" /> Transcripción sugerida
              </label>
              <div className="bg-[#F8F7FD] border border-[#E8E5F4] rounded-2xl p-4 text-sm font-bold text-[#1C1135]">
                "{transcription}"
              </div>
            </div>

            {/* Professional Review */}
            <div className="mb-4">
              <label className="block text-xs font-extrabold text-[#1C1135] mb-2">Revisión profesional</label>
              <textarea
                rows={4}
                value={observacion}
                onChange={e => setObservacion(e.target.value)}
                placeholder="Añade una observación..."
                className="w-full bg-white border border-[#E8E5F4] rounded-2xl p-3.5 text-sm font-medium text-[#1C1135] placeholder-[#8C82A8] outline-none resize-none focus:border-violet-400"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => alert('Transcripción verificada')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-violet-200 transition-all cursor-pointer"
            >
              <Check size={16} /> Revisar transcripción
            </button>
            <button
              onClick={handleGuardarRevision}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-[#E8E5F4] hover:bg-violet-50 text-[#1C1135] font-extrabold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Save size={16} className="text-[#6B46FE]" /> Guardar revisión
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Card: Historial de análisis */}
      <div className="bg-white rounded-3xl border border-[#E8E5F4] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E8E5F4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#6B46FE] flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1C1135]">Historial de análisis</h2>
            </div>
          </div>
          <button
            onClick={() => setHistory([...history])}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-[#E8E5F4] hover:bg-violet-50 text-xs font-bold text-[#1C1135] transition cursor-pointer"
          >
            <RotateCw size={14} className="text-[#6B46FE]" /> Actualizar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F8F7FD] border-b border-[#E8E5F4] text-xs font-extrabold text-[#615274]">
                <th className="py-4 px-6">Archivo de audio</th>
                <th className="py-4 px-6">Actividad</th>
                <th className="py-4 px-6">Fecha de análisis</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5F4] text-sm">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-[#F9F8FD] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <FileText size={16} className="text-[#8C82A8]" />
                      <span className="font-extrabold text-[#1C1135]">{item.archivo}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#615274] font-medium">{item.actividad}</td>
                  <td className="py-4 px-6 text-[#615274] font-medium">{item.fecha}</td>
                  <td className="py-4 px-6">
                    {item.estado === 'Por revisar' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF4E5] text-[#FF8A00]">
                        <Clock size={12} />
                        Por revisar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669]">
                        <CheckCircle2 size={12} />
                        Revisado
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => alert(`Detalle de ${item.archivo}`)}
                      className="inline-flex items-center gap-1 font-bold text-xs text-[#6B46FE] hover:text-[#5833EA] cursor-pointer"
                    >
                      <Eye size={14} /> Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
export default AdminML;
