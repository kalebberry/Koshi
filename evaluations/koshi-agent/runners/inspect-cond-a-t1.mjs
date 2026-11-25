import { buildTestPage } from './test-harness.mjs';
import { chromium } from '@playwright/test';

const html = `
<section class="native-hero">
  <figure class="hero-media"><img src="/visual.webp" alt="Visual" /></figure>
  <header class="hero-narrative">
    <span class="eyebrow">ESSAY 01</span>
    <h1>Spatial Cadence and Lattice Structure</h1>
    <p>Exploring proportional relationships in modern architectural facades.</p>
    <a href="#read" class="cta">Read Article →</a>
  </header>
</section>
`;

const css = `
.native-hero {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 24px;
  align-items: start;
}
.hero-media {
  aspect-ratio: 16 / 9;
  margin: 0;
  background: #e0deda;
  min-height: 200px;
}
.hero-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.hero-narrative {
  padding: 1.5rem;
  background: #ffffff;
}
@media (max-width: 768px) {
  .native-hero {
    grid-template-columns: 1fr;
  }
}
`;

const pageHtml = buildTestPage({ html, css, condition: 'A', containerWidth: 360 });
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 800 });
await page.setContent(pageHtml);

const info = await page.evaluate(() => {
  const hero = document.querySelector('.native-hero');
  const comp = window.getComputedStyle(hero);
  return {
    gridTemplateColumns: comp.gridTemplateColumns,
    frameWidth: document.getElementById('eval-frame').getBoundingClientRect().width,
    heroWidth: hero.getBoundingClientRect().width,
    mediaWidth: hero.querySelector('.hero-media').getBoundingClientRect().width,
    textWidth: hero.querySelector('.hero-narrative').getBoundingClientRect().width,
    hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  };
});

await browser.close();
console.log('Condition A Task 1 in 1200px viewport, 360px container:');
console.log(info);
