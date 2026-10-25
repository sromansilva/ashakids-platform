import { useEffect, useRef, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

export const adminFormInputClass =
  "mt-1.5 block min-h-12 w-full min-w-0 rounded-xl border border-[#DDD6EF] bg-white px-4 py-3 text-sm font-semibold text-[#1C1135] outline-none transition placeholder:text-[#9E95B7] focus:border-violet-500 focus:ring-2 focus:ring-violet-200 disabled:cursor-not-allowed disabled:bg-[#EDE9FE] disabled:text-[#675779]";

export const adminFormLabelClass = "block min-w-0 text-sm font-extrabold text-[#1C1135]";

interface AdminFormDialogProps {
  ariaLabelledBy: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  maxWidth?: string;
}

export function AdminFormDialog({ ariaLabelledBy, eyebrow, title, subtitle, icon: Icon, onClose, children, footer, maxWidth = "max-w-3xl" }: AdminFormDialogProps) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    closeButton.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1135]/45 p-3 backdrop-blur-md sm:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby={ariaLabelledBy} className={`flex max-h-[95dvh] w-full ${maxWidth} flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_24px_80px_rgba(45,27,105,0.24)]`}>
        <header className="flex items-start justify-between border-b border-[#E8E5F4] px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-violet-700 sm:h-14 sm:w-14"><Icon size={26} strokeWidth={2.4} aria-hidden="true" /></span>
            <div className="min-w-0">
              <p className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-violet-600">{eyebrow}</p>
              <h2 id={ariaLabelledBy} className="text-xl font-black tracking-tight text-[#1C1135] sm:text-2xl">{title}</h2>
              <p className="mt-1 text-sm font-medium text-[#6B5E8A]">{subtitle}</p>
            </div>
          </div>
          <button ref={closeButton} type="button" onClick={onClose} aria-label="Cerrar formulario" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F5F3FF] text-[#6B5E8A] transition hover:bg-[#EDE9FE] hover:text-violet-700"><X size={20} aria-hidden="true" /></button>
        </header>
        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6"><div className="rounded-[24px] bg-[#F7F4FF] p-4 sm:p-5">{children}</div></div>
        <footer className="flex flex-col-reverse gap-2 border-t border-[#E8E5F4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">{footer}</footer>
      </div>
    </div>
  );
}
