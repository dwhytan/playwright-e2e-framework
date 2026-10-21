import { Page } from '@playwright/test';

export class InventoryPage {
  constructor(private page: Page) {}

  async addToCart(productName: string) {
    await this.page.click(`[data-test="add-to-cart-${productName}"]`);
  }

  async getCartBadge() {
    return this.page.locator('.shopping_cart_badge');
  }

  async goToCart() {
    await this.page.click('.shopping_cart_link');
  }

  async sortBy(option: string) {
    await this.page.selectOption('[data-test="product-sort-container"]', option);
  }

  async getFirstProductName() {
    return this.page.locator('.inventory_item_name').first();
  }
}