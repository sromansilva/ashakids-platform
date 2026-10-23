// Synthetic family session. Every API request is intercepted; local media is real.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const out = 'docs/evidence/sounds-v102';
const preview = process.env.PREVIEW_URL || 'http://127.0.0.1:5175';
const names = { cow: 'Vaca', cat: 'Gato', dog: 'Perro', chick: 'Pollito' };
const requests = [], errors = [], layouts = [], cases = [];
const fixture = { id_paciente:901,version:'basica-1',experiencia:0,nivel:1,medallas:[],intentos_totales:0,experiencia_siguiente_nivel:200,
  mundos:[{id:'HABLA',version:'basica-1',name:'Taller de los Sonidos',description:'Prueba sintética de sonidos',asignado:true,completados:[],intentos:0,medalla:false,
    levels:[1,2,3].map(number=>({number,title:'Actividad anterior',prompt:'Elige gato',choices:['Gato','Perro'],sequence:false}))}] };
async function prepare(page) {
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/v1/**', async route => {
    const request=route.request(), path=new URL(request.url()).pathname;
    requests.push({method:request.method(),path});
    const body=path.endsWith('/pacientes') ? [{id_paciente:901,nombres_paciente:'Ana',apellidos_paciente:'Demo',activo:true}] : path.endsWith('/juegos') ? fixture : [];
    await route.fulfill({status:200,contentType:'application/json',headers:{'X-Total-Count':'1'},body:JSON.stringify(body)});
  });
  await page.addInitScript(() => {
    window.__audio=[]; window.__overlap=0;
    const NativeAudio=window.Audio;
    window.Audio=function(...args) {
      const audio=new NativeAudio(...args); window.__audio.push(audio);
      audio.addEventListener('playing',()=>{window.__overlap=Math.max(window.__overlap,window.__audio.filter(a=>!a.paused&&!a.ended).length);});
      return audio;
    };
  });
  await page.goto(`${preview}/tests/world-map-harness.html?verify=1`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button',{name:'Abrir Taller de los Sonidos',exact:true}).click();
  await page.locator('.sound-world img').first().evaluate(img=>img.decode());
}
async function hear(page, button) {
  await button.click();
  await page.waitForFunction(()=>window.__audio.at(-1)?.ended && window.__audio.at(-1).currentTime>0);
  return page.evaluate(()=>window.__audio.at(-1).src.split('/').at(-1).replace('.mp3',''));
}
async function layout(page,label) {
  const result=await page.evaluate(label=>({label,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,
    broken:[...document.querySelectorAll('.sound-world img')].filter(img=>!img.complete||!img.naturalWidth).map(img=>img.src),
    small:[...document.querySelectorAll('.sound-world button')].filter(btn=>btn.checkVisibility()&&btn.getBoundingClientRect().height<44).map(btn=>btn.textContent),
    world:document.querySelector('.sound-world').getBoundingClientRect().toJSON()}),label);
  layouts.push(result); assert.equal(result.overflow,false,JSON.stringify(result)); assert.deepEqual(result.broken,[]); assert.deepEqual(result.small,[]);
}

const titles=['Toca y descubre','¿Quién está sonando?','Mis primeras dos parejas','El reto de tres parejas'];
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:1000}});page.setDefaultTimeout(60000);
  await prepare(page);
  const click=name=>page.getByRole('button',{name,exact:true}).click();
  for(const width of [1366,768,390,320]){
   await page.setViewportSize({width,height:1000});
   await page.locator('.sound-world img').evaluateAll(async imgs=>Promise.all(imgs.map(img=>img.decode())));
   await layout(page,`menu-${width}`);await page.screenshot({path:`${out}/menu-${width}.png`,fullPage:true});
   for(const [i,title] of titles.entries()){
    await click(`Jugar ${title}`);await page.locator('.sound-world img').evaluateAll(async imgs=>Promise.all(imgs.map(img=>img.decode())));
    await layout(page,`game-${i+1}-${width}`);
    if(width===1366||width===390)await page.screenshot({path:`${out}/game-${i+1}-${width}.png`,fullPage:true});
    assert.equal(await page.getByLabel('Cuatro juegos independientes').count(),0);
    await click('Volver a los juegos');
    assert.equal(await page.getByRole('button',{name:`Jugar ${title}`,exact:true}).evaluate(el=>el===document.activeElement),true);
   }
  }
  await page.setViewportSize({width:1366,height:1000});
  await page.getByRole('button',{name:`Jugar ${titles[0]}`,exact:true}).press('Enter');
  assert.equal(await page.locator('h2:focus').count(),1);
  await click('Silenciar');await click('Vaca');await page.getByRole('alert').filter({hasText:'Activa el sonido'}).waitFor();await click('Activar sonido');
  await page.route('**/sounds/animals/cow.mp3',r=>r.abort());await click('Vaca');await page.getByRole('alert').filter({hasText:'reintentar'}).waitFor();await page.unroute('**/sounds/animals/cow.mp3');
  for(const name of Object.values(names))await hear(page,page.getByRole('button',{name,exact:true}));
  await page.getByRole('region',{name:'Actividad completada'}).waitFor();
  assert.equal(await page.locator('.sound-animal').count(),0);
  assert.equal(await page.getByRole('button',{name:'Siguiente nivel',exact:true}).count(),0);
  await page.screenshot({path:`${out}/explore-complete.png`,fullPage:true});
  await click('Elegir otro juego');cases.push('explore complete, success replaces board, mute/error recovery, keyboard');
  await click(`Jugar ${titles[1]}`);
  for(let round=0;round<5;round++){
   const id=await hear(page,page.getByRole('button',{name:'Escuchar sonido',exact:true}));
   await click(names[id]);await click(round===4?'Terminar':'Siguiente ronda');
  }
  await page.getByRole('region',{name:'Actividad completada'}).waitFor();assert.equal(await page.locator('.sound-animal').count(),0);
  await page.screenshot({path:`${out}/identify-complete.png`,fullPage:true});await click('Elegir otro juego');cases.push('identify: five real-audio rounds, independent completion');
  for(const count of [2,3]){
   await click(`Jugar ${titles[count]}`);
   const tokens=page.getByRole('button',{name:/Escuchar ficha/});assert.equal(await tokens.count(),count);
   for(let i=0;i<count;i++){
    const token=tokens.nth(i),id=await hear(page,token),target=page.getByRole('button',{name:`Relacionar con ${names[id]}`,exact:true});
    if(i===0){
     await token.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
     const a=await token.boundingBox(),b=await target.boundingBox();
     await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(a.x+a.width/2+12,a.y+a.height/2+12,{steps:5});await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:20});await page.mouse.up();
    }else await target.click();
    if(i<count-1)assert.equal(await token.isDisabled(),true);
   }
   await page.getByRole('region',{name:'Actividad completada'}).waitFor();
   assert.equal(await page.locator('.sound-token').count(),0);assert.equal(await page.locator('.sound-animal').count(),0);
   await page.screenshot({path:`${out}/match-${count}-complete.png`,fullPage:true});
   await click('Otra vez');assert.equal(await tokens.count(),count);
   await click('Volver a los juegos');cases.push(`independent ${count} pairs: native drag/click, success without board, repeat same count`);
  }
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.sound-level').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  await click(`Jugar ${titles[0]}`);await click('Vaca');await click('Volver a los juegos');assert.equal(await page.evaluate(()=>window.__audio.at(-1).getAttribute('src')),null);
  assert.ok(await page.evaluate(()=>window.__overlap)<=1);
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.setDefaultTimeout(60000);await prepare(mobile);
  await mobile.getByRole('button',{name:`Jugar ${titles[2]}`,exact:true}).tap();
  for(let i=0;i<2;i++){
   await mobile.getByRole('button',{name:`Escuchar ficha ${i+1}`,exact:true}).tap();await mobile.waitForFunction(()=>window.__audio.at(-1)?.ended);
   const id=await mobile.evaluate(()=>window.__audio.at(-1).src.split('/').at(-1).replace('.mp3',''));
   await mobile.getByRole('button',{name:`Relacionar con ${names[id]}`,exact:true}).tap();
  }
  await mobile.getByRole('region',{name:'Actividad completada'}).waitFor();await mobile.screenshot({path:`${out}/touch-complete.png`,fullPage:true});await mobile.close();cases.push('complete two pairs by touch; reduced motion, navigation cancels audio');
  assert.deepEqual(errors,[]);assert.equal(requests.some(r=>r.method!=='GET'),false);
  fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify({cases,layouts,errors,apiRequests:requests,apiWrites:0,realMedia:true},null,2)+'\n');
  console.log(JSON.stringify({cases:cases.length,layouts:layouts.length,errors,apiWrites:0}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
