import { test, expect } from '@playwright/test';

/**
 * Kōshi Architectural Law V — Accessibility Acceptance Suite
 *
 * "Kōshi should support accessible composition without making
 * unsupported accessibility guarantees."
 */

test.describe('Law V — Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('sequential keyboard tab navigation follows DOM source order rather than visual kos-order', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.innerHTML = `
        <div class="kos-grid" kos-cols="12">
          <!-- Visually reordered with kos-order -->
          <div kos-col-span="4" kos-order="3"><button id="btn-first-dom">Button 1 (Visual 3)</button></div>
          <div kos-col-span="4" kos-order="1"><button id="btn-second-dom">Button 2 (Visual 1)</button></div>
          <div kos-col-span="4" kos-order="2"><button id="btn-third-dom">Button 3 (Visual 2)</button></div>
        </div>
      `;
    });

    // Start focus traversal with Tab key
    await page.keyboard.press('Tab');
    let activeId = await page.evaluate(() => document.activeElement?.id);
    expect(activeId).toBe('btn-first-dom');

    await page.keyboard.press('Tab');
    activeId = await page.evaluate(() => document.activeElement?.id);
    expect(activeId).toBe('btn-second-dom');

    await page.keyboard.press('Tab');
    activeId = await page.evaluate(() => document.activeElement?.id);
    expect(activeId).toBe('btn-third-dom');

    // Demonstrates: DOM order is preserved in the accessibility focus tree,
    // which confirms that visual reordering via kos-order can create a disconnect
    // between visual reading position and keyboard focus order (developer responsibility).
  });

  test('responsive reflow at 320px viewport width eliminates horizontal panning (WCAG 2.2 SC 1.4.10)', async ({ page }) => {
    // 320px viewport simulates 400% zoom on standard 1280px display
    await page.setViewportSize({ width: 320, height: 640 });
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.innerHTML = `
        <div class="kos-composition" kos-collapse="sm">
          <div class="kos-grid" kos-cols="12">
            <div kos-col-span="6">
              <h2>Accessible Reflow</h2>
              <p>Content that collapses to single column at narrow widths.</p>
            </div>
            <div kos-col-span="6">
              <p>Second column stacks below without requiring horizontal scrolling.</p>
            </div>
          </div>
        </div>
      `;
    });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('layout accommodates 200% text resizing without horizontal container blowout', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '600px';
      stage.innerHTML = `
        <div class="kos-container" style="font-size: 32px;" id="scaled-text-container">
          <div class="kos-grid" kos-cols="12">
            <div kos-col-span="12">
              <p>Large resized text to verify containment at 200% font scaling.</p>
            </div>
          </div>
        </div>
      `;
    });

    const isContained = await page.evaluate(() => {
      const c = document.getElementById('scaled-text-container')!;
      return c.scrollWidth <= c.clientWidth;
    });

    expect(isContained).toBe(true);
  });
});
