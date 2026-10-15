// Synthetic UI verification. Every API request is intercepted before network access.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = process.env.EVIDENCE_OUT || 'docs/evidence/world-map-v70';
const preview = process.env.PREVIEW_URL || 'http://127.0.0.1:5176';
fs.mkdirSync(out,{recursive:true});
const names = ['Taller de los Sonidos','La Isla de las Palabras','Ritmo de las Palabras','El Estudio de la Voz','Laboratorio de los Gestos'];
const codes = ['HABLA','LENGUAJE','FLUIDEZ','VOZ','OROFACIAL'];
const titles = ['Escucha y elige','Encuentra la palabra','Ordena la historia'];
function initial(id=901) {
  return { id_paciente:id,version:'basica-1',experiencia:0,nivel:1,medallas:[],intentos_totales:0,experiencia_siguiente_nivel:200,
    mundos:codes.map((code,i)=>({id:code,version:'basica-1',name:names[i],description:'Explora sonidos y palabras con actividades básicas de selección y orden.',asignado:id===901,completados:[],intentos:0,medalla:false,
      levels:[1,2,3].map(number=>({number,title:titles[number-1],prompt:number===3?'Ordena la frase: primero alguien, luego una acción.':'Encuentra el animal que dice miau.',choices:number===3?['El gato','duerme']:['Gato','Perro','Pato','Conejo'],sequence:number===3}))}))};
}
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  const errors=[],layouts=[],requests=[];
  let data=initial(),reject=false,delay=0;
  try {
    const page=await browser.newPage({viewport:{width:1536,height:1024}});
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/api/v1/**',async route=>{
      const req=route.request(),path=new URL(req.url()).pathname.replace('/api/v1','');
      requests.push({method:req.method(),path});
      let body=[],status=200;
      if(path==='/pacientes') body=[{id_paciente:901,nombres_paciente:'Ana',apellidos_paciente:'Demo',activo:true},{id_paciente:902,nombres_paciente:'Luis',apellidos_paciente:'Demo',activo:true}];
      if(path==='/pacientes/901/juegos') {body=reject?{detail:'Error sintético de conexión.'}:data;status=reject?503:200;}
      if(path==='/pacientes/902/juegos') body=initial(902);
      if(path.endsWith('/intentos')) {
        if(delay) await new Promise(resolve=>setTimeout(resolve,delay));
        const sent=req.postDataJSON(),code=path.split('/').at(-2),w=data.mundos.find(w=>w.id===code);
        const correct=sent.respuestas.join('|')===(sent.nivel===3?'El gato|duerme':'Gato');
        const xp=correct&&!w.completados.includes(sent.nivel)?100:0;
        data={...data,experiencia:data.experiencia+xp,intentos_totales:data.intentos_totales+1,mundos:data.mundos.map(w=>w.id===code?{...w,intentos:w.intentos+1,completados:correct?[...new Set([...w.completados,sent.nivel])]:w.completados}:w)};
        body={id_intento:data.intentos_totales,correcto:correct,experiencia_otorgada:xp,repetido:false,resumen:data};
      }
      await route.fulfill({status,contentType:'application/json',headers:{'X-Total-Count':path==='/pacientes'?'2':'0'},body:JSON.stringify(body)});
    });
    for(const width of [1536,1440,1280]) {
      await page.setViewportSize({width,height:1024});
      await page.goto(`${preview}/tests/world-map-harness.html?verify=1`);
      await page.locator('.asha-world-map').waitFor();
      await page.evaluate(()=>document.fonts.ready);
      await page.locator('.asha-island-art').first().evaluate(img=>img.decode());
      await page.waitForTimeout(300);
      const layout=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,map:document.querySelector('.asha-world-map').getBoundingClientRect().toJSON(),brokenImages:[...document.querySelectorAll('.asha-worlds img')].filter(img=>!img.complete||!img.naturalWidth).map(img=>img.src),smallButtons:[...document.querySelectorAll('.asha-worlds button')].filter(btn=>btn.getBoundingClientRect().height<44).map(btn=>btn.textContent)}));
      assert.equal(layout.overflow,false);assert.deepEqual(layout.brokenImages,[]);assert.deepEqual(layout.smallButtons,[]);
      assert.equal(await page.locator('.asha-world-island').count(),5);layouts.push(layout);
      await page.screenshot({path:`${out}/map-${width}.png`});
    }
    await page.setViewportSize({width:1536,height:1024});
    const first=page.getByRole('button',{name:`Abrir ${names[0]}`,exact:true});
    await first.hover();await page.waitForTimeout(300);
    assert.notEqual(await first.locator('img').evaluate(img=>getComputedStyle(img).transform),'none');
    await page.screenshot({path:`${out}/map-hover-1536.png`});
    for(const name of names) {
      await page.getByRole('button',{name:`Abrir ${name}`,exact:true}).click();
      await page.getByRole('button',{name:'Jugar nivel 3',exact:true}).waitFor();
      await page.locator('.asha-route-scenery').evaluate(img=>img.decode());
      await page.screenshot({path:`${out}/levels-${codes[names.indexOf(name)].toLowerCase()}-1536.png`});
      await page.getByRole('button',{name:'Jugar nivel 1',exact:true}).focus();
      await page.keyboard.press('Enter');
      const dialog=page.getByRole('dialog');await dialog.waitFor();
      assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true);
      for(let i=0;i<14;i++) {await page.keyboard.press('Tab');assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true);}
      await page.screenshot({path:`${out}/game-${codes[names.indexOf(name)].toLowerCase()}-1536.png`});
      await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
      assert.equal(await page.getByRole('button',{name:'Jugar nivel 1',exact:true}).evaluate(btn=>btn===document.activeElement),true);
      await page.getByRole('button',{name:'Volver a mundos',exact:true}).click();
    }
    await page.getByRole('button',{name:`Abrir ${names[0]}`,exact:true}).click();
    await page.getByRole('button',{name:'Jugar nivel 3',exact:true}).click();
    await page.getByRole('button',{name:'El gato',exact:true}).click();await page.getByRole('button',{name:'duerme',exact:true}).click();
    delay=800;await page.getByRole('button',{name:'Comprobar y guardar',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Cerrar juego'}).isDisabled(),true);
    await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),1);
    await page.getByText(/Intento guardado.*100 XP/).waitFor();
    await page.getByRole('button',{name:'Regresar al listado de niveles'}).click();
    await page.getByRole('button',{name:'Repetir nivel 3'}).waitFor();assert.equal(data.mundos[0].completados.join(','),'3');
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('.asha-level-square').first().evaluate(btn=>getComputedStyle(btn).transitionDuration),'0s');
    await page.getByLabel('Hijo o hija').selectOption('902');
    await page.getByRole('heading',{name:'Mundos pendientes para Luis'}).waitFor();
    assert.equal(await page.locator('.asha-world-island:disabled').count(),5);
    await page.screenshot({path:`${out}/map-unassigned-1536.png`});
    reject=true;await page.reload();await page.getByLabel('Hijo o hija').selectOption('901');
    await page.getByRole('alert').filter({hasText:'Error sintético'}).waitFor();
    assert.equal(await page.locator('.asha-world-map').count(),0);
    await page.screenshot({path:`${out}/error-1536.png`});
    reject=false;await page.getByRole('button',{name:'Reintentar',exact:true}).click();await page.locator('.asha-world-map').waitFor();
    assert.deepEqual(errors,[]);
    fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify({layouts,errors,requests,checks:['5 worlds','desktop 1536/1440/1280','hover','5 level maps and modals','keyboard focus and Escape','pending save prevents close','level 3 first','child isolation','unassigned','error and retry','reduced motion'],scope:'Synthetic API only; desktop. No real API writes. Responsive deferred.'},null,2));
    console.log(JSON.stringify({result:'PASS',layouts:layouts.map(l=>({width:l.width,overflow:l.overflow})),errors,requests:requests.length}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
