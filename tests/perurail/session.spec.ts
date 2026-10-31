import { test, expect } from '@playwright/test';

// The page keeps its inactivity limits in a hidden field, in seconds: "<warning>-<expiry>", e.g. "1500-1740"
let warningSeconds = 0;
let expirySeconds = 0;

test.describe('PeruRail — Session', () => {

  test.beforeEach(async ({ page }) => {
    // Control the browser clock, so we can jump ahead 25 minutes instead of waiting for real
    await page.clock.install();
    await page.goto('/?tipoIdioma=1');
    await expect(page.getByText(/\d+ adult/)).toBeVisible();
    [warningSeconds, expirySeconds] = (await page.locator('#hidTiempoInactividad').inputValue()).split('-').map(Number);
  });

  test('PR-015 the user is warned before the session expires', async ({ page }) => {
    const warning = page.getByRole('dialog').filter({ hasText: 'Are you still here?' });

    await test.step('No warning one second before the limit', async () => {
      await page.clock.fastForward((warningSeconds - 1) * 1000);
      await expect(warning).toBeHidden();
    });

    await test.step('The warning appears at the limit', async () => {
      await page.clock.fastForward(1000);
      await expect(warning).toBeVisible();
      await expect(warning.getByRole('button', { name: 'I am still here' })).toBeVisible();
    });

    await test.step('Without an answer, the session ends and the user can book again', async () => {
      await page.clock.fastForward((expirySeconds - warningSeconds) * 1000);
      await expect(page.getByText('Your session has expired due to inactivity')).toBeVisible();
      // After a few seconds the site opens its "session expired" page
      await page.clock.fastForward(11000);
      await expect(page).toHaveURL(/\/PaginaBlanco\/SesionTerminada/);
      await expect(page.getByText('BOOK AGAIN')).toBeVisible();
    });
  });

  test('PR-019 the warning announces the real time left', async ({ page }) => {
    test.fail(true, 'Known defect: the warning announces 5 minutes, but the session ends 4 minutes later');

    await page.clock.fastForward(warningSeconds * 1000);
    const warning = page.getByRole('dialog').filter({ hasText: 'Are you still here?' });
    await expect(warning).toBeVisible();

    const announcedMinutes = Number((await warning.innerText()).match(/(\d+) Minutes/)![1]);
    expect(announcedMinutes, 'minutes announced in the warning').toBe((expirySeconds - warningSeconds) / 60);
  });

});