import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import type { CrearTerapeutaPayload } from '../src/modules/auth/domain/auth';
import { TherapistProfileExtras } from '../src/modules/admin/presentation/TherapistProfileExtras';

it('adds distinct languages and skills while preserving the professional description', () => {
  function Form() {
    const [form, setForm] = useState<CrearTerapeutaPayload>({ nombres:'', apellidos:'', email:'', password:'', idiomas:'Español', descripcion_profesional:'Perfil existente' });
    return <><TherapistProfileExtras form={form} disabled={false} onChange={patch => setForm(current => ({...current,...patch}))}/><output data-testid="profile">{form.idiomas} | {form.descripcion_profesional}</output></>;
  }
  render(<Form/>);
  fireEvent.click(screen.getByRole('combobox', {name:'Idioma adicional 1'}));
  expect(screen.queryByRole('option', {name:'Español'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('option', {name:'Quechua'}));
  expect(screen.getByTestId('profile')).toHaveTextContent('Español, Quechua');
  fireEvent.click(screen.getByRole('combobox', {name:'Habilidad principal'}));
  fireEvent.click(screen.getByRole('option', {name:'Trabajo en equipo'}));
  fireEvent.click(screen.getByRole('combobox', {name:'Habilidad complementaria'}));
  expect(screen.queryByRole('option', {name:'Trabajo en equipo'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('option', {name:'Escucha activa'}));
  expect(screen.getByTestId('profile')).toHaveTextContent('Perfil existente Habilidades: Trabajo en equipo; Escucha activa');
});
