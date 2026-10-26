const { Pool } = require('../backend/node_modules/pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:1234@127.0.0.1:5432/ashakids' });
async function run() {
  const check = await pool.query('SELECT * FROM expedientes WHERE id_paciente = 3');
  let idExp;
  if (check.rows.length === 0) {
    const exp = await pool.query('INSERT INTO expedientes (id_paciente, historial_clinico, diagnostico_inicial) VALUES (3, $1, $2) RETURNING id_expediente', ['Inicio de atencion', 'Trastorno fonologico']);
    idExp = exp.rows[0].id_expediente;
  } else {
    idExp = check.rows[0].id_expediente;
  }
  const checkT = await pool.query('SELECT * FROM tratamientos WHERE id_expediente = $1', [idExp]);
  if (checkT.rows.length === 0) {
    await pool.query('INSERT INTO tratamientos (id_expediente, id_terapeuta, nombre_tratamiento, descripcion, sesiones_recomendadas, estado_tratamiento, fecha_inicio, area, mundos_asignados) VALUES ($1, 1, $2, $3, 12, $4, NOW(), $5, $6)', [
      idExp,
      'Plan Integral de Articulación y Habla',
      'Intervención enfocada en fluidez y habla',
      'ACTIVO',
      'HABLA',
      JSON.stringify(['HABLA'])
    ]);
    console.log('Plan created for patient 3 successfully');
  } else {
    console.log('Patient 3 already has treatment');
  }
  await pool.end();
}
run().catch(console.error);

