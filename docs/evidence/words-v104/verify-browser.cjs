// Synthetic family; every API request is intercepted. TTS is instrumented, not audibly certified.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='docs/evidence/words-v104',base=process.env.PREVIEW_URL||'http://127.0.0.1:5175';
const errors=[],requests=[],layouts=[],cases=[];
const games=['El tesoro de palabras','Parejas escondidas','Cestas de colores','Una pequeña historia','Amigos al revés','El taller de sílabas','La merienda de la isla','¿Dónde está mi amigo?','Palabras que riman','El tren de las frases'];
const ids=['treasure','memory','sort','story','opposites','syllables','count','positions','rhymes','sentence'];
const fixture={id_paciente:901,version:'basica-1',experiencia:0,nivel:1,medallas:[],intentos_totales:0,experiencia_siguiente_nivel:200,mundos:[{id:'LENGUAJE',name:'La Isla de las Palabras',version:'basica-1',description:'Catálogo sintético',asignado:true,completados:[],intentos:0,medalla:false,levels:[1,2,3].map(number=>({number,title:'Actividad anterior',prompt:'Elige gato',choices:['Gato','Perro'],sequence:false}))}]};
async function prepare(page,voice=true){
 page.setDefaultTimeout(60000);page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(voice=>{Math.random=()=>.999;window.__speech=[];if(voice)window.speechSynthesis.speak=u=>window.__speech.push(u.text);else Object.defineProperty(window,'speechSynthesis',{value:undefined,configurable:true});},voice);
 await page.route('**/api/v1/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;requests.push({method:req.method(),path});const body=path.endsWith('/pacientes')?[{id_paciente:901,nombres_paciente:'Ana',apellidos_paciente:'Demo',activo:true}]:path.endsWith('/juegos')?fixture:[];await route.fulfill({status:200,contentType:'application/json',headers:{'X-Total-Count':'1'},body:JSON.stringify(body)});});
 await page.goto(`${base}/tests/world-map-harness.html?verify=1`);await page.waitForLoadState('networkidle');await page.getByRole('button',{name:'Abrir La Isla de las Palabras',exact:true}).click();
}
async function layout(page,label){
 await page.locator('.word-world img').evaluateAll(async images=>Promise.all(images.map(img=>img.decode())));
 const result=await page.evaluate(label=>({label,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.querySelectorAll('.word-world img')].filter(img=>!img.complete||!img.naturalWidth).map(img=>img.src),small:[...document.querySelectorAll('.word-world button')].filter(btn=>btn.checkVisibility()&&btn.getBoundingClientRect().height<44).map(btn=>btn.textContent),artOverflow:[...document.querySelectorAll('.word-game-art img')].filter(img=>{const a=img.getBoundingClientRect(),b=img.parentElement.getBoundingClientRect();return a.height>b.height+1||a.width>b.width+1;}).map(img=>img.src)}),label);
 layouts.push(result);assert.equal(result.overflow,false,JSON.stringify(result));assert.deepEqual(result.broken,[]);assert.deepEqual(result.small,[]);assert.deepEqual(result.artOverflow,[]);
}
async function nativeDrag(page,source,target){
 await source.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));const a=await source.boundingBox(),b=await target.boundingBox();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(a.x+a.width/2+12,a.y+a.height/2+12,{steps:5});await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:20});await page.mouse.up();
}
const stories=[['Plantamos la semilla','Regamos con agua','Crece una flor'],['Guardamos los juguetes','Leemos un cuento','Nos acostamos'],['Lavamos la manzana','La ponemos en la cesta','Compartimos la merienda']];
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:1100}});await prepare(page);
  const click=name=>page.getByRole('button',{name,exact:true}).click();
  const advance=async()=>click(await page.getByRole('button',{name:'Continuar',exact:true}).count()?'Continuar':'Terminar juego');
  const open=async(i,start=true)=>{await click(`Jugar ${games[i]}`);if(start)await click('¡Vamos a jugar!');};
  for(const mode of ['gentle','challenge']){
   await page.getByRole('button',{name:mode==='gentle'?/^Primeros pasos/:/^Un poquito más/}).click();
   for(const width of mode==='gentle'?[1366,768,390,320]:[1366,390]){
    await page.setViewportSize({width,height:1100});await layout(page,`${mode}-menu-${width}`);
    if(mode==='gentle'||width===1366)await page.screenshot({path:`${out}/${mode}-menu-${width}.png`,fullPage:true,animations:'disabled'});
    for(let i=0;i<games.length;i++){
     await open(i,false);await layout(page,`${mode}-${ids[i]}-intro-${width}`);
     if(mode==='gentle'&&i===5&&(width===1366||width===390))await page.screenshot({path:`${out}/welcome-${width}.png`,fullPage:true,animations:'disabled'});
     await click('¡Vamos a jugar!');await layout(page,`${mode}-${ids[i]}-play-${width}`);
     if(width===1366||width===390)await page.screenshot({path:`${out}/${mode}-${ids[i]}-${width}.png`,fullPage:true,animations:'disabled'});
     await click('Volver a los juegos');assert.equal(await page.getByRole('button',{name:`Jugar ${games[i]}`,exact:true}).evaluate(el=>el===document.activeElement),true);
    }
   }
   await page.setViewportSize({width:1366,height:1100});
   for(let i=0;i<games.length;i++){
    await open(i);
    if(i===0){await click('Perro');assert.equal(await page.getByRole('button',{name:'Continuar',exact:true}).count(),0);await click('Perro');await page.locator('.word-help [role=note]').waitFor();for(const name of ['Gato','Barco','Flor']){await click(name);await advance();}}
    if(i===1){const count=mode==='gentle'?2:4;assert.equal(await page.locator('.word-memory img').count(),count*2);await click('Ya las vi');assert.equal(await page.locator('.word-memory img').count(),0);await click('Descubrir carta 1');await click('Descubrir carta 2');await click('Volver a intentar');for(let n=1;n<=count;n++){await click(`Descubrir carta ${n}`);await click(`Descubrir carta ${n+count}`);}await click('Terminar juego');}
    if(i===2){await click('Cesta de frutas');if(mode==='gentle'){await nativeDrag(page,page.locator('.word-sort-current'),page.getByRole('button',{name:'Cesta de animales',exact:true}));await page.waitForFunction(()=>document.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')==='1');}else await click('Cesta de animales');for(const cat of ['animales','frutas','frutas',...(mode==='challenge'?['transportes','transportes']:[])])await click(`Cesta de ${cat}`);await click('Terminar juego');}
    if(i===3){for(const steps of stories.slice(0,mode==='gentle'?1:3)){for(const step of steps)await click(step);await click('Comprobar historia');await click('Escuchar mi historia');await advance();}}
    if(i===4){for(const answer of ['Pequeño','Noche','Abajo']){await click(answer);await advance();}}
    if(i===5){if(mode==='gentle'){for(const count of [2,2,3]){await click('Escuchar por partes');for(let n=0;n<count;n++)await click('Dar una palmada');await click('Comprobar palmadas');await advance();}}else{for(const parts of [['ga','to'],['ca','sa'],['pe','lo','ta']]){for(const part of parts)await click(part);await click('Comprobar palabra');await advance();}}}
    if(i===6){for(const count of mode==='gentle'?[2,3,4]:[3,4,5]){for(let n=0;n<count+1;n++)await click('Añadir una fruta');await click('Quitar una fruta');await click('¡La merienda está lista!');await advance();}}
    if(i===7){for(const pos of ['dentro','encima','debajo']){await click(`Colocar ${pos}`);await advance();}}
    if(i===8){for(const answer of ['Zapato','Caracol','Tambor']){await click(`Escuchar ${answer}`);await click(`Elegir ${answer}`);await click('¡Estas riman!');await advance();}}
    if(i===9){for(const parts of [['El gato','duerme','en casa'],['El pájaro','vuela','por el cielo'],['El conejo','come','zanahoria']]){for(const part of parts)await click(part);await click('Comprobar frase');await click('Escuchar mi frase');await advance();}}
    await page.getByRole('region',{name:'Juego completado'}).waitFor();cases.push({mode,id:ids[i],completed:true});
    if(mode==='gentle'||[1,3,5].includes(i))await page.screenshot({path:`${out}/${mode}-${ids[i]}-complete.png`,fullPage:true,animations:'disabled'});
    await click('Otra vez');assert.equal(await page.getByRole('region',{name:'Juego completado'}).count(),0);await click('Volver a los juegos');
   }
  }
  assert.equal(await page.getByText('Jugado en esta visita',{exact:true}).count(),10);
  await page.getByRole('button',{name:/^Primeros pasos/}).click();
  await page.getByRole('button',{name:`Jugar ${games[0]}`,exact:true}).press('Enter');await page.getByRole('button',{name:'¡Vamos a jugar!',exact:true}).press('Enter');await page.getByRole('button',{name:'Gato',exact:true}).press('Space');await page.getByRole('button',{name:'Continuar',exact:true}).press('Enter');
  assert.equal(await page.locator('.word-instruction>p').evaluate(el=>el===document.activeElement),true);await click('Volver a los juegos');
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.word-game-card').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  await page.setViewportSize({width:1366,height:1600});await page.locator('.word-menu').screenshot({path:`${out}/cards-desktop.png`,animations:'disabled'});
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await prepare(mobile);await mobile.getByRole('button',{name:`Jugar ${games[6]}`,exact:true}).tap();await mobile.getByRole('button',{name:'¡Vamos a jugar!',exact:true}).tap();
  for(const n of [2,3,4]){for(let k=0;k<n;k++)await mobile.getByRole('button',{name:'Añadir una fruta',exact:true}).tap();await mobile.getByRole('button',{name:'¡La merienda está lista!',exact:true}).tap();await mobile.getByRole('button',{name:n===4?'Terminar juego':'Continuar',exact:true}).tap();}await mobile.getByRole('region',{name:'Juego completado'}).waitFor();await mobile.screenshot({path:`${out}/touch-complete.png`,fullPage:true,animations:'disabled'});await mobile.close();
  const fallback=await browser.newPage({viewport:{width:390,height:844}});await fallback.route('**/words/games/treasure-v104.webp',route=>route.abort());await prepare(fallback,false);await fallback.getByText('El tesoro de palabras · imagen no disponible',{exact:true}).waitFor();await fallback.getByRole('button',{name:`Jugar ${games[0]}`,exact:true}).click();await fallback.getByRole('button',{name:'¡Vamos a jugar!',exact:true}).click();await fallback.getByText('La voz no está disponible aquí. Puedes seguir con las imágenes y el texto.',{exact:true}).waitFor();await fallback.getByRole('button',{name:'Gato',exact:true}).click();await fallback.getByRole('button',{name:'Continuar',exact:true}).waitFor();await fallback.close();
  const spoken=await page.evaluate(()=>window.__speech);assert.ok(spoken.some(text=>text.includes('ga. to.')));assert.ok(spoken.some(text=>text.includes('flor')&&text.includes('Tambor'))||spoken.some(text=>text.includes('Flor. Tambor.')));assert.deepEqual(errors,[]);assert.equal(requests.some(r=>r.method!=='GET'),false);
  fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify({cases,layouts,errors,apiRequests:requests,apiWrites:0,keyboard:true,touch:true,nativeDrag:true,voice:'TTS calls instrumented; no audible synthesis claim',spokenCount:spoken.length},null,2)+'\n');console.log(JSON.stringify({games:cases.length,layouts:layouts.length,errors,apiWrites:0,keyboard:true,touch:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
