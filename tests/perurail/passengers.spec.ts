import { test, expect, Page } from '@playwright/test';

// Each passenger type has a counter with "-" and "+" buttons around a read-only number
const ADULTS = '#Filtros_Adultos_Total';
const CHILDREN = '#Filtros_Ninno_Total';
const INFANTS = '#Filtros_Infante_SinAsiento_Total';

function counterButton(page: Page, counter: string, button: '+' | '-') {
  const direction = button === '+' ? 'up' : 'down';
  return page.locator('.bootstrap-touchspin', { has: page.locator(counter) }).locator(`.bootstrap-touchspin-${direction}`);
}

test.describe('PeruRail — Passengers', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/?tipoIdioma=1');
    await page.locator('#detalleNroPasajeros').click();
  });

  test('PR-006 passenger total: 11 is accepted, 12 is rejected', async ({ page }) => {
    await test.step('Raise adults from the default 2 to 11', async () => {
      for (let adults = 2; adults < 11; adults++) {
        await counterButton(page, ADULTS, '+').click();
      }
      await expect(page.locator(ADULTS)).toHaveValue('11');
    });

    await test.step('A 12th adult is not added', async () => {
      await counterButton(page, ADULTS, '+').click();
      await expect(page.locator(ADULTS)).toHaveValue('11');
    });

    await test.step('A child as 12th passenger is rejected with a message', async () => {
      await counterButton(page, CHILDREN, '+').click();
      await expect(page.getByText('Up to 11 persons')).toBeVisible();
      await page.getByRole('button', { name: 'OK', exact: true }).click();
      await expect(page.locator(CHILDREN)).toHaveValue('0');
    });
  });

  test('PR-007 adult, child and infant age categories are offered', async ({ page }) => {
    await test.step('Verify the three categories and their age ranges', async () => {
      await expect(page.getByText('From 12 years')).toBeVisible();
      await expect(page.getByText('Between 3 to 11 years')).toBeVisible();
      await expect(page.getByText('Children under 3 years')).toBeVisible();
    });

    await test.step('At least one adult is required', async () => {
      await counterButton(page, ADULTS, '-').click();
      await counterButton(page, ADULTS, '-').click();
      await expect(page.locator(ADULTS)).toHaveValue('1');
    });

    await test.step('Each infant must travel with an adult', async () => {
      await counterButton(page, INFANTS, '+').click();
      await expect(page.locator(INFANTS)).toHaveValue('1');

      // A second infant with only one adult is blocked (the warning shown has no text, see findings)
      await counterButton(page, INFANTS, '+').click();
      await page.getByRole('button', { name: 'OK', exact: true }).click();
      await expect(page.locator(INFANTS)).toHaveValue('1');
    });
  });

});