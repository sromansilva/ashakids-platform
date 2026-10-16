// DEV-only synthetic fixture; it intercepts APIs before networking.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try {
    const page=await browser.newPage({viewport:{width:1280,height:950}});
    await page.addInitScript(()=>{const NativeAudio=Audio;window.__audio=[];window.Audio=function(){const a=new NativeAudio();window.__audio.push(a);return a;};});
    await page.goto('http://127.0.0.1:5174/tests/world-map-harness.html');await page.waitForLoadState('networkidle');
    await page.getByRole('button',{name:'Abrir Taller de los Sonidos',exact:true}).focus();await page.keyboard.press('Enter');
    await page.getByRole('button',{name:/Jugar nivel 3:/}).focus();await page.keyboard.press('Enter');
    const token=page.getByRole('button',{name:'Escuchar ficha 1',exact:true});await token.focus();await page.keyboard.press('Space');
    await page.waitForFunction(()=>window.__audio.at(-1)?.ended);
    const id=await page.evaluate(()=>window.__audio.at(-1).src.split('/').at(-1).replace('.mp3',''));
    const name={cow:'Vaca',cat:'Gato',dog:'Perro',chick:'Pollito'}[id];
    await page.getByRole('button',{name:`Relacionar con ${name}`,exact:true}).focus();await page.keyboard.press('Enter');
    assert.equal(await token.isDisabled(),true);
    await page.getByRole('button',{name:'Volver a niveles',exact:true}).focus();await page.keyboard.press('Enter');
    assert.equal(await page.getByRole('button',{name:/Jugar nivel 3:/}).evaluate(el=>el===document.activeElement),true);
    fs.writeFileSync('docs/evidence/sounds-v97/keyboard-results.json',JSON.stringify({keyboardOnlyMatching:true,enterAndSpace:true,focusRestored:true,realApi:false},null,2));
    console.log('PASS: pareja completa con Space/Enter y retorno de foco. Datos sintéticos.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
