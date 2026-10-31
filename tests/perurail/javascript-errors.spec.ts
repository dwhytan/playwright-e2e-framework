import { test, expect } from '@playwright/test';

test.describe('PeruRail — JavaScript errors', () => {

  test('PR-018 the search flow throws no JavaScript errors', async ({ page }) => {
    test.fail(true, 'Known defect: pressing "-" on a passenger counter at its minimum throws "E.toFixed is not a function"');

    // Collect every error the page's own code throws and does not handle
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    await test.step('Load the search page', async () => {
      await page.goto('/?tipoIdioma=1');
      await expect(page.getByText(/\d+ adult/)).toBeVisible();
    });

    await test.step('Lower the adults to the minimum and press "-" once more', async () => {
      await page.locator('#detalleNroPasajeros').click();
      const lessAdults = page.locator('.bootstrap-touchspin', { has: page.locator('#Filtros_Adultos_Total') }).locator('.bootstrap-touchspin-down');
      await lessAdults.click();
      await lessAdults.click();
      await expect(page.locator('#Filtros_Adultos_Total')).toHaveValue('1');
    });

    await test.step('Search a one-way trip and wait for the trains', async () => {
      await page.getByText('One Way', { exact: true }).click();
      await page.locator('#btnSiguiente').click();
      await expect(page.locator('.row-desktop-trenes').first()).toBeVisible();
    });

    await test.step('Verify no JavaScript errors were thrown', async () => {
      expect(errors).toEqual([]);
    });
  });

});