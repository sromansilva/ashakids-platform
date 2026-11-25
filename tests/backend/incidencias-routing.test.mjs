import { it } from 'node:test';
import assert from 'node:assert/strict';
import { IncidenciasService } from '../../backend/dist/modules/incidencias/incidencias.service.js';

const service = new IncidenciasService();

it('asigna las tres categorías a áreas adecuadas según el rol que reporta', () => {
  const route = (role, type, therapistId = null, requestedArea) =>
    service.clasificarDestinatario(role, type, 'Descripción', therapistId, requestedArea);

  assert.equal(route('PADRE', 'Problemas técnicos').area_destino, 'SOPORTE_TECNICO');
  assert.equal(route('PADRE', 'Problemas de permisos').area_destino, 'ADMINISTRACION');
  assert.deepEqual(route('PADRE', 'Problemas de información', 81), {
    area_destino: 'TERAPEUTA', responsable: 'terapeuta', id_terapeuta: 81,
  });
  assert.equal(route('PADRE', 'Problemas de información').area_destino, 'ADMINISTRACION');

  assert.equal(route('TERAPEUTA', 'Problemas técnicos', null, 'ADMINISTRACION').area_destino, 'SOPORTE_TECNICO');
  assert.equal(route('TERAPEUTA', 'Problemas de permisos').area_destino, 'ADMINISTRACION');
  assert.equal(route('TERAPEUTA', 'Problemas de información').area_destino, 'ADMINISTRACION');

  assert.equal(route('ADMIN', 'Problemas técnicos').area_destino, 'SOPORTE_TECNICO');
  assert.equal(route('ADMIN', 'Problemas de permisos').area_destino, 'SOPORTE_TECNICO');
  assert.equal(route('ADMIN', 'Problemas de información').area_destino, 'SOPORTE_TECNICO');
});

it('no permite que un terapeuta o administrador se asigne incidencias a su propia área', () => {
  assert.equal(service.clasificarDestinatario('TERAPEUTA', 'Seguimiento Terapéutico').area_destino, 'ADMINISTRACION');
  assert.equal(service.clasificarDestinatario('TERAPEUTA', 'Otro', 'Reporte', 41, 'TERAPEUTA').area_destino, 'ADMINISTRACION');
  assert.equal(service.clasificarDestinatario('ADMIN', 'Cuentas y Permisos').area_destino, 'SOPORTE_TECNICO');
  assert.equal(service.clasificarDestinatario('ADMIN', 'Otro', 'Reporte', null, 'ADMINISTRACION').area_destino, 'SOPORTE_TECNICO');
});

it('clasifica las variedades debajo de las tres categorías y respeta quién reporta', () => {
  const route = (role, type, therapistId = null) => service.clasificarDestinatario(role, type, 'Descripción', therapistId);
  for (const type of ['Funcional', 'Visual / Diseño', 'Carga / Rendimiento', 'Error de datos', 'Soporte de Plataforma']) {
    assert.equal(route('PADRE', type).area_destino, 'SOPORTE_TECNICO');
    assert.equal(route('TERAPEUTA', type).area_destino, 'SOPORTE_TECNICO');
    assert.equal(route('ADMIN', type).area_destino, 'SOPORTE_TECNICO');
  }
  for (const type of ['Cuentas y Permisos', 'Seguridad y Acceso']) {
    assert.equal(route('PADRE', type).area_destino, 'ADMINISTRACION');
    assert.equal(route('TERAPEUTA', type).area_destino, 'ADMINISTRACION');
    assert.equal(route('ADMIN', type).area_destino, 'SOPORTE_TECNICO');
  }
  for (const type of ['Paciente / Agenda', 'Seguimiento Terapéutico', 'Sesiones y Citas', 'Mundo ASHA']) {
    assert.deepEqual(route('PADRE', type, 81), { area_destino: 'TERAPEUTA', responsable: 'terapeuta', id_terapeuta: 81 });
    assert.equal(route('PADRE', type).area_destino, 'ADMINISTRACION');
    assert.equal(route('TERAPEUTA', type).area_destino, 'ADMINISTRACION');
    assert.equal(route('ADMIN', type).area_destino, 'SOPORTE_TECNICO');
  }
  assert.equal(route('SOPORTE_TECNICO', 'Cuentas y Permisos').area_destino, 'ADMINISTRACION');
  assert.equal(route('SOPORTE_TECNICO', 'Seguridad y Acceso').area_destino, 'ADMINISTRACION');
});
