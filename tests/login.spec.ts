import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login — Sauce Demo', () => {

  test('standard user can log in successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Open the Sauce Demo login page', async () => {
      await loginPage.goto();
    });

    await test.step('Enter valid standard user credentials', async () => {
      await loginPage.login('standard_user', 'secret_sauce');
    });

    await test.step('Verify redirect to the product inventory page', async () => {
      await loginPage.verifySuccessfulLogin();
    });
  });

  test('login fails with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Open the login page', async () => {
      await loginPage.goto();
    });

    await test.step('Enter incorrect username and password', async () => {
      await loginPage.login('invalid_user', 'wrong_password');
    });

    await test.step('Verify authentication error message is displayed', async () => {
      await loginPage.verifyLoginError('Username and password do not match');
    });
  });

  test('login fails when fields are empty', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Open the login page', async () => {
      await loginPage.goto();
    });

    await test.step('Attempt login without entering any credentials', async () => {
      await loginPage.login('', '');
    });

    await test.step('Verify the username field is required', async () => {
      await loginPage.verifyLoginError('Username is required');
    });
  });

});