import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});const errors=[],checks=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}});page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.APP_URL||'http://127.0.0.1:4173';await page.goto(base+'/#network-lab');
 assert.deepEqual(await page.locator('#module-menu [data-module]').evaluateAll(a=>a.map(x=>x.dataset.module)),['lab','classroom','osi']);
 assert(await page.locator('#world').isVisible());await page.locator('#message').fill('Keep my experiment 🌍');await page.locator('#send').click();await page.locator('#play').click();
 const events=await page.locator('#event-count').innerText();
 await page.locator('.lab-plain-guide summary').click();assert.match(await page.locator('.lab-plain-guide').innerText(),/receipts/);
 await page.locator('#notebook-page').selectOption('ARP Cache');await page.locator('.notebook-plain-guide summary').click();assert.match(await page.locator('.notebook-plain-guide').innerText(),/local IP/);
 await page.screenshot({path:'docs/screenshots/structured-lab-desktop.png',fullPage:true});
 checks.push('Exactly three main sections, with original lab controls and optional plain-language help');
 await page.locator('#trail').click();await page.waitForSelector('[data-chapter]');assert.equal(await page.locator('[data-chapter]').count(),6);assert.equal(await page.locator('[data-module][aria-current]').getAttribute('data-module'),'lab');
 await page.locator('#close-modal').click();
 await page.locator('[data-module="classroom"]').click();await page.waitForSelector('[data-cn-unit]');
 for(let unit=1;unit<=5;unit++){await page.locator(`[data-cn-unit="${unit}"]`).click();assert.match(page.url(),new RegExp('#cn-unit-'+unit+'$'));assert((await page.locator('[data-concept]').count())>0);}
 await page.locator('#close-modal').click();
 checks.push('All six lab missions retained inside the lab; all five course units keep correct URLs');
 await page.locator('[data-module="osi"]').click();await page.waitForSelector('#osi-canvas');assert.equal(await page.locator('[data-osi-layer]').count(),7);assert.equal(await page.locator('.osi-explorer-views button').count(),3);assert.equal(await page.locator('#osi-formats-table').count(),0);
 await page.locator('#osi-connected-open').click();await page.waitForSelector('#connected-title');assert.equal(await page.locator('[data-module][aria-current]').getAttribute('data-module'),'osi');assert.equal(await page.locator('[data-connected-side]').count(),14);assert.equal(await page.locator('#osi-formats-table').count(),0);
 await page.locator('#connected-formats-open').click();assert.equal(await page.locator('#osi-formats-table tbody tr').count(),7);assert(await page.locator('#modal').isVisible());await page.locator('#formats-message').fill('Shared hello 🌍');await page.locator('#close-modal').click();assert.equal(await page.locator('#osi-formats-table').count(),0);assert.equal(await page.locator('#connected-message').inputValue(),'Shared hello 🌍');
 await page.locator('#osi-worlds-open').click();await page.waitForSelector('#osi-canvas');assert.equal(await page.locator('#osi-message').inputValue(),'Shared hello 🌍');
 checks.push('OSI worlds and whole journey share one parent; data formats expand once and share the message');
 await page.locator('[data-module="lab"]').click();await page.locator('#lab').waitFor({state:'visible'});assert.equal(await page.locator('#message').inputValue(),'Keep my experiment 🌍');assert.equal(await page.locator('#event-count').innerText(),events);
 await page.locator('#trail').click();await page.locator('[data-chapter="0"]').click();assert(await page.locator('#challenge').isVisible());
 await page.locator('#settings').click();assert(await page.locator('#sound-volume').isVisible());await page.locator('#close-modal').click();
 checks.push('Previous lab experiment survives navigation; missions, notebook, faults and sound controls remain');
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));for(const module of ['lab','classroom','osi'])assert(await page.locator(`[data-module="${module}"]`).isVisible());await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'docs/screenshots/structured-lab-mobile.png',fullPage:true});
 checks.push('All three sections remain accessible on phones with no horizontal page overflow');
 assert.deepEqual(errors,[]);fs.writeFileSync('docs/module-verification.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
}finally{await browser.close();}
