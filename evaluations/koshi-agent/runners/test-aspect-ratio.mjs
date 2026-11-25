import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`
    <style>
      .cq { container-type: inline-size; width: 326px; }
      .card {
        aspect-ratio: 16/9;
        box-sizing: border-box;
        min-width: 0;
        background: lime;
      }
      @container (min-width: 480px) {
        .card { min-height: 220px; }
      }
    </style>
    <div class="cq">
      <div class="card" id="card">Card</div>
    </div>
  `);
  const res = await page.evaluate(() => {
    const el = document.getElementById('card');
    return { w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height };
  });
  console.log('Container query remedy at 326px:', res);

  await page.evaluate(() => {
    document.querySelector('.cq').style.width = '600px';
  });
  const resWide = await page.evaluate(() => {
    const el = document.getElementById('card');
    return { w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height };
  });
  console.log('Container query remedy at 600px:', resWide);

  await browser.close();
}
run();
