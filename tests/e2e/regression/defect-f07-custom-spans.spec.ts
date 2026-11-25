import { test, expect } from '@playwright/test';

/**
 * Defect F-07 Regression Suite: Custom Column & Row Span Cascade Collisions
 *
 * Problem Statement:
 * In browsers supporting CSS Values & Units Level 5 typed attr(), the rules:
 *   .kos-grid > [kos-col-span] { grid-column-end: span attr(kos-col-span type(<integer>), 1); }
 *   .kos-grid > [kos-row-span] { grid-row: span attr(kos-row-span type(<integer>), 1); }
 * have specificity (0, 2, 0), overriding:
 *   [kos-col-span='custom'] { grid-column-end: span var(--kos-col-span, 1); } (specificity 0, 1, 0)
 *   [kos-row-span='custom'] { grid-row: span var(--kos-row-span, 1); }       (specificity 0, 1, 0)
 * Because attr("custom" type(<integer>), 1) fails integer parsing, it falls back to 1 track,
 * stomping author-declared custom track spans.
 *
 * Approved Specificity-Preserving Correction:
 *   .kos-grid > [kos-col-span]:where(:not([kos-col-span='custom']))
 *   .kos-grid > [kos-row-span]:where(:not([kos-row-span='custom']))
 */

test.describe('Defect F-07 — Custom Column and Row Span Cascade Collision Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('F-07.1: custom column span (6 tracks) renders 588px in 1200px container', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" style="gap: 24px;">
          <div kos-col-span="custom" style="--kos-col-span: 6;" id="target-custom-col">Custom 6</div>
        </div>
      `;
    });

    const item = page.locator('#target-custom-col');
    const colEnd = await item.evaluate((el) => window.getComputedStyle(el).gridColumnEnd);
    const rect = await item.boundingBox();

    // 1200px container with 24px gap:
    // 12 tracks: track width = (1200 - 11 * 24) / 12 = 936 / 12 = 78px
    // 6 tracks = 6 * 78 + 5 * 24 = 468 + 120 = 588px
    expect(colEnd).toBe('span 6');
    expect(rect!.width).toBeCloseTo(588, 0);
  });

  test('F-07.2: custom row span (3 rows) spans across 3 row tracks', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" style="grid-template-rows: repeat(4, 80px); gap: 24px;" id="grid-rows">
          <div kos-col-span="6" kos-row-span="custom" style="--kos-row-span: 3;" id="tall-custom-row">Tall 3 Rows</div>
          <div kos-col-span="6" id="r1" style="height: 80px;">R1</div>
          <div kos-col-span="6" id="r2" style="height: 80px;">R2</div>
          <div kos-col-span="6" id="r3" style="height: 80px;">R3</div>
          <div kos-col-span="6" id="r4" style="height: 80px;">R4</div>
        </div>
      `;
    });

    const tall = page.locator('#tall-custom-row');
    const computedRow = await tall.evaluate((el) => window.getComputedStyle(el).gridRow);
    const tallBox = await tall.boundingBox();
    const r1 = await page.locator('#r1').boundingBox();
    const r2 = await page.locator('#r2').boundingBox();
    const r3 = await page.locator('#r3').boundingBox();
    const r4 = await page.locator('#r4').boundingBox();

    // Verify computed grid-row
    expect(computedRow).toBe('span 3');

    // Tall starts at line 1 with r1
    expect(Math.abs(tallBox!.y - r1!.y)).toBeLessThan(1.0);

    // Track relationships: tall occupies rows 1, 2, and 3 in column 1-6.
    // r1 is in row 1 (y = 8), r2 in row 2 (y = 112), r3 in row 3 (y = 216).
    // Because tall spans 3 rows, r4 cannot take row 2 or 3 and is pushed to row 4 (y = 320)
    expect(r2!.y).toBeGreaterThan(r1!.y);
    expect(r3!.y).toBeGreaterThan(r2!.y);
    expect(r4!.y).toBeGreaterThan(r3!.y);
    expect(r4!.y - r3!.y).toBeCloseTo(104, 0); // 80px track + 24px gap = 104px
  });

  test('F-07.3: combined custom column and row spans on a single grid item', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" style="grid-template-rows: repeat(3, 100px); gap: 24px;">
          <div kos-col-span="custom" kos-row-span="custom" style="--kos-col-span: 8; --kos-row-span: 2;" id="combo-custom">Combo</div>
          <div kos-col-span="4" id="combo-r1" style="height: 100px;">R1</div>
          <div kos-col-span="4" id="combo-r2" style="height: 100px;">R2</div>
          <div kos-col-span="12" id="combo-r3" style="height: 100px;">R3</div>
        </div>
      `;
    });

    const item = page.locator('#combo-custom');
    const colEnd = await item.evaluate((el) => window.getComputedStyle(el).gridColumnEnd);
    const rowEnd = await item.evaluate((el) => window.getComputedStyle(el).gridRow);
    const rect = await item.boundingBox();
    const r1 = await page.locator('#combo-r1').boundingBox();
    const r2 = await page.locator('#combo-r2').boundingBox();
    const r3 = await page.locator('#combo-r3').boundingBox();

    // 8 column tracks: (1200 - 264) * (8/12) + 7 * 24 = 624 + 168 = 792px
    expect(colEnd).toBe('span 8');
    expect(rowEnd).toBe('span 2');
    expect(rect!.width).toBeCloseTo(792, 0);

    // Track geometry: item spans rows 1 and 2 in cols 1-8.
    // combo-r1 takes cols 9-12 in row 1 (same y as combo)
    expect(Math.abs(rect!.y - r1!.y)).toBeLessThan(1.0);
    // combo-r2 takes cols 9-12 in row 2
    expect(r2!.y).toBeGreaterThan(r1!.y);
    // combo-r3 must be pushed to row 3 below the 2-row combo item
    expect(r3!.y).toBeGreaterThan(r2!.y);
  });

  test('F-07.4: custom column span combined with kos-offset preserves both offset and custom span', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" style="gap: 24px;">
          <div kos-offset="2" kos-col-span="custom" style="--kos-col-span: 4;" id="offset-custom">Offset 2 Custom 4</div>
        </div>
      `;
    });

    const item = page.locator('#offset-custom');
    const start = await item.evaluate((el) => window.getComputedStyle(el).gridColumnStart);
    const rect = await item.boundingBox();

    // Offset 2 sets start line 3: 2 * 78 + 2 * 24 = 204px
    expect(start).toBe('3');
    expect(rect!.x).toBeCloseTo(204, 0);
    // Custom 4 spans 4 tracks = 384px
    expect(rect!.width).toBeCloseTo(384, 0);
  });

  test('F-07.5: numeric spans alongside custom spans evaluate independently without cascade bleed', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" style="gap: 24px;">
          <div kos-col-span="6" id="num-span">Numeric 6</div>
          <div kos-col-span="custom" style="--kos-col-span: 6;" id="custom-span">Custom 6</div>
        </div>
      `;
    });

    const numRect = await page.locator('#num-span').boundingBox();
    const custRect = await page.locator('#custom-span').boundingBox();

    // Both should be 588px and share the row
    expect(numRect!.width).toBeCloseTo(588, 0);
    expect(custRect!.width).toBeCloseTo(588, 0);
    expect(Math.abs(numRect!.y - custRect!.y)).toBeLessThan(1.0);
  });

  test('F-07.6: missing custom property value falls back cleanly to 1 track', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" style="gap: 24px;">
          <div kos-col-span="custom" id="missing-prop-item">Missing var</div>
        </div>
      `;
    });

    const rect = await page.locator('#missing-prop-item').boundingBox();
    // Fallback var(--kos-col-span, 1) evaluates to 1 track = 78px
    expect(rect!.width).toBeCloseTo(78, 0);
  });

  test('F-07.7: nested custom spans evaluate relative to local cell width', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" style="gap: 24px;">
          <div kos-col-span="8" id="outer-cell">
            <div class="kos-grid" kos-cols="12" style="gap: 24px;">
              <div kos-col-span="custom" style="--kos-col-span: 6;" id="inner-custom">Inner 6 of 12</div>
            </div>
          </div>
        </div>
      `;
    });

    const outer = await page.locator('#outer-cell').boundingBox();
    const inner = await page.locator('#inner-custom').boundingBox();

    // Outer cell width = 792px
    expect(outer!.width).toBeCloseTo(792, 0);
    // Inner grid in 792px with 24px gap:
    // 6 of 12 tracks = (792 - 24) / 2 = 384px
    expect(inner!.width).toBeCloseTo(384, 0);
  });
});
