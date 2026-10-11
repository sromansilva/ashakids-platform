const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const out = 'docs/evidence/landing-v55';
(async () => {
 const browser = await chromium.launch({headless:true,channel:'chrome'});
 try {
  const page = await browser.newPage({viewport:{width:1536,height:1024}});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/v1/**',r=>r.fulfill({status:401,contentType:'application/json',body:'{}'}));
  await page.goto('http://127.0.0.1:5176'); await page.locator('h1').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('.landing-ashi-hero').evaluate(img=>img.decode());
  const baseline=JSON.parse(fs.readFileSync(`${out}/landing-baseline.json`,'utf8'));
  const content=await page.evaluate(()=>({text:document.querySelector('.asha-landing').innerText,buttons:[...document.querySelectorAll('.asha-landing button')].map(e=>({text:e.textContent.trim(),label:e.getAttribute('aria-label'),disabled:e.disabled})),links:[...document.querySelectorAll('.asha-landing a')].map(e=>({text:e.textContent,label:e.getAttribute('aria-label'),href:e.getAttribute('href')}))}));
  const words=text=>text.trim().split(/\s+/).sort();
  assert.deepEqual(words(content.text),words(baseline.text),'All visible words preserved');
  assert.deepEqual(content.buttons,baseline.buttons,'All button names and disabled states preserved');
  assert.deepEqual(content.links,baseline.links,'All link names and destinations preserved');
  const layouts=[];
  for(const [width,height] of [[1536,1024],[1440,1000],[1280,900]]) {
   await page.setViewportSize({width,height});
   await page.evaluate(()=>document.getElementById('root').scrollTo(0,0));
   await page.evaluate(async()=>{for(const img of document.querySelectorAll('.asha-landing img')){img.loading='eager';await img.decode();}});
   const layout=await page.evaluate(()=>({width:innerWidth, overflow:document.getElementById('root').scrollWidth>innerWidth, smallButtons:[...document.querySelectorAll('.asha-landing button')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().height<44).map(e=>e.textContent), font:getComputedStyle(document.querySelector('h1')).fontFamily,images:[...document.querySelectorAll('.asha-landing img')].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})), hero:document.querySelector('.landing-reference-hero').getBoundingClientRect().toJSON(),audience:document.querySelector('.landing-audience').getBoundingClientRect().toJSON()}));
   assert.equal(layout.overflow,false); assert.deepEqual(layout.smallButtons,[]);
   const clearance=await page.evaluate(()=>({dockLeft:document.querySelector('.landing-assistant-dock').getBoundingClientRect().left,contentRight:Math.max(...[...document.querySelectorAll('.landing-section .landing-container')].map(e=>e.getBoundingClientRect().right))}));
   assert.ok(clearance.contentRight<clearance.dockLeft,'Lower sections leave room for the floating dock'); layout.dockClearance=clearance.dockLeft-clearance.contentRight;
   assert.ok(layout.images.every(i=>i.loaded)); layouts.push(layout);
   await page.screenshot({path:`${out}/desktop-${width}.png`});
  }
  const faqs=page.locator('.landing-faq-item button'); const answers=[];
  assert.equal(await faqs.count(),5);
  for(let i=0;i<5;i++) { await faqs.nth(i).click(); answers.push(await page.locator('.landing-faq-answer').innerText()); await faqs.nth(i).click(); assert.equal(await faqs.nth(i).getAttribute('aria-expanded'),'false'); }
  assert.deepEqual(answers,JSON.parse(fs.readFileSync('docs/evidence/landing-v51/browser-results.json','utf8')).faqs,'Preserve all existing FAQ answers');
  assert.equal(await page.getByRole('link',{name:/WhatsApp/}).count(),1);
  assert.equal(await page.getByRole('link',{name:/WhatsApp/}).getAttribute('href'),'https://wa.me/51986309426?text=Hola%20AshaKids%2C%20necesito%20ayuda.');
  await page.setViewportSize({width:1536,height:1024});
  await page.evaluate(()=>document.getElementById('root').scrollTo(0,0));
  await page.getByRole('button',{name:'Abrir Ashi, asistente de demostración'}).click();
  await page.getByText('Demo',{exact:true}).waitFor();
  await page.getByText(/Esta conversación es una demostración/).waitFor();
  await page.locator('.ashi-up').evaluate(async e=>{await Promise.all(e.getAnimations().map(a=>a.finished));});
  await page.screenshot({path:`${out}/ashi-demo.png`});
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Abrir Ashi, asistente de demostración');
  const destinations=[];
  for(const [label,path] of [['Conocer ASHAKids','/sobre-nosotros'],['Explorar Mundo ASHA','/mundo-asha'],['Familias','/login'],['Terapeutas','/especialistas'],['Mundo ASHA','/mundo-asha']]) {
   await page.goto('http://127.0.0.1:5176'); await page.locator('h1').waitFor();
   const button=label==='Mundo ASHA'?page.locator('.landing-audience-card').nth(2):label==='Familias'?page.locator('.landing-audience-card').nth(0):label==='Terapeutas'?page.locator('.landing-audience-card').nth(1):page.getByRole('button',{name:label,exact:true});
   await button.click(); const actual=new URL(page.url()).pathname; assert.equal(actual,path); destinations.push({label,actual});
  }
  await page.goto('http://127.0.0.1:5176'); await page.locator('h1').waitFor();
  await page.getByRole('textbox',{name:'Newsletter semanal · Gratis'}).fill('prueba@example.invalid');
  const newsletterRequests=[];
  await page.getByRole('button',{name:'Suscribirme gratis'}).click();
  await page.getByRole('alert').filter({hasText:'Acepta el consentimiento'}).waitFor();
  let failNewsletter=false;
  await page.route('**/api/v1/newsletter/suscripciones',async r=>{
   newsletterRequests.push(r.request().postDataJSON());
   await r.fulfill({status:failNewsletter?503:200,contentType:'application/json',body:JSON.stringify(failNewsletter?{detail:'Servicio de prueba no disponible'}:{message:'Revisa tu correo para confirmar la suscripción.'})});
  });
  await page.getByRole('checkbox',{name:'Acepto recibir consejos y novedades de ASHAKids.'}).check();
  await page.getByRole('button',{name:'Suscribirme gratis'}).click();
  await page.getByRole('status').filter({hasText:'Revisa tu correo'}).waitFor();
  assert.deepEqual(newsletterRequests[0],{email:'prueba@example.invalid',consent:true});
  failNewsletter=true;
  await page.getByRole('button',{name:'Suscribirme gratis'}).click();
  await page.getByRole('alert').filter({hasText:'Servicio de prueba no disponible'}).waitFor();
  assert.equal(await page.locator('#landing-email').getAttribute('aria-invalid'),'true');
  failNewsletter=false;
  await page.getByRole('button',{name:'Suscribirme gratis'}).click();
  await page.getByRole('status').filter({hasText:'Revisa tu correo'}).waitFor();
  assert.equal(newsletterRequests.length,3);
  await page.goto('http://127.0.0.1:5176'); await page.locator('h1').waitFor();
  const lowerImages=await page.locator('.landing-section img').evaluateAll(es=>es.map(e=>e.getAttribute('src')));
  assert.equal(new Set(lowerImages).size,lowerImages.length,'Each lower illustration has a unique source');
  await page.getByRole('textbox',{name:'Newsletter semanal · Gratis'}).fill('');
  await page.getByRole('link',{name:'Preguntas frecuentes',exact:true}).click();
  assert.equal(new URL(page.url()).hash,'#landing-faq');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.landing-audience-card').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  await page.setViewportSize({width:1536,height:1024});
  for(const section of ['steps','services','team','stories','faq','newsletter']) {
   await page.locator(`.landing-${section}`).scrollIntoViewIfNeeded();
   await page.locator(`.landing-${section}`).screenshot({path:`${out}/${section}.png`});
  }
  await page.evaluate(()=>{for(const e of [document.documentElement,document.body,document.getElementById('root')]){e.style.height='auto';e.style.overflow='visible';}window.scrollTo(0,0);});
  await page.screenshot({path:`${out}/desktop-complete.png`,fullPage:true});
  assert.deepEqual(errors,[]);
  fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify({content:'same visible words, button names/disabled states, anchor names/destinations as merged dev ca9e1b3 before visual changes',layouts,answers,destinations,newsletterRequests,lowerImages,errors,scope:'Desktop only; API intercepted; catalog/newsletter API mocked; no backend, SMTP or WhatsApp delivery tested.'},null,2));
  console.log(JSON.stringify({layouts:layouts.map(l=>l.width),faqs:answers.length,destinations,errors}));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
