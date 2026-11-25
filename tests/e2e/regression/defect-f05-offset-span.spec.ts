import { test, expect } from '@playwright/test';

/**
 * Defect F-05 Regression Suite
 *
 * Problem Statement:
 * In browsers supporting CSS Values & Units Level 5 typed attr() (Chromium 133+, modern WebKit, modern Gecko),
 * the progressive enhancement rule:
 *   .kos-grid > [kos-col-span] { grid-column: span attr(...); }  (specificity 0, 2, 0)
 * overrides:
 *   [kos-offset='2'] { grid-column-start: 3; }                  (specificity 0, 1, 0)
 * resetting grid-column-start to auto/span.
 *
 * Intended Corrected Behavior:
 * - When kos-offset="2" and kos-col-span="4" are combined on an element in a 1200px grid (24px gap):
 *   - grid-column-start must be 3 (line 3, x = 204px).
 *   - grid-column-end must be span 4 (width = 384px).
 */

test.describe('Defect F-05 — Grid Offset and Span Specificity Collision', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('F-05.1: kos-offset alone correctly sets grid-column-start', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12">
          <div kos-offset="2" id="offset-only">Offset 2 Only</div>
        </div>
      `;
    });

    const item = await page.locator('#offset-only').boundingBox();
    const computedStart = await page.locator('#offset-only').evaluate((el) => window.getComputedStyle(el).gridColumnStart);

    expect(computedStart).toBe('3');
    // Starts at line 3: 2 * 78px + 2 * 24px = 204px
    expect(item!.x).toBeCloseTo(204, 0);
  });

  test('F-05.2: combined kos-offset="2" and kos-col-span="4" preserves both offset and span', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12">
          <div kos-col-span="4" kos-offset="2" id="combined-target">Offset 2 Span 4</div>
        </div>
      `;
    });

    const item = page.locator('#combined-target');
    const start = await item.evaluate((el) => window.getComputedStyle(el).gridColumnStart);
    const rect = await item.boundingBox();

    // Intended: grid-column-start is line 3
    expect(start).toBe('3');
    // Intended: position starts after 2 tracks (204px), width spans 4 tracks (384px)
    expect(rect!.x).toBeCloseTo(204, 0);
    expect(rect!.width).toBeCloseTo(384, 0);
  });

  test('F-05.3: 1200px/12-col/24px gutter: numeric and custom spans combined with offset 2 yield exact 204px position and 384px width', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12" style="gap: 24px;">
          <!-- Numeric span 4 + offset 2 -->
          <div kos-offset="2" kos-col-span="4" id="numeric-combo">Numeric 4 Offset 2</div>
          <!-- Custom span 4 + offset 2 -->
          <div kos-offset="2" kos-col-span="custom" style="--kos-col-span: 4;" id="custom-combo">Custom 4 Offset 2</div>
        </div>
      `;
    });

    const numItem = page.locator('#numeric-combo');
    const custItem = page.locator('#custom-combo');

    const numRect = await numItem.boundingBox();
    const custRect = await custItem.boundingBox();

    const numStart = await numItem.evaluate((el) => window.getComputedStyle(el).gridColumnStart);
    const numEnd = await numItem.evaluate((el) => window.getComputedStyle(el).gridColumnEnd);
    const custStart = await custItem.evaluate((el) => window.getComputedStyle(el).gridColumnStart);
    const custEnd = await custItem.evaluate((el) => window.getComputedStyle(el).gridColumnEnd);

    // Grid math: (1200 - 11*24) / 12 = 936 / 12 = 78px per track
    // Offset 2 (start line 3): 2 * 78 + 2 * 24 = 204px
    // Span 4 (width): 4 * 78 + 3 * 24 = 312 + 72 = 384px

    expect(numStart).toBe('3');
    expect(numEnd).toBe('span 4');
    expect(numRect!.x).toBeCloseTo(204, 0);
    expect(numRect!.width).toBeCloseTo(384, 0);

    expect(custStart).toBe('3');
    expect(custEnd).toBe('span 4');
    expect(custRect!.x).toBeCloseTo(204, 0);
    expect(custRect!.width).toBeCloseTo(384, 0);
  });
});
