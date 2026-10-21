# QA Automation Portfolio

![Playwright Tests](https://github.com/dwhytan/qa-automation-portfolio/actions/workflows/playwright.yml/badge.svg)

End-to-end test automation framework built with Playwright and TypeScript, integrated with GitHub Actions CI/CD and AI-powered failure analysis.

## Live Test Report

[View Allure Report](https://dwhytan.github.io/qa-automation-portfolio)

## Tech Stack

- **Framework:** Playwright
- **Language:** TypeScript
- **CI/CD:** GitHub Actions
- **Reporting:** Allure Reports (with screenshots and video evidence)
- **AI Analysis:** Google Gemini (automated failure analysis)
- **Pattern:** Page Object Model
- **Target:** [Sauce Demo](https://www.saucedemo.com) | [PokeAPI](https://pokeapi.co)

## Test Suites

| Suite | Description | Tests |
|-------|-------------|-------|
| Login | Valid/invalid credentials, empty fields | 3 |
| Checkout | Add to cart, complete flow, remove item | 3 |
| Inventory | Add to cart, sort products, navigate | 3 |
| API | GET, negative testing with PokeAPI | 5 |
| AI Analysis | Automated failure analysis using Gemini AI | 1 |

## Project Structure

    ├── tests/
    │   ├── login.spec.ts
    │   ├── checkout.spec.ts
    │   ├── inventory.spec.ts
    │   ├── api.spec.ts
    │   └── ai-analysis.spec.ts
    ├── pages/
    │   ├── LoginPage.ts
    │   └── InventoryPage.ts
    ├── utils/
    │   └── aiAnalyzer.ts
    └── .github/
        └── workflows/
            └── playwright.yml

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

# Generate Allure report
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

## CI/CD

Tests run automatically on every push via GitHub Actions across Chromium, Firefox and WebKit. AI-powered failure analysis runs as part of the pipeline using Google Gemini. Results are published to GitHub Pages after every run.

## Author

**Davis Huaytán** — Senior QA Engineer
[LinkedIn](https://www.linkedin.com/in/davis-huaytan) | [GitHub](https://github.com/dwhytan)