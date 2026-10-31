import { test, expect } from '@playwright/test';

// The search page asks this service for the bookable dates of the selected route
const CALENDAR_SERVICE = '**/Reservas/ObtenerCalendarioRuta**';

test.describe('PeruRail — Resilience', () => {

  test('PR-014 search still works when the calendar service fails', async ({ page }) => {
    test.fail(true, 'Known defect: when the calendar service fails, Search does nothing and shows no message');

    await test.step('Load the search page while the calendar service answers with an error', async () => {
      // The error is simulated inside the browser: the request never reaches PeruRail
      await page.route(CALENDAR_SERVICE, route => route.fulfill({ status: 500, body: 'Internal Server Error' }));
      const calendarFailed = page.waitForResponse(response => response.url().includes('ObtenerCalendarioRuta'));
      await page.goto('/?tipoIdioma=1');
      await calendarFailed;
    });

    await test.step('Verify the page still loads', async () => {
      await expect(page.locator('#btnSiguiente')).toBeVisible();
      await expect(page.locator('#Filtros_Ida_Fecha')).toHaveValue(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    await test.step('Verify Search still opens the trains page', async () => {
      await page.locator('#btnSiguiente').click();
      // A shorter wait than the default 15 s: when it works, this page opens in a few seconds
      await expect(page).toHaveURL(/\/Reservas\/Trenes/, { timeout: 10000 });
    });
  });

});