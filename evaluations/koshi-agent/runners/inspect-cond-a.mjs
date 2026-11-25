import { buildTestPage } from './test-harness.mjs';
import { chromium } from '@playwright/test';

const html = `
<div class="dashboard-wrapper">
  <div class="dashboard-layout">
    <aside class="dashboard-nav">
      <nav><ul><li>Filter A</li><li>Filter B</li></ul></nav>
    </aside>
    <main class="dashboard-content">
      <h2>Analytics Overview</h2>
      <div class="stats-grid">
        <div class="stat-card"><strong>1,240</strong><span>Visits</span></div>
        <div class="stat-card"><strong>98.4%</strong><span>Uptime</span></div>
      </div>
    </main>
  </div>
</div>
`;

const css = `
.dashboard-wrapper { container-type: inline-size; }
.dashboard-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.stat-card { background: #f0f4f8; padding: 16px; border-radius: 4px; }
@container (max-width: 600px) {
  .dashboard-layout { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr; }
}
`;

const pageHtml = buildTestPage({ html, css, condition: 'A', containerWidth: 360 });
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 800 });
await page.setContent(pageHtml);

const info = await page.evaluate(() => {
  const dl = document.querySelector('.dashboard-layout');
  const comp = window.getComputedStyle(dl);
  return {
    gridTemplateColumns: comp.gridTemplateColumns,
    frameWidth: document.getElementById('eval-frame').getBoundingClientRect().width,
    layoutWidth: dl.getBoundingClientRect().width,
    asideWidth: dl.querySelector('aside').getBoundingClientRect().width,
    mainWidth: dl.querySelector('main').getBoundingClientRect().width
  };
});

await browser.close();
console.log('Condition A in 1200px viewport, 360px container:');
console.log(info);
