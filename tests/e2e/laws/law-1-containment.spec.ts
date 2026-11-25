import { test, expect } from '@playwright/test';

/**
 * Kōshi Architectural Law I — Containment Acceptance Suite
 *
 * "Kōshi compositions should respect their available layout space
 * under explicitly defined and supported content and sizing conditions."
 */

test.describe('Law I — Containment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('narrow viewport down to 320px produces zero document horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.innerHTML = `
        <div class="kos-container">
          <div class="kos-grid" kos-cols="12">
            <div kos-col-span="12">Card 1</div>
            <div kos-col-span="12">Card 2</div>
          </div>
        </div>
      `;
    });

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasOverflow).toBe(false);
  });

  test('long unbroken text strings wrap within .kos-container via overflow-wrap', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 600 });
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.innerHTML = `
        <div class="kos-container" id="container">
          <div class="kos-grid">
            <div id="text-cell">
              https://example.com/a/very/long/unbroken/url/path/that/would/normally/overflow/without/wrapping/rules/established/in/foundation
            </div>
          </div>
        </div>
      `;
    });

    const isContained = await page.evaluate(() => {
      const c = document.getElementById('container')!;
      return c.scrollWidth <= c.clientWidth;
    });

    expect(isContained).toBe(true);
  });

  test('replaced elements (img, video) are constrained to max-width: 100%', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '500px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" id="img-grid">
          <div kos-col-span="6" id="img-cell">
            <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'></svg>" id="large-img" alt="test">
          </div>
        </div>
      `;
    });

    const img = page.locator('#large-img');
    const cell = page.locator('#img-cell');
    const imgRect = await img.boundingBox();
    const cellRect = await cell.boundingBox();

    // Image natural width is 1200px, but it must be contained within cell width
    expect(imgRect!.width).toBeLessThanOrEqual(cellRect!.width + 0.5);
  });

  test('nested box-sizing: border-box prevents padding and borders from expanding container', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '600px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" id="box-grid">
          <div kos-col-span="6" id="padded-item" style="padding: 20px; border: 4px solid #000;">
            Content
          </div>
        </div>
      `;
    });

    // In a 600px grid with 24px gap, span 6 basis = (600 - 24) / 2 = 288px
    // Because box-sizing is border-box, total outer width of padded-item must remain exactly 288px
    const item = await page.locator('#padded-item').boundingBox();
    expect(item!.width).toBeCloseTo(288, 0);
  });

  test('zero and large gutter values preserve container boundaries', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '800px';
      stage.innerHTML = `
        <div class="kos-grid kos-gap-0" kos-cols="12" id="grid-gap-0">
          <div kos-col-span="6" id="g0-a">A</div>
          <div kos-col-span="6" id="g0-b">B</div>
        </div>
        <div class="kos-grid kos-gap-8" kos-cols="12" id="grid-gap-8" style="margin-top: 20px;">
          <div kos-col-span="6" id="g8-a">A</div>
          <div kos-col-span="6" id="g8-b">B</div>
        </div>
      `;
    });

    // Gap 0: 800px / 2 = 400px each, closing exactly at 800px
    const g0a = await page.locator('#g0-a').boundingBox();
    const g0b = await page.locator('#g0-b').boundingBox();
    expect(g0a!.width).toBeCloseTo(400, 0);
    expect(g0b!.x + g0b!.width).toBeCloseTo(800, 0);

    // Gap 8: 2rem = 32px. (800 - 32) / 2 = 384px each, closing exactly at 800px
    const g8a = await page.locator('#g8-a').boundingBox();
    const g8b = await page.locator('#g8-b').boundingBox();
    expect(g8a!.width).toBeCloseTo(384, 0);
    expect(g8b!.x + g8b!.width).toBeCloseTo(800, 0);
  });
});
