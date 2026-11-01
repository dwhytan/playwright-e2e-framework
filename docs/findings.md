# PeruRail — Test Findings

What we found while exploring and automating the PeruRail booking site.
The test plan behind these findings is in [test-strategy.md](test-strategy.md).

| | |
|---|---|
| **Site** | book.perurail.com, English version (`?tipoIdioma=1`), and the policy pages of www.perurail.com read by the AI assistant |
| **Browsers** | Firefox and WebKit (desktop), iPhone 13 emulation, Android screen size |
| **Period** | October 2026 |
| **Scope** | Search form and trains list only. Nothing was booked and no personal data was entered |

Findings describe what we observed on those dates. The site may have changed since.

## Summary

| Type | Count |
|---|---|
| Defects covered by a test | 5 |
| Minor defects without a test | 7 |
| Questions for the business | 4 |

**Severity scale:** **High** blocks or excludes a group of users. **Medium** misleads the user or
leaves them stuck in an unusual situation. **Low** is cosmetic or has no visible effect.

## Defects covered by a test

Each one is kept as a test marked with `test.fail()`: the suite stays green while the defect exists,
and the test turns red when the defect is fixed, as a reminder to remove the mark.

### D1 — Critical accessibility violations · High · PR-013

An axe-core scan (WCAG 2 level A and AA) finds critical violations on both pages:

| Rule | What it means for the user | Search page | Trains page |
|---|---|---|---|
| `button-name` | A screen reader announces only "button" | ✗ | ✗ |
| `image-alt` | Images have no text alternative | ✗ | ✗ |
| `label` | Form fields have no label | ✗ | |
| `select-name` | A dropdown has no name | ✗ | ✗ |

There are also serious issues (color contrast, a field without an accessible name), and every train
in the list repeats the same `id="lbl_estacion"`, while an id must be unique on a page.
The full axe result for each page is attached to the test in the HTML report.

### D2 — Spanish text in the English version · Medium · PR-012

- The page declares `lang="es"`, so screen readers and translators treat it as Spanish.
- Spanish text on the search page: "Sesión", "2 adultos (+12)", the "[Seleccionar]" option
  and the language names in the language menu.
- Spanish dates on the trains page: "Sáb 31 oct" instead of "Sat 31 Oct".

### D3 — Search does nothing when the calendar service fails · Medium · PR-014

The search page asks a service for the bookable dates of the route. We simulated an error from that
service inside the browser (the request never reached PeruRail):

- the calendar opens with every day disabled;
- pressing **Search** does nothing: no message, no request, no error.

The user is stuck with no explanation. See question Q3 for the expected behaviour.

### D4 — The session warning announces the wrong time · Medium · PR-019

After 25 minutes without a click, a warning says the session will expire in **5 minutes**.
The session actually ends **4 minutes** later. A user who trusts the message loses their search
one minute earlier than announced.

### D5 — JavaScript error on a passenger counter · Low · PR-018

Pressing **"-"** on a passenger counter that is already at its minimum (for example with 1 adult) throws
`TypeError: E.toFixed is not a function`, in Firefox and WebKit. The counter keeps working; the
error has no visible effect, but it is an unhandled exception in a normal user action.

## Minor defects without a test

| # | Finding | Where |
|---|---|---|
| M1 | Typo: "dditional luggage storage" (missing "A") | Trains page, station notes |
| M2 | The warning shown when adding a second infant for one adult shows an "info" icon with no message | Passengers |
| M3 | While the page loads, the departure date changes several times (today, tomorrow, a date in 2031, tomorrow). A search started at that moment could use the wrong date | Search page |
| M4 | Only clicks count as activity for the session timer: a user who reads, scrolls or uses the keyboard gets the expiry warning | Whole site |
| M5 | If renewing the session fails, the error handler itself throws an error, because it uses variables that do not exist | Session warning |
| M6 | The included luggage is described in two different ways: 1 bag or backpack up to 8 kg and 115 cm, or 1 backpack up to 8 kg and 100 cm or 1 carry-on bag up to 12 kg and 115 cm. A traveller cannot know which rule applies | www.perurail.com luggage page and FAQ |
| M7 | Spanish text on the English luggage page: "01 Mochila o equipaje de mano" | www.perurail.com luggage page |

M6 and M7 were found by the AI assistant (`npm run ai:ask`): asked about the luggage allowance,
it answered that its sources disagree, and the pages confirmed it.

## Questions for the business

Requirements we could not confirm. The tests check only what is certain and leave these open.

| # | Question | What we observed | Related test |
|---|---|---|---|
| Q1 | Is today bookable, or is the earliest date tomorrow? | The default date is tomorrow, but today can be picked in the calendar | PR-008 |
| Q2 | Is the 5% online discount meant for round trips only? | Round trips show the list price and 5% off; one-way trips show the full price | PR-009 |
| Q3 | When the dates cannot be loaded, should the user search with the default date or see an error? | Neither happens (see D3) | PR-014 |
| Q4 | Is it intended that Machu Picchu is already chosen as destination? | Earlier the destination started empty; now it starts as Machu Picchu | PR-001, PR-004 |

## Business rules discovered

Rules learned by exploring the site, each covered by a test.

| Rule | Test |
|---|---|
| At most 11 passengers with a seat (adults and children); infants travel without a seat | PR-006 |
| Adults are 12 or older, children 3 to 11, infants under 3 | PR-007 |
| At least one adult; one infant per adult | PR-007 |
| Each origin offers its own list of destinations | PR-005 |
| Round-trip online price = list price minus 5% | PR-009 |
| Trains can be sorted by departure time, price or duration | PR-011 |
| Warning after 25 minutes without a click; session ends at 29 minutes | PR-015 |

## Technical health

| Topic | Observation | Test |
|---|---|---|
| Speed of the search page | Its main content appears after 2.3 to 3.1 s (Largest Contentful Paint). Google rates up to 2.5 s as good | PR-017 |
| Speed of the trains list | Trains appear 5.6 to 7.6 s after pressing Search, with a blank page meanwhile | PR-017 |
| Page weight | 140 to 160 requests, about 1 MB and more than 30 different domains on the search page, many of them analytics and marketing services | — |
| Mobile | The search form and trains list fit iPhone and Android screens with no sideways scrolling | PR-016 |
| Standards mode | The page has no `<!DOCTYPE html>`, so browsers render it in quirks mode | — |
| Blocking requests | The page uses synchronous requests, which freeze the browser while they wait | — |

Times were measured from our test machine over the internet; they depend on the network and are
meant to spot changes over time, not as an exact figure.

## Limitations

- **No Chromium:** PeruRail's bot protection denies automated Chromium. We respect it instead of
  working around it, so Chrome and Edge are not covered and Android is checked by screen size only.
- **No booking:** passenger data, payment and confirmation are out of scope on a production site.
- **Live data:** schedules, prices and available dates change every day, so tests check rules and
  structure, not exact values.