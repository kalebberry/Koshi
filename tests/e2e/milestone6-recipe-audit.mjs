import { chromium, firefox, webkit } from '@playwright/test';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { recipes } from '../../src/lib/compositions.ts';
import { exportHTML, exportCSS, exportBoth } from '../../src/lib/export.ts';

// Ensure screenshots directory exists
mkdirSync(resolve('tests/e2e/screenshots'), { recursive: true });

const koshiCss = readFileSync(resolve('src/styles/koshi.css'), 'utf8');

// Serves the full Koshi CSS + standalone export test page
function buildHtmlForRecipe(recipe, containerWidth = 1200) {
  const exported = exportHTML(recipe);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${recipe.title}</title>
  <style>
    ${koshiCss}
    ${exportCSS}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #faf9f6; font-family: -apple-system, sans-serif; padding: 24px; }
    .wrapper { width: ${containerWidth}px; max-width: 100%; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e0deda; }
  </style>
</head>
<body>
  <div class="wrapper" id="test-wrapper">
    ${exported}
  </div>
</body>
</html>`;
}

let currentHtml = '';
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(currentHtml);
});

server.listen(4331, '127.0.0.1', async () => {
  console.log(`Auditing all 72 Composition Recipes across archetypes...`);
  console.log(`Total recipes loaded: ${recipes.length}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const auditResults = [];
  const representativeWidths = [320, 375, 480, 512, 640, 768, 900, 1024, 1200];

  // 1. Audit every single one of the 72 recipes at 1200px
  for (let i = 0; i < recipes.length; i++) {
    const r = recipes[i];
    currentHtml = buildHtmlForRecipe(r, 1200);
    await page.goto('http://127.0.0.1:4331');

    const metrics = await page.evaluate(() => {
      const wrapper = document.getElementById('test-wrapper');
      const comp = wrapper.querySelector('.kos-composition');
      const grids = Array.from(comp.querySelectorAll('.kos-grid'));
      
      const gridMetrics = grids.map((grid) => {
        const blocks = Array.from(grid.querySelectorAll('[kos-col-span]'));
        return {
          blockCount: blocks.length,
          scrollWidth: grid.scrollWidth,
          clientWidth: grid.clientWidth,
          overflow: grid.scrollWidth > grid.clientWidth + 1,
          blocks: blocks.map((b) => ({
            span: b.getAttribute('kos-col-span'),
            offset: b.getAttribute('kos-offset'),
            rowSpan: b.getAttribute('kos-row-span'),
            subgrid: b.getAttribute('kos-subgrid'),
            width: b.getBoundingClientRect().width,
            x: b.getBoundingClientRect().x - grid.getBoundingClientRect().x
          }))
        };
      });

      return {
        compScrollWidth: comp.scrollWidth,
        compClientWidth: comp.clientWidth,
        compOverflow: comp.scrollWidth > comp.clientWidth + 1,
        gridMetrics
      };
    });

    // Also verify export HTML and CSS packaging validity
    const htmlExport = exportHTML(r);
    const bothExport = exportBoth(r);
    const validExport = htmlExport.length > 50 && bothExport.includes(exportCSS) && bothExport.includes('class="kos-composition"');

    const hasOverflow = metrics.compOverflow || metrics.gridMetrics.some((g) => g.overflow);

    auditResults.push({
      index: i + 1,
      id: r.id,
      title: r.title,
      category: r.category,
      categoryLabel: r.categoryLabel,
      signature: r.signature,
      rowCount: r.rows.length,
      blockCount: r.rows.reduce((sum, row) => sum + row.length, 0),
      layoutValid: !hasOverflow,
      exportValid: validExport,
      overflow: hasOverflow,
      metrics
    });
  }

  // 2. Responsive threshold audit on representative recipes from each archetype
  console.log(`Running responsive width tests across 9 container widths...`);
  const archetypeRepRecipes = [
    'bento-hero-stack',
    'hero-split-16-9',
    'feat-subgrid-triad',
    'edit-magazine-asymmetric',
    'gal-asymmetric-mosaic',
    'lat-tatami-modular'
  ];
  const responsiveResults = [];

  for (const recipeId of archetypeRepRecipes) {
    const r = recipes.find((x) => x.id === recipeId);
    if (!r) continue;

    for (const width of representativeWidths) {
      currentHtml = buildHtmlForRecipe(r, width);
      await page.goto('http://127.0.0.1:4331');

      const respMetrics = await page.evaluate((w) => {
        const wrapper = document.getElementById('test-wrapper');
        const comp = wrapper.querySelector('.kos-composition');
        const firstGrid = comp.querySelector('.kos-grid');
        const style = window.getComputedStyle(firstGrid);
        const cols = style.gridTemplateColumns.trim().split(/\s+/).length;
        const isSingleCol = cols === 1;

        return {
          width: w,
          cols,
          isSingleCol,
          compScrollWidth: comp.scrollWidth,
          compClientWidth: comp.clientWidth,
          overflow: comp.scrollWidth > comp.clientWidth + 1
        };
      }, width);

      responsiveResults.push({
        recipeId,
        category: r.category,
        ...respMetrics
      });
    }
  }

  // 3. Root font size rem threshold variation audit (20px root font)
  console.log(`Running root font size variation test...`);
  const rBento = recipes.find((x) => x.id === 'bento-hero-stack');
  currentHtml = `<!DOCTYPE html>
<html lang="en" style="font-size: 20px;">
<head>
  <meta charset="utf-8">
  <style>
    ${koshiCss}
    ${exportCSS}
  </style>
</head>
<body>
  <div style="width: 900px;" id="font-test-wrapper">
    ${exportHTML(rBento)}
  </div>
</body>
</html>`;
  await page.goto('http://127.0.0.1:4331');
  const rootFontMetrics = await page.evaluate(() => {
    const comp = document.querySelector('.kos-composition');
    const firstGrid = comp.querySelector('.kos-grid');
    const cols = window.getComputedStyle(firstGrid).gridTemplateColumns.trim().split(/\s+/).length;
    // At 20px root font, default collapse threshold 48rem = 48 * 20 = 960px.
    // In a 900px container (< 960px), it should collapse to 1 column!
    return {
      containerWidth: 900,
      cols,
      collapsed: cols === 1
    };
  });

  // 4. Cross-browser check on Firefox and WebKit for representative recipes
  console.log(`Running cross-browser validation on Firefox and WebKit...`);
  const crossBrowserSummary = {};

  for (const [engineName, browserType] of [
    ['Firefox', firefox],
    ['WebKit', webkit]
  ]) {
    const b = await browserType.launch();
    const p = await b.newPage();
    const engineResults = [];

    for (const recipeId of archetypeRepRecipes) {
      const r = recipes.find((x) => x.id === recipeId);
      currentHtml = buildHtmlForRecipe(r, 1200);
      await p.goto('http://127.0.0.1:4331');

      const res = await p.evaluate(() => {
        const comp = document.querySelector('.kos-composition');
        return {
          overflow: comp.scrollWidth > comp.clientWidth + 1
        };
      });
      engineResults.push({ recipeId, overflow: res.overflow });
    }

    crossBrowserSummary[engineName] = engineResults;
    await b.close();
  }

  console.log('--- AUDIT SUMMARY ---');
  const passedLayouts = auditResults.filter((r) => r.layoutValid).length;
  const passedExports = auditResults.filter((r) => r.exportValid).length;
  console.log(`72 Recipe Audit: ${passedLayouts} / 72 layouts valid, ${passedExports} / 72 exports valid.`);
  console.log(`Root font rem test:`, JSON.stringify(rootFontMetrics));
  console.log(`Cross-browser summary:`, JSON.stringify(crossBrowserSummary));

  // Write full JSON report to file for inspection
  const fullAuditReport = {
    totalRecipes: recipes.length,
    passedLayouts,
    passedExports,
    archetypes: ['bento', 'hero', 'features', 'editorial', 'gallery', 'lattice'],
    auditResults: auditResults.map((r) => ({
      index: r.index,
      id: r.id,
      title: r.title,
      category: r.category,
      categoryLabel: r.categoryLabel,
      signature: r.signature,
      rowCount: r.rowCount,
      blockCount: r.blockCount,
      layoutValid: r.layoutValid,
      exportValid: r.exportValid,
      overflow: r.overflow
    })),
    responsiveResults,
    rootFontMetrics,
    crossBrowserSummary
  };

  const { writeFileSync } = await import('node:fs');
  writeFileSync(resolve('tests/e2e/recipe-audit-results.json'), JSON.stringify(fullAuditReport, null, 2));
  console.log('Saved recipe-audit-results.json.');

  await browser.close();
  server.close();
  process.exit(0);
});
