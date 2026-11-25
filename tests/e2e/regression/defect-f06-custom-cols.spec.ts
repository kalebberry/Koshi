import { test, expect } from '@playwright/test';

/**
 * Defect F-06 Regression Suite
 *
 * Problem Statement:
 * In styles/koshi.css, the typed attr() progressive enhancement rule:
 *   .kos-grid[kos-cols] { grid-template-columns: repeat(attr(kos-cols type(<integer>), 12), minmax(0, 1fr)); }
 * appears at line 174, AFTER line 160:
 *   .kos-grid[style*='--kos-cols'], .kos-grid[kos-cols='custom'] { grid-template-columns: repeat(var(--kos-cols, 12), ...); }
 * Both have specificity (0, 2, 0).
 * Line 174 wins the cascade. When kos-cols="custom" is present, attr("custom" type(<integer>), 12)
 * fails integer parsing and falls back to 12 tracks, overriding the author's custom track count.
 *
 * Intended Corrected Behavior:
 * - <div class="kos-grid" kos-cols="custom" style="--kos-cols: 5;"> renders exactly 5 tracks.
 */

test.describe('Defect F-06 — Custom Grid Column Count Cascade Collision', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('F-06.1: style="--kos-cols: 5" without kos-cols attribute renders 5 columns today', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1000px';
      stage.innerHTML = `
        <div class="kos-grid" style="--kos-cols: 5;" id="style-only-grid">
          <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
        </div>
      `;
    });

    const cols = await page.locator('#style-only-grid').evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length;
    });

    // Native CSS repeat(var(--kos-cols, 12), ...) works when line 174 does not match
    expect(cols).toBe(5);
  });

  test('F-06.2: kos-cols="custom" with style="--kos-cols: 5" renders 5 columns', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1000px';
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="custom" style="--kos-cols: 5;" id="custom-attr-grid">
          <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
        </div>
      `;
    });

    const cols = await page.locator('#custom-attr-grid').evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length;
    });

    // Intended: kos-cols="custom" should not be overridden by typed attr(), rendering 5 tracks
    expect(cols).toBe(5);
  });
});
