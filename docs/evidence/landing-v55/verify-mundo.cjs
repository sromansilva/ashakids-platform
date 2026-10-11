const {chromium}=require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'); const assert=require('node:assert/strict');
const out='docs/evidence/landing-v55';
const normalize=s=>s.replace(/🌎/g,'').replace(/ASHAKids/g,'AshaKids').trim();
const words=s=>normalize(s).split(/\s+/).sort();
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try {
  const page=await browser.newPage({viewport:{width:1536,height:1024}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const catalog=fs.readFileSync(`${out}/catalog-fixture.json`,'utf8'); let mode='success';let release;
  await page.route('**/api/v1/**',async route=>{
   if(!route.request().url().includes('/juegos/catalogo'))return route.fulfill({status:401,contentType:'application/json',body:'{}'});
   if(mode==='pending')await new Promise(resolve=>release=resolve);
   return route.fulfill({status:mode==='error'?503:200,contentType:'application/json',body:mode==='error'?JSON.stringify({detail:'Catálogo no disponible (prueba local)'}):catalog});
  });
  await page.goto('http://127.0.0.1:5176/mundo-asha');
  await page.locator('.mundo-card').nth(4).waitFor();await page.evaluate(()=>document.fonts.ready);
  const current=await page.evaluate(()=>({text:document.querySelector('.asha-mundo').innerText,buttons:[...document.querySelectorAll('#root button')].map(e=>({text:e.textContent.trim(),disabled:e.disabled})),links:[...document.querySelectorAll('#root a')].map(e=>({text:e.textContent,href:e.getAttribute('href')}))}));
  const baseline=JSON.parse(fs.readFileSync(`${out}/mundo-baseline.json`,'utf8'));
  assert.deepEqual(words(current.text),words(baseline.text),'All world content preserved; decorative globe replaced by image');
  assert.deepEqual(current.buttons.map(b=>({...b,text:normalize(b.text)})),baseline.buttons.map(b=>({...b,text:normalize(b.text)})));
  assert.deepEqual(current.links,baseline.links);
  const layouts=[];
  for(const [width,height] of [[1536,1024],[1440,1000],[1280,900]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>document.getElementById('root').scrollTo(0,0));
   await page.evaluate(async()=>{for(const img of document.querySelectorAll('.asha-mundo img')){img.loading='eager';await img.decode();}});
   const layout=await page.evaluate(()=>({width:innerWidth,overflow:document.getElementById('root').scrollWidth>innerWidth,font:getComputedStyle(document.querySelector('h1')).fontFamily,smallButtons:[...document.querySelectorAll('.asha-mundo button')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().height<44).map(e=>e.textContent)}));
   assert.equal(layout.overflow,false);assert.deepEqual(layout.smallButtons,[]);layouts.push(layout);
   await page.screenshot({path:`${out}/mundo-${width}.png`});
  }
  await page.setViewportSize({width:1536,height:1024});
  await page.evaluate(()=>{for(const e of [document.documentElement,document.body,document.getElementById('root')]){e.style.height='auto';e.style.overflow='visible';}window.scrollTo(0,0);});
  await page.screenshot({path:`${out}/mundo-complete.png`,fullPage:true});
  for(const selector of ['.mundo-hero .asha-btn','.mundo-card:nth-child(1) .asha-btn','.mundo-card:nth-child(5) .asha-btn','.mundo-cta .asha-btn']){
   await page.goto('http://127.0.0.1:5176/mundo-asha');await page.locator('.mundo-card').nth(4).waitFor();await page.locator(selector).click();assert.equal(new URL(page.url()).pathname,'/login');
  }
  mode='pending';await page.goto('http://127.0.0.1:5176/mundo-asha');await page.getByRole('status').waitFor();assert.equal(await page.getByRole('status').innerText(),'Cargando datos…');release();await page.locator('.mundo-card').nth(4).waitFor();
  mode='error';await page.reload();await page.getByRole('alert').waitFor({timeout:20000});await page.screenshot({path:`${out}/mundo-error.png`});
  mode='success';await page.getByRole('button',{name:'Reintentar'}).click();await page.locator('.mundo-card').nth(4).waitFor();assert.equal(await page.getByRole('alert').count(),0);
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.mundo-card').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/mundo-results.json`,JSON.stringify({contentPreserved:true,layouts,loginDestinations:4,states:['pending','error','retry recovery'],errors,fixture:'Static catalogue extracted from backend source; all API intercepted; no DB/session writes'},null,2));
  console.log(JSON.stringify({layouts:layouts.map(l=>l.width),cards:5,states:'PASS',errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
