// Synthetic family session. Every API request is intercepted; local media is real.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const out = 'docs/evidence/sounds-v97';
const preview = process.env.PREVIEW_URL || 'http://127.0.0.1:5174';
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
    small:[...document.querySelectorAll('.sound-world button')].filter(btn=>btn.getBoundingClientRect().height<44).map(btn=>btn.textContent),
    world:document.querySelector('.sound-world').getBoundingClientRect().toJSON()}),label);
  layouts.push(result); assert.equal(result.overflow,false,JSON.stringify(result)); assert.deepEqual(result.broken,[]); assert.deepEqual(result.small,[]);
}
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try {
    const page=await browser.newPage({viewport:{width:1366,height:1000}}); page.setDefaultTimeout(15000);
    await prepare(page);
    for(const width of [1366,768,390,320]) {
      await page.setViewportSize({width,height:1000}); await layout(page,`levels-${width}`);
      await page.screenshot({path:`${out}/levels-${width}.png`,fullPage:true});
      await page.getByRole('button',{name:/Jugar nivel 1:/}).click();
      await layout(page,`explore-${width}`); await page.screenshot({path:`${out}/explore-${width}.png`,fullPage:true});
      await page.getByRole('button',{name:'Volver a niveles',exact:true}).click();
    }
    await page.setViewportSize({width:1366,height:1000});
    const decoded=await page.evaluate(async()=>{
      const context=new AudioContext(), result=[];
      for(const id of ['cow','cat','dog','chick']) {
        const response=await fetch(`/sounds/animals/${id}.mp3`); const buffer=await context.decodeAudioData(await response.arrayBuffer());
        let energy=0,peak=0;for(const sample of buffer.getChannelData(0)){energy+=sample*sample;peak=Math.max(peak,Math.abs(sample));}
        result.push({id,duration:buffer.duration,channels:buffer.numberOfChannels,rms:Math.sqrt(energy/buffer.length),peak});
      } await context.close();return result;
    });
    for(const clip of decoded){assert.ok(clip.duration>0.5&&clip.duration<3.2);assert.ok(clip.rms>.005);assert.ok(clip.peak<1);}
    const first=page.getByRole('button',{name:/Jugar nivel 1:/});await first.focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('h2:focus').count(),1);
    await page.getByRole('button',{name:'Vaca',exact:true}).click();
    await page.getByRole('button',{name:'Gato',exact:true}).click();
    await page.waitForFunction(()=>window.__audio.at(-1)?.ended);
    assert.equal(await page.getByRole('progressbar',{name:'Amigos escuchados'}).getAttribute('aria-valuenow'),'1');
    for(const animal of ['Vaca','Perro','Pollito']) await hear(page,page.getByRole('button',{name:animal,exact:true}));
    await page.getByRole('heading',{name:'¡Ya conoces sus sonidos!'}).waitFor();
    await page.screenshot({path:`${out}/explore-complete.png`,fullPage:true});cases.push('explore: cancellation, four real clips, completion');
    assert.equal(await page.evaluate(()=>window.__overlap),1);
    await page.getByRole('button',{name:'Otra vez',exact:true}).click();
    assert.equal(await page.getByRole('progressbar',{name:'Amigos escuchados'}).getAttribute('aria-valuenow'),'0');
    await page.getByRole('button',{name:'Silenciar',exact:true}).click();await page.getByRole('button',{name:'Vaca',exact:true}).click();
    await page.getByRole('alert').filter({hasText:'Activa el sonido'}).waitFor();
    await page.getByRole('button',{name:'Activar sonido',exact:true}).click();
    await page.route('**/sounds/animals/cow.mp3',route=>route.abort());await page.getByRole('button',{name:'Vaca',exact:true}).click();
    await page.getByRole('alert').filter({hasText:'reintentar'}).waitFor();await page.unroute('**/sounds/animals/cow.mp3');
    await hear(page,page.getByRole('button',{name:'Vaca',exact:true}));cases.push('mute and actual network failure recover without false completion');
    await page.getByRole('button',{name:'Volver a niveles',exact:true}).click();
    assert.equal(await page.evaluate(()=>window.__audio.at(-1).getAttribute('src')),null);
    await page.getByRole('button',{name:/Jugar nivel 2:/}).click();
    for(let round=0;round<5;round++) {
      assert.equal(await page.locator('.sound-animal').count(),round<2?2:3);
      const id=await hear(page,page.getByRole('button',{name:'Escuchar sonido',exact:true}));
      assert.equal(await page.locator('.sound-playground').getByText(/Muuu|Miau|Guau|Pío/).count(),0);
      const wrong=page.locator('.sound-animal').filter({hasNot:page.locator(`strong:text-is("${names[id]}")`)}).first();
      await wrong.click();await page.getByText('Escuchemos otra vez',{exact:true}).waitFor();
      await page.getByRole('button',{name:names[id],exact:true}).click();await page.getByText('¡Lo encontraste!',{exact:true}).waitFor();
      if(round===2){await layout(page,'identify-desktop');await page.screenshot({path:`${out}/identify.png`,fullPage:true});}
      await page.getByRole('button',{name:round===4?'Terminar':'Siguiente ronda',exact:true}).click();
    }
    await page.getByRole('heading',{name:'¡Qué buenos oídos!'}).waitFor();cases.push('five real-audio identification rounds, friendly retry, no answer text');
    await page.getByRole('button',{name:'Siguiente nivel',exact:true}).click();
    for(const count of [2,3]) {
      const tokens=page.getByRole('button',{name:/Escuchar ficha/});assert.equal(await tokens.count(),count);
      for(let index=0;index<count;index++) {
        const token=tokens.nth(index),id=await hear(page,token),target=page.getByRole('button',{name:`Relacionar con ${names[id]}`,exact:true});
        if(index===0) {
          // Keep both ends visible before dragging in the app's scrolling main panel.
          await token.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
          const source=await token.boundingBox(), destination=await target.boundingBox();
          await page.mouse.move(source.x+source.width/2,source.y+source.height/2);
          await page.mouse.down();await page.mouse.move(source.x+source.width/2+12,source.y+source.height/2+12,{steps:5});
          await page.mouse.move(destination.x+destination.width/2,destination.y+destination.height/2,{steps:20});await page.mouse.up();
        } else await target.click();
        await page.waitForFunction(label=>[...document.querySelectorAll('.sound-animal')].find(b=>b.getAttribute('aria-label')===label)?.disabled,`Relacionar con ${names[id]}`);
      }
      if(count===2) await page.getByRole('button',{name:/Vamos con tres parejas/}).click();
    }
    await page.getByRole('heading',{name:'¡Cada sonido encontró su lugar!'}).waitFor();await page.screenshot({path:`${out}/match-complete.png`,fullPage:true});cases.push('native drag-and-drop and click matching, two then three pairs');
    await page.getByRole('button',{name:'Otra vez',exact:true}).click();
    assert.equal(await page.locator('.sound-token').count(),2);assert.equal(await page.getByRole('progressbar',{name:/Parejas/}).getAttribute('aria-valuenow'),'0');
    await page.getByRole('button',{name:'Volver a niveles',exact:true}).click();
    await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:/Jugar nivel 1:/}).click();
    assert.equal(await page.locator('.sound-animal').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
    await page.getByRole('button',{name:'Vaca',exact:true}).click();await page.getByRole('button',{name:'Volver a niveles',exact:true}).click();
    assert.equal(await page.evaluate(()=>window.__audio.at(-1).getAttribute('src')),null);
    assert.equal(await page.getByRole('button',{name:/Jugar nivel 1:/}).evaluate(el=>document.activeElement===el),true);cases.push('keyboard start, heading focus, return focus, reduced motion, navigation cleanup');
    const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await prepare(mobile);
    await mobile.getByRole('button',{name:/Jugar nivel 3:/}).tap();
    const token=mobile.getByRole('button',{name:'Escuchar ficha 1',exact:true});await token.tap();await mobile.waitForFunction(()=>window.__audio.at(-1)?.ended);
    const id=await mobile.evaluate(()=>window.__audio.at(-1).src.split('/').at(-1).replace('.mp3',''));
    await mobile.getByRole('button',{name:`Relacionar con ${names[id]}`,exact:true}).tap();
    assert.equal(await token.isDisabled(),true);await layout(mobile,'match-touch');await mobile.screenshot({path:`${out}/match-touch.png`,fullPage:true});cases.push('mobile touch-to-match');
    await mobile.close();assert.deepEqual(errors,[]);assert.equal(requests.some(r=>r.method!=='GET'),false);
    fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify({cases,decoded,layouts,errors,apiRequests:requests,realDatabaseWrites:0},null,2));
    console.log(JSON.stringify({cases:cases.length,layouts:layouts.length,decoded,errors,apiWrites:0}));
  } finally { await browser.close(); }
})().catch(error=>{fs.writeFileSync(`${out}/browser-failure.txt`,error.stack);console.error(error);process.exitCode=1;});
