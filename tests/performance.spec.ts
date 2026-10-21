import { test, expect } from '@playwright/test';

test.describe('Performance Testing - Sauce Demo', () => {

  test('login page meets Core Web Vitals thresholds', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: Record<string, number> = {};

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            vitals['lcp'] = entry.startTime;
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true } as PerformanceObserverInit);

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              vitals['fcp'] = entry.startTime;
            }
          }
        }).observe({ type: 'paint', buffered: true } as PerformanceObserverInit);

        setTimeout(() => resolve(vitals), 3000);
      });
    });

    const vitals = metrics as Record<string, number>;

    console.log('\n📊 Performance Metrics:');
    console.log('FCP:', vitals['fcp'], 'ms');
    console.log('LCP:', vitals['lcp'], 'ms');

    expect(vitals['fcp']).toBeLessThan(3000);
    expect(vitals['lcp']).toBeLessThan(4000);
  });

  test('page load time is acceptable', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('https://www.saucedemo.com', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    console.log('\n⏱ Page load time:', loadTime, 'ms');
    expect(loadTime).toBeLessThan(5000);
  });

  test('inventory page load time after login', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');

    const startTime = Date.now();
    await page.click('#login-button');
    await page.waitForSelector('.inventory_list');
    const loadTime = Date.now() - startTime;

    console.log('\n⏱ Inventory load time:', loadTime, 'ms');
    expect(loadTime).toBeLessThan(3000);
  });

});