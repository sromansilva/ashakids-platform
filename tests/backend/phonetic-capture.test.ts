import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { FamilyPhoneticCaptureStore, PhoneticCaptureStore, pcm16MonoWav } from '../../backend/src/modules/sesiones/phonetic-capture.ts';

const session = 12;
const user = 34;
const word = 'carro';
const phoneme = '/rr/';

function packet(sampleCount = 4_000) {
  return Buffer.alloc(sampleCount * 2);
}

function start(store: PhoneticCaptureStore, captureId = randomUUID()) {
  store.create({
    id_sesion: session,
    id_usuario: user,
    captura_id: captureId,
    palabra_objetivo: word,
    fonema_objetivo: phoneme,
  });
  return captureId;
}

test('phonetic capture reassembles an ordered two-second PCM stream and clears it on take', () => {
  const store = new PhoneticCaptureStore();
  const captureId = start(store);
  for (let index = 0; index < 8; index += 1) {
    const result = store.append(session, user, captureId, index, packet());
    assert.equal(result.paquetes_recibidos, index + 1);
  }

  const completed = store.take(session, user, captureId);
  assert.equal(completed.total_samples, 32_000);
  assert.equal(completed.pcm.length, 64_000);
  assert.equal(completed.palabra_objetivo, word);
  assert.throws(() => store.take(session, user, captureId), /expiró o ya fue cerrada/);
  completed.pcm.fill(0);
});

test('phonetic capture rejects out-of-order packets without accepting them', () => {
  const store = new PhoneticCaptureStore();
  const captureId = start(store);
  assert.throws(() => store.append(session, user, captureId, 1, packet()), /fuera de secuencia/);
  assert.equal(store.append(session, user, captureId, 0, packet()).paquetes_recibidos, 1);
  store.discard(session, user, captureId);
});

test('phonetic capture rejects samples shorter than two seconds and erases the buffer', () => {
  const store = new PhoneticCaptureStore();
  const captureId = start(store);
  for (let index = 0; index < 7; index += 1) store.append(session, user, captureId, index, packet());
  assert.throws(() => store.take(session, user, captureId), /entre 2 y 3 segundos/);
  assert.throws(() => store.append(session, user, captureId, 7, packet()), /expiró o ya fue cerrada/);
});

test('PCM wrapper emits mono signed 16-bit WAV at 16 kHz with exact duration bytes', () => {
  const wav = pcm16MonoWav(packet(32_000));
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wav.readUInt16LE(22), 1);
  assert.equal(wav.readUInt32LE(24), 16_000);
  assert.equal(wav.readUInt16LE(34), 16);
  assert.equal(wav.readUInt32LE(40), 64_000);
  assert.equal(wav.length, 64_044);
  wav.fill(0);
});

test('family capture hands off the therapist request, accepts only the claimed family device, and retains no PCM after processing', () => {
  const store = new FamilyPhoneticCaptureStore();
  const familyUser = 56;
  const otherFamilyUser = 57;
  const captureId = randomUUID();
  store.create({
    id_sesion: session,
    id_usuario: user,
    captura_id: captureId,
    palabra_objetivo: word,
    fonema_objetivo: phoneme,
  });

  assert.equal(store.pending(session, familyUser)?.estado, 'SOLICITADA');
  store.claim(session, familyUser, captureId);
  assert.equal(store.pending(session, familyUser)?.estado, 'EN_CAPTURA');
  assert.deepEqual(store.pending(session, otherFamilyUser), { estado: 'OCUPADA' });
  assert.throws(() => store.append(session, otherFamilyUser, captureId, 0, packet()), /no está activa/);

  for (let index = 0; index < 8; index += 1) {
    assert.equal(store.append(session, familyUser, captureId, index, packet()).paquetes_recibidos, index + 1);
  }
  const completed = store.take(session, familyUser, captureId);
  assert.equal(completed.total_samples, 32_000);
  assert.equal(store.result(session, captureId).estado, 'PROCESANDO');
  completed.pcm.fill(0);
  store.complete(session, captureId, {
    id_evaluacion: 501,
    estado: 'PENDIENTE_REVISION',
    palabra_esperada: word,
    transcripcion_tentativa: 'carro',
    duracion_segundos: 2,
    aviso: 'Requiere revisión del terapeuta.',
  });
  const result = store.result(session, captureId);
  assert.equal(result.estado, 'COMPLETADA');
  assert.equal(result.resultado?.id_evaluacion, 501);
  store.discard(session, captureId);
  assert.throws(() => store.result(session, captureId), /expiró o fue cancelada/);
});

test('session cleanup erases unprocessed clinical and family audio buffers', () => {
  const clinicalStore = new PhoneticCaptureStore();
  const familyStore = new FamilyPhoneticCaptureStore();
  const clinicalCaptureId = start(clinicalStore);
  clinicalStore.append(session, user, clinicalCaptureId, 0, packet());

  const familyUser = 56;
  const familyCaptureId = randomUUID();
  familyStore.create({
    id_sesion: session,
    id_usuario: user,
    captura_id: familyCaptureId,
    palabra_objetivo: word,
    fonema_objetivo: phoneme,
  });
  familyStore.claim(session, familyUser, familyCaptureId);
  familyStore.append(session, familyUser, familyCaptureId, 0, packet());

  assert.equal(clinicalStore.discardSession(session), 1);
  assert.equal(familyStore.discardSession(session), 1);
  assert.throws(() => clinicalStore.append(session, user, clinicalCaptureId, 1, packet()), /expiró o ya fue cerrada/);
  assert.throws(() => familyStore.result(session, familyCaptureId), /expiró o fue cancelada/);
});

test('a family account cannot erase an active capture owned by a different family account', () => {
  const store = new FamilyPhoneticCaptureStore();
  const owner = 56;
  const other = 57;
  const captureId = randomUUID();
  store.create({
    id_sesion: session,
    id_usuario: user,
    captura_id: captureId,
    palabra_objetivo: word,
    fonema_objetivo: phoneme,
  });
  store.claim(session, owner, captureId);
  store.append(session, owner, captureId, 0, packet());

  assert.throws(() => store.discard(session, captureId, other), /no pertenece a esta cuenta familiar/);
  assert.equal(store.append(session, owner, captureId, 1, packet()).paquetes_recibidos, 2);
  store.discard(session, captureId, owner);
});
