import 'dotenv/config';

export async function analyzeTestFailure(
  testName: string,
  errorMessage: string,
  steps: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || '';

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

  const prompt = `You are a QA expert. Analyze this test failure briefly.
    
Test Name: ${testName}
Error: ${errorMessage}
Steps: ${steps}

Provide:
1. Root cause (1 sentence)
2. Suggested fix (1 sentence)
3. Prevention (1 sentence)`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json() as any;
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis unavailable';
}