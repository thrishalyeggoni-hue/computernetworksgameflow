import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});const checks=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}});
 page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.APP_URL||'http://127.0.0.1:5173';
 await page.goto(base+'/#osi-layer-7');await page.locator('#osi-connected-open').click();
 await page.waitForSelector('#connected-title');
 assert.match(page.url(),/#osi-connected$/);assert.equal(await page.locator('[data-connected-side]').count(),14);
 await page.locator('#connected-message').fill('Hello 🌍');
 assert.equal(await page.locator('#connected-byte-count').innerText(),'10 bytes');
 const sender=[7,6,5,4,3,2,1],receiver=[1,2,3,4,5,6,7];
 for(let step=0;step<15;step++){
  if(step)await page.locator('#connected-next').click();
  assert.equal(await page.locator('#connected-count').innerText(),`${step+1} / 15`);
  if(step===7)assert.equal(await page.locator('#connected-wire').getAttribute('aria-pressed'),'true');
  else{
   const active=page.locator('[data-connected-side][aria-current]');
   assert.equal(await active.getAttribute('data-connected-side'),step<7?'sender':'receiver');
   assert.equal(await active.getAttribute('data-connected-layer'),String(step<7?sender[step]:receiver[step-8]));
  }
  const wraps=[0,0,0,1,2,3,3,3,3,2,1,0,0,0,0][step];
  assert.equal(await page.locator('.connected-wrap').count(),wraps);
  if(step===5)await page.screenshot({path:'docs/screenshots/osi-connected-desktop.png',fullPage:true});
 }
 assert.equal(await page.locator('#connected-result').innerText(),'Hello 🌍');assert(await page.locator('#connected-next').isDisabled());
 checks.push('15 steps follow sender 7→1, link, receiver 1→7; headers nest and unwrap at the correct layers; original Unicode message arrives');
 await page.locator('[data-connected-side="sender"][data-connected-layer="3"]').click();assert.equal(await page.locator('#connected-count').innerText(),'5 / 15');
 await page.locator('#connected-wire').click();assert.equal(await page.locator('#connected-count').innerText(),'8 / 15');
 await page.locator('[data-connected-step="12"]').click();assert.equal(await page.locator('#connected-count').innerText(),'13 / 15');
 await page.locator('#connected-prev').click();assert.equal(await page.locator('#connected-count').innerText(),'12 / 15');
 checks.push('Both stacks, the physical link, progress markers and previous/next are selectable');
 await page.locator('#connected-reset').click();await page.locator('#connected-speed').selectOption('4');await page.locator('#connected-play').click();
 await page.waitForFunction(()=>document.querySelector('#connected-count').textContent==='3 / 15');
 await page.locator('#connected-play').click();const count=await page.locator('#connected-count').innerText();await page.waitForTimeout(650);assert.equal(await page.locator('#connected-count').innerText(),count);
 await page.locator('#connected-play').click();await page.waitForFunction(()=>document.querySelector('#connected-count').textContent==='15 / 15',null,{timeout:10000});
 assert(await page.locator('#connected-received').isVisible());
 checks.push('Play, pause, speed, replay and automatic completion work');
 await page.locator('#connected-message').fill('');assert.equal(await page.locator('#connected-count').innerText(),'1 / 15');assert.equal(await page.locator('#connected-byte-count').innerText(),'0 bytes');
 await page.locator('#connected-message').fill('Hi 🌍');await page.locator('[data-connected-step="4"]').click();await page.locator('#connected-explore').click();await page.waitForSelector('[data-osi-layer="3"][aria-current]');assert.equal(await page.locator('#osi-message').inputValue(),'Hi 🌍');
 await page.goBack();await page.waitForSelector('#connected-title');await page.reload();await page.waitForSelector('#connected-title');assert.equal(await page.locator('#connected-message').inputValue(),'Hi 🌍');
 checks.push('Layer-world links, shared message, empty input, reload and browser back work');
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-connected-side="receiver"][data-connected-layer="4"]').click();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'docs/screenshots/osi-connected-mobile.png',fullPage:true});
 await page.locator('[data-connected-step="0"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#connected-count').innerText(),'1 / 15');
 checks.push('390px layout has no horizontal overflow; keyboard and reduced-motion controls work');
 assert.deepEqual(errors,[]);fs.writeFileSync('docs/osi-connected-verification.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
}finally{await browser.close();}
