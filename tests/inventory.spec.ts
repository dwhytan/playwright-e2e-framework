import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Inventory — Sauce Demo', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('adding a product to cart updates the badge counter', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await test.step('Add "Sauce Labs Backpack" to the cart', async () => {
      await inventoryPage.addToCart('sauce-labs-backpack');
    });

    await test.step('Verify cart badge shows 1 item', async () => {
      await expect(await inventoryPage.getCartBadge()).toHaveText('1');
    });
  });

  test('sorting products by price low to high reorders the list', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await test.step('Select sort option: Price (low to high)', async () => {
      await inventoryPage.sortBy('lohi');
    });

    await test.step('Verify the first product is the cheapest (Sauce Labs Onesie)', async () => {
      await expect(await inventoryPage.getFirstProductName()).toHaveText('Sauce Labs Onesie');
    });
  });

  test('clicking the cart icon navigates to the cart page', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await test.step('Add a product to the cart', async () => {
      await inventoryPage.addToCart('sauce-labs-backpack');
    });

    await test.step('Click the cart icon', async () => {
      await inventoryPage.goToCart();
    });

    await test.step('Verify redirect to cart page', async () => {
      await expect(page).toHaveURL(/cart\.html/);
    });
  });

});