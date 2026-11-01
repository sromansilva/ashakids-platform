import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DecolectaService } from '../../backend/dist/infrastructure/decolecta/decolecta.service.js';

describe('Decolecta DNI RENIEC & SUNAT RUC Integration Tests (TypeScript)', () => {
  it('1. Detects configuration mode gracefully without throwing exceptions', () => {
    const configured = DecolectaService.isConfigured();
    assert.equal(typeof configured, 'boolean');
  });

  it('2. Rejects invalid DNI formats (non-numeric, less or more than 8 digits)', async () => {
    const invalidInputs = ['', '1234567', '123456789', '1234ABCD', 'abcdefgh'];
    for (const input of invalidInputs) {
      const res = await DecolectaService.consultarDni(input);
      assert.equal(res.success, false);
      assert.ok(res.message);
      assert.match(res.message, /8 dígitos/);
    }
  });

  it('3. Successfully returns person identification data for a valid 8-digit DNI', async () => {
    const validDni = '70854321';
    const res = await DecolectaService.consultarDni(validDni);

    assert.equal(res.success, true);
    assert.ok(res.data);
    assert.equal(res.data.numero, validDni);
    assert.ok(res.data.nombres.length > 0);
    assert.ok(res.data.apellidos.length > 0);
    assert.ok(res.data.nombreCompleto.length > 0);
    assert.ok(['DECOLECTA_RENIEC', 'MOCK_DESARROLLO'].includes(res.data.fuente));
  });

  it('4. Rejects invalid RUC formats (non-numeric, less or more than 11 digits)', async () => {
    const invalidRucs = ['', '201000709', '201000709701', '2010007097A'];
    for (const input of invalidRucs) {
      const res = await DecolectaService.consultarRuc(input);
      assert.equal(res.success, false);
      assert.ok(res.message);
      assert.match(res.message, /11 dígitos/);
    }
  });

  it('5. Successfully returns fiscal data for a valid 11-digit RUC', async () => {
    const validRuc = '20100070970';
    const res = await DecolectaService.consultarRuc(validRuc);

    assert.equal(res.success, true);
    assert.ok(res.data);
    assert.equal(res.data.numero, validRuc);
    assert.ok(res.data.razonSocial.length > 0);
    assert.ok(['ACTIVO', 'INACTIVO', 'BAJA'].includes(res.data.estado));
    assert.ok(['DECOLECTA_SUNAT', 'MOCK_DESARROLLO'].includes(res.data.fuente));
  });

  it('6. Handles unexpected errors safely without throwing unhandled exceptions', async () => {
    const resDni = await DecolectaService.consultarDni('   ');
    assert.equal(resDni.success, false);
    const resRuc = await DecolectaService.consultarRuc('   ');
    assert.equal(resRuc.success, false);
  });
});
