import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';

mkdirSync(resolve('tests/e2e/screenshots'), { recursive: true });

// Simple static server for dist/
const distDir = resolve('dist');
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2'
};

const server = createServer((req, res) => {
  let pathname = req.url.split('?')[0];
  if (pathname === '/') pathname = '/index.html';
  if (!extname(pathname)) pathname = join(pathname, 'index.html');

  const filePath = join(distDir, pathname);
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(readFileSync(filePath));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(4332, '127.0.0.1', async () => {
  console.log('Static server for dist/ running at http://127.0.0.1:4332');

  const browser = await chromium.launch();
  const consoleErrors = [];

  // =========================================================================
  // 1. DESKTOP COMPOSITION LAB INTERACTION & VISUAL VALIDATION
  // =========================================================================
  console.log('Testing Composition Lab on Desktop (1280x900)...');
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('http://127.0.0.1:4332/lab/');
  await page.waitForLoadState('networkidle');

  // Verify page title and header
  const title = await page.title();
  console.log(`Page title: ${title}`);

  // Screenshot Desktop Lab initial state
  await page.screenshot({ path: resolve('tests/e2e/screenshots/lab-desktop.png') });
  console.log('Captured lab-desktop.png');

  // Test Archetype Filter Tabs & capture archetype screenshots
  const categoryLabels = [
    { id: 'bento', label: 'Bento Mosaics' },
    { id: 'hero', label: 'Heroes & Mastheads' },
    { id: 'features', label: 'Structural Subgrids' },
    { id: 'editorial', label: 'Editorial Spreads' },
    { id: 'gallery', label: 'Media & Ratios' },
    { id: 'lattice', label: 'Lattice & Yohaku' },
  ];

  for (const cat of categoryLabels) {
    const tabSelector = `.category-pill:has-text("${cat.label}")`;
    await page.click(tabSelector);
    await page.waitForTimeout(400);

    // Verify study cards updated
    const tagText = await page.locator('.study-card .card-category-tag').first().textContent();
    console.log(`Tab ${cat.id} (${cat.label}) active; first study category tag: ${tagText}`);

    // Capture screenshot of detail preview for this archetype
    const detailEl = page.locator('.preview-stage');
    if (await detailEl.count() > 0) {
      await detailEl.screenshot({ path: resolve(`tests/e2e/screenshots/archetype-${cat.id}.png`) });
      console.log(`Captured archetype-${cat.id}.png`);
    }
  }

  // Switch back to Bento for slider and button tests
  await page.click('.category-pill:has-text("Bento Mosaics")');
  await page.waitForTimeout(200);

  // Test Shuffle set button
  await page.click('button:has-text("Shuffle set")');
  await page.waitForTimeout(200);

  // Test Study Selection
  const secondStudy = page.locator('.study-card').nth(1);
  await secondStudy.click();
  await page.waitForTimeout(200);

  // Test Width Slider: set to 600px
  await page.evaluate(() => {
    const slider = document.getElementById('preview-width');
    slider.value = '600';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(200);

  // Capture responsive collapse in preview stage at 600px
  const collapsedCanvas = page.locator('.preview-stage');
  await collapsedCanvas.screenshot({ path: resolve('tests/e2e/screenshots/responsive-collapse.png') });
  console.log('Captured responsive-collapse.png');

  // Reset Width Slider
  await page.click('.width-reset');
  await page.waitForTimeout(200);

  // Test Lattice guides toggle (kos-debug)
  const debugCheckbox = page.locator('label:has-text("Lattice guides") input');
  await debugCheckbox.check();
  await page.waitForTimeout(200);

  // Test Code View toggle
  await page.click('button:has-text("View HTML")');
  await page.waitForTimeout(200);
  const codePanelVisible = await page.locator('.code-panel').isVisible();
  const codeText = await page.locator('.code-panel code').textContent();
  console.log(`Code panel visible: ${codePanelVisible}, snippet length: ${codeText.length}`);

  // Test Copy Buttons
  await page.click('button:has-text("Copy HTML")');
  await page.waitForTimeout(200);

  // =========================================================================
  // 2. MOBILE COMPOSITION LAB USABILITY (375x667)
  // =========================================================================
  console.log('Testing Composition Lab on Mobile Viewport (375x667)...');
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await mobilePage.goto('http://127.0.0.1:4332/lab/');
  await mobilePage.waitForLoadState('networkidle');

  // Verify no horizontal overflow on mobile
  const mobileOverflow = await mobilePage.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Mobile page horizontal overflow: ${mobileOverflow}`);

  await mobilePage.screenshot({ path: resolve('tests/e2e/screenshots/lab-mobile.png'), fullPage: false });
  console.log('Captured lab-mobile.png');

  // =========================================================================
  // 3. DOCUMENTATION INDEX PAGE VALIDATION
  // =========================================================================
  console.log('Testing Documentation Page (/docs/)...');
  const docsPage = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await docsPage.goto('http://127.0.0.1:4332/docs/');
  await docsPage.waitForLoadState('networkidle');

  const docsTitle = await docsPage.title();
  console.log(`Docs title: ${docsTitle}`);

  // Screenshot Docs index
  await docsPage.screenshot({ path: resolve('tests/e2e/screenshots/docs-index.png') });
  console.log('Captured docs-index.png');

  // =========================================================================
  // 4. SPECIFIC VISUAL ARTIFACTS FOR CORE REFINEMENTS
  // =========================================================================
  console.log('Capturing specific visual artifacts for Core Refinements...');

  // A. Corrected Offset + Span
  const artifactPage = await browser.newPage({ viewport: { width: 1200, height: 400 } });
  const koshiCss = readFileSync(resolve('src/styles/koshi.css'), 'utf8');

  await artifactPage.setContent(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>
      ${koshiCss}
      body { background: #faf9f6; font-family: sans-serif; padding: 40px; }
      .kos-grid > div { background: #e8e3d8; border: 1px solid #c8c2b5; padding: 16px; border-radius: 4px; }
      .active { background: #2b3a4a !important; color: white !important; font-weight: bold; }
    </style></head>
    <body>
      <h3 style="margin-bottom: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #666;">
        F-05 Corrected: kos-offset="2" + kos-col-span="4" (Starts track 3, spans 4 tracks)
      </h3>
      <div class="kos-grid" kos-cols="12" style="background: white; border: 1px dashed #bbb; padding: 12px;">
        <div kos-offset="2" kos-col-span="4" class="active">Offset 2 + Span 4</div>
      </div>
    </body></html>
  `);
  await artifactPage.screenshot({ path: resolve('tests/e2e/screenshots/offset-span-corrected.png') });
  console.log('Captured offset-span-corrected.png');

  // B. Corrected Custom Columns (5 tracks)
  await artifactPage.setContent(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>
      ${koshiCss}
      body { background: #faf9f6; font-family: sans-serif; padding: 40px; }
      .kos-grid > div { background: #4a5d4e; color: white; padding: 16px; border-radius: 4px; text-align: center; }
    </style></head>
    <body>
      <h3 style="margin-bottom: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #666;">
        F-06 Corrected: kos-cols="custom" + style="--kos-cols: 5" (Renders exactly 5 columns)
      </h3>
      <div class="kos-grid" kos-cols="custom" style="--kos-cols: 5; background: white; border: 1px dashed #bbb; padding: 12px;">
        <div>Col 1</div><div>Col 2</div><div>Col 3</div><div>Col 4</div><div>Col 5</div>
      </div>
    </body></html>
  `);
  await artifactPage.screenshot({ path: resolve('tests/e2e/screenshots/custom-cols-5.png') });
  console.log('Captured custom-cols-5.png');

  // C. D-1 Flexbox Yohaku (Non-growing span 4 leaving negative space)
  await artifactPage.setContent(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>
      ${koshiCss}
      body { background: #faf9f6; font-family: sans-serif; padding: 40px; }
      .kos-flex-grid > div { background: #8b3a2b; color: white; padding: 16px; border-radius: 4px; text-align: center; }
    </style></head>
    <body>
      <h3 style="margin-bottom: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #666;">
        D-1 Approved: Single span-4 in Flexbox (Strict 384px basis, preserving 816px Yohaku)
      </h3>
      <div class="kos-flex-grid" style="background: white; border: 1px dashed #bbb; padding: 12px; min-height: 80px;">
        <div kos-col-span="4">Span 4 (Strict Non-Growing)</div>
      </div>
    </body></html>
  `);
  await artifactPage.screenshot({ path: resolve('tests/e2e/screenshots/flex-yohaku.png') });
  console.log('Captured flex-yohaku.png');

  // D. Subgrid card alignment
  await artifactPage.setContent(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><style>
      ${koshiCss}
      body { background: #faf9f6; font-family: sans-serif; padding: 40px; }
      .kos-card { background: white; border: 1px solid #dcd7ce; padding: 1.5rem; display: grid; grid-template-rows: subgrid; }
      .eyebrow { font-size: 0.75rem; text-transform: uppercase; color: #888; }
      .title { font-size: 1.25rem; font-weight: bold; margin: 0.5rem 0; }
      .desc { color: #555; line-height: 1.5; }
      .action { margin-top: 1rem; color: #8b3a2b; font-weight: bold; }
    </style></head>
    <body>
      <h3 style="margin-bottom: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #666;">
        Law III: Subgrid Card Alignment across Unequal Content Lengths
      </h3>
      <div class="kos-grid" kos-cols="12" style="grid-template-rows: auto auto auto auto;">
        <div kos-col-span="6" kos-row-span="4" class="kos-card" kos-subgrid="rows">
          <span class="eyebrow">Card 1</span>
          <h4 class="title">Short Header</h4>
          <p class="desc">Brief description paragraph.</p>
          <div class="action">Read More →</div>
        </div>
        <div kos-col-span="6" kos-row-span="4" class="kos-card" kos-subgrid="rows">
          <span class="eyebrow">Card 2</span>
          <h4 class="title">Extensive Multi-Line Editorial Header Spanning Multiple Lines of Typography</h4>
          <p class="desc">A much longer description paragraph illustrating how subgrid aligns the call-to-action footers to identical baseline tracks regardless of unequal content volume.</p>
          <div class="action">Read More →</div>
        </div>
      </div>
    </body></html>
  `);
  await artifactPage.screenshot({ path: resolve('tests/e2e/screenshots/subgrid-alignment.png') });
  console.log('Captured subgrid-alignment.png');

  // =========================================================================
  // 5. ACCESSIBILITY INSPECTION (KEYBOARD TAB ORDER & 200% ZOOM)
  // =========================================================================
  console.log('Testing Accessibility: Sequential Tab Flow & 200% Text Zoom...');
  await page.goto('http://127.0.0.1:4332/lab/');
  
  // Tab through first 5 focusable elements
  const focusedElements = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    const elInfo = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? { tagName: el.tagName, text: el.textContent?.trim().slice(0, 30), role: el.getAttribute('role') } : null;
    });
    if (elInfo) focusedElements.push(elInfo);
  }
  console.log('Keyboard Focus sequence:', JSON.stringify(focusedElements));

  // Test 200% text zoom on docs page
  await docsPage.evaluate(() => {
    document.documentElement.style.fontSize = '32px'; // 200% of 16px
  });
  const zoomOverflow = await docsPage.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Docs page horizontal overflow at 200% text zoom: ${zoomOverflow}`);

  console.log('--- LAB & VISUAL VALIDATION COMPLETE ---');
  console.log(`Total console errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Console errors:', consoleErrors);
  }

  await browser.close();
  server.close();
  process.exit(0);
});
