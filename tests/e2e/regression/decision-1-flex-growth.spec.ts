import { test, expect } from '@playwright/test';

/**
 * Decision D-1 Regression & Acceptance Suite
 *
 * Behavioral Contract:
 * - Unspanned items retain automatic growth (flex: 1 1 16rem).
 * - Explicit column spans (kos-col-span="1..12") default to flex-grow: 0.
 * - Explicit growth modifiers (kos-grow="1..3") override the default.
 * - flex-shrink: 1 is preserved across all items.
 */

test.describe('Decision D-1 — Explicit Flexbox Span Growth Contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/harness.html');
  });

  test('D-1.1: unspanned items retain automatic growth by default', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="auto-flex">
          <div class="unspanned" id="auto-1">Auto 1</div>
          <div class="unspanned" id="auto-2">Auto 2</div>
        </div>
      `;
    });

    const s1 = await page.locator('#auto-1').evaluate((el) => window.getComputedStyle(el).flexGrow);
    const s2 = await page.locator('#auto-2').evaluate((el) => window.getComputedStyle(el).flexGrow);

    // Unspanned items must retain automatic growth (flex-grow: 1)
    expect(s1).toBe('1');
    expect(s2).toBe('1');
  });

  test('D-1.2: single span-4 item defaults to non-growing (384px, leaving 816px Yohaku)', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="span-flex">
          <div kos-col-span="4" id="target-4">Span 4 Strict</div>
        </div>
      `;
    });

    const item = page.locator('#target-4');
    const flexGrow = await item.evaluate((el) => window.getComputedStyle(el).flexGrow);
    const rect = await item.boundingBox();

    // Approved D-1 contract: flex-grow: 0 on explicit spans
    expect(flexGrow).toBe('0');
    // Geometry: 384px item, leaving 816px unoccupied space on row
    expect(rect!.width).toBeCloseTo(384, 0);
  });

  test('D-1.3: span 4 + span 4 defaults to non-growing (384px each, 24px gap, 408px Yohaku)', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="two-span-flex">
          <div kos-col-span="4" id="item-4a">Span 4 A</div>
          <div kos-col-span="4" id="item-4b">Span 4 B</div>
        </div>
      `;
    });

    const a = await page.locator('#item-4a').boundingBox();
    const b = await page.locator('#item-4b').boundingBox();

    // Approved D-1 contract: each item stays 384px, remaining space is 1200 - (384 + 24 + 384) = 408px
    expect(a!.width).toBeCloseTo(384, 0);
    expect(b!.width).toBeCloseTo(384, 0);
    expect(b!.x - (a!.x + a!.width)).toBeCloseTo(24, 0);
  });

  test('D-1.4: single span-4 with explicit kos-grow="1" expands to full row width (migration path)', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid">
          <div kos-col-span="4" kos-grow="1" id="migrated-item">Span 4 Grow 1</div>
        </div>
      `;
    });

    const item = await page.locator('#migrated-item').boundingBox();
    // Verifies migration path: consumers who want automatic growth can add kos-grow="1"
    expect(item!.width).toBeCloseTo(1200, 0);
  });

  test('D-1.5: explicit span with kos-grow="0" enforces strict non-growing behavior today', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid">
          <div kos-col-span="4" kos-grow="0" id="strict-grow-0">Span 4 Grow 0</div>
        </div>
      `;
    });

    const item = await page.locator('#strict-grow-0').boundingBox();
    expect(item!.width).toBeCloseTo(384, 0);
  });

  test('D-1.6: flex-shrink: 1 is preserved on all items', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.innerHTML = `
        <div class="kos-flex-grid">
          <div id="unspanned-shrink">Auto</div>
          <div kos-col-span="6" id="spanned-shrink">Span 6</div>
          <div kos-col-span="6" kos-grow="0" id="grow0-shrink">Grow 0</div>
        </div>
      `;
    });

    const sAuto = await page.locator('#unspanned-shrink').evaluate((el) => window.getComputedStyle(el).flexShrink);
    const sSpan = await page.locator('#spanned-shrink').evaluate((el) => window.getComputedStyle(el).flexShrink);
    const sGrow0 = await page.locator('#grow0-shrink').evaluate((el) => window.getComputedStyle(el).flexShrink);

    expect(sAuto).toBe('1');
    expect(sSpan).toBe('1');
    expect(sGrow0).toBe('1');
  });

  test('D-1.7: all supported numeric spans 1-12 default to flex-grow: 0', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      let html = '<div class="kos-flex-grid" id="all-numeric-spans">';
      for (let i = 1; i <= 12; i++) {
        html += `<div kos-col-span="${i}" id="numeric-span-${i}">Span ${i}</div>`;
      }
      html += '</div>';
      stage.innerHTML = html;
    });

    for (let i = 1; i <= 12; i++) {
      const grow = await page.locator(`#numeric-span-${i}`).evaluate((el) => window.getComputedStyle(el).flexGrow);
      expect(grow).toBe('0');
    }
  });

  test('D-1.8: invalid and unsupported span values retain automatic sizing behavior (flex-grow: 1)', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="invalid-spans-flex">
          <div kos-col-span="13" id="invalid-13">Span 13</div>
          <div kos-col-span="foo" id="invalid-foo">Span Foo</div>
          <div kos-col-span="-1" id="invalid-neg">Span -1</div>
        </div>
      `;
    });

    const g13 = await page.locator('#invalid-13').evaluate((el) => window.getComputedStyle(el).flexGrow);
    const gFoo = await page.locator('#invalid-foo').evaluate((el) => window.getComputedStyle(el).flexGrow);
    const gNeg = await page.locator('#invalid-neg').evaluate((el) => window.getComputedStyle(el).flexGrow);

    // Option A: invalid spans do not match supported numeric rules and retain flex-grow: 1
    expect(g13).toBe('1');
    expect(gFoo).toBe('1');
    expect(gNeg).toBe('1');
  });

  test('D-1.9: empty span attribute (kos-col-span="") retains automatic sizing behavior (flex-grow: 1)', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid">
          <div kos-col-span="" id="empty-span">Empty Span</div>
          <div id="unspanned-sibling">Unspanned Sibling</div>
        </div>
      `;
    });

    const gEmpty = await page.locator('#empty-span').evaluate((el) => window.getComputedStyle(el).flexGrow);
    const gSibling = await page.locator('#unspanned-sibling').evaluate((el) => window.getComputedStyle(el).flexGrow);

    expect(gEmpty).toBe('1');
    expect(gSibling).toBe('1');
  });

  test('D-1.10: custom Grid span attribute (kos-col-span="custom") in Flexbox retains automatic sizing (flex-grow: 1)', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid">
          <div kos-col-span="custom" style="--kos-col-span: 4;" id="custom-flex-item">Custom Grid Span in Flex</div>
        </div>
      `;
    });

    const gCustom = await page.locator('#custom-flex-item').evaluate((el) => window.getComputedStyle(el).flexGrow);
    // Custom grid spans have no numeric flex-basis rule and fall through to fluid auto-growth
    expect(gCustom).toBe('1');
  });

  test('D-1.11: explicit growth modifiers override defaults across valid, invalid, and custom spans', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid">
          <!-- Supported numeric span with explicit growth -->
          <div kos-col-span="4" kos-grow="2" id="override-span-2">Span 4 Grow 2</div>
          <div kos-col-span="4" kos-grow="3" id="override-span-3">Span 4 Grow 3</div>
          <!-- Invalid span with explicit zero growth -->
          <div kos-col-span="13" kos-grow="0" id="override-invalid-0">Invalid 13 Grow 0</div>
          <!-- Custom span with explicit zero growth -->
          <div kos-col-span="custom" kos-grow="0" id="override-custom-0">Custom Grow 0</div>
        </div>
      `;
    });

    const gSpan2 = await page.locator('#override-span-2').evaluate((el) => window.getComputedStyle(el).flexGrow);
    const gSpan3 = await page.locator('#override-span-3').evaluate((el) => window.getComputedStyle(el).flexGrow);
    const gInv0 = await page.locator('#override-invalid-0').evaluate((el) => window.getComputedStyle(el).flexGrow);
    const gCust0 = await page.locator('#override-custom-0').evaluate((el) => window.getComputedStyle(el).flexGrow);

    expect(gSpan2).toBe('2');
    expect(gSpan3).toBe('3');
    expect(gInv0).toBe('0');
    expect(gCust0).toBe('0');
  });

  test('D-1.12: natural wrapping and native gutter math preserved under numeric flex-grow: 0', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.style.width = '1200px';
      stage.innerHTML = `
        <div class="kos-flex-grid" id="wrap-check">
          <!-- 4 + 10 = 14 > 12 -> item 10 wraps to second row -->
          <div kos-col-span="4" id="wrap-item-4">Span 4</div>
          <div kos-col-span="10" id="wrap-item-10">Span 10</div>
        </div>
      `;
    });

    const r4 = await page.locator('#wrap-item-4').boundingBox();
    const r10 = await page.locator('#wrap-item-10').boundingBox();

    // Span 4: 384px on first row
    expect(r4!.width).toBeCloseTo(384, 0);
    // Span 10: 996px on second row (wrapped)
    expect(r10!.width).toBeCloseTo(996, 0);
    expect(r10!.y).toBeGreaterThan(r4!.y);
  });
});
