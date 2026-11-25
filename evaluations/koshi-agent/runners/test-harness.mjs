import { chromium, firefox, webkit } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';

const koshiCss = fs.readFileSync(path.resolve('src/styles/koshi.css'), 'utf8');

/**
 * Builds the test HTML document.
 * If condition === 'A', Kōshi CSS is excluded (Native CSS baseline).
 * If condition === 'B' | 'C' | 'D', Kōshi CSS is included.
 */
export function buildTestPage({ html, css = '', condition = 'C', containerWidth = 1200 }) {
  const includeKoshi = condition !== 'A';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Koshi Benchmark Trial (${condition})</title>
  <style>
    ${includeKoshi ? koshiCss : ''}
    * { box-sizing: border-box; }
    body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #faf9f6; }
    .eval-container-frame {
      width: ${containerWidth}px;
      max-width: 100%;
      margin: 0 auto;
      background: #ffffff;
      padding: 16px;
      border: 1px solid #ddd;
    }
    ${css}
  </style>
</head>
<body>
  <div class="eval-container-frame" id="eval-frame">
    ${html}
  </div>
</body>
</html>`;
}

/**
 * Executes browser assertions for a given trial snippet across 360px, 768px, and 1200px.
 */
export async function evaluateSnippet({ html, css = '', condition = 'C', browserType = 'chromium' }) {
  let currentHtml = '';
  const port = 4350 + Math.floor(Math.random() * 100);
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(currentHtml);
  });

  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));

  const engine = browserType === 'firefox' ? firefox : browserType === 'webkit' ? webkit : chromium;
  const browser = await engine.launch({ headless: true });
  const page = await browser.newPage();

  const widths = [360, 768, 1200];
  const results = {
    condition,
    browser: browserType,
    widths: {},
    allContainmentPass: true,
    responsiveStackPass: false,
    wideMultiColPass: false,
    alignmentDelta: 0
  };

  try {
    for (const w of widths) {
      await page.setViewportSize({ width: Math.max(w + 32, 400), height: 800 });
      currentHtml = buildTestPage({ html, css, condition, containerWidth: w });
      await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });

      const metrics = await page.evaluate(() => {
        const frame = document.getElementById('eval-frame');
        const scrollWidth = document.documentElement.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;
        const hasOverflow = scrollWidth > clientWidth;

        // Query direct children or main layout blocks
        const children = Array.from(frame.querySelectorAll('div, section, article, figure, aside, main, header, footer'));
        const boxes = children.slice(0, 10).map(el => {
          const r = el.getBoundingClientRect();
          const comp = window.getComputedStyle(el);
          return {
            tag: el.tagName.toLowerCase(),
            className: el.className,
            id: el.id,
            width: Math.round(r.width * 10) / 10,
            height: Math.round(r.height * 10) / 10,
            x: Math.round(r.left * 10) / 10,
            y: Math.round(r.top * 10) / 10,
            display: comp.display,
            gridColumn: comp.gridColumn,
            gridTemplateColumns: comp.gridTemplateColumns,
            flexGrow: comp.flexGrow,
            flexBasis: comp.flexBasis
          };
        });

        // Check if bottom buttons / CTAs exist and measure alignment
        const buttons = Array.from(frame.querySelectorAll('a.btn, button, .cta, .kos-card__cta, footer a'));
        let maxDeltaY = 0;
        if (buttons.length >= 2) {
          const buttonYs = buttons.map(b => b.getBoundingClientRect().top);
          const minY = Math.min(...buttonYs);
          const maxY = Math.max(...buttonYs);
          maxDeltaY = Math.round((maxY - minY) * 10) / 10;
        }

        return {
          scrollWidth,
          clientWidth,
          hasOverflow,
          boxes,
          maxDeltaY,
          buttonCount: buttons.length
        };
      });

      results.widths[w] = metrics;
      if (metrics.hasOverflow) {
        results.allContainmentPass = false;
      }
    }

    // Determine responsive stacking (narrow 360 has single column / stacked blocks)
    const narrowBoxes = results.widths[360].boxes.filter(b => b.width > 250);
    results.responsiveStackPass = narrowBoxes.length >= 1;

    // Determine wide multi-column (wide 1200 has side-by-side elements with different x)
    const wideBoxes = results.widths[1200].boxes.filter(b => b.width > 100);
    const uniqueXs = new Set(wideBoxes.map(b => Math.round(b.x / 50) * 50));
    results.wideMultiColPass = uniqueXs.size >= 2;

    // Subgrid / button alignment on wide
    results.alignmentDelta = results.widths[1200].maxDeltaY;

  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }

  return results;
}
