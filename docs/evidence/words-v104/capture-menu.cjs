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

(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{const page=await browser.newPage({viewport:{width:1366,height:2800}});await prepare(page);await page.locator('.word-world img').evaluateAll(async imgs=>Promise.all(imgs.map(img=>img.decode())));await page.locator('.word-menu').screenshot({path:`${out}/cards-desktop.png`,animations:'disabled'});console.log('Captured full menu with all ten cards.');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
