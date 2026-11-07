import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
const base=process.env.VILLAGE_BASE_URL || 'http://127.0.0.1:3038';
const out=process.env.VILLAGE_SCREENSHOTS || path.resolve('..');
async function run(){
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1050}});
  await page.goto(base+'/play/ten-commandments',{waitUntil:'networkidle'});
  for(const name of ['village','church','home','school','playground']){
   const response=await page.request.get(base+`/games/neighbor-village/${name}.webp`);
   assert.equal(response.status(),200,name+' asset');
   assert.match(response.headers()['content-type'],/image\/webp/);
  }
  await page.waitForFunction(()=>{const i=document.querySelector('.nv-map-image') as HTMLImageElement;return i?.complete&&i.naturalWidth>0;});
  assert.equal(await page.locator('.nv-map-art').count(),0,'old flat map removed');
  const centers=[['church',.25,.30],['home',.76,.32],['playground',.25,.68],['school',.76,.68]] as const;
  for(const [location,x,y] of centers){
   const map=await page.locator('.nv-map-image').boundingBox();assert.ok(map);
   // Click painted building itself, not merely its text sign.
   await page.mouse.click(map.x+map.width*x,map.y+map.height*y);
   await page.waitForFunction(l=>document.querySelector('[data-mission-id]')?.getAttribute('data-mission-id')?.startsWith(l+'-'),location);
   assert.equal(await page.getByRole('button',{name:`Play five missions at ${location[0].toUpperCase()+location.slice(1)}`,exact:true}).getAttribute('aria-pressed'),'true');
   const scene=page.locator('.nv-scene-image');
   assert.match((await scene.getAttribute('src'))!,new RegExp(location));
   assert.match((await scene.getAttribute('alt'))!,/^Representative /);
   await page.waitForFunction(()=>{const i=document.querySelector('.nv-scene-image') as HTMLImageElement;return i?.complete&&i.naturalWidth>0;});
   const bounds=await scene.boundingBox();assert.ok(bounds);
   assert.ok(Math.abs(bounds.width/bounds.height-16/9)<.02,'no subject cropping');
   if(location==='school') await page.screenshot({path:path.join(out,'ckc-commandments-watercolor-desktop.png'),fullPage:true});
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Play five missions at School',exact:true}).click();
  await page.waitForFunction(()=>{const i=document.querySelector('.nv-scene-image') as HTMLImageElement;return i?.complete&&i.naturalWidth>0;});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile overflow');
  await page.screenshot({path:path.join(out,'ckc-commandments-watercolor-mobile.png'),fullPage:true});
  console.log('PASS: all five WebP URLs; real generated map/scenes; painted-building hits; representative alt; full 16:9 subjects; desktop/mobile layout.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
