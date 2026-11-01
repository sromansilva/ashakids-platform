import { useState, useRef, useEffect } from 'react';
import { View } from '@/shared/domain/types/navigation';
import {
  Mic,
  Clock,
  Settings,
  UploadCloud,
  Play,
  Pause,
  X,
  FileText,
  RotateCw,
  Sparkles,
  AlertCircle,
  Cpu,
  Activity,
} from 'lucide-react';

interface InferenciaMLResponse {
  transcripcion: string;
  duracion_segundos: number;
  motor_red_neuronal_activa: boolean;
}

interface HealthMLResponse {
  status: string;
  service: string;
  dispositivo: string;
  modelo: string;
  modelo_listo: boolean;
}

export function AdminML({ go: _go }: { go: (v: View) => void }) {
  const [tab, setTab] = useState<'ANALISIS' | 'HISTORIAL' | 'CONFIG'>('ANALISIS');

  // Archivo real seleccionado
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [selectedFileMeta, setSelectedFileMeta] = useState<{ name: string; size: string } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estados de inferencia Machine Learning
  const [isProcessing, setIsProcessing] = useState(false);
  const [mlResult, setMlResult] = useState<InferenciaMLResponse | null>(null);
  const [observacion, setObservacion] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado del servidor ML
  const [health, setHealth] = useState<HealthMLResponse | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  // Historial de atenciones
  const [history, setHistory] = useState<Array<{ id: number; archivo: string; fecha: string }>>([]);

  // Consultar estado del microservicio ML
  const consultarHealthML = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await fetch('http://127.0.0.1:8001/health');
      if (res.ok) {
        const data = (await res.json()) as HealthMLResponse;
        setHealth(data);
      } else {
        setHealth(null);
      }
    } catch {
      setHealth(null);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    if (tab === 'CONFIG') {
      void consultarHealthML();
    }
  }, [tab]);

  // Manejador de selección de archivo en disco
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const hasAudioExtension = /\.(m4a|mp3|wav|ogg|webm|mp4)$/i.test(file.name);
    if (!file.type.startsWith('audio/') && !hasAudioExtension) {
      setErrorMessage('Selecciona un archivo de audio compatible.');
      e.target.value = '';
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage('El archivo supera 100 MB. Selecciona un audio más corto.');
      e.target.value = '';
      return;
    }

    setFileObject(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedFileMeta({
      name: file.name,
      size: `${sizeMb} MB`,
    });
    setMlResult(null);
    setErrorMessage(null);

    // Preparar reproductor de audio local
    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = URL.createObjectURL(file);
    }
  };

  // Reproducir / pausar audio
  const togglePlayAudio = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Enviar audio al microservicio Wav2Vec 2.0
  const handleProcesar = async () => {
    if (!fileObject) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();

      formData.append('file', fileObject);

      // Llamada directa al microservicio Wav2Vec 2.0 (puerto 8001)
      const res = await fetch('http://127.0.0.1:8001/predict/file', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: Falló el procesamiento en el motor ML.`);
      }

      const data = (await res.json()) as InferenciaMLResponse;
      setMlResult(data);

      // El historial de esta pestaña solo conserva archivos procesados en memoria.
      setHistory(prev => [
        {
          id: Date.now(),
          archivo: selectedFileMeta?.name || fileObject.name,
          fecha: 'Hoy, ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error('[Error ML]:', err);
      setErrorMessage(
        err.message || 'No se pudo conectar con el microservicio ML en el puerto 8001. Verifica que start.bat esté activo.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-[#1C1135]">
      {/* Audio Element oculto para reproducción */}
      <audio
        ref={audioPlayerRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.m4a,.wav,.mp3,.ogg,.webm"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5F4] shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-xl z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1135] tracking-tight">
              Machine Learning
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Transcripción experimental
            </span>
          </div>
          <p className="text-sm sm:text-base text-[#615274] mt-2 font-medium">
            Transcripción tentativa de archivos de audio para revisión profesional. No produce diagnóstico ni métricas de precisión clínica.
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
          <span>Configuración del Motor</span>
        </button>
      </div>

      {/* Error Banner si no conecta */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Aviso del servicio de Machine Learning</p>
            <p className="text-xs text-amber-800 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA CONFIGURACIÓN */}
      {tab === 'CONFIG' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5F4] shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E5F4]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-100 text-[#6B46FE] flex items-center justify-center">
                <Cpu size={22} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#1C1135]">Estado del Servidor de Inferencia</h2>
                <p className="text-xs text-[#615274]">Microservicio FastAPI + PyTorch en ejecución en puerto 8001</p>
              </div>
            </div>
            <button
              onClick={consultarHealthML}
              disabled={isLoadingHealth}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8E5F4] hover:bg-violet-50 text-xs font-bold text-[#1C1135] transition"
            >
              <RotateCw size={14} className={isLoadingHealth ? 'animate-spin text-[#6B46FE]' : 'text-[#6B46FE]'} />
              Actualizar estado
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#F8F7FD] border border-[#E8E5F4]">
              <p className="text-xs font-bold text-[#615274] mb-1">Estado de Conexión</p>
              <p className={`text-sm font-black flex items-center gap-2 ${health?.status === 'online' ? 'text-emerald-600' : 'text-[#615274]'}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${health?.status === 'online' ? 'bg-emerald-500' : 'bg-[#9E95B7]'}`} />
                {health?.status === 'online' ? 'Servicio en línea' : 'Sin verificar'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F7FD] border border-[#E8E5F4]">
              <p className="text-xs font-bold text-[#615274] mb-1">Modelo de Deep Learning</p>
              <p className="text-xs font-mono font-bold text-[#1C1135] truncate" title={health?.modelo || 'Modelo experimental de transcripción'}>
                {health?.modelo_listo ? health.modelo : 'Modelo no disponible'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F7FD] border border-[#E8E5F4]">
              <p className="text-xs font-bold text-[#615274] mb-1">Dispositivo de Inferencia</p>
              <p className="text-sm font-black text-[#6B46FE] uppercase">
                {health?.dispositivo || 'No informado'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F7FD] border border-[#E8E5F4]">
              <p className="text-xs font-bold text-[#615274] mb-1">Puerto de Servicio</p>
              <p className="text-sm font-black text-[#1C1135]">
                http://127.0.0.1:8001
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA ANÁLISIS */}
      {tab === 'ANALISIS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Card: Nuevo análisis */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E5F4] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#6B46FE] flex items-center justify-center shrink-0">
                  <Mic size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#1C1135]">Nuevo análisis acústico</h2>
                  <p className="text-xs text-[#615274]">Carga una pista local. El modelo devuelve una transcripción tentativa sin inferir un diagnóstico.</p>
                </div>
              </div>

              {/* Dropzone interactivo */}
              <div className="border-2 border-dashed border-violet-200 bg-violet-50/40 rounded-3xl p-6 text-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#6B46FE] flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-extrabold text-[#1C1135]">Sube una nota de voz o audio</p>
                <p className="text-xs text-[#615274] mt-0.5 mb-3">Arrastra un archivo o haz clic para seleccionar</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2 rounded-xl bg-[#6B46FE] hover:bg-[#5833EA] text-white text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  Seleccionar archivo de audio
                </button>
                <p className="text-[11px] text-[#8C82A8] mt-2">Formatos: M4A, WAV, MP3, OGG o WEBM (máx. 100 MB)</p>
              </div>

              {/* File Audio Player Box */}
              {selectedFileMeta && (
                <div className="bg-[#F8F7FD] border border-[#E8E5F4] rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-violet-100 text-[#6B46FE] flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1C1135]">{selectedFileMeta.name}</p>
                        <p className="text-[11px] text-[#8C82A8]">{selectedFileMeta.size} · Audio local</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFileMeta(null);
                        setFileObject(null);
                        setMlResult(null);
                      }}
                      className="text-[#8C82A8] hover:text-red-500 transition"
                      title="Quitar archivo"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Audio Waveform visualization */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayAudio}
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
                            isPlaying && i % 2 === 0 ? 'bg-[#6B46FE] animate-pulse' : i < 8 ? 'bg-[#6B46FE]' : 'bg-[#D8CFEA]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono font-bold text-[#615274]">
                      {isPlaying ? 'Reproduciendo' : 'Listo'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Process audio button */}
            <button
              onClick={handleProcesar}
              disabled={isProcessing || !selectedFileMeta}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-extrabold text-sm shadow-md shadow-violet-200 transition-all active:scale-[.98] cursor-pointer disabled:opacity-50"
            >
              <Activity size={16} className={isProcessing ? 'animate-spin' : ''} />
              {isProcessing ? 'Generando transcripción tentativa…' : 'Transcribir audio'}
            </button>
          </div>

          {/* Right Card: Resultado del Modelo ML */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E5F4] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#6B46FE] flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#1C1135]">Transcripción tentativa</h2>
                    <p className="text-xs text-[#615274]">Requiere escucha y revisión profesional.</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF4E5] text-[#FF8A00] shrink-0">
                  <Clock size={13} />
                  {mlResult ? 'Revisar' : 'Sin analizar'}
                </span>
              </div>

              {/* Transcripción detectada */}
              <div className="mb-4">
                  <label className="block text-xs font-extrabold text-[#1C1135] mb-2 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#6B46FE]" /> Texto reconocido
                </label>
                <div className="bg-[#F8F7FD] border border-[#E8E5F4] rounded-2xl p-4 text-sm font-bold text-[#1C1135]">
                  {mlResult?.transcripcion ? `“${mlResult.transcripcion}”` : 'Carga un audio para ver una transcripción. No se generan frases de ejemplo.'}
                </div>
              </div>

              {/* Professional Review Textarea */}
              <div className="mb-4">
                <label className="block text-xs font-extrabold text-[#1C1135] mb-2">
                  Nota local del profesional (no se guarda en el reporte clínico)
                </label>
                <textarea
                  rows={3}
                  value={observacion}
                  onChange={e => setObservacion(e.target.value)}
                  placeholder="Anota una revisión local de la transcripción..."
                  className="w-full bg-white border border-[#E8E5F4] rounded-2xl p-3.5 text-sm font-medium text-[#1C1135] placeholder-[#8C82A8] outline-none resize-none focus:border-violet-400"
                />
              </div>
            </div>

            <p className="border-t border-[#E8E5F4] pt-3 text-xs text-[#615274]">Este panel no guarda observaciones clínicas. Registra notas y resultados revisados en el reporte de la sesión correspondiente.</p>
          </div>
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA HISTORIAL */}
      {tab === 'HISTORIAL' && (
        <div className="bg-white rounded-3xl border border-[#E8E5F4] shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-[#E8E5F4] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#6B46FE] flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#1C1135]">Archivos procesados en esta vista</h2>
                <p className="text-xs text-[#615274]">Lista temporal del navegador; no es un historial clínico guardado.</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F8F7FD] border-b border-[#E8E5F4] text-xs font-extrabold text-[#615274]">
                  <th className="py-4 px-6">Archivo de audio</th>
                  <th className="py-4 px-6">Procesado</th>
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
                    <td className="py-4 px-6 text-[#615274] font-medium">{item.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length === 0 && <p className="p-6 text-sm text-[#615274]">Todavía no se procesó ningún archivo en esta página.</p>}
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminML;
