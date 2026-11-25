import { test, expect } from '@playwright/test';

test.describe('Kōshi Harness & Core Stylesheet Smoke Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test harness served by the local HTTP server
    const response = await page.goto('/harness.html');
    expect(response?.status()).toBe(200);
  });

  test('test harness loads and document title is correct', async ({ page }) => {
    await expect(page).toHaveTitle('Kōshi Layout Test Harness');
    const stage = page.locator('#stage');
    await expect(stage).toBeAttached();
  });

  test('production koshi.css stylesheet is loaded and active in the cascade', async ({ page }) => {
    // Verify that /src/styles/koshi.css was requested and parsed into document.styleSheets
    const stylesheetLoaded = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
      const koshiLink = links.find((l) => l.href.includes('koshi.css'));
      if (!koshiLink) return false;

      // Check whether CSS rules are accessible and @layer kos-grid is present
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          if (sheet.href && sheet.href.includes('koshi.css')) {
            const rules = Array.from(sheet.cssRules);
            const hasKosGridLayer = rules.some((rule) => {
              return (
                rule.type === CSSRule.LAYER_BLOCK_RULE ||
                rule.cssText.includes('@layer kos-grid')
              );
            });
            return hasKosGridLayer;
          }
        } catch {
          // Cross-origin access restriction (should not happen on local server)
          return false;
        }
      }
      return false;
    });

    expect(stylesheetLoaded).toBe(true);
  });

  test('CSS Grid primitive (.kos-grid) instantiates display: grid', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.innerHTML = `
        <div class="kos-grid" id="test-grid">
          <div class="grid-item">Track 1</div>
          <div class="grid-item">Track 2</div>
        </div>
      `;
    });

    const display = await page.locator('#test-grid').evaluate((el) => {
      return window.getComputedStyle(el).display;
    });

    expect(display).toBe('grid');
  });

  test('Flexbox primitive (.kos-flex-grid) instantiates display: flex', async ({ page }) => {
    await page.evaluate(() => {
      const stage = document.getElementById('stage')!;
      stage.innerHTML = `
        <div class="kos-flex-grid" id="test-flex">
          <div class="flex-item">Item 1</div>
          <div class="flex-item">Item 2</div>
        </div>
      `;
    });

    const computed = await page.locator('#test-flex').evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        display: style.display,
        flexWrap: style.flexWrap,
      };
    });

    expect(computed.display).toBe('flex');
    expect(computed.flexWrap).toBe('wrap');
  });
});
