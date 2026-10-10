import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Inp } from '@/components/common/Inp';
import { LoginPage } from '@/pages/auth/LoginPage';
import { AuthContext } from '@/auth/AuthContext';
import { reportInput, sessionsService } from '@/services/clinicalService';
import type { Report } from '@/types/clinical';

const report: Report = { id_sesion: 9, id_reporte_sesion: 7, fecha_creacion: '2026-01-01',
  observaciones_iniciales: null, objetivos_trabajados: 'Objetivo de prueba', nivel_ayuda: null, proximos_pasos: 'Continuar' };

describe('U0: contratos de reporte y acceso', () => {
  it('el servicio también descarta metadatos al recibir un Report y conserva valores nulos', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(report), { headers: { 'Content-Type': 'application/json' } }));
    await sessionsService.saveReport(9, report);
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body))).toEqual({
      observaciones_iniciales: null, objetivos_trabajados: 'Objetivo de prueba', nivel_ayuda: null, proximos_pasos: 'Continuar',
    });
    expect(reportInput(report)).not.toBe(report);
    expect(report.id_reporte_sesion).toBe(7);
  });
  it('mostrar y ocultar contraseña conserva el valor y expone nombre, estado y campo controlado', () => {
    function Field() { const [value, setValue] = useState('clave de prueba'); return <Inp label="Contraseña" type="password" value={value} onChange={setValue} />; }
    render(<Field />);
    const input = screen.getByLabelText('Contraseña');
    const show = screen.getByRole('button', { name: 'Mostrar contraseña' });
    expect(show).toHaveAttribute('aria-controls', input.id);
    expect(show).toHaveAttribute('aria-pressed', 'false');
    show.focus(); fireEvent.click(show);
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveFocus();
    expect(input).toHaveAttribute('type', 'text'); expect(input).toHaveValue('clave de prueba');
    expect(show).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(input, { target: { value: 'clave editada' } }); fireEvent.click(show);
    expect(input).toHaveAttribute('type', 'password'); expect(input).toHaveValue('clave editada');
  });
  it('asocia el error al campo y respeta disabled también en el control de contraseña', () => {
    render(<Inp id="test-password" label="Contraseña" type="password" value="" onChange={vi.fn()}
      error="Ingresa tu contraseña" hint="Ayuda sustituida" disabled aria-describedby="external" />);
    const input = screen.getByLabelText('Contraseña');
    expect(input).toBeDisabled(); expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'external test-password-feedback');
    expect(screen.getByText('Ingresa tu contraseña')).toHaveAttribute('id', 'test-password-feedback');
    expect(screen.queryByText('Ayuda sustituida')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeDisabled();
  });
  it('el acceso evita doble envío, anuncia el fallo y conserva las credenciales sin ofrecer Recordarme', async () => {
    let reject!: (error: Error) => void;
    const login = vi.fn(() => new Promise<never>((_, fail) => { reject = fail; }));
    const success = vi.fn();
    render(<AuthContext.Provider value={{ user: null, role: null, isAuthenticated: false, isLoading: false,
      login, logout: vi.fn(), refreshUser: vi.fn() }}><LoginPage onSuccess={success} onGoHome={vi.fn()} /></AuthContext.Provider>);
    expect(screen.queryByText('Recordarme')).not.toBeInTheDocument();
    const code = screen.getByLabelText('Código de usuario'); const password = screen.getByLabelText('Contraseña');
    expect(code).toHaveAttribute('autocomplete', 'username'); expect(password).toHaveAttribute('autocomplete', 'current-password');
    fireEvent.change(code, { target: { value: 'p00001' } }); fireEvent.change(password, { target: { value: 'clave sintética' } });
    const form = code.closest('form')!; fireEvent.submit(form); fireEvent.submit(form);
    expect(login).toHaveBeenCalledTimes(1); expect(login).toHaveBeenCalledWith({ codigo_usuario: 'p00001', password: 'clave sintética' });
    expect(screen.getByRole('button', { name: 'Iniciando sesión…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeDisabled();
    reject(new Error('Acceso de prueba rechazado'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Acceso de prueba rechazado');
    expect(password).toHaveValue('clave sintética'); expect(code).toHaveValue('p00001'); expect(success).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
  });
});
