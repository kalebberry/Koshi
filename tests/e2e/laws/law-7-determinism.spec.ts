import { test, expect } from '@playwright/test';

/**
 * Kōshi Architectural Law VII — Determinism Acceptance Suite
 *
 * "Equivalent supported inputs and rendering conditions should produce
 * predictable compositional behavior."
 */

test.describe('Law VII — Determinism', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('deterministic 12-track closure across viewports 1200px, 768px, and 375px', async ({ page }) => {
    for (const width of [1200, 768, 375]) {
      await page.setViewportSize({ width: width + 80, height: 800 });
      await page.evaluate((w) => {
        const stage = document.getElementById('stage')!;
        stage.style.width = `${w}px`;
        stage.innerHTML = `
          <div class="kos-grid" kos-cols="12" id="grid-${w}">
            <div kos-col-span="6" id="left-${w}">Left</div>
            <div kos-col-span="6" id="right-${w}">Right</div>
          </div>
        `;
      }, width);

      const left = await page.locator(`#left-${width}`).boundingBox();
      const right = await page.locator(`#right-${width}`).boundingBox();

      // In any width with 24px gap:
      // Half width = (width - 24) / 2
      const expectedHalf = (width - 24) / 2;
      expect(left!.width).toBeCloseTo(expectedHalf, 0);
      expect(right!.width).toBeCloseTo(expectedHalf, 0);
      expect(Math.abs(left!.y - right!.y)).toBeLessThan(1.0);

      // Track closure: right.x + right.width must align to container width
      expect(right!.x + right!.width).toBeCloseTo(width, 0);
    }
  });

  test('container query threshold transitions trigger deterministically at exact rem boundaries', async ({ page }) => {
    // 48rem = 768px at 16px font
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '768px';
      stage.innerHTML = `
        <div class="kos-composition" id="comp-thresh">
          <div class="kos-grid" kos-cols="12">
            <div kos-col-span="6" id="t-a">A</div>
            <div kos-col-span="6" id="t-b">B</div>
          </div>
        </div>
      `;
    });

    // Exactly at threshold 768px (<= 48rem): collapse is active (stacked)
    const atA = await page.locator('#t-a').boundingBox();
    const atB = await page.locator('#t-b').boundingBox();
    expect(atB!.y).toBeGreaterThan(atA!.y + atA!.height - 1.0);

    // 1px above threshold 769px (> 48rem): columns restored (side-by-side)
    await page.evaluate(() => {
      document.getElementById('stage')!.style.width = '769px';
    });

    const aboveA = await page.locator('#t-a').boundingBox();
    const aboveB = await page.locator('#t-b').boundingBox();
    expect(Math.abs(aboveA!.y - aboveB!.y)).toBeLessThan(1.0);
  });
});
