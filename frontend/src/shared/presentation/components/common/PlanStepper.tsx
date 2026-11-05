import { Check } from 'lucide-react';
import { planSteps } from './planForm';

export function PlanStepper({ step, onBack }: { step: number; onBack: (index: number) => void }) {
  return (
    <ol aria-label="Pasos del plan" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {planSteps.map((label, index) => (
        <li key={label}>
          <button
            type="button"
            disabled={index > step}
            aria-current={index === step ? 'step' : undefined}
            onClick={() => { if (index < step) onBack(index); }}
            className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors disabled:cursor-default ${
              index === step
                ? 'border-violet-300 bg-violet-50 text-[#5B35E8]'
                : index < step
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                  : 'border-[#E8E5F4] bg-white text-[#8C82A8]'
            }`}
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[11px]">
              {index < step ? <Check size={14} /> : index + 1}
            </span>
            <span className="leading-tight">{label}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
