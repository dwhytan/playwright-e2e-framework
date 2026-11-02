# playwright-e2e-framework

![Playwright Tests](https://github.com/dwhytan/playwright-e2e-framework/actions/workflows/playwright.yml/badge.svg)

UI test automation for [PeruRail](https://book.perurail.com)'s train booking site, a real production
system, with Playwright and TypeScript, plus an AI layer built on Google Gemini.

The goal is to show how a QA engineer approaches a live system they do not own: explore it, rank
the risks, design the tests with formal techniques, automate what can be automated safely and
report what was found.

## Highlights

- **19 test cases** traced to a risk analysis: [test-strategy.md](docs/test-strategy.md)
- **5 defects and 7 minor issues found**, documented in [findings.md](docs/findings.md)
- **Known defects stay visible:** each one is a test marked with `test.fail()`, so the suite stays
  green and the test turns red when PeruRail fixes it
- **Safe on production:** read-only, one test at a time, no booking, no personal data, and no
  workarounds for the site's bot protection
- **AI as an assistant, never as the judge:** it suggests, a QA confirms

## Live test reports

- [Playwright HTML report](https://dwhytan.github.io/playwright-e2e-framework/playwright/)
- [Allure report](https://dwhytan.github.io/playwright-e2e-framework/allure/)

## What is tested

| File | Test cases | What it checks | Technique |
|---|---|---|---|
| `search.spec.ts` | PR-001 to PR-005, PR-008 to PR-012 | Search form, routes, dates, prices, durations, sorting, English texts | Use cases, decision table, boundary values, business rules |
| `passengers.spec.ts` | PR-006, PR-007 | Passenger limits and age categories | Boundary values, equivalence partitioning |
| `accessibility.spec.ts` | PR-013 | WCAG 2 A and AA violations | axe-core scan |
| `resilience.spec.ts` | PR-014 | Search when the calendar service fails | Network mocking (`page.route`) |
| `session.spec.ts` | PR-015, PR-019 | Inactivity warning and session expiry | Clock control (`page.clock`) |
| `mobile.spec.ts` | PR-016 | Search on iPhone and Android screens | Device emulation |
| `performance.spec.ts` | PR-017 | Page load against a time budget | Largest Contentful Paint |
| `javascript-errors.spec.ts` | PR-018 | Errors thrown while searching | Console monitoring |

Browsers: Firefox and WebKit. Chromium is not used because PeruRail's bot protection denies it,
and we respect that instead of disguising the browser.

## AI layer (Gemini)

| Command | What it does |
|---|---|
| `npm run ai:triage` | After a run, suggests why each failed test failed: product defect, test defect, environment or flaky. Runs in CI |
| `npm run ai:ask -- "question"` | Answers questions about PeruRail's public policies and this test suite, citing its sources (RAG) |
| `npm run ai:i18n` | Lists the texts of the English pages that are not in English |

Rules the AI follows in this repo:

- **Advisory only:** it never changes a test result, and if Gemini is unavailable the run goes on.
- **Evidence first:** the triage reads the error and the page at the moment of the failure; the
  assistant answers only from its sources and says when they disagree; the language check
  discards any text that is not really on the page.
- **No copied content:** PeruRail's pages are downloaded when needed into a local `.cache` folder
  that git ignores.

The AI already earned its place: the assistant noticed that PeruRail's luggage policy contradicts
itself (findings M6 and M7).

## Project structure

    ├── tests/perurail/       # the test files listed above
    ├── ai/
    │   ├── gemini.ts         # calls the Gemini API (shared)
    │   ├── triage.ts         # npm run ai:triage
    │   ├── ask.ts            # npm run ai:ask
    │   └── i18n.ts           # npm run ai:i18n
    ├── docs/
    │   ├── test-strategy.md  # scope, risks and test cases
    │   └── findings.md       # defects, questions for the business, technical health
    ├── playwright.config.ts
    └── .github/workflows/playwright.yml

## How to run

```bash
# Install dependencies and browsers
npm install
npx playwright install firefox webkit

# Run all tests, or only the smoke tests
npm test
npm run test:smoke

# Open the reports
npm run report:html
npm run report:allure
```

The AI commands need a free [Gemini API key](https://aistudio.google.com/apikey) in a `.env` file:

```
GEMINI_API_KEY=your-key
```

The tests themselves do not need it.

## CI/CD

GitHub Actions runs the suite on every push and pull request, runs the AI failure triage
and publishes both reports to GitHub Pages.

## Limitations

- Live data (schedules, prices, dates) changes every day, so tests check rules and structure,
  not exact values.
- Only the steps before passenger data are covered.
- Gemini's free tier has daily limits; when they are reached, the AI commands say so and the
  tests are not affected.

## Author

**Davis Huaytán** — Senior QA Engineer  
[LinkedIn](https://www.linkedin.com/in/davis-huaytan) | [GitHub](https://github.com/dwhytan)