import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Scans the page against WCAG 2 level A and AA, attaches the full result to the report
// and returns the critical violations as "rule (number of elements)", e.g. "image-alt (1)"
async function criticalViolations(page: Page, name: string) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  await test.info().attach(`axe results — ${name}`, { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
  return results.violations
    .filter(violation => violation.impact === 'critical')
    .map(violation => `${violation.id} (${violation.nodes.length})`);
}

test.describe('PeruRail — Accessibility', () => {

  test('PR-013 search and results pages have no critical accessibility violations', { tag: '@a11y' }, async ({ page }) => {
    test.fail(true, 'Known defect: buttons, images and form fields without an accessible name');

    await test.step('Scan the search page', async () => {
      await page.goto('/?tipoIdioma=1');
      await expect(page.getByText(/\d+ adult/)).toBeVisible();
      expect.soft(await criticalViolations(page, 'search page')).toEqual([]);
    });

    await test.step('Scan the results page', async () => {
      await page.locator('#select2-Filtros_Ida_Destino-container').click();
      await page.getByRole('treeitem', { name: 'MachuPicchu', exact: true }).click();
      await page.locator('#btnSiguiente').click();
      await expect(page.locator('.row-desktop-trenes').first()).toBeVisible();
      expect.soft(await criticalViolations(page, 'results page')).toEqual([]);
    });
  });

});