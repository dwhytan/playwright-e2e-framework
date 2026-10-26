import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Checkout — Sauce Demo', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('adding a product to cart updates the badge', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await test.step('Add "Sauce Labs Backpack" to the cart', async () => {
      await inventoryPage.addToCart('sauce-labs-backpack');
    });

    await test.step('Verify cart shows 1 product', async () => {
      await expect(await inventoryPage.getCartBadge()).toHaveText('1');
    });
  });

  test('user can complete the full purchase flow successfully', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await test.step('Add "Sauce Labs Backpack" to the cart', async () => {
      await inventoryPage.addToCart('sauce-labs-backpack');
    });

    await test.step('Navigate to the shopping cart', async () => {
      await inventoryPage.goToCart();
      await expect(page).toHaveURL(/cart\.html/);
    });

    await test.step('Proceed to checkout', async () => {
      await page.click('[data-test="checkout"]');
    });

    await test.step('Enter customer shipping information', async () => {
      await page.fill('[data-test="firstName"]', 'Davis');
      await page.fill('[data-test="lastName"]', 'Huaytan');
      await page.fill('[data-test="postalCode"]', '15001');
      await page.click('[data-test="continue"]');
    });

    await test.step('Confirm the order and verify success message', async () => {
      await page.click('[data-test="finish"]');
      await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    });
  });

  test('removing a product from cart clears it from the list', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await test.step('Add "Sauce Labs Backpack" to the cart', async () => {
      await inventoryPage.addToCart('sauce-labs-backpack');
    });

    await test.step('Navigate to the shopping cart', async () => {
      await inventoryPage.goToCart();
    });

    await test.step('Remove the product from the cart', async () => {
      await page.click('[data-test="remove-sauce-labs-backpack"]');
    });

    await test.step('Verify the cart is now empty', async () => {
      await expect(page.locator('.cart_item')).not.toBeVisible();
    });
  });

});