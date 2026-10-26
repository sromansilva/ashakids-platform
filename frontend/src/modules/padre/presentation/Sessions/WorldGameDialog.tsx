import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function WorldGameDialog({ title, pending, onClose, children }: { title: string; pending: boolean; onClose: () => void; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current!;
    dialog.showModal();
    return () => { dialog.close(); if (previous?.isConnected) previous.focus(); };
  }, []);
  return <dialog ref={dialogRef} className="asha-game-dialog" aria-labelledby={titleId} aria-busy={pending} onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onCancel={event => {
    event.preventDefault(); if (!pending) onClose();
  }}>
    <div className="asha-game-dialog-top"><h2 id={titleId}>{title}</h2><button type="button" className="asha-map-icon-button" aria-label="Cerrar juego" disabled={pending} onClick={onClose}><X size={22}/></button></div>
    {children}
    <p className="asha-game-note">Actividad básica de simulación. No mide progreso clínico.</p>
  </dialog>;
}
