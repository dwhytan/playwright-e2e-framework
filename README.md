# QA Automation Portfolio

![Playwright Tests](https://github.com/dwhytan/qa-automation-portfolio/actions/workflows/playwright.yml/badge.svg)

End-to-end test automation framework built with Playwright and TypeScript, integrated with GitHub Actions CI/CD.

## Tech Stack

- **Framework:** Playwright
- **Language:** TypeScript
- **CI/CD:** GitHub Actions
- **Target:** [Sauce Demo](https://www.saucedemo.com)

## Test Suites

| Suite | Description | Tests |
|-------|-------------|-------|
| Login | Valid/invalid credentials, empty fields | 3 |
| Checkout | Add to cart, complete flow, remove item | 3 |

## How to Run

```bash
# Install dependencies
npm install

# Run all tests
npx playwright test

# Run specific suite
npx playwright test tests/login.spec.ts

# Run with UI mode
npx playwright test --ui
```

## CI/CD

Tests run automatically on every push via GitHub Actions across Chromium, Firefox and WebKit.

## Author

**Davis Huaytán** — Senior QA Engineer  
[LinkedIn](https://www.linkedin.com/in/davis-huaytan) | [GitHub](https://github.com/dwhytan)