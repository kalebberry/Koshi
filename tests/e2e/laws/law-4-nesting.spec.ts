import { test, expect } from '@playwright/test';

/**
 * Kōshi Architectural Law IV — Nesting Acceptance Suite
 *
 * "Kōshi compositions should establish predictable local layout contexts."
 */

test.describe('Law IV — Nesting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('Grid inside Grid establishes local coordinate context', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12">
          <div kos-col-span="6" id="outer-cell">
            <div class="kos-grid" kos-cols="12" id="inner-grid">
              <div kos-col-span="6" id="inner-1">Inner 1</div>
              <div kos-col-span="6" id="inner-2">Inner 2</div>
            </div>
          </div>
          <div kos-col-span="6" id="outer-sibling">Sibling</div>
        </div>
      `;
    });

    const outerCell = await page.locator('#outer-cell').boundingBox();
    // (1200 - 24) / 2 = 588px
    expect(outerCell!.width).toBeCloseTo(588, 0);

    const inner1 = await page.locator('#inner-1').boundingBox();
    const inner2 = await page.locator('#inner-2').boundingBox();
    // Inner span 6: (588 - 24) / 2 = 282px
    expect(inner1!.width).toBeCloseTo(282, 0);
    expect(inner2!.width).toBeCloseTo(282, 0);
    expect(Math.abs(inner1!.y - inner2!.y)).toBeLessThan(1.0);
  });

  test('Grid inside Flexbox maintains grid geometry within flex cell', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid">
          <div kos-col-span="12" id="flex-wrapper">
            <div class="kos-grid" kos-cols="4" id="nested-grid">
              <div id="col-1">1</div>
              <div id="col-2">2</div>
              <div id="col-3">3</div>
              <div id="col-4">4</div>
            </div>
          </div>
        </div>
      `;
    });

    const col1 = await page.locator('#col-1').boundingBox();
    // 1200px with 3 gaps of 24px = 1200 - 72 = 1128 / 4 = 282px
    expect(col1!.width).toBeCloseTo(282, 0);
  });

  test('Flexbox inside Grid establishes independent wrapping row', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12">
          <div kos-col-span="8" id="grid-cell">
            <div class="kos-flex-grid" id="inner-flex">
              <div kos-col-span="6" id="flex-1">F1</div>
              <div kos-col-span="6" id="flex-2">F2</div>
            </div>
          </div>
          <div kos-col-span="4" id="grid-side">Side</div>
        </div>
      `;
    });

    const gridCell = await page.locator('#grid-cell').boundingBox();
    // 8 tracks: 1200 * 8/12 - 24 * 4/12 = 792px
    expect(gridCell!.width).toBeCloseTo(792, 0);

    const f1 = await page.locator('#flex-1').boundingBox();
    const f2 = await page.locator('#flex-2').boundingBox();
    // Inner flex 6 + 6: (792 - 24) / 2 = 384px
    expect(f1!.width).toBeCloseTo(384, 0);
    expect(f2!.width).toBeCloseTo(384, 0);
  });

  test('local custom properties override cleanly for subtree', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" style="--kos-gutter: 24px;">
          <div kos-col-span="6" id="cell-default">G24</div>
          <div kos-col-span="6" style="--kos-gutter: 12px;" id="cell-overridden">
            <div class="kos-grid" kos-cols="2" id="inner-grid-12">
              <div id="item-a">A</div>
              <div id="item-b">B</div>
            </div>
          </div>
        </div>
      `;
    });

    const a = await page.locator('#item-a').boundingBox();
    const b = await page.locator('#item-b').boundingBox();
    // Outer cell width: (1200 - 24) / 2 = 588px
    // Inner grid with local 12px gap: (588 - 12) / 2 = 288px per item
    expect(a!.width).toBeCloseTo(288, 0);
    expect(b!.width).toBeCloseTo(288, 0);
    // Gap distance between items is 12px
    expect(b!.x - (a!.x + a!.width)).toBeCloseTo(12, 0);
  });

  test('nested .kos-container maintains documented inset compounding', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-container" id="outer-c">
          <div class="kos-container" id="inner-c">
            <div id="content">Content</div>
          </div>
        </div>
      `;
    });

    const outer = await page.locator('#outer-c').boundingBox();
    const inner = await page.locator('#inner-c').boundingBox();

    // In 1280px viewport, 3.5vw = 44.80px offset
    // Outer = 1200 - 44.80 = 1155.20px
    // Inner = 1155.20 - 44.80 = 1110.40px
    expect(outer!.width).toBeCloseTo(1155.2, 0);
    expect(inner!.width).toBeCloseTo(1110.4, 0);
    expect(outer!.width - inner!.width).toBeCloseTo(44.8, 0);
  });
});
