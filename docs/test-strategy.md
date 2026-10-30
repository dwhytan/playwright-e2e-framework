# Test Strategy — PeruRail Online Booking

## 1. Purpose

This repository tests the public train booking flow of [PeruRail](https://book.perurail.com),
a real production system, using Playwright and TypeScript.

The goal is to show how a QA engineer approaches a live system they do not own:
understand the business, rank the risks, design the tests with formal techniques,
and automate what can be automated safely.

## 2. System under test

| Item | Detail |
|---|---|
| Application | PeruRail booking engine (`book.perurail.com`) |
| Environment | Production — read-only usage |
| Booking flow | Search → Trains → Passengers data → Confirmation and payment |
| Languages | English, Spanish, Portuguese, French, German |
| Routes | Cusco, Urubamba, Ollantaytambo, Machu Picchu, Hidroeléctrica, Puno, Arequipa |
| Train classes | Expedition, Vistadome, Vistadome Observatory (and others per route) |

## 3. Scope

### In scope
- Train search form: origins, destinations, trip type, dates, passengers
- Search results: train list, schedules, durations, prices, sorting
- Client-side validations and business rules visible in the UI
- Internationalization of the English version
- Accessibility (WCAG 2.1 A/AA, automated with axe-core)
- Front-end health: console errors, redundant requests, page weight, load time
- Resilience of the UI when a back-end call fails (simulated with network mocking)
- Mobile layout (device emulation)

### Out of scope (and why)
| Not tested | Reason |
|---|---|
| Passenger data and payment steps | Would create real reservations or hold real seats |
| Coupon codes | Guessing codes against production is not acceptable |
| Load, stress and security testing | Never against a production system we do not own |
| Chromium browser | The site's bot protection denies automated Chromium; we respect it |

## 4. Working rules for a production system

- **Read-only:** tests never submit passenger data, never pay, never book.
- **Low traffic:** one worker, no parallel runs, a short suite. A full run loads only a few dozen pages.
- **No evasion:** if the site's bot protection blocks a browser, we do not disguise the browser. We drop it.
- **Mock, don't hammer:** error and edge cases are simulated with `page.route()` instead of being forced on the real server.
- **Neutral reporting:** findings are described factually. Anything security-related is never published.

## 5. Risk analysis

Likelihood and impact are rated 1 (low) to 3 (high). Risk = Likelihood × Impact.

| ID | Risk | L | I | Risk | Covered by |
|---|---|---|---|---|---|
| R1 | Search fails or returns no trains for a valid route | 2 | 3 | **6** | PR-002, PR-003 |
| R2 | Wrong price shown to the customer | 2 | 3 | **6** | PR-009 |
| R3 | Passenger limits or age rules not enforced | 2 | 3 | **6** | PR-006, PR-007 |
| R4 | Past or invalid dates can be selected | 2 | 3 | **6** | PR-008 |
| R5 | Wrong schedule or duration shown | 1 | 3 | 3 | PR-010, PR-011 |
| R6 | Incomplete form can be submitted | 2 | 2 | 4 | PR-004, PR-005 |
| R7 | UI breaks when a back-end call fails | 2 | 2 | 4 | PR-014 |
| R8 | Foreign users see untranslated content | 3 | 2 | **6** | PR-012 |
| R9 | Users with disabilities cannot book | 3 | 2 | **6** | PR-013 |
| R10 | Session expiry is not handled clearly | 2 | 2 | 4 | PR-015 |
| R11 | Layout breaks on mobile devices | 2 | 2 | 4 | PR-016 |
| R12 | Slow pages or front-end errors hurt conversion | 2 | 2 | 4 | PR-017, PR-018 |

High risks (6) are automated first.

## 6. Test cases

| ID | Test case | Technique | Risk | Tag |
|---|---|---|---|---|
| PR-001 | Search form loads with its default values | Smoke | R1 | @smoke |
| PR-002 | One-way search Cusco → Machu Picchu shows available trains | Use case | R1 | @smoke |
| PR-003 | Round-trip search shows outbound and return trains | Use case | R1 | |
| PR-004 | Search without a destination is blocked | Negative testing | R6 | |
| PR-005 | Destination list depends on the selected origin | Decision table | R6 | |
| PR-006 | Passenger total: 11 is accepted, 12 is rejected | Boundary value analysis | R3 | |
| PR-007 | Adult, child and infant age categories are offered | Equivalence partitioning | R3 | |
| PR-008 | Past dates are disabled and the default date is not in the past | Boundary value analysis | R4 | |
| PR-009 | Round-trip online price equals the list price minus 5% | Business rule | R2 | |
| PR-010 | Each train's duration equals arrival minus departure | Business rule | R5 | |
| PR-011 | Sorting by departure time orders trains chronologically | Use case | R5 | |
| PR-012 | English version shows no Spanish text | i18n check | R8 | |
| PR-013 | Search and results pages have no critical accessibility violations | axe-core scan | R9 | @a11y |
| PR-014 | A failing calendar request is handled without breaking the page | Network mocking | R7 | |
| PR-015 | The user is warned before the session expires | Clock control | R10 | |
| PR-016 | Search form is usable on iPhone and Android viewports | Device emulation | R11 | @mobile |
| PR-017 | Search page loads within the performance budget | Performance budget | R12 | @perf |
| PR-018 | Search page logs no JavaScript errors | Console monitoring | R12 | |

Known defects found during exploration (for example in PR-012, PR-013 and PR-018) are kept
as tests marked with `test.fail()`, so the suite stays green while the defect is visible in the report.
When PeruRail fixes it, the test will "unexpectedly pass" and tell us.

## 7. Test levels and tools

| Need | Tool |
|---|---|
| UI automation | Playwright Test + TypeScript |
| Browsers | Firefox and WebKit (desktop), device emulation for mobile |
| Accessibility | `@axe-core/playwright` |
| Network mocking | `page.route()` |
| Time control | `page.clock` |
| Reports | Playwright HTML report and Allure |
| CI | GitHub Actions |

## 8. Shift-left

PeruRail's code is not ours, so shift-left here means doing the quality work before writing automation:

1. **Explore first:** manual exploration of the flow, its rules and its network calls.
2. **Risk before tests:** test cases come from the risk table, not the other way around.
3. **Design before code:** every automated test traces back to a test case ID in this document.
4. **Report early:** defects found while exploring are documented before any test is written.

## 9. Entry and exit criteria

**Entry:** the site is reachable and not blocking the selected browsers.

**Exit (per run):**
- All `@smoke` tests pass.
- No new failures outside the known defects marked with `test.fail()`.
- Any new failure is analyzed and classified as either a site change, a defect or a test problem.

## 10. Limitations

- Production data changes every day (schedules, prices, availability), so tests assert rules
  and structure, not exact values.
- The site may change or block automation at any time. A blocked run is an environment issue, not a test failure.
- Only the steps before passenger data are covered.