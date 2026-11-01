import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { askGemini, embed } from './gemini';

// Ask questions about PeruRail's public policies and about this test suite (RAG: retrieval-augmented generation).
// Usage: npm run ai:ask -- "Can I change my travel date?"     Add --refresh to download the sources again.

// PeruRail's public policy pages are downloaded when the index is built and kept only in the local
// .cache folder (ignored by git), so the company's content is never copied into this repository
const SOURCES = [
  'https://www.perurail.com/luggage/',
  'https://www.perurail.com/faq/',
  'https://www.perurail.com/purchase-terms-and-conditions/',
  'docs/test-strategy.md',
  'docs/findings.md',
];
const INDEX = '.cache/knowledge.json';

type Chunk = { source: string; text: string; embedding: number[] };

// Keeps the readable text of a web page: the <main> part, without scripts, styles or HTML tags
function pageText(html: string) {
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  return main
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>|<\/(p|li|h[1-6]|div|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&#8217;/g, "'").replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

// Splits a text into pieces of about 2000 characters, cutting between lines so sentences stay whole
function split(text: string) {
  const pieces: string[] = [];
  let current = '';
  for (const line of text.split('\n')) {
    if (current.length + line.length > 2000 && current) {
      pieces.push(current);
      current = '';
    }
    current += line + '\n';
  }
  if (current.trim()) pieces.push(current);
  return pieces;
}

async function buildIndex(): Promise<Chunk[]> {
  console.log('Building the knowledge index (first run, or --refresh)...');
  const pieces: { source: string; text: string }[] = [];
  for (const source of SOURCES) {
    const text = source.startsWith('http') ? pageText(await (await fetch(source)).text()) : readFileSync(source, 'utf8');
    pieces.push(...split(text).map(piece => ({ source, text: piece })));
  }
  const embeddings = await embed(pieces.map(piece => piece.text), 'document');
  const chunks = pieces.map((piece, i) => ({ ...piece, embedding: embeddings[i] }));
  mkdirSync('.cache', { recursive: true });
  writeFileSync(INDEX, JSON.stringify(chunks));
  console.log(`Indexed ${chunks.length} pieces from ${SOURCES.length} sources.\n`);
  return chunks;
}

// How close two embeddings are in meaning: 1 = same direction, 0 = unrelated (cosine similarity)
function similarity(a: number[], b: number[]) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / Math.sqrt(normA * normB);
}

const PROMPT = `You answer questions about PeruRail's train booking policies and about a QA test suite
for PeruRail's booking site. Answer ONLY with the information in the numbered sources below.
If the sources do not contain the answer, say so clearly instead of guessing.
If the sources disagree, say so and give each version with the page it comes from.
Copy numbers (weights, sizes, prices, times) exactly as the sources write them.
Keep the answer short. Do not put source numbers in the answer text; list them in sourcesUsed.`;

const SCHEMA = {
  type: 'object',
  properties: {
    answer: { type: 'string' },
    sourcesUsed: { type: 'array', items: { type: 'integer' } },
  },
  required: ['answer', 'sourcesUsed'],
};

async function main() {
  const question = process.argv.slice(2).filter(arg => arg !== '--refresh').join(' ');
  if (!question) {
    console.log('Usage: npm run ai:ask -- "your question"');
    return;
  }
  if (!process.env.GEMINI_API_KEY) {
    console.log('GEMINI_API_KEY is not set (see .env).');
    return;
  }

  const chunks: Chunk[] = existsSync(INDEX) && !process.argv.includes('--refresh')
    ? JSON.parse(readFileSync(INDEX, 'utf8'))
    : await buildIndex();

  // Retrieval: find the 6 pieces closest in meaning to the question
  const [questionEmbedding] = await embed([question], 'query');
  const best = chunks
    .map(chunk => ({ ...chunk, score: similarity(chunk.embedding, questionEmbedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  // Generation: Gemini answers using only those pieces
  const sources = best.map((chunk, i) => `[${i + 1}] (${chunk.source})\n${chunk.text}`).join('\n\n');
  const result = await askGemini<{ answer: string; sourcesUsed: number[] }>(
    `${PROMPT}\n\nQuestion: ${question}\n\nSources:\n${sources}`, SCHEMA);

  console.log(result.answer);
  const used = [...new Set(result.sourcesUsed.map(n => best[n - 1]?.source).filter(Boolean))];
  if (used.length) console.log(`\nSources: ${used.join(', ')}`);
}

main().catch(error => console.log(`AI assistant could not answer: ${error.message}`));