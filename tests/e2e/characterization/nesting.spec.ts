import { test, expect } from '@playwright/test';

/**
 * Kōshi Milestone 3: Nested Layout Characterization
 *
 * Measures and records empirical behavior of nested compositions:
 * - Grid nested inside Grid
 * - Flexbox nested inside Flexbox
 * - Grid nested inside Flexbox
 * - Flexbox nested inside Grid
 * - Nested custom properties (--kos-gutter, --kos-cols) inheritance and override
 * - Nested .kos-container offset compounding at representative widths (1200px, 800px, 360px)
 */

test.describe('Nested Layout Characterization Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('Grid nested inside Grid establishes local formatting context', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" id="outer-grid">
          <div kos-col-span="6" id="outer-cell">
            <div class="kos-grid" kos-cols="12" id="inner-grid">
              <div kos-col-span="6" id="inner-half-1">Inner 1</div>
              <div kos-col-span="6" id="inner-half-2">Inner 2</div>
            </div>
          </div>
          <div kos-col-span="6" id="outer-sibling">Sibling</div>
        </div>
      `;
    });

    // Outer grid span-6 cell: (1200 - 24) / 2 = 588px
    const outerCell = await page.locator('#outer-cell').boundingBox();
    expect(outerCell!.width).toBeCloseTo(588, 0);

    // Inner grid divides outer cell's 588px into 12 tracks:
    // Inner span-6: (588 - 24) / 2 = 282px
    const inner1 = await page.locator('#inner-half-1').boundingBox();
    const inner2 = await page.locator('#inner-half-2').boundingBox();
    expect(inner1!.width).toBeCloseTo(282, 0);
    expect(inner2!.width).toBeCloseTo(282, 0);
    expect(Math.abs(inner1!.y - inner2!.y)).toBeLessThan(1.0);
  });

  test('Flexbox nested inside Grid establishes local flex row', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12">
          <div kos-col-span="8" id="grid-cell">
            <div class="kos-flex-grid" id="inner-flex">
              <div kos-col-span="6" id="flex-half-1">Flex 1</div>
              <div kos-col-span="6" id="flex-half-2">Flex 2</div>
            </div>
          </div>
          <div kos-col-span="4" id="grid-side">Side</div>
        </div>
      `;
    });

    // Grid cell 8 tracks: 1200 * 8/12 - 24 * 4/12 = 800 - 8 = 792px
    const gridCell = await page.locator('#grid-cell').boundingBox();
    expect(gridCell!.width).toBeCloseTo(792, 0);

    // Inner flex divides 792px: (792 - 24) / 2 = 384px
    const flex1 = await page.locator('#flex-half-1').boundingBox();
    const flex2 = await page.locator('#flex-half-2').boundingBox();
    expect(flex1!.width).toBeCloseTo(384, 0);
    expect(flex2!.width).toBeCloseTo(384, 0);
    expect(Math.abs(flex1!.y - flex2!.y)).toBeLessThan(1.0);
  });

  test('Grid nested inside Flexbox preserves grid column structure', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid">
          <div kos-col-span="12" id="flex-row">
            <div class="kos-grid" kos-cols="4" id="nested-grid-in-flex">
              <div class="col" id="col-1">1</div>
              <div class="col" id="col-2">2</div>
              <div class="col" id="col-3">3</div>
              <div class="col" id="col-4">4</div>
            </div>
          </div>
        </div>
      `;
    });

    const col1 = await page.locator('#col-1').boundingBox();
    // 1200px with 3 gaps of 24px = 1200 - 72 = 1128 / 4 = 282px
    expect(col1!.width).toBeCloseTo(282, 0);
  });

  test('nested custom property overrides scope cleanly to subtree', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" style="--kos-gutter: 24px;" id="root-grid">
          <div kos-col-span="6" id="default-gutter-cell">G24</div>
          <div kos-col-span="6" style="--kos-gutter: 8px;" id="override-gutter-cell">
            <div class="kos-grid" kos-cols="2" id="nested-dense-grid">
              <div class="dense-item" id="dense-1">D1</div>
              <div class="dense-item" id="dense-2">D2</div>
            </div>
          </div>
        </div>
      `;
    });

    // Outer cell width: (1200 - 24) / 2 = 588px
    const overrideCell = await page.locator('#override-gutter-cell').boundingBox();
    expect(overrideCell!.width).toBeCloseTo(588, 0);

    // Inner grid inherits local --kos-gutter: 8px
    // (588 - 8) / 2 = 290px per item
    const d1 = await page.locator('#dense-1').boundingBox();
    const d2 = await page.locator('#dense-2').boundingBox();
    expect(d1!.width).toBeCloseTo(290, 0);
    expect(d2!.width).toBeCloseTo(290, 0);
    // Verified local gap = d2.x - (d1.x + d1.width) = 8px
    expect(d2!.x - (d1!.x + d1!.width)).toBeCloseTo(8, 0);
  });

  test('nested .kos-container offset behavior at 1200px, 800px, and 360px', async ({ page }) => {
    // Characterize empirical width when .kos-container is placed inside another .kos-container
    // Formula: width: min(var(--max-width), calc(100% - clamp(1rem, 3.5vw, 3.5rem)))
    // In viewport 1280px, 3.5vw = 44.8125px

    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-container" id="outer-c">
          <div class="kos-container" id="inner-c">
            <div id="content">Inner Content</div>
          </div>
        </div>
      `;
    });

    const outer1200 = await page.locator('#outer-c').boundingBox();
    const inner1200 = await page.locator('#inner-c').boundingBox();

    // In Playwright 1280px viewport, 3.5vw = 44.8px. Outer = 1200 - 44.8 = 1155.2px
    expect(outer1200!.width).toBeCloseTo(1155.2, 0);
    // Inner container subtracts another 44.8px offset from outer = 1110.4px
    expect(inner1200!.width).toBeCloseTo(1110.4, 0);
    // Verified empirical inset compounding: outer minus inner equals the offset exactly
    expect(outer1200!.width - inner1200!.width).toBeCloseTo(44.8, 0);

    // Viewport resize check: at 800px width
    await page.setViewportSize({ width: 800, height: 720 });
    await page.evaluate(() => {
      document.getElementById('stage')!.style.width = '800px';
    });

    const outer800 = await page.locator('#outer-c').boundingBox();
    const inner800 = await page.locator('#inner-c').boundingBox();
    // In 800px viewport, 3.5vw = 28px. Outer = 800 - 28 = 772px
    expect(outer800!.width).toBeCloseTo(772, 0);
    // Inner = 772 - 28 = 744px
    expect(inner800!.width).toBeCloseTo(744, 0);
    expect(outer800!.width - inner800!.width).toBeCloseTo(28, 0);

    // Narrow mobile viewport: 360px width
    await page.setViewportSize({ width: 360, height: 720 });
    await page.evaluate(() => {
      document.getElementById('stage')!.style.width = '360px';
    });

    const outer360 = await page.locator('#outer-c').boundingBox();
    const inner360 = await page.locator('#inner-c').boundingBox();
    // In 360px viewport, 3.5vw is 12.6px -> clamped to min 1rem = 16px
    // Outer = 360 - 16 = 344px
    expect(outer360!.width).toBeCloseTo(344, 0);
    // Inner = 344 - 16 = 328px
    expect(inner360!.width).toBeCloseTo(328, 0);
    expect(outer360!.width - inner360!.width).toBeCloseTo(16, 0);
  });
});
