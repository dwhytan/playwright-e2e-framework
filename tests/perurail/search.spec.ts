import { test, expect, Page } from '@playwright/test';

// Origin and destination use a custom dropdown (select2) on top of a hidden <select>,
// so we pick options the way a user does: open the dropdown and click the option
async function pickOption(page: Page, selectId: string, option: string) {
  await page.locator(`#select2-${selectId}-container`).click();
  await page.getByRole('treeitem', { name: option, exact: true }).click();
}

// Decision table for PR-005: the destinations each origin offers, as seen during exploration
const destinationsByOrigin: Record<string, string[]> = {
  'City of Cusco': ['MachuPicchu', 'Ollantaytambo', 'Puno', 'Arequipa'],
  'Urubamba': ['MachuPicchu'],
  'Ollantaytambo': ['MachuPicchu', 'City of Cusco'],
  'MachuPicchu': ['City of Cusco', 'Urubamba', 'Ollantaytambo', 'Hidroelectrica'],
  'Hidroelectrica': ['MachuPicchu'],
  'Puno': ['City of Cusco', 'Arequipa'],
  'Arequipa': ['City of Cusco', 'Puno'],
};

test.describe('PeruRail — Train search', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/?tipoIdioma=1');
  });

  test('PR-001 search form loads with its default values', { tag: '@smoke' }, async ({ page }) => {
    await test.step('Verify the booking steps are shown', async () => {
      await expect(page.getByText('TRAINS', { exact: true })).toBeVisible();
      await expect(page.getByText('PASSENGERS DATA', { exact: true })).toBeVisible();
      await expect(page.getByText('CONFIRMATION AND PAYMENT', { exact: true })).toBeVisible();
    });

    await test.step('Verify the default search values', async () => {
      await expect(page.locator('#Filtros_Ida_Origen option:checked')).toHaveText('City of Cusco');
      await expect(page.locator('#Filtros_Ida_Fecha')).toHaveValue(/^\d{2}\/\d{2}\/\d{4}$/);
      await expect(page.locator('#btnSiguiente')).toBeVisible();
    });
  });

  test('PR-002 one-way search Cusco to Machu Picchu shows available trains', { tag: '@smoke' }, async ({ page }) => {
    await test.step('Search a one-way trip from Cusco to Machu Picchu', async () => {
      await page.getByText('One Way', { exact: true }).click();
      await pickOption(page, 'Filtros_Ida_Destino', 'MachuPicchu');
      await page.locator('#btnSiguiente').click();
    });

    await test.step('Verify the trains page opens for the selected route', async () => {
      await expect(page).toHaveURL(/\/Reservas\/Trenes/);
      await expect(page.getByText('City of Cusco > MachuPicchu')).toBeVisible();
    });

    await test.step('Verify at least one train with schedule and price is listed', async () => {
      // Schedules and prices change every day, so we check the structure, not exact values
      const firstTrain = page.locator('.row-desktop-trenes').first();
      await expect(firstTrain).toBeVisible();
      await expect(firstTrain).toContainText(/\d{2}:\d{2}/);
      await expect(firstTrain).toContainText('Machu Picchu');
      await expect(firstTrain).toContainText(/USD\s*\d+\.\d{2}/);
    });
  });

  test('PR-003 round-trip search shows outbound and return trains', async ({ page }) => {
    const visibleTrains = page.locator('.row-desktop-trenes').filter({ visible: true });

    await test.step('Search a round trip from Cusco to Machu Picchu', async () => {
      await page.getByText('Round Trip', { exact: true }).click();
      await pickOption(page, 'Filtros_Ida_Destino', 'MachuPicchu');
      await page.locator('#btnSiguiente').click();
    });

    await test.step('Verify outbound trains arrive at Machu Picchu', async () => {
      await expect(page.getByText('City of Cusco > MachuPicchu')).toBeVisible();
      await expect(visibleTrains.first()).toContainText('Machu Picchu');
    });

    await test.step('Choose the first outbound fare and go to the return trains', async () => {
      // Choosing a fare only marks it in the session; nothing is booked before the passengers step
      await page.locator('.grupo-opcion1').first().click();
      await page.getByRole('button', { name: 'Select Train for return' }).click();
    });

    await test.step('Verify return trains depart from Machu Picchu', async () => {
      await expect(visibleTrains.first()).toBeVisible();
      await expect(visibleTrains.first()).toContainText(/^\s*\d{2}:\d{2}\s*Station\s*Machu Picchu/);
    });
  });

  test('PR-004 search without a destination is blocked', async ({ page }) => {
    const destination = page.locator('#Filtros_Ida_Destino');

    await test.step('Clear the destination and try to search', async () => {
      await pickOption(page, 'Filtros_Ida_Destino', '[Seleccionar]');
      await expect(destination).toHaveValue('');
      await page.locator('#btnSiguiente').click();
    });

    await test.step('Verify the browser blocks the search', async () => {
      const valueMissing = await destination.evaluate((el: HTMLSelectElement) => el.validity.valueMissing);
      expect(valueMissing).toBe(true);
      await expect(page).not.toHaveURL(/\/Reservas\/Trenes/);
    });
  });

  test('PR-005 destination list depends on the selected origin', async ({ page }) => {
    // One page load for the whole table keeps our traffic low; soft checks report every wrong row
    for (const [origin, destinations] of Object.entries(destinationsByOrigin)) {
      await test.step(`From ${origin}`, async () => {
        await pickOption(page, 'Filtros_Ida_Origen', origin);
        await expect.soft(page.locator('#Filtros_Ida_Destino option')).toHaveText(['[Seleccionar]', ...destinations]);
      });
    }
  });

});