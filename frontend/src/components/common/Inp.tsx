import { useId, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

type InpProps = Omit<ComponentPropsWithoutRef<"input">, "value" | "onChange" | "size"> & {
  label?: string; value: string; onChange: (value: string) => void;
  icon?: ReactNode; hint?: string; error?: string;
};

export function Inp({ label, type = "text", value, onChange, icon, hint, error,
  id: suppliedId, className = "", disabled, "aria-describedby": describedBy, ...props }: InpProps) {
  const [show, setShow] = useState(false);
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const feedback = error || hint;
  const description = [describedBy, feedback ? `${id}-feedback` : undefined].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-bold text-[var(--foreground)]">{label}</label>}
      <div className="relative">
        {icon && <div aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">{icon}</div>}
        <input {...props} id={id} disabled={disabled} aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={description} type={type === "password" && show ? "text" : type}
          value={value} onChange={e => onChange(e.target.value)}
          className={`w-full min-h-12 rounded-2xl border ${error ? "border-[var(--error-text)]" : "border-[var(--control-border)]"} bg-[var(--input-background)] px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2 disabled:opacity-60 font-medium ${icon ? "pl-11" : ""} ${type === "password" ? "pr-14" : ""} ${className}`} />
        {type === "password" && (
          <button type="button" disabled={disabled} onClick={() => setShow(s => !s)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={show} aria-controls={id}
            className="absolute right-1 top-1/2 -translate-y-1/2 flex min-h-11 min-w-11 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--primary)] disabled:opacity-60">
            {show ? <EyeOff aria-hidden="true" size={20} /> : <Eye aria-hidden="true" size={20} />}
          </button>
        )}
      </div>
      {feedback && <p id={`${id}-feedback`} className={`text-sm font-medium ${error ? "text-[var(--error-text)]" : "text-[var(--text-secondary)]"}`}>{feedback}</p>}
    </div>
  );
}
