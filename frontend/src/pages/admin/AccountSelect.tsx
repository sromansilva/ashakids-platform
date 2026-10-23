import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import './account-select.css';

interface Props {
  id?: string;
  label: string;
  value: string;
  options: readonly string[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

/** Account form select: focus stays on the combobox, including keyboard selection. */
export function AccountSelect({ id, label, value, options, disabled, onChange }: Props) {
  const generated = useId();
  const controlId = id ?? generated;
  const listId = `${controlId}-options`;
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = Math.max(0, options.indexOf(value));
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  const choose = (index: number) => { onChange(options[index]); setOpen(false); };
  return <div className="account-select" ref={root}>
    <button id={controlId} type="button" role="combobox" aria-label={label}
      aria-expanded={open && !disabled} aria-controls={listId} aria-haspopup="listbox"
      aria-activedescendant={open ? `${listId}-${active}` : undefined} disabled={disabled}
      className="account-select-trigger"
      onBlur={() => setOpen(false)}
      onClick={() => { setActive(selected); setOpen(!open); }}
      onKeyDown={event => {
        if (event.key === 'Tab') { setOpen(false); return; }
        if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); return; }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
          event.preventDefault();
          if (!open) { setOpen(true); setActive(event.key === 'End' ? options.length - 1 : selected); return; }
          if (event.key === 'Enter' || event.key === ' ') choose(active);
          else if (event.key === 'Home') setActive(0);
          else if (event.key === 'End') setActive(options.length - 1);
          else setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
        } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          const match = options.findIndex(option => option.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()));
          if (match >= 0) { event.preventDefault(); setActive(match); setOpen(true); }
        }
      }}><span>{value}</span><ChevronDown size={18} aria-hidden="true" /></button>
    {open && !disabled && <div id={listId} role="listbox" aria-label={label} className="account-select-menu">
      {options.map((option, index) => <div id={`${listId}-${index}`} key={option} role="option"
        aria-selected={value === option} className={`account-select-option${active === index ? ' is-active' : ''}`}
        onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()}
        onClick={event => { event.preventDefault(); event.stopPropagation(); choose(index); }}>
        <span>{option}</span>{value === option && <Check size={17} aria-hidden="true" />}
      </div>)}
    </div>}
  </div>;
}
