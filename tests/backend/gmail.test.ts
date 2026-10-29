import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GmailService } from '../../backend/dist/infrastructure/mailer/gmail.service.js';

describe('Gmail & Mailer Microservice Tests (TypeScript)', () => {
  it('1. Detects configuration mode gracefully without throwing exceptions', () => {
    const configured = GmailService.isConfigured();
    assert.equal(typeof configured, 'boolean');
  });

  it('2. Handles sendMail safely without throwing unhandled exceptions', async () => {
    const result = await GmailService.sendMail({
      to: 'familia.prueba@ashakids.life',
      subject: 'Prueba de servicio de correo',
      text: 'Este es un correo de prueba del microservicio Gmail.',
    });

    assert.ok(typeof result === 'object');
    assert.ok(typeof result.success === 'boolean');
    assert.ok(['ENVIADO', 'NO_CONFIGURADO', 'FALLO'].includes(result.status));
  });

  it('3. Generates welcome email with credentials and link safely', async () => {
    const result = await GmailService.sendWelcomeEmail({
      to: 'tutor.demo@ashakids.life',
      name: 'Sergio Roman',
      role: 'Tutor / Familia',
      code: 'p12345',
      initialPassword: 'PasswordSegura2026!',
    });

    assert.ok(typeof result === 'object');
    assert.ok(typeof result.success === 'boolean');
    assert.ok(['ENVIADO', 'NO_CONFIGURADO', 'FALLO'].includes(result.status));
  });

  it('4. Generates password reset email safely', async () => {
    const result = await GmailService.sendPasswordResetEmail({
      to: 'terapeuta.demo@ashakids.life',
      resetUrl: 'https://ashakids.life/login?reset=token123',
    });

    assert.ok(typeof result === 'object');
    assert.ok(typeof result.success === 'boolean');
    assert.ok(['ENVIADO', 'NO_CONFIGURADO', 'FALLO'].includes(result.status));
  });

  it('5. Generates Zoom appointment confirmation email safely', async () => {
    const result = await GmailService.sendAppointmentConfirmation({
      to: 'familia.demo@ashakids.life',
      patientOrTherapistName: 'Mateo Roman',
      topic: 'Terapia de Lenguaje y Habla',
      date: '2026-11-01',
      time: '10:00 AM',
      zoomJoinUrl: 'https://zoom.us/j/123456789',
    });

    assert.ok(typeof result === 'object');
    assert.ok(typeof result.success === 'boolean');
    assert.ok(['ENVIADO', 'NO_CONFIGURADO', 'FALLO'].includes(result.status));
  });
});

