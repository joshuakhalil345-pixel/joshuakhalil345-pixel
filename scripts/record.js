const { chromium } = require('playwright');
const path = require('path');
(async ()=>{
  const file = path.resolve(__dirname, '..', 'standalone.html');
  const url = `file://${file}`;
  const outDir = path.resolve(__dirname, '..', 'videos');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: outDir, size: { width:1280, height:720 } }
  });
  const page = await context.newPage();
  await page.goto(url);
  // wait for scene to settle
  await page.waitForTimeout(800);
  // click Yes button
  const yes = await page.$('#yesBtn');
  if(yes) await yes.click();
  // wait for animations to play
  await page.waitForTimeout(3000);
  // close context to finalize video
  await context.close();
  await browser.close();
  console.log('Recording complete. Video saved in', outDir);
})();
