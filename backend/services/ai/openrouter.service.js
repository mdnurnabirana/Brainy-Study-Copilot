const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const name = "openrouter";

export const isConfigured = () => Boolean(process.env.OPENROUTER_API_KEY);

export const generate = async (prompt) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const model =
    process.env.OPENROUTER_MODEL || "google/gemma-2-9b-it:free";

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.BACKEND_URL || "http://localhost:8000",
      "X-Title": "Learning Assistant",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`OpenRouter API error (${response.status}): ${body}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("OpenRouter API returned empty response");
  }

  return text;
};
