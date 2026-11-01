import 'dotenv/config';

// "latest" always points to Google's current Flash model, so the project does not depend on a version
const MODEL = 'gemini-flash-latest';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Sends a prompt to Gemini and returns its answer as JSON that follows the given schema
export async function askGemini<T>(prompt: string, schema: object): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY ?? '' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema: schema },
      }),
    });
    if (response.ok) {
      const data = await response.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);
    }
    // 429 (too many requests) and 503 (busy) are temporary: wait and try again, up to 3 times
    if ((response.status === 429 || response.status === 503) && attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, attempt * 10000));
      continue;
    }
    throw new Error(`Gemini answered ${response.status}: ${await response.text()}`);
  }
}