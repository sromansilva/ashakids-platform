import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AccountSelect } from '@/modules/admin/presentation/AccountSelect';

describe('AccountSelect', () => {
  it('selects by keyboard and consumes Escape before the modal', () => {
    const change = vi.fn(); const modalKey = vi.fn();
    render(<div onKeyDown={modalKey}><AccountSelect label="Parentesco" value="Padre" options={['Padre','Madre','Tutor']} onChange={change}/></div>);
    const control = screen.getByRole('combobox');
    control.focus();
    fireEvent.keyDown(control, { key: 'ArrowDown' });
    fireEvent.keyDown(control, { key: 'End' });
    fireEvent.keyDown(control, { key: 'Enter' });
    expect(change).toHaveBeenCalledWith('Tutor');
    expect(control).toHaveAttribute('aria-expanded', 'false');
    expect(control).toHaveFocus();
    fireEvent.click(control); modalKey.mockClear();
    fireEvent.keyDown(control, { key: 'Escape' });
    expect(modalKey).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('supports pointer selection, outside dismissal and disabled state', () => {
    const change = vi.fn();
    const { rerender } = render(<AccountSelect label="Sexo" value="Masculino" options={['Masculino','Femenino','Otro']} onChange={change}/>);
    const control = screen.getByRole('combobox');
    fireEvent.click(control); fireEvent.click(screen.getByRole('option', {name:'Femenino'}));
    expect(change).toHaveBeenCalledWith('Femenino');
    fireEvent.click(control); fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    rerender(<AccountSelect label="Sexo" value="Masculino" options={['Masculino','Femenino','Otro']} onChange={change} disabled/>);
    expect(control).toBeDisabled();
  });
});
