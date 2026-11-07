/** Start a local Next server, then run with VILLAGE_BASE_URL if not port 3038. */
import { chromium, type Page } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import { MISSIONS } from '../src/lib/commandments/missions';
import { STORAGE_KEY } from '../src/lib/commandments/model';
const base = process.env.VILLAGE_BASE_URL || 'http://127.0.0.1:3038';
const out = process.env.VILLAGE_SCREENSHOTS || path.resolve('..');
async function run() {
  const browser = await chromium.launch({ headless:true });
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1050}});
    const errors: string[]=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',route=>new URL(route.request().url()).hostname.match(/^(localhost|127\.0\.0\.1)$/) ? route.continue() : route.abort());
    await page.goto(base+'/play',{waitUntil:'networkidle',timeout:120000});
    assert.ok(await page.getByRole('link',{name:'Play Love Your Neighbor Village',exact:true}).count());
    await page.getByRole('link',{name:'Play Love Your Neighbor Village',exact:true}).click();
    await page.waitForURL('**/play/ten-commandments');
    await page.locator('aside nav').waitFor({state:'visible'});
    assert.equal(await page.locator('aside nav').count(),1);
    await page.getByRole('button',{name:'Start village tour',exact:false}).click();
    const firstIds: string[]=[];
    async function getMission(p: Page) {
      const id=await p.locator('[data-mission-id]').getAttribute('data-mission-id');
      const m=MISSIONS.find(m=>m.id===id);assert.ok(m);return m;
    }
    for(let i=0;i<5;i++) {
      const m=await getMission(page);firstIds.push(m.id);
      assert.equal(await page.locator('.nv-answer').count(),3);
      if(i===0) {
        const wrong=m.choices.find(c=>c.id!==m.correctId)!;
        await page.getByRole('button',{name:wrong.text,exact:false}).click();
        await page.getByRole('status').filter({hasText:'Not quite.'}).waitFor();
        assert.match((await page.locator('.nv-progress').getAttribute('aria-label'))! ,/^0 of 5/);
        assert.equal(await page.locator('.nv-answer:disabled').count(),0);
      }
      const yes=m.choices.find(c=>c.id===m.correctId)!;
      if(i===1) { await page.getByRole('button',{name:yes.text,exact:false}).focus(); await page.keyboard.press('Enter'); }
      else await page.getByRole('button',{name:yes.text,exact:false}).click();
      await page.locator('.nv-feedback-good').waitFor();
      // Simulate duplicate DOM click after success; no second garden growth.
      await page.locator('.nv-answer-correct').evaluate(el=>{(el as HTMLButtonElement).click();(el as HTMLButtonElement).click();});
      assert.equal(await page.locator('.nv-progress').getAttribute('aria-label'),`${i+1} of 5 missions completed`);
      assert.equal(await page.locator('.nv-answer:disabled').count(),3);
      if(i===0) await page.screenshot({path:path.join(out,'ckc-commandments-desktop.png'),fullPage:true});
      await page.getByRole('button',{name:i===4?'See your garden':'Continue',exact:false}).click();
    }
    await page.getByRole('heading',{name:'Your garden is blooming!'}).waitFor();
    assert.equal(await page.locator('.nv-review li').count(),5);
    await page.screenshot({path:path.join(out,'ckc-commandments-complete.png'),fullPage:true});
    await page.reload({waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Start village tour',exact:false}).click();
    const secondHistory=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),STORAGE_KEY);
    assert.equal(secondHistory.seen.length,10);
    assert.equal(new Set(secondHistory.seen).size,10);
    assert.ok(secondHistory.coverage.every((n:number)=>n===1));
    assert.ok(!firstIds.includes((await getMission(page)).id));
    // Location selection and New Game: five questions belong to selected location.
    for(const l of ['Church','Home','School','Playground']) {
      await page.getByRole('button',{name:`Play five missions at ${l}`,exact:true}).click();
      assert.equal((await getMission(page)).location,l.toLowerCase());
      const before=await page.locator('[data-mission-id]').getAttribute('data-mission-id');
      await page.getByRole('button',{name:`New game · ${l}`,exact:true}).click();
      assert.notEqual(await page.locator('[data-mission-id]').getAttribute('data-mission-id'),before);
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'desktop overflow');
    await page.setViewportSize({width:390,height:844});
    await page.goto(base+'/play/ten-commandments',{waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Bible & Faith',exact:true}).click();
    await page.locator('aside nav').waitFor({state:'visible'});
    await page.getByRole('button',{name:'Hide navigation',exact:true}).click();
    await page.locator('aside nav').waitFor({state:'hidden'});
    await page.getByRole('button',{name:'Play five missions at School',exact:true}).click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile overflow');
    await page.screenshot({path:path.join(out,'ckc-commandments-mobile.png'),fullPage:true});
    // Corrupt and unavailable storage still play.
    await page.evaluate(key=>localStorage.setItem(key,'{broken'),STORAGE_KEY);
    await page.reload({waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Start village tour',exact:false}).click();
    assert.ok(await getMission(page));
    const blocked=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('blocked')};Storage.prototype.setItem=()=>{throw new Error('blocked')};});
    await blocked.goto(base+'/play/ten-commandments',{waitUntil:'networkidle',timeout:120000});
    await blocked.getByRole('button',{name:'Start village tour',exact:false}).click();
    assert.ok(await getMission(blocked));
    await blocked.locator('.nv-help summary').click();
    await blocked.getByText('Browser storage is unavailable.',{exact:false}).waitFor();
    assert.deepEqual(errors,[],'no client errors');
    console.log('PASS: hub/direct route/sidebar; wrong retry; correct; keyboard; disabled double score; five complete; restart; reload balance/repeats; all locations; corrupt/blocked storage; reduced motion; mobile overflow.');
  } finally { await browser.close(); }
}
run().catch(e=>{console.error(e);process.exitCode=1;});
