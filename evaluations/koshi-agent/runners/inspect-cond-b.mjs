import { buildTestPage } from './test-harness.mjs';
import { chromium } from '@playwright/test';

const html = `
<section class="kos-composition" kos-collapse="sm">
  <div class="kos-sidebar-grid">
    <aside style="background:#f0f0f0;padding:1rem;">Nav Rail</aside>
    <main style="background:#fff;padding:1rem;">
      <h2>Dashboard</h2>
      <div class="kos-grid" kos-cols="2">
        <div style="background:#f8f8f8;padding:1rem;">Stat 1</div>
        <div style="background:#f8f8f8;padding:1rem;">Stat 2</div>
      </div>
    </main>
  </div>
</section>
`;

const pageHtml = buildTestPage({ html, condition: 'B', containerWidth: 360 });
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 800 });
await page.setContent(pageHtml);

const info = await page.evaluate(() => {
  const sb = document.querySelector('.kos-sidebar-grid');
  const comp = window.getComputedStyle(sb);
  return {
    gridTemplateColumns: comp.gridTemplateColumns,
    frameWidth: document.getElementById('eval-frame').getBoundingClientRect().width,
    sbWidth: sb.getBoundingClientRect().width,
    asideWidth: sb.querySelector('aside').getBoundingClientRect().width,
    mainWidth: sb.querySelector('main').getBoundingClientRect().width,
    docScrollWidth: document.documentElement.scrollWidth,
    docClientWidth: document.documentElement.clientWidth,
    hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  };
});

await browser.close();
console.log('Condition B in 1200px viewport, 360px container:');
console.log(info);
