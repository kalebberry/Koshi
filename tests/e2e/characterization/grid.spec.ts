import { test, expect } from '@playwright/test';

/**
 * Kōshi Milestone 3: CSS Grid Characterization
 *
 * Measures and records the empirical behavior of .kos-grid:
 * - Default intrinsic auto-fit/minmax sizing
 * - Automatic transition to 12-track explicit grid when child spans exist
 * - Explicit column count overrides (kos-cols="1..12, 16")
 * - Explicit column spans (kos-col-span="1..12")
 * - Combined spans exceeding row width and row wrapping
 * - Oversized spans and implicit track handling
 * - Offsets (kos-offset) and row spans (kos-row-span)
 * - Custom column/span properties via style* attributes
 */

test.describe('CSS Grid Characterization Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('default intrinsic grid uses auto-fit with minmax item sizing', async ({ page }) => {
    // Stage width = 1200px, min item size = 16rem = 256px (at 16px font), gap = 1.5rem = 24px
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" id="intrinsic-grid">
          <div class="item">Item 1</div>
          <div class="item">Item 2</div>
          <div class="item">Item 3</div>
          <div class="item">Item 4</div>
        </div>
      `;
    });

    const items = page.locator('#intrinsic-grid .item');
    const count = await items.count();
    expect(count).toBe(4);

    // In a 1200px container with 24px gap, 4 items of min 256px fit in 1 row:
    // (1200 - 3 * 24) / 4 = (1200 - 72) / 4 = 1128 / 4 = 282px
    const firstRect = await items.nth(0).boundingBox();
    const secondRect = await items.nth(1).boundingBox();
    expect(firstRect).not.toBeNull();
    expect(secondRect).not.toBeNull();

    // Verify all 4 items are in the same horizontal row
    expect(Math.abs(firstRect!.y - secondRect!.y)).toBeLessThan(1.0);
    // Verify each item gets equal fractional distribution (~282px)
    expect(firstRect!.width).toBeCloseTo(282, 0);
  });

  test('ordinary grid automatically transitions to 12 tracks when child has kos-col-span', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" id="auto-12-grid">
          <div kos-col-span="4" id="item-span-4">Span 4</div>
          <div id="item-unspanned">Unspanned</div>
        </div>
      `;
    });

    // Check computed grid-template-columns on the grid container
    const cols = await page.locator('#auto-12-grid').evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });

    // .kos-grid:not([kos-cols]):has(> [kos-col-span]) activates 12 tracks
    expect(cols).toBe(12);

    // In a 1200px container with 24px gap (11 gaps = 264px):
    // Available track space = 1200 - 264 = 936px
    // 1 track = 936 / 12 = 78px
    // Span 4 = 4 * 78 + 3 * 24 = 312 + 72 = 384px
    // Span 1 (unspanned default) = 1 * 78 = 78px
    const span4Rect = await page.locator('#item-span-4').boundingBox();
    const unspannedRect = await page.locator('#item-unspanned').boundingBox();

    expect(span4Rect!.width).toBeCloseTo(384, 0);
    expect(unspannedRect!.width).toBeCloseTo(78, 0);
  });

  test('explicit kos-cols="12" enforces 12-track layout regardless of child spans', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" id="explicit-12-grid">
          <div class="track" id="track-1">1</div>
          <div class="track" id="track-2">2</div>
        </div>
      `;
    });

    const colCount = await page.locator('#explicit-12-grid').evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    expect(colCount).toBe(12);

    const track1 = await page.locator('#track-1').boundingBox();
    expect(track1!.width).toBeCloseTo(78, 0);
  });

  test('explicit column spans 1 through 12 distribute across fractional tracks', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" id="spans-grid">
          <div kos-col-span="6" id="s6-a">Span 6 A</div>
          <div kos-col-span="6" id="s6-b">Span 6 B</div>
        </div>
      `;
    });

    const s6a = await page.locator('#s6-a').boundingBox();
    const s6b = await page.locator('#s6-b').boundingBox();

    // In 1200px with 24px gap:
    // Span 6 width = (1200 - 24) / 2 = 588px
    expect(s6a!.width).toBeCloseTo(588, 0);
    expect(s6b!.width).toBeCloseTo(588, 0);
    // They must share the same horizontal row
    expect(Math.abs(s6a!.y - s6b!.y)).toBeLessThan(1.0);
    // Outer right boundary must align with container width (588 + 24 + 588 = 1200px)
    expect(s6b!.x + s6b!.width).toBeCloseTo(1200, 0);
  });

  test('items whose combined spans exceed 12 tracks wrap to subsequent rows', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" id="wrap-grid">
          <div kos-col-span="4" id="item-4">Span 4</div>
          <div kos-col-span="10" id="item-10">Span 10</div>
        </div>
      `;
    });

    const item4 = await page.locator('#item-4').boundingBox();
    const item10 = await page.locator('#item-10').boundingBox();

    // 4 + 10 = 14 > 12. Grid cannot fit 10 in row 1, so item-10 wraps to row 2
    expect(item10!.y).toBeGreaterThan(item4!.y + item4!.height - 1.0);

    // Item 4 takes columns 1-4: width = 384px
    expect(item4!.width).toBeCloseTo(384, 0);

    // Item 10 takes columns 1-10 in row 2:
    // 10 tracks = 10 * 78 + 9 * 24 = 780 + 216 = 996px
    expect(item10!.width).toBeCloseTo(996, 0);
  });

  test('offsets (kos-offset) shift grid item starting track position', async ({ page }) => {
    // Characterize empirical behavior of kos-offset alone:
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" id="offset-grid">
          <div kos-offset="2" id="offset-item">Offset 2 Alone</div>
        </div>
      `;
    });

    // kos-offset="2" sets grid-column-start: 3 (starts at track 3 line)
    // 2 preceding tracks + 2 gaps = 2 * 78 + 2 * 24 = 156 + 48 = 204px
    const item = await page.locator('#offset-item').boundingBox();
    expect(item!.x).toBeCloseTo(204, 0);
    // Unspanned default takes 1 track = 78px
    expect(item!.width).toBeCloseTo(78, 0);
  });

  test('row spans (kos-row-span) extend vertically across grid tracks', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" id="row-span-grid">
          <div kos-col-span="6" kos-row-span="2" id="tall-item" style="height: 200px;">Tall</div>
          <div kos-col-span="6" id="row1-item" style="height: 80px;">R1</div>
          <div kos-col-span="6" id="row2-item" style="height: 80px;">R2</div>
        </div>
      `;
    });

    const tall = await page.locator('#tall-item').boundingBox();
    const r1 = await page.locator('#row1-item').boundingBox();
    const r2 = await page.locator('#row2-item').boundingBox();

    // Tall item starts at top with r1
    expect(Math.abs(tall!.y - r1!.y)).toBeLessThan(1.0);
    // r2 is placed directly below r1 in row 2
    expect(r2!.y).toBeGreaterThan(r1!.y);
  });

  test('custom tracks via kos-cols="custom" and style="--kos-cols: 5" render 5 columns', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1000px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="custom" style="--kos-cols: 5;" id="custom-grid">
          <div class="item">1</div>
          <div class="item">2</div>
        </div>
      `;
    });

    const cols = await page.locator('#custom-grid').evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });

    // With F-06 fixed, kos-cols="custom" avoids typed attr cascade collision and renders 5 tracks
    expect(cols).toBe(5);
  });
});
