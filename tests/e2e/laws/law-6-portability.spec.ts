import { test, expect } from '@playwright/test';

/**
 * Kōshi Architectural Law VI — Portability Acceptance Suite
 *
 * "Kōshi Core should remain usable as standalone HTML and CSS without
 * JavaScript runtime dependencies."
 */

test.describe('Law VI — Portability', () => {
  test('standalone exported HTML and CSS render complete grid layouts with JavaScript disabled', async ({ browser }) => {
    // Create an isolated browser context with JavaScript explicitly disabled
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/harness.html');

    // Inject representative compositions from the 6 curated archetypes
    // (Bento, Hero, Features, Editorial, Gallery, Lattice)
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="/src/styles/koshi.css">
        <style>body { margin: 0; padding: 20px; }</style>
      </head>
      <body>
        <!-- 1. Bento Archetype -->
        <div class="kos-grid" kos-cols="12" id="bento-specimen" style="width: 1200px;">
          <div kos-col-span="8" id="bento-main">Bento Main 8</div>
          <div kos-col-span="4" id="bento-side">Bento Side 4</div>
        </div>

        <!-- 2. Hero Archetype -->
        <div class="kos-grid" kos-cols="12" id="hero-specimen" style="width: 1200px; margin-top: 20px;">
          <div kos-col-span="7" id="hero-title">Hero Title 7</div>
          <div kos-col-span="5" id="hero-media">Hero Media 5</div>
        </div>

        <!-- 3. Features Archetype (3-col equal) -->
        <div class="kos-grid" kos-cols="12" id="features-specimen" style="width: 1200px; margin-top: 20px;">
          <div kos-col-span="4" id="feat-1">Feature 1</div>
          <div kos-col-span="4" id="feat-2">Feature 2</div>
          <div kos-col-span="4" id="feat-3">Feature 3</div>
        </div>

        <!-- 4. Editorial Archetype (Asymmetric Offset) -->
        <div class="kos-grid" kos-cols="12" id="editorial-specimen" style="width: 1200px; margin-top: 20px;">
          <div kos-col-span="6" id="edit-body">Editorial 6</div>
          <div kos-col-span="6" id="edit-aside">Aside 6</div>
        </div>

        <!-- 5. Gallery Archetype (Halves) -->
        <div class="kos-grid" kos-cols="12" id="gallery-specimen" style="width: 1200px; margin-top: 20px;">
          <div kos-col-span="6" id="gal-1">Gal 1</div>
          <div kos-col-span="6" id="gal-2">Gal 2</div>
        </div>

        <!-- 6. Lattice Visualizer Primitive -->
        <div class="kos-grid" kos-cols="12" id="lattice-specimen" style="width: 1200px; margin-top: 20px;">
          <div kos-col-span="12" id="lattice-full">Full Width 12</div>
        </div>
      </body>
      </html>
    `);

    // Verify computed layout geometry is fully computed without runtime JS
    const bentoMain = await page.locator('#bento-main').boundingBox();
    const bentoSide = await page.locator('#bento-side').boundingBox();
    expect(bentoMain!.width).toBeCloseTo(792, 0);
    expect(bentoSide!.width).toBeCloseTo(384, 0);

    const feat1 = await page.locator('#feat-1').boundingBox();
    const feat2 = await page.locator('#feat-2').boundingBox();
    const feat3 = await page.locator('#feat-3').boundingBox();
    expect(feat1!.width).toBeCloseTo(384, 0);
    expect(feat2!.width).toBeCloseTo(384, 0);
    expect(feat3!.width).toBeCloseTo(384, 0);
    expect(Math.abs(feat1!.y - feat2!.y)).toBeLessThan(1.0);

    const full = await page.locator('#lattice-full').boundingBox();
    expect(full!.width).toBeCloseTo(1200, 0);

    await context.close();
  });
});
