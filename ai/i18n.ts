import { writeFileSync, mkdirSync } from 'node:fs';
import { firefox, Page } from '@playwright/test';
import { askGemini } from './gemini';

// AI language check: opens the English search and trains pages and asks Gemini which texts are not in English.
// PR-012 looks only for Spanish words we already know; this check can find new ones.
// It is advice for a QA to confirm by hand; a confirmed finding can then become a fixed test.

const SITE = 'https://book.perurail.com/?tipoIdioma=1';
const OUTPUT = 'test-results/ai-i18n.md';

type Finding = { text: string; language: string; english: string };

// The visible text of the page, one line per text and without repeats
async function visibleTexts(page: Page) {
  const lines = (await page.locator('body').innerText()).split('\n').map(line => line.trim());
  return [...new Set(lines.filter(line => /[a-zA-Záéíóúñ]{2}/.test(line)))];
}

const PROMPT = `You are a QA engineer checking the English version of PeruRail's train booking site.
Below are the visible texts of one page. List every text that is not in English, for example Spanish words or dates.
Place names (Cusco, Machu Picchu, Ollantaytambo...), train names (Vistadome, Hiram Bingham...), brand names,
postal addresses and currency codes are not errors. Copy each text exactly as it is written and suggest the English version.
If every text is in English, answer with an empty list.

Texts:
`;

const SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      text: { type: 'string' },
      language: { type: 'string' },
      english: { type: 'string' },
    },
    required: ['text', 'language', 'english'],
  },
};

async function checkPage(name: string, texts: string[]) {
  const findings = await askGemini<Finding[]>(PROMPT + texts.join('\n'), SCHEMA);
  // Keep only texts that really are on the page: the AI must not invent findings
  return findings.filter(finding => texts.some(text => text.includes(finding.text))).map(finding => ({ page: name, ...finding }));
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.log('GEMINI_API_KEY is not set (see .env).');
    return;
  }

  // Read-only visit, like the tests: open the search page, search the default route, read the trains list
  const browser = await firefox.launch();
  const page = await browser.newPage({ timezoneId: 'America/Lima' });
  await page.goto(SITE);
  // The page first appears in Spanish and is translated a moment later: wait for the English booking steps
  await page.getByText('TRAINS', { exact: true }).waitFor();
  const searchTexts = await visibleTexts(page);
  await page.locator('#btnSiguiente').click();
  await page.locator('.row-desktop-trenes').first().waitFor({ timeout: 30000 });
  const trainsTexts = await visibleTexts(page);
  await browser.close();

  const findings = [
    ...await checkPage('Search page', searchTexts),
    ...await checkPage('Trains page', trainsTexts),
  ];

  const lines = [
    '## AI language check',
    '',
    '_Suggestions by Gemini. Confirm each one on the site before reporting it._',
    '',
    findings.length ? '| Page | Text on the site | Language | English version |' : 'No text outside English was found.',
    findings.length ? '|---|---|---|---|' : '',
    ...findings.map(f => `| ${f.page} | ${f.text} | ${f.language} | ${f.english} |`),
  ];
  mkdirSync('test-results', { recursive: true });
  writeFileSync(OUTPUT, lines.join('\n'));
  console.log(lines.join('\n'));
}

main().catch(error => console.log(`AI language check could not run: ${error.message}`));