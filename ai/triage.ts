import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { askGemini } from './gemini';

// AI failure triage: after a test run, Gemini suggests why each failed test failed.
// It is advice for the person reading the report; it never changes a test result.

const REPORT = 'test-results/results.json';
const OUTPUT = 'test-results/ai-triage.md';

type Failure = { test: string; browser: string; step: string; evidence: string };
type Verdict = { category: string; confidence: string; reason: string; nextStep: string };

// Playwright error messages carry terminal colours; remove them before sending the text
const plainText = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, '');

// For each failure Playwright saves an "error context": the error, what the page showed at that
// moment and the test's source code. It is the best evidence for the AI, e.g. whether the page loaded
function errorContext(result: any) {
  const context = result.attachments.find((a: any) => a.name === 'error-context');
  if (!context?.path || !existsSync(context.path)) return '(not available)';
  const text = readFileSync(context.path, 'utf8');
  // Skip Playwright's own instructions at the top of the file and keep the evidence
  return plainText(text.slice(Math.max(text.indexOf('# Error details'), 0))).slice(0, 6000);
}

// Walks the JSON report and returns the tests that failed unexpectedly.
// Known defects (test.fail) pass as "expected", so they are not included
function collectFailures(suite: any, file = ''): Failure[] {
  const failures: Failure[] = [];
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests) {
      if (test.status !== 'unexpected' && test.status !== 'flaky') continue;
      const result = test.results.find((r: any) => r.error) ?? test.results[0];
      const failedStep = (result.steps ?? []).find((step: any) => step.error);
      failures.push({
        test: `${spec.file ?? file} › ${spec.title}`,
        browser: test.projectName,
        step: failedStep?.title ?? '(no step)',
        evidence: errorContext(result),
      });
    }
  }
  for (const child of suite.suites ?? []) failures.push(...collectFailures(child, suite.file ?? file));
  return failures;
}

const PROMPT = `You are a senior QA engineer triaging failed Playwright tests.
The tests run read-only against the English version of PeruRail's live booking site (train tickets in Peru).
Schedules, prices and dates change every day. Known defects are already excluded.

For each failure below, choose one category:
- "product defect": the site behaves wrongly for a user (wrong language, price, data or behaviour)
- "test defect": the test itself is wrong (outdated locator, wrong assumption, changed live data)
- "environment": network error, site down or access denied
- "flaky": timing or race condition that may pass on retry

Base your decision on the evidence: the error, what the page showed at the moment of the failure
and the test's source code. If the page loaded normally, the environment is rarely the cause.
Never suggest bypassing or disabling the site's bot protection.

Answer in the same order as the failures, with a short reason and a concrete next step.

Failures:
`;

const SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      category: { type: 'string', enum: ['product defect', 'test defect', 'environment', 'flaky'] },
      confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
      reason: { type: 'string' },
      nextStep: { type: 'string' },
    },
    required: ['category', 'confidence', 'reason', 'nextStep'],
  },
};

async function main() {
  if (!existsSync(REPORT)) {
    console.log(`AI triage skipped: ${REPORT} not found. Run the tests first.`);
    return;
  }
  const failures = collectFailures(JSON.parse(readFileSync(REPORT, 'utf8')));
  if (failures.length === 0) {
    console.log('AI triage: no unexpected failures, nothing to triage.');
    return;
  }
  if (!process.env.GEMINI_API_KEY) {
    console.log(`AI triage skipped: ${failures.length} failure(s) found, but GEMINI_API_KEY is not set.`);
    return;
  }

  const verdicts = await askGemini<Verdict[]>(PROMPT + JSON.stringify(failures, null, 2), SCHEMA);

  const lines = [
    '## AI failure triage',
    '',
    '_Suggestions by Gemini. They help to read the report; they do not change any test result._',
    '',
    '| Test | Browser | Failed step | Category | Confidence |',
    '|---|---|---|---|---|',
    ...failures.map((f, i) => `| ${f.test} | ${f.browser} | ${f.step} | ${verdicts[i]?.category} | ${verdicts[i]?.confidence} |`),
    '',
    ...failures.flatMap((f, i) => [
      `### ${f.test} (${f.browser})`,
      `- **Why:** ${verdicts[i]?.reason}`,
      `- **Next step:** ${verdicts[i]?.nextStep}`,
      '',
    ]),
  ];
  writeFileSync(OUTPUT, lines.join('\n'));
  console.log(lines.join('\n'));
  // On GitHub Actions, also show the triage on the run's summary page
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n'));
}

// AI triage is advisory: if Gemini fails, report it and let the run finish normally
main().catch(error => console.log(`AI triage could not run: ${error.message}`));