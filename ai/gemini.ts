import 'dotenv/config';

// "latest" always points to Google's current Flash model, so the project does not depend on a version
const MODEL = 'gemini-flash-latest';
const EMBEDDING_MODEL = 'gemini-embedding-001';
const API = 'https://generativelanguage.googleapis.com/v1beta/models';

// Calls the Gemini API. 429 (too many requests) and 503 (busy) are temporary: wait and retry, up to 3 times.
// The free tier allows a limited number of requests per minute, so the waits are long
async function callGemini(path: string, body: object): Promise<any> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(`${API}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY ?? '' },
      body: JSON.stringify(body),
    });
    if (response.ok) return response.json();
    if ((response.status === 429 || response.status === 503) && attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, attempt * 30000));
      continue;
    }
    // Google's message is long: keep the line that says which quota ran out, or else the first line
    const error = await response.json().catch(() => ({}));
    const lines: string[] = (error.error?.message ?? '').split('\n');
    throw new Error(`Gemini answered ${response.status}: ${lines.find(line => line.startsWith('* Quota exceeded')) ?? lines[0]}`);
  }
}

// Sends a prompt to Gemini and returns its answer as JSON that follows the given schema
export async function askGemini<T>(prompt: string, schema: object): Promise<T> {
  const data = await callGemini(`${MODEL}:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
    // Temperature 0 makes the answers as factual and repeatable as possible
    generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0 },
  });
  return JSON.parse(data.candidates[0].content.parts[0].text);
}

// Turns texts into embeddings: lists of numbers where texts with a similar meaning get similar numbers.
// "document" is for the texts we search in, "query" for the question we search with
export async function embed(texts: string[], purpose: 'document' | 'query'): Promise<number[][]> {
  const embeddings: number[][] = [];
  // The free tier embeds up to 30,000 tokens per minute: send batches of 25 texts (about 12,000 tokens)
  // and wait a minute between batches
  for (let i = 0; i < texts.length; i += 25) {
    if (i > 0) await new Promise(resolve => setTimeout(resolve, 60000));
    const data = await callGemini(`${EMBEDDING_MODEL}:batchEmbedContents`, {
      requests: texts.slice(i, i + 25).map(text => ({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        taskType: purpose === 'document' ? 'RETRIEVAL_DOCUMENT' : 'RETRIEVAL_QUERY',
        outputDimensionality: 768,
      })),
    });
    embeddings.push(...data.embeddings.map((e: any) => e.values));
  }
  return embeddings;
}