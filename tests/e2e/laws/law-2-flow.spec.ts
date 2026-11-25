import { test, expect } from '@playwright/test';

/**
 * Kōshi Architectural Law II — Flow Acceptance Suite
 *
 * "Kōshi should provide predictable automatic sizing, proportional sizing,
 * growth, distribution, and wrapping."
 */

test.describe('Law II — Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('unspanned items share available space with automatic fluid sizing', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="auto-flex">
          <div class="auto-item">Item 1</div>
          <div class="auto-item">Item 2</div>
          <div class="auto-item">Item 3</div>
        </div>
      `;
    });

    const items = page.locator('#auto-flex .auto-item');
    const b1 = await items.nth(0).boundingBox();
    const b2 = await items.nth(1).boundingBox();
    const b3 = await items.nth(2).boundingBox();

    // 1200px with 2 gaps of 24px = 1200 - 48 = 1152 / 3 = 384px each
    expect(b1!.width).toBeCloseTo(384, 0);
    expect(b2!.width).toBeCloseTo(384, 0);
    expect(b3!.width).toBeCloseTo(384, 0);
    expect(Math.abs(b1!.y - b2!.y)).toBeLessThan(1.0);
  });

  test('representative partitions totaling 12 close the row exactly: 4+4+4, 7+5, 8+4, 6+6, 12', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="closure-flex">
          <!-- Row 1: 4 + 4 + 4 -->
          <div kos-col-span="4" id="r1-a">4</div>
          <div kos-col-span="4" id="r1-b">4</div>
          <div kos-col-span="4" id="r1-c">4</div>
          <!-- Row 2: 7 + 5 -->
          <div kos-col-span="7" id="r2-a">7</div>
          <div kos-col-span="5" id="r2-b">5</div>
          <!-- Row 3: 8 + 4 -->
          <div kos-col-span="8" id="r3-a">8</div>
          <div kos-col-span="4" id="r3-b">4</div>
          <!-- Row 4: 6 + 6 -->
          <div kos-col-span="6" id="r4-a">6</div>
          <div kos-col-span="6" id="r4-b">6</div>
          <!-- Row 5: 12 -->
          <div kos-col-span="12" id="r5">12</div>
        </div>
      `;
    });

    // Row 1: 3 * 384px + 2 * 24px = 1200px
    const r1c = await page.locator('#r1-c').boundingBox();
    expect(r1c!.x + r1c!.width).toBeCloseTo(1200, 0);

    // Row 2: 690px + 24px + 486px = 1200px
    const r2a = await page.locator('#r2-a').boundingBox();
    const r2b = await page.locator('#r2-b').boundingBox();
    expect(r2a!.width).toBeCloseTo(690, 0);
    expect(r2b!.width).toBeCloseTo(486, 0);
    expect(r2b!.x + r2b!.width).toBeCloseTo(1200, 0);

    // Row 3: 792px + 24px + 384px = 1200px
    const r3a = await page.locator('#r3-a').boundingBox();
    const r3b = await page.locator('#r3-b').boundingBox();
    expect(r3a!.width).toBeCloseTo(792, 0);
    expect(r3b!.width).toBeCloseTo(384, 0);
    expect(r3b!.x + r3b!.width).toBeCloseTo(1200, 0);

    // Row 4: 588px + 24px + 588px = 1200px
    const r4b = await page.locator('#r4-b').boundingBox();
    expect(r4b!.x + r4b!.width).toBeCloseTo(1200, 0);

    // Row 5: 1200px
    const r5 = await page.locator('#r5').boundingBox();
    expect(r5!.width).toBeCloseTo(1200, 0);
  });

  test('natural wrapping: atomic items wrap to subsequent row when space is exceeded', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="wrap-flex">
          <div kos-col-span="4" id="wrap-4">4</div>
          <div kos-col-span="10" id="wrap-10">10</div>
        </div>
      `;
    });

    const w4 = await page.locator('#wrap-4').boundingBox();
    const w10 = await page.locator('#wrap-10').boundingBox();

    // 4 + 10 = 14 > 12: item 10 must wrap to row 2
    expect(w10!.y).toBeGreaterThan(w4!.y + w4!.height - 1.0);
  });

  test('opt-in growth: single span 4 with explicit kos-grow="1" expands to available row width', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="opt-in-growth">
          <div kos-col-span="4" kos-grow="1" id="grow-item">Span 4 Grow 1</div>
        </div>
      `;
    });

    const item = await page.locator('#grow-item').boundingBox();
    // With kos-grow="1", the item intentionally expands to 1200px
    expect(item!.width).toBeCloseTo(1200, 0);
  });

  test('weighted growth: kos-grow="2" receives double the positive free space of kos-grow="1"', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="weighted-flex">
          <div kos-col-span="4" kos-grow="1" id="w1">Weight 1</div>
          <div kos-col-span="4" kos-grow="2" id="w2">Weight 2</div>
        </div>
      `;
    });

    const w1 = await page.locator('#w1').boundingBox();
    const w2 = await page.locator('#w2').boundingBox();

    // Net container row space = 1200 - 24 = 1176px.
    // Total bases = 384 + 384 = 768px.
    // Free space = 1176 - 768 = 408px.
    // Weight 1 gets 408 * (1/3) = 136px -> Width = 384 + 136 = 520px
    // Weight 2 gets 408 * (2/3) = 272px -> Width = 384 + 272 = 656px
    expect(w1!.width).toBeCloseTo(520, 0);
    expect(w2!.width).toBeCloseTo(656, 0);
    expect(Math.abs(w1!.y - w2!.y)).toBeLessThan(1.0);
  });
});
