// Synthetic browser QA: all API requests intercepted, no writes to the server.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = 'docs/evidence/therapist-reform-2026-10-11';
const apt = {id_reserva:1,id_paciente:1,id_terapeuta:2,id_tratamiento:1,id_sesion:3,paciente_nombre:'Paciente de prueba',terapeuta_nombre:'Profesional de prueba',fecha_hora_inicio:'2026-10-11T13:00:00Z',fecha_hora_fin:'2026-10-11T13:45:00Z',estado_reserva:'COMPLETADA',modalidad:'PRESENCIAL',localizacion:null,fecha_creacion:'2026-10-01T00:00:00Z'};
const session = {id_sesion:3,id_reserva:1,cita:apt,estado_sesion:'FINALIZADA',asistencia:'ASISTIO',reporte_disponible:false};
const contact = {id_tutor:3,id_terapeuta:2,tutor_nombre:'Familia de prueba',terapeuta_nombre:'Profesional de prueba'};
const conversation = {...contact,id_conversacion:12,estado:'ACTIVA',ultima_actividad:'2026-10-11T15:00:00Z',puede_enviar:true,id_usuario_tutor:2,id_usuario_terapeuta:1};
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1536,height:1024}});
 const errors=[],layouts=[],requests=[];let role='TERAPEUTA',review=null;
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/v1/**', async route=>{
   const req=route.request(),path=new URL(req.url()).pathname.replace('/api/v1',''); requests.push({path,method:req.method()});
   let body=[],status=200;
   if(path==='/auth/me') body={id_usuario:1,codigo_usuario:'t00001',nombres:'Profesional',apellidos:'de prueba',email:'test@example.invalid',rol:role,roles:[role],activo:true};
   if(path==='/terapeutas/me') body={user:{nombres:'Profesional',apellidos:'de prueba',email:'test@example.invalid'},perfil_terapeuta:{id_terapeuta:2,especialidad:'Lenguaje',anios_experiencia:0,idiomas:'Español',descripcion_profesional:'Perfil sintético para verificar la presentación.'}};
   if(path==='/pacientes') body=[{id_paciente:1,id_tutor:3,nombres_paciente:'Paciente',apellidos_paciente:'de prueba',fecha_nacimiento:'2018-01-01',activo:true}];
   if(path==='/citas') body=[apt]; if(path==='/citas/1') body=apt;
   if(path==='/sesiones') body=[session];if(path==='/sesiones/3')body=session;
   if(path==='/sesiones/3/plan')body=null;
   if(path==='/terapeutas/2/disponibilidad')body={turnos:[0,1,2,3,4].flatMap(dia=>[8,9,10,14,15,16].map(hora=>({dia,hora}))),bloqueos:[],duracion_minutos:45};
   if(path==='/conversaciones/contactos')body=[contact,{...contact,id_tutor:4,tutor_nombre:'Otra familia de prueba'}];
   if(path==='/conversaciones')body={items:[conversation],next_before_id:null};if(path==='/conversaciones/12')body=conversation;
   if(path==='/conversaciones/12/mensajes')body={items:[{id_mensaje:1,id_conversacion:12,id_usuario_emisor:2,texto_mensaje:'Hola, ¿podemos revisar las actividades de la próxima sesión?',fecha_envio:'2026-10-11T15:00:00Z'},{id_mensaje:2,id_conversacion:12,id_usuario_emisor:1,texto_mensaje:'Sí, lo revisaremos juntos en nuestra próxima atención.',fecha_envio:'2026-10-11T15:01:00Z'}],next_before_id:null};
   if(path==='/valoraciones')body=[{id_valoracion:8,id_sesion:3,calificacion:4,comentario:'Gracias por la atención y la explicación a la familia.',fecha_creacion:'2026-10-11T15:00:00Z',autor_nombre:'Familia de prueba',fecha_sesion:apt.fecha_hora_inicio}];
   if(path==='/sesiones/3/valoracion'){
     if(req.method()==='POST'){review={id_valoracion:8,id_sesion:3,...req.postDataJSON(),fecha_creacion:'2026-10-11T15:00:00Z'};status=201;} body=review;
   }
   await route.fulfill({status,contentType:'application/json',headers:{'X-Total-Count':String(Array.isArray(body)?body.length:0)},body:JSON.stringify(body)});
 });
 async function capture(name){
   await page.evaluate(()=>document.fonts.ready);
   const result=await page.evaluate(()=>({width:innerWidth,overflow:document.getElementById('root').scrollWidth>innerWidth,text:document.querySelector('main')?.innerText ?? document.body.innerText,smallControls:[...document.querySelectorAll('main button')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height<44).map(e=>e.innerText)}));
   assert.equal(result.overflow,false,name);layouts.push({name,...result});
   await page.screenshot({path:`${out}/${name}.png`,fullPage:true});
 }
 try {
   await page.goto('http://127.0.0.1:5178/terapeuta');await page.getByText('Pacientes atendidos',{exact:true}).waitFor();await capture('dashboard-1536');
   assert.equal(await page.getByRole('navigation',{name:'Acciones del panel'}).count(),0);
   await page.goto('http://127.0.0.1:5178/terapeuta/mensajes');await page.getByText('Conecta con las familias').waitFor();await capture('messages-empty-1536');
   await page.getByRole('button',{name:'Familia de prueba Asignación activa'}).click();await page.getByText('Hola, ¿podemos revisar las actividades de la próxima sesión?').waitFor();await capture('messages-thread-1536');
   await page.goto('http://127.0.0.1:5178/terapeuta/config');await page.getByLabel('Nombre completo').waitFor();await capture('profile-1536');
   await page.getByRole('button',{name:'Disponibilidad',exact:true}).click();await page.getByRole('checkbox',{name:'Lunes 08:00'}).waitFor();
   await page.getByRole('button',{name:'Seleccionar día',exact:true}).first().click();assert.equal(await page.getByRole('checkbox',{name:'Lunes 17:00'}).isChecked(),true);await capture('availability-1536');
   await page.getByRole('button',{name:'Seguridad',exact:true}).click();await page.getByLabel('Nueva contraseña',{exact:true}).waitFor();assert.equal(await page.getByText('Autenticación en dos pasos').count(),0);assert.equal(await page.getByRole('button',{name:'Eliminar cuenta',exact:true}).count(),0);await capture('security-1536');
   await page.goto('http://127.0.0.1:5178/terapeuta/pacientes');await page.getByRole('button',{name:'Abrir expediente'}).click();await page.getByRole('navigation',{name:'Expediente'}).waitFor();await capture('patient-1536');
   await page.goto('http://127.0.0.1:5178/terapeuta/valoraciones');await page.getByText('Calificación media').waitFor();await capture('reviews-1536');
   await page.goto('http://127.0.0.1:5178/terapeuta/datos-actividad');await page.getByRole('heading',{name:'Próximamente'}).waitFor();await capture('activity-empty-1536');
   role='PADRE';await page.goto('http://127.0.0.1:5178/padre/agenda');await page.getByRole('button',{name:'Mes anterior'}).waitFor();
   await page.getByRole('button',{name:/11 Oct 2026.*Completada/}).click();await page.getByRole('radio',{name:'4 estrellas'}).waitFor();await capture('family-review-1536');
   await page.getByRole('radio',{name:'4 estrellas'}).check();await page.getByLabel('Comentario (opcional)').fill('Gracias por la atención');await page.getByRole('button',{name:'Enviar valoración'}).click();await page.getByText('Calificaste esta sesión con 4 de 5 estrellas.').waitFor();await capture('family-review-saved-1536');
   assert.equal(requests.filter(r=>r.method==='POST').length,1);assert.deepEqual(errors,[]);
   fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify({errors,layouts,requests,environment:'Intercepted API; synthetic fixtures; desktop only'},null,2));
   console.log(JSON.stringify({pass:true,captures:layouts.length,errors:errors.length}));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
