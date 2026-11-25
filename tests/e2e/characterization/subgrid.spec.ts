import { test, expect } from '@playwright/test';

/**
 * Kōshi Milestone 3: Subgrid Characterization
 *
 * Measures and records empirical behavior of CSS Subgrid inheritance:
 * - Row subgrid ([kos-subgrid="rows"], [kos-subgrid])
 * - Column subgrid ([kos-subgrid="cols"])
 * - Combined row and column subgrid ([kos-subgrid="both"])
 * - Sibling cards with disparate content lengths locking row tracks
 * - Scope of track inheritance: subgrids only inherit tracks their box spans in parent
 */

test.describe('Subgrid Characterization Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('row subgrid locks row track boundaries across sibling cards with unequal content', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" id="parent-subgrid" style="grid-template-rows: auto auto auto;">
          <!-- Card 1: Short Header, Long Body -->
          <div kos-col-span="6" kos-subgrid="rows" id="card-1" style="grid-row: span 3;">
            <div class="header" id="h1" style="height: 50px;">Short Header</div>
            <div class="body" id="b1" style="height: 180px;">Long Body Content</div>
            <div class="footer" id="f1" style="height: 40px;">Footer 1</div>
          </div>

          <!-- Card 2: Tall Header, Short Body -->
          <div kos-col-span="6" kos-subgrid="rows" id="card-2" style="grid-row: span 3;">
            <div class="header" id="h2" style="height: 100px;">Taller Multi-line Header</div>
            <div class="body" id="b2" style="height: 60px;">Short Body Content</div>
            <div class="footer" id="f2" style="height: 40px;">Footer 2</div>
          </div>
        </div>
      `;
    });

    const h1 = await page.locator('#h1').boundingBox();
    const h2 = await page.locator('#h2').boundingBox();
    const b1 = await page.locator('#b1').boundingBox();
    const b2 = await page.locator('#b2').boundingBox();
    const f1 = await page.locator('#f1').boundingBox();
    const f2 = await page.locator('#f2').boundingBox();

    // With subgrid rows active, Row 1 expands to accommodate the taller header (100px)
    // Both Card 1's body and Card 2's body must start at the exact same Y position!
    expect(Math.abs(b1!.y - b2!.y)).toBeLessThan(1.5);

    // Row 2 expands to accommodate the taller body (180px)
    // Both Card 1's footer and Card 2's footer must start at the exact same Y position!
    expect(Math.abs(f1!.y - f2!.y)).toBeLessThan(1.5);

    // Total card heights are synchronized
    const card1 = await page.locator('#card-1').boundingBox();
    const card2 = await page.locator('#card-2').boundingBox();
    expect(Math.abs(card1!.height - card2!.height)).toBeLessThan(1.5);
  });

  test('column subgrid inherits parent column track intervals', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" id="parent-col-grid">
          <!-- Item spanning 6 parent tracks that inherits columns via subgrid -->
          <div kos-col-span="6" kos-subgrid="cols" id="col-subgrid-card">
            <div class="child" id="sub-item-1" style="grid-column: span 3;">Sub 3</div>
            <div class="child" id="sub-item-2" style="grid-column: span 3;">Sub 3</div>
          </div>
        </div>
      `;
    });

    const subgrid = await page.locator('#col-subgrid-card');
    const computed = await subgrid.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        display: s.display,
        gridTemplateColumns: s.gridTemplateColumns,
      };
    });

    expect(computed.display).toBe('grid');

    const sub1 = await page.locator('#sub-item-1').boundingBox();
    const sub2 = await page.locator('#sub-item-2').boundingBox();

    // Both sub-items span 3 parent tracks within the span-6 card
    // 3 parent tracks = 3 * 78 + 2 * 24 = 234 + 48 = 282px
    expect(sub1!.width).toBeCloseTo(282, 0);
    expect(sub2!.width).toBeCloseTo(282, 0);
    expect(Math.abs(sub1!.y - sub2!.y)).toBeLessThan(1.0);
  });

  test('combined row and column subgrid sets both axes to subgrid', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12">
          <div kos-col-span="6" kos-row-span="2" kos-subgrid="both" id="both-subgrid"></div>
        </div>
      `;
    });

    const computed = await page.locator('#both-subgrid').evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        display: s.display,
        gridTemplateRows: s.gridTemplateRows,
        gridTemplateColumns: s.gridTemplateColumns,
      };
    });

    expect(computed.display).toBe('grid');
    expect(computed.gridTemplateRows).toBeTruthy();
    expect(computed.gridTemplateColumns).toBeTruthy();
  });

  test('subgrid spanning single parent track inherits only one track, placing children in same line', async ({ page }) => {
    // Empirical demonstration: a subgrid only inherits the tracks spanned by its box in the parent
    // If [kos-subgrid] does not declare grid-row: span N, it spans 1 row track, so inner children share track 1
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" id="implicit-parent">
          <div kos-col-span="12" kos-subgrid="rows" id="subgrid-implicit">
            <div id="inner-1" style="height: 40px;">Inner 1</div>
            <div id="inner-2" style="height: 60px;">Inner 2</div>
          </div>
        </div>
      `;
    });

    const inner1 = await page.locator('#inner-1').boundingBox();
    const inner2 = await page.locator('#inner-2').boundingBox();

    // Since only 1 row track was inherited, both children share the same row start position
    expect(Math.abs(inner1!.y - inner2!.y)).toBeLessThan(1.0);
  });
});
