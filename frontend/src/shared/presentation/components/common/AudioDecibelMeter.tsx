import { useEffect, useRef, useState } from 'react';
import { Mic, Volume2 } from 'lucide-react';
import { decibelsFromRms, VOICE_MIN_DB } from '@/shared/application/audio/voiceSignal';

interface AudioDecibelMeterProps {
  stream?: MediaStream | null;
  recording: boolean;
  label?: string;
  className?: string;
}

export function AudioDecibelMeter({
  stream,
  recording,
  label = 'Nivel del micrófono',
  className = '',
}: AudioDecibelMeterProps) {
  const [decibels, setDecibels] = useState(30);
  const [levelPercent, setLevelPercent] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!recording || !stream) {
      setDecibels(30);
      setLevelPercent(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        void audioCtxRef.current.close().catch(() => undefined);
      }
      audioCtxRef.current = null;
      analyserRef.current = null;
      return;
    }

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    let ctx: AudioContext | null = null;
    try {
      ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArray);

        let sumSquares = 0;
        for (let index = 0; index < dataArray.length; index += 1) {
          const normalized = (dataArray[index] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        // Mapear RMS a decibeles aproximados de 30 dB a 85 dB
        const dbCalculated = decibelsFromRms(rms);
        const percent = Math.min(100, Math.max(0, Math.round(((dbCalculated - 30) / 55) * 100)));

        setDecibels(dbCalculated);
        setLevelPercent(percent);

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      animFrameRef.current = requestAnimationFrame(updateMeter);
    } catch {
      // Degradar con gracia si el contexto de audio no se puede crear
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (ctx && ctx.state !== 'closed') void ctx.close().catch(() => undefined);
      audioCtxRef.current = null;
      analyserRef.current = null;
    };
  }, [recording, stream]);

  const getStatusText = () => {
    if (!recording) return 'Inactivo';
    if (decibels < VOICE_MIN_DB) return 'Silencio o voz lejana';
    if (decibels <= 72) return 'Nivel óptimo de voz';
    return 'Volumen alto / saturación';
  };

  const getStatusColor = () => {
    if (!recording) return 'text-[#9E95B7]';
    if (decibels < VOICE_MIN_DB) return 'text-[#615274]';
    if (decibels <= 72) return 'text-emerald-700 font-bold';
    return 'text-amber-700 font-bold';
  };

  const barsCount = 10;
  const activeBars = Math.round((levelPercent / 100) * barsCount);

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={decibels}
      aria-valuemin={30}
      aria-valuemax={85}
      className={`rounded-xl border border-violet-100 bg-[#F8F7FC] p-3 transition-colors ${className}`}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-bold text-[#1C1135]">
          {recording ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
          ) : (
            <Volume2 size={13} className="text-[#9E95B7]" />
          )}
          {label}
        </span>
        <span className="font-mono text-[11px] font-semibold text-[#615274]">
          {recording ? `~${decibels} dB` : '-- dB'}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1">
        {Array.from({ length: barsCount }).map((_, index) => {
          const isActive = recording && index < activeBars;
          let barBg = 'bg-[#E8E5F4]';
          if (isActive) {
            if (index < 7) barBg = 'bg-emerald-500';
            else if (index < 9) barBg = 'bg-violet-600';
            else barBg = 'bg-amber-500';
          }
          return (
            <div
              key={index}
              className={`h-3 flex-1 rounded-sm transition-all duration-75 ${barBg}`}
            />
          );
        })}
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        <span className={`text-[11px] ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {recording && (
          <span className="inline-flex items-center gap-1 text-[10px] text-violet-700">
            <Mic size={10} /> Escuchando ráfaga...
          </span>
        )}
      </div>
    </div>
  );
}

