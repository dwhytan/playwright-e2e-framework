import { test, expect } from '@playwright/test';

// Budgets in milliseconds. LCP uses Google's "poor" threshold (4 s); the trains budget leaves room
// over the 6-8 s measured during exploration, so only a real slowdown fails the test
const BUDGET = {
  largestContentfulPaint: 4000,
  trainsListed: 10000,
};

test.describe('PeruRail — Performance', () => {

  test('PR-017 search page and trains list load within the performance budget', { tag: '@perf' }, async ({ page }) => {
    await test.step('Largest Contentful Paint of the search page', async () => {
      await page.goto('/?tipoIdioma=1', { waitUntil: 'load' });
      // The browser reports when the biggest element on screen was painted (a Core Web Vital)
      const lcp = await page.evaluate(() => new Promise<number>(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1].startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      }));
      test.info().annotations.push({ type: 'Largest Contentful Paint', description: `${Math.round(lcp)} ms` });
      expect.soft(lcp, 'Largest Contentful Paint (ms)').toBeLessThanOrEqual(BUDGET.largestContentfulPaint);
    });

    await test.step('Time from Search until the first train is shown', async () => {
      await page.getByText('One Way', { exact: true }).click();
      await page.locator('#select2-Filtros_Ida_Destino-container').click();
      await page.getByRole('treeitem', { name: 'MachuPicchu', exact: true }).click();

      const start = Date.now();
      await page.locator('#btnSiguiente').click();
      await expect(page.locator('.row-desktop-trenes').first()).toBeVisible({ timeout: 30000 });
      const trainsListed = Date.now() - start;

      test.info().annotations.push({ type: 'Trains listed after', description: `${trainsListed} ms` });
      expect.soft(trainsListed, 'Trains listed after (ms)').toBeLessThanOrEqual(BUDGET.trainsListed);
    });
  });

});