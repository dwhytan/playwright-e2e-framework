import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login — Sauce Demo', () => {

  test('usuario estándar puede iniciar sesión exitosamente', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Abrir la página de login de Sauce Demo', async () => {
      await loginPage.goto();
    });

    await test.step('Ingresar credenciales válidas de usuario estándar', async () => {
      await loginPage.login('standard_user', 'secret_sauce');
    });

    await test.step('Verificar redirección al inventario de productos', async () => {
      await loginPage.verifySuccessfulLogin();
    });
  });

  test('login falla con credenciales inválidas', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Abrir la página de login', async () => {
      await loginPage.goto();
    });

    await test.step('Ingresar usuario y contraseña incorrectos', async () => {
      await loginPage.login('invalid_user', 'wrong_password');
    });

    await test.step('Verificar que se muestra mensaje de error de autenticación', async () => {
      await loginPage.verifyLoginError('Username and password do not match');
    });
  });

  test('login falla con campos vacíos', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Abrir la página de login', async () => {
      await loginPage.goto();
    });

    await test.step('Intentar login sin ingresar credenciales', async () => {
      await loginPage.login('', '');
    });

    await test.step('Verificar que se solicita el campo de usuario', async () => {
      await loginPage.verifyLoginError('Username is required');
    });
  });

});