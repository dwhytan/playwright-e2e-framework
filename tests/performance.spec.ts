import { test, expect } from '@playwright/test';

test.describe('Performance — Sauce Demo', () => {

  test('login page meets Core Web Vitals thresholds', async ({ page }) => {
    await test.step('Load the login page', async () => {
      await page.goto('https://www.saucedemo.com');
    });

    await test.step('Collect Core Web Vitals metrics (FCP and LCP)', async () => {
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals: Record<string, number> = {};

          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) vitals['lcp'] = entry.startTime;
          }).observe({ type: 'largest-contentful-paint', buffered: true } as PerformanceObserverInit);

          new PerformanceObserver((list) => {
            for (const entry of list.getEntries())
              if (entry.name === 'first-contentful-paint') vitals['fcp'] = entry.startTime;
          }).observe({ type: 'paint', buffered: true } as PerformanceObserverInit);

          setTimeout(() => resolve(vitals), 3000);
        });
      });

      const vitals = metrics as Record<string, number>;
      console.log(`\n📊 FCP: ${vitals['fcp']}ms | LCP: ${vitals['lcp']}ms`);

      await test.step('Verify FCP is under 3000ms (Good threshold)', async () => {
        expect(vitals['fcp']).toBeLessThan(3000);
      });

      await test.step('Verify LCP is under 4000ms (Good threshold)', async () => {
        expect(vitals['lcp']).toBeLessThan(4000);
      });
    });
  });

  test('login page full load time is acceptable', async ({ page }) => {
    await test.step('Measure DOM-ready load time and verify under 5000ms', async () => {
      const startTime = Date.now();
      await page.goto('https://www.saucedemo.com', { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - startTime;
      console.log(`\n⏱ Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000);
    });
  });

  test('inventory page loads in acceptable time after login', async ({ page }) => {
    await test.step('Log in to the application', async () => {
      await page.goto('https://www.saucedemo.com');
      await page.fill('#user-name', 'standard_user');
      await page.fill('#password', 'secret_sauce');
    });

    await test.step('Measure inventory page load time post-login and verify under 3000ms', async () => {
      const startTime = Date.now();
      await page.click('#login-button');
      await page.waitForSelector('.inventory_list');
      const loadTime = Date.now() - startTime;
      console.log(`\n⏱ Inventory load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(3000);
    });
  });

});