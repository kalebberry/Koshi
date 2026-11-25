import { test, expect } from '@playwright/test';

/**
 * Kōshi Milestone 3: Container Query Characterization
 *
 * Measures and records empirical behavior of .kos-composition container queries:
 * - 32rem threshold (512px at 16px root font size) with kos-collapse="sm"
 * - 48rem threshold (768px at 16px root font size) default
 * - 64rem threshold (1024px at 16px root font size) with kos-collapse="lg"
 * - Boundary transitions (immediately below, at, and immediately above)
 * - Behavior on CSS Grid (.kos-grid) vs. Flexbox (.kos-flex-grid)
 */

test.describe('Container Query Characterization Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('default collapse threshold at 48rem (768px): stacks at <= 768px, multi-track at > 768px', async ({ page }) => {
    // Check below threshold: 760px
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '760px';
      stage.innerHTML = `
        <div class="kos-composition" id="comp-default">
          <div class="kos-grid" kos-cols="12" id="grid-default">
            <div kos-col-span="6" id="item-a">Card A</div>
            <div kos-col-span="6" id="item-b">Card B</div>
          </div>
        </div>
      `;
    });

    const aBelow = await page.locator('#item-a').boundingBox();
    const bBelow = await page.locator('#item-b').boundingBox();

    // At 760px (<= 48rem = 768px), @container (max-width: 48rem) triggers:
    // grid-template-columns becomes minmax(0, 1fr) (single column) and items stack vertically
    expect(bBelow!.y).toBeGreaterThan(aBelow!.y + aBelow!.height - 1.0);
    expect(aBelow!.width).toBeCloseTo(760, 0);

    // Now test immediately above threshold: 780px (> 48rem)
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '780px';
    });

    const aAbove = await page.locator('#item-a').boundingBox();
    const bAbove = await page.locator('#item-b').boundingBox();

    // At 780px (> 48rem), columns are restored: Card A and Card B sit side-by-side on row 1
    expect(Math.abs(aAbove!.y - bAbove!.y)).toBeLessThan(1.0);
    // Each takes half minus gap (780 - 24) / 2 = 378px
    expect(aAbove!.width).toBeCloseTo(378, 0);
  });

  test('sm collapse threshold at 32rem (512px) with kos-collapse="sm"', async ({ page }) => {
    // 500px is <= 32rem (512px) -> stacked
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '500px';
      stage.innerHTML = `
        <div class="kos-composition" kos-collapse="sm" id="comp-sm">
          <div class="kos-grid" kos-cols="12">
            <div kos-col-span="6" id="sm-a">A</div>
            <div kos-col-span="6" id="sm-b">B</div>
          </div>
        </div>
      `;
    });

    const aStacked = await page.locator('#sm-a').boundingBox();
    const bStacked = await page.locator('#sm-b').boundingBox();
    expect(bStacked!.y).toBeGreaterThan(aStacked!.y);

    // 530px is > 32rem (512px) -> multi-column restored
    await page.evaluate(() => {
      document.getElementById('stage')!.style.width = '530px';
    });

    const aSide = await page.locator('#sm-a').boundingBox();
    const bSide = await page.locator('#sm-b').boundingBox();
    expect(Math.abs(aSide!.y - bSide!.y)).toBeLessThan(1.0);
  });

  test('lg collapse threshold at 64rem (1024px) with kos-collapse="lg"', async ({ page }) => {
    // 1000px is <= 64rem (1024px) -> stacked
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1000px';
      stage.innerHTML = `
        <div class="kos-composition" kos-collapse="lg" id="comp-lg">
          <div class="kos-grid" kos-cols="12">
            <div kos-col-span="6" id="lg-a">A</div>
            <div kos-col-span="6" id="lg-b">B</div>
          </div>
        </div>
      `;
    });

    const aStacked = await page.locator('#lg-a').boundingBox();
    const bStacked = await page.locator('#lg-b').boundingBox();
    expect(bStacked!.y).toBeGreaterThan(aStacked!.y);

    // 1040px is > 64rem (1024px) -> multi-column restored
    await page.evaluate(() => {
      document.getElementById('stage')!.style.width = '1040px';
    });

    const aSide = await page.locator('#lg-a').boundingBox();
    const bSide = await page.locator('#lg-b').boundingBox();
    expect(Math.abs(aSide!.y - bSide!.y)).toBeLessThan(1.0);
  });

  test('kos-collapse="none" disables collapse entirely regardless of container width', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '360px'; // Narrow mobile width
      stage.innerHTML = `
        <div class="kos-composition" kos-collapse="none" id="comp-none">
          <div class="kos-grid" kos-cols="12">
            <div kos-col-span="6" id="none-a">A</div>
            <div kos-col-span="6" id="none-b">B</div>
          </div>
        </div>
      `;
    });

    const a = await page.locator('#none-a').boundingBox();
    const b = await page.locator('#none-b').boundingBox();

    // With kos-collapse="none", multi-column remains active even at 360px container width
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(1.0);
    // (360 - 24) / 2 = 168px
    expect(a!.width).toBeCloseTo(168, 0);
  });

  test('Flexbox inside .kos-composition is not affected by container collapse queries', async ({ page }) => {
    // Characterize the empirical fact that .kos-composition rules only target .kos-grid, not .kos-flex-grid
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '400px'; // Narrower than default 48rem (768px)
      stage.innerHTML = `
        <div class="kos-composition" id="comp-flex">
          <div class="kos-flex-grid" id="inner-flex">
            <div kos-col-span="6" id="flex-a">Flex A</div>
            <div kos-col-span="6" id="flex-b">Flex B</div>
          </div>
        </div>
      `;
    });

    const flexA = await page.locator('#flex-a').boundingBox();
    const flexB = await page.locator('#flex-b').boundingBox();

    // In .kos-flex-grid, spans 6 + 6 = 12 tracks: (400 - 24) / 2 = 188px
    // Since .kos-composition has no rules for .kos-flex-grid, items do NOT force-stack to single column!
    expect(Math.abs(flexA!.y - flexB!.y)).toBeLessThan(1.0);
    expect(flexA!.width).toBeCloseTo(188, 0);
  });
});
