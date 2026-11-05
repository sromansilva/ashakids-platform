import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface MLServiceUnavailableBannerProps {
  visible: boolean;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function MLServiceUnavailableBanner({
  visible,
  title = 'Servicio de IA Fonológica en Pausa Temporal',
  message = 'El motor de transcripción fonológica experimental no está disponible en este momento. La sesión clínica continúa con total normalidad; puedes registrar tus observaciones y completar el reporte clínico de forma manual.',
  onRetry,
  onDismiss,
  className = '',
}: MLServiceUnavailableBannerProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      className={`rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50/80 via-[#FAF8FF] to-purple-50/60 p-4 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700">
          <AlertTriangle size={18} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wide text-violet-900">
              {title}
            </h4>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-[#9E95B7] hover:text-[#1C1135]"
                aria-label="Cerrar aviso"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#615274]">
            {message}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-violet-700 border border-violet-100">
              ✓ Atención clínica ininterrumpida
            </span>
            <span className="inline-flex items-center rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-[#615274] border border-[#E8E5F4]">
              ✓ Reporte manual habilitado
            </span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-violet-700"
              >
                <RefreshCw size={11} /> Reintentar conexión
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

