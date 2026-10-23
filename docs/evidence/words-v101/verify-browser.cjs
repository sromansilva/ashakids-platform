// All API calls are intercepted. Generated WebP files and React interactions are real.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='docs/evidence/words-v101',base=process.env.PREVIEW_URL||'http://127.0.0.1:5174';
const requests=[],errors=[],layouts=[],cases=[];
const games=['El tesoro de palabras','Parejas escondidas','Cestas de colores','Una pequeña historia','Amigos al revés','El taller de sílabas','La merienda de la isla','¿Dónde está mi amigo?','Palabras que riman','El tren de las frases'];
const ids=['treasure','memory','sort','story','opposites','syllables','count','positions','rhymes','sentence'];
const fixture={id_paciente:901,version:'basica-1',experiencia:0,nivel:1,medallas:[],intentos_totales:0,experiencia_siguiente_nivel:200,mundos:[{id:'LENGUAJE',name:'La Isla de las Palabras',version:'basica-1',description:'Catálogo sintético',asignado:true,completados:[],intentos:0,medalla:false,levels:[1,2,3].map(number=>({number,title:'Actividad anterior',prompt:'Elige gato',choices:['Gato','Perro'],sequence:false}))}]};
async function layout(page,label){
 await page.locator('.word-world img').evaluateAll(async images=>{await Promise.all(images.map(img=>img.decode()));});
 const result=await page.evaluate(label=>({label,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.querySelectorAll('.word-world img')].filter(img=>!img.complete||!img.naturalWidth).map(img=>img.src),small:[...document.querySelectorAll('.word-world button')].filter(btn=>btn.checkVisibility()&&btn.getBoundingClientRect().height<44).map(btn=>btn.textContent)}),label);
 layouts.push(result);assert.equal(result.overflow,false,JSON.stringify(result));assert.deepEqual(result.broken,[]);assert.deepEqual(result.small,[]);
}
async function nativeDrag(page,source,target){
 await source.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 const a=await source.boundingBox(),b=await target.boundingBox();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(a.x+a.width/2+12,a.y+a.height/2+12,{steps:5});await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:20});await page.mouse.up();
}
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:1000}});page.setDefaultTimeout(60000);
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{Math.random=()=>.999;window.__voice=[];window.speechSynthesis.speak=utterance=>window.__voice.push(utterance.text);});
  await page.route('**/api/v1/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;requests.push({method:req.method(),path});const body=path.endsWith('/pacientes')?[{id_paciente:901,nombres_paciente:'Ana',apellidos_paciente:'Demo',activo:true}]:path.endsWith('/juegos')?fixture:[];await route.fulfill({status:200,contentType:'application/json',headers:{'X-Total-Count':'1'},body:JSON.stringify(body)});});
  await page.goto(`${base}/tests/world-map-harness.html?verify=1`);await page.waitForLoadState('networkidle');
  await page.getByRole('button',{name:'Abrir La Isla de las Palabras',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:/^Jugar /}).count(),10);
  for(const width of [1366,768,390,320]){await page.setViewportSize({width,height:1000});await layout(page,`menu-${width}`);await page.screenshot({path:`${out}/menu-${width}.png`,fullPage:true});}
  const click=async name=>page.getByRole('button',{name,exact:true}).click();
  const advance=async()=>{if(await page.getByRole('button',{name:'Continuar',exact:true}).count())await click('Continuar');else await click('Terminar juego');};
  for(let i=0;i<games.length;i++){
   await page.setViewportSize({width:1366,height:1000});await click(`Jugar ${games[i]}`);
   assert.equal(await page.getByRole('heading',{name:games[i],exact:true}).evaluate(el=>el===document.activeElement),true);
   for(const width of [1366,768,390,320]){await page.setViewportSize({width,height:1000});await layout(page,`${ids[i]}-${width}`);if(width===1366||width===390)await page.screenshot({path:`${out}/${ids[i]}-${width}.png`,fullPage:true});}
   await page.setViewportSize({width:1366,height:1000});
   if(i===0){await click('Escuchar');assert.ok((await page.evaluate(()=>window.__voice)).some(text=>text.includes('gato')));await click('Perro');await page.getByText('Vamos a probar otra vez.',{exact:true}).waitFor();for(const name of ['Gato','Barco','Flor']){await click(name);await advance();}}
   if(i===1){assert.equal(await page.locator('.word-memory img').count(),0);await click('Descubrir carta 1');await click('Descubrir carta 2');await click('Volver a intentar');for(const [a,b]of[[1,4],[2,5],[3,6]]){await click(`Descubrir carta ${a}`);await click(`Descubrir carta ${b}`);}await click('Terminar juego');}
   if(i===2){await click('Elegir Manzana');await click('Cesta de animales');await page.getByText(/va en otra cesta/).waitFor();await nativeDrag(page,page.getByRole('button',{name:'Elegir Manzana',exact:true}),page.getByRole('button',{name:'Cesta de frutas',exact:true}));assert.equal(await page.getByRole('button',{name:'Elegir Manzana',exact:true}).isEnabled(),false);for(const [name,category]of[['Gato','animales'],['Perro','animales'],['Conejo','animales'],['Banana','frutas'],['Uvas','frutas']]){await click(`Elegir ${name}`);await click(`Cesta de ${category}`);}await click('Terminar juego');}
   if(i===3){for(const name of ['Crece una flor','Plantamos la semilla','Regamos con agua'])await click(name);await click('Comprobar historia');await page.getByText(/Vamos a cambiar el orden/).waitFor();await click('Cambiar');for(const name of ['Plantamos la semilla','Regamos con agua','Crece una flor'])await click(name);await click('Comprobar historia');await click('Terminar juego');}
   if(i===4){await click('Grande');await click('Noche');await page.getByText(/busca lo contrario/).waitFor();for(const[a,b]of[['Grande','Pequeño'],['Día','Noche'],['Arriba','Abajo']]){await click(a);await click(b);}await click('Terminar juego');}
   if(i===5){for(const parts of [['ga','to'],['man','za','na'],['ma','ri','po','sa']]){for(const part of parts)await click(part);await click('Comprobar');await advance();}}
   if(i===6){await click('¡La cesta está lista!');await page.getByText('Vamos a probar otra vez.',{exact:true}).waitFor();for(const count of [2,3,4]){for(let n=0;n<count+1;n++)await click('Añadir una fruta');await click('Quitar una fruta');await click('¡La cesta está lista!');await advance();}}
   if(i===7){await click('Colocar fuera');await page.getByText('Vamos a probar otra vez.',{exact:true}).waitFor();await click('Colocar dentro');await advance();await click('Colocar encima');await advance();await click('Colocar debajo');await advance();}
   if(i===8){await click('Manzana');await page.getByText('Vamos a probar otra vez.',{exact:true}).waitFor();for(const name of ['Zapato','Banana','Gato']){await click(name);await advance();}}
   if(i===9){for(const parts of [['El gato','duerme','en casa'],['El pájaro','vuela','muy alto'],['El conejo','come','una zanahoria']]){for(const part of parts)await click(part);await click('Comprobar');await advance();}}
   await page.getByRole('region',{name:'Juego completado'}).waitFor();cases.push({id:ids[i],completed:true});
   await page.screenshot({path:`${out}/${ids[i]}-complete.png`,fullPage:true});await click('Otra vez');assert.equal(await page.getByRole('region',{name:'Juego completado'}).count(),0);await click('Volver a los juegos');
   assert.equal(await page.getByRole('button',{name:`Jugar ${games[i]}`,exact:true}).evaluate(el=>el===document.activeElement),true);
  }
  assert.equal(await page.getByText('Jugado en esta visita',{exact:true}).count(),10);
  // Native keyboard input, not synthetic click events.
  await page.getByRole('button',{name:'Jugar El tesoro de palabras',exact:true}).press('Enter');await page.getByRole('button',{name:'Gato',exact:true}).press('Space');await page.getByRole('button',{name:'Continuar',exact:true}).waitFor();await click('Volver a los juegos');
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.word-game-card').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  // Real touch context for a complete three-round game.
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await mobile.addInitScript(()=>Math.random=()=>.999);
  await mobile.goto(`${base}/tests/world-map-harness.html`);await mobile.waitForLoadState('networkidle');await mobile.getByRole('button',{name:'Abrir La Isla de las Palabras',exact:true}).tap();await mobile.getByRole('button',{name:'Jugar El tesoro de palabras',exact:true}).tap();
  for(const [index,name]of ['Gato','Barco','Flor'].entries()){await mobile.getByRole('button',{name,exact:true}).tap();await mobile.getByRole('button',{name:index===2?'Terminar juego':'Continuar',exact:true}).tap();}await mobile.getByRole('region',{name:'Juego completado'}).waitFor();await mobile.screenshot({path:`${out}/touch-complete.png`,fullPage:true});await mobile.close();
  assert.deepEqual(errors,[]);assert.equal(requests.some(req=>req.method!=='GET'),false);
  fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify({games:cases,layouts,errors,apiRequests:requests,apiWrites:0,keyboard:true,touch:true,reducedMotion:true,spokenInstructions:'Speech API stubbed; no audible synthesis claim'},null,2));console.log(JSON.stringify({games:cases.length,layouts:layouts.length,errors,keyboard:true,touch:true,apiWrites:0}));
 }finally{await browser.close();}
})().catch(error=>{fs.writeFileSync(`${out}/browser-failure.txt`,error.stack);console.error(error);process.exitCode=1;});
