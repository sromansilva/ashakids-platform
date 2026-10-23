import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function PublicDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="landing-dialog" aria-labelledby="public-dialog-title" onCancel={onClose} onKeyDown={e => {
    if (e.key !== 'Tab') return;
    const controls = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')];
    const first = controls[0], last = controls.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="landing-dialog-content">
      <button className="landing-dialog-close" type="button" aria-label="Cerrar" onClick={onClose}><X size={24}/></button>
      <h2 id="public-dialog-title">{title}</h2>{children}
    </div>
  </dialog>;
}
