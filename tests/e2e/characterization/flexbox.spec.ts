import { test, expect } from '@playwright/test';

/**
 * Kōshi Milestone 3: Flexbox Characterization
 *
 * Measures and records empirical behavior of .kos-flex-grid:
 * - Default unspanned child styling: flex: 1 1 var(--kos-grid-min-item-size)
 * - Non-growing flex-grow: 0 default on explicitly spanned items (Decision D-1)
 * - Proportional width preservation and Yohaku when row spans sum to < 12
 * - Natural wrapping behavior when row spans sum to > 12
 * - Row closure when spans sum to exactly 12
 * - Explicit growth controls via kos-grow="0..3"
 * - Mixed explicit spans with unspanned items
 * - Intrinsic minimum sizing (min-width: 0) and long content resilience
 */

test.describe('Flexbox Characterization Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('default unspanned children inherit flex: 1 1 16rem', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="unspanned-flex">
          <div class="item">Item 1</div>
          <div class="item">Item 2</div>
        </div>
      `;
    });

    const styles = await page.locator('#unspanned-flex .item').first().evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        flexGrow: s.flexGrow,
        flexShrink: s.flexShrink,
        flexBasis: s.flexBasis,
        minWidth: s.minWidth,
      };
    });

    expect(styles.flexGrow).toBe('1');
    expect(styles.flexShrink).toBe('1');
    // 16rem * 16px = 256px
    expect(styles.flexBasis).toBe('256px');
    expect(styles.minWidth).toBe('0px');
  });

  test('single span-4 item defaults to non-growing (384px), preserving 816px Yohaku', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="single-4-flex">
          <div kos-col-span="4" id="item-4">Span 4 Alone</div>
        </div>
      `;
    });

    const item = await page.locator('#item-4');
    const computed = await item.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        flexBasis: s.flexBasis,
        flexGrow: s.flexGrow,
      };
    });

    // Approved D-1 contract: explicit spans default to flex-grow: 0
    expect(computed.flexGrow).toBe('0');
    // In getComputedStyle, percentage calc basis is preserved as a calc expression
    expect(computed.flexBasis).toContain('16px');

    // Observed empirical behavior: with flex-grow: 0, the item stays at strict 384px geometry
    const rect = await item.boundingBox();
    expect(rect!.width).toBeCloseTo(384, 0);
  });

  test('span-4 with explicit kos-grow="0" prevents expansion and preserves negative space', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="grow-0-flex">
          <div kos-col-span="4" kos-grow="0" id="item-strict-4">Strict Span 4</div>
        </div>
      `;
    });

    const item = await page.locator('#item-strict-4');
    const computed = await item.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        flexGrow: s.flexGrow,
        flexBasis: s.flexBasis,
      };
    });

    // kos-grow="0" explicitly cancels growth
    expect(computed.flexGrow).toBe('0');
    expect(computed.flexBasis).toContain('16px');

    // With kos-grow="0", the item respects strict 4-track geometry (384px)
    const rect = await item.boundingBox();
    expect(rect!.width).toBeCloseTo(384, 0);
  });

  test('representative spans totaling < 12: 4 + 4 default to non-growing geometry (384px each)', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="two-4-flex">
          <div kos-col-span="4" id="item-4a">Span 4 A</div>
          <div kos-col-span="4" id="item-4b">Span 4 B</div>
        </div>
      `;
    });

    const a = await page.locator('#item-4a').boundingBox();
    const b = await page.locator('#item-4b').boundingBox();

    // Under D-1, explicit spans default to flex-grow: 0 (non-growing)
    // Each 4-track span remains 384px, leaving 1200 - (384 + 24 + 384) = 408px Yohaku
    expect(a!.width).toBeCloseTo(384, 0);
    expect(b!.width).toBeCloseTo(384, 0);
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(1.0);
    expect(1200 - (b!.x + b!.width)).toBeCloseTo(408, 0);
  });

  test('representative spans totaling exactly 12: 4 + 4 + 4 close the row exactly', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="three-4-flex">
          <div kos-col-span="4" id="c4-1">Span 4</div>
          <div kos-col-span="4" id="c4-2">Span 4</div>
          <div kos-col-span="4" id="c4-3">Span 4</div>
        </div>
      `;
    });

    const b1 = await page.locator('#c4-1').boundingBox();
    const b2 = await page.locator('#c4-2').boundingBox();
    const b3 = await page.locator('#c4-3').boundingBox();

    // Each 4-track flex-basis is 384px. Total bases = 3 * 384 = 1152px + 2 gaps (48px) = 1200px
    // Exactly fills the 1200px row, with zero excess free space to grow
    expect(b1!.width).toBeCloseTo(384, 0);
    expect(b2!.width).toBeCloseTo(384, 0);
    expect(b3!.width).toBeCloseTo(384, 0);

    // All 3 items are on the same horizontal row
    expect(Math.abs(b1!.y - b2!.y)).toBeLessThan(1.0);
    expect(Math.abs(b2!.y - b3!.y)).toBeLessThan(1.0);

    // Total width plus outer position closes container cleanly
    expect(b3!.x + b3!.width).toBeCloseTo(1200, 0);
  });

  test('representative spans totaling exactly 12: 7 + 5, 8 + 4, 6 + 6, 12', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="pairs-flex">
          <div kos-col-span="7" id="s7">Span 7</div>
          <div kos-col-span="5" id="s5">Span 5</div>
          <div kos-col-span="8" id="s8">Span 8</div>
          <div kos-col-span="4" id="s4">Span 4</div>
          <div kos-col-span="6" id="s6a">Span 6 A</div>
          <div kos-col-span="6" id="s6b">Span 6 B</div>
          <div kos-col-span="12" id="s12">Span 12</div>
        </div>
      `;
    });

    // Row 1: 7 + 5
    // 7 tracks = 1200 * 7/12 - 24 * 5/12 = 700 - 10 = 690px
    // 5 tracks = 1200 * 5/12 - 24 * 7/12 = 500 - 14 = 486px
    // 690 + 24 (gap) + 486 = 1200px (exact closure)
    const s7 = await page.locator('#s7').boundingBox();
    const s5 = await page.locator('#s5').boundingBox();
    expect(s7!.width).toBeCloseTo(690, 0);
    expect(s5!.width).toBeCloseTo(486, 0);
    expect(Math.abs(s7!.y - s5!.y)).toBeLessThan(1.0);

    // Row 2: 8 + 4
    // 8 tracks = 1200 * 8/12 - 24 * 4/12 = 800 - 8 = 792px
    // 4 tracks = 384px. 792 + 24 + 384 = 1200px
    const s8 = await page.locator('#s8').boundingBox();
    const s4 = await page.locator('#s4').boundingBox();
    expect(s8!.width).toBeCloseTo(792, 0);
    expect(s4!.width).toBeCloseTo(384, 0);
    expect(Math.abs(s8!.y - s4!.y)).toBeLessThan(1.0);

    // Row 3: 6 + 6
    // 6 tracks = 1200 * 6/12 - 24 * 6/12 = 600 - 12 = 588px
    const s6a = await page.locator('#s6a').boundingBox();
    const s6b = await page.locator('#s6b').boundingBox();
    expect(s6a!.width).toBeCloseTo(588, 0);
    expect(s6b!.width).toBeCloseTo(588, 0);

    // Row 4: 12
    const s12 = await page.locator('#s12').boundingBox();
    expect(s12!.width).toBeCloseTo(1200, 0);
  });

  test('representative spans totaling > 12: 4 + 10 wraps item-10 to row 2 preserving proportional widths', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="wrap-flex">
          <div kos-col-span="4" id="wrap-4">Span 4</div>
          <div kos-col-span="10" id="wrap-10">Span 10</div>
        </div>
      `;
    });

    const w4 = await page.locator('#wrap-4').boundingBox();
    const w10 = await page.locator('#wrap-10').boundingBox();

    // 4 + 10 = 14 > 12: item-10 wraps to next row
    expect(w10!.y).toBeGreaterThan(w4!.y + w4!.height - 1.0);

    // Under D-1 non-growing defaults, wrapped items preserve their declared proportional widths:
    // Span 4 remains 384px (leaving 816px Yohaku on row 1)
    // Span 10 remains 996px (leaving 204px Yohaku on row 2)
    expect(w4!.width).toBeCloseTo(384, 0);
    expect(w10!.width).toBeCloseTo(996, 0);
  });

  test('mixed explicit span with an automatic unspanned item', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="mixed-flex">
          <div kos-col-span="4" id="mixed-4">Span 4</div>
          <div class="auto-item" id="mixed-auto">Auto Item</div>
        </div>
      `;
    });

    const mixed4 = await page.locator('#mixed-4').boundingBox();
    const mixedAuto = await page.locator('#mixed-auto').boundingBox();

    // Span 4 has flex-grow: 0 (retains strict 384px geometry)
    // Auto item retains flex-grow: 1 (absorbs all remaining positive space: 1200 - 384 - 24 = 792px)
    expect(Math.abs(mixed4!.y - mixedAuto!.y)).toBeLessThan(1.0);
    expect(mixed4!.width).toBeCloseTo(384, 0);
    expect(mixedAuto!.width).toBeCloseTo(792, 0);
  });

  test('long unbroken content does not cause horizontal blowout due to min-width: 0', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '400px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="long-content-flex" style="width: 400px;">
          <div kos-col-span="6" id="long-item" style="overflow: hidden;">
            <div style="width: 800px; height: 20px;">Unbroken Inner Content</div>
          </div>
          <div kos-col-span="6" id="sibling-item">Sibling</div>
        </div>
      `;
    });

    const container = page.locator('#long-content-flex');
    const scrollWidth = await container.evaluate((el) => el.scrollWidth);
    const clientWidth = await container.evaluate((el) => el.clientWidth);

    // .kos-flex-grid > * has min-width: 0, preventing flex children from blowing out container
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
