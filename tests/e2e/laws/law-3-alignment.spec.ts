import { test, expect } from '@playwright/test';

/**
 * Kōshi Architectural Law III — Alignment Acceptance Suite
 *
 * "Kōshi should preserve declared spatial relationships and shared track alignment
 * under supported configurations."
 */

test.describe('Law III — Alignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('multi-row subgrid preserves baseline track alignment across sibling cards with unequal text', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" style="grid-template-rows: auto auto auto;">
          <!-- Card 1: 1-line header, 4-line body -->
          <div kos-col-span="6" kos-subgrid="rows" id="card-1" style="grid-row: span 3;">
            <div id="h1" style="min-height: 40px;">Short Header</div>
            <div id="b1" style="min-height: 160px;">Long multi-paragraph body text that occupies substantial height</div>
            <div id="f1" style="min-height: 40px;"><button>Action 1</button></div>
          </div>

          <!-- Card 2: 3-line header, 1-line body -->
          <div kos-col-span="6" kos-subgrid="rows" id="card-2" style="grid-row: span 3;">
            <div id="h2" style="min-height: 90px;">Much longer multi-line card header title that wraps onto multiple lines</div>
            <div id="b2" style="min-height: 50px;">Short body text</div>
            <div id="f2" style="min-height: 40px;"><button>Action 2</button></div>
          </div>
        </div>
      `;
    });

    const b1 = await page.locator('#b1').boundingBox();
    const b2 = await page.locator('#b2').boundingBox();
    const f1 = await page.locator('#f1').boundingBox();
    const f2 = await page.locator('#f2').boundingBox();

    // Body track line synchronization: Card 1 body and Card 2 body start at the exact same Y
    expect(Math.abs(b1!.y - b2!.y)).toBeLessThan(1.5);

    // Footer track line synchronization: Card 1 action and Card 2 action align at the exact same Y
    expect(Math.abs(f1!.y - f2!.y)).toBeLessThan(1.5);
  });

  test('column subgrid aligns child columns to parent grid track lines', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" id="parent-grid">
          <div kos-col-span="3" id="ref-track">Ref 3 Tracks</div>
          <div kos-col-span="6" kos-subgrid="cols" id="subgrid-card">
            <div id="sub-col-a" style="grid-column: span 3;">Sub 3</div>
            <div id="sub-col-b" style="grid-column: span 3;">Sub 3</div>
          </div>
        </div>
      `;
    });

    const ref = await page.locator('#ref-track').boundingBox();
    const subA = await page.locator('#sub-col-a').boundingBox();

    // Both span 3 parent tracks, so their widths must match exactly
    expect(ref!.width).toBeCloseTo(subA!.width, 0);
  });

  test('subgrid combined both axes sets subgrid for rows and columns', async ({ page }) => {
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
        rows: s.gridTemplateRows,
        cols: s.gridTemplateColumns,
      };
    });

    expect(computed.display).toBe('grid');
    expect(computed.rows).toBeTruthy();
    expect(computed.cols).toBeTruthy();
  });
});
