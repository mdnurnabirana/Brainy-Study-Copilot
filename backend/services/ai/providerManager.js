import * as groqService from "./groq.service.js";
import * as openrouterService from "./openrouter.service.js";
import * as geminiService from "./gemini.service.js";

const PROVIDER_CHAIN = [groqService, openrouterService, geminiService];

const getAvailableProviders = () =>
  PROVIDER_CHAIN.filter((provider) => provider.isConfigured());

const isRateLimitError = (error) =>
  error?.status === 429 ||
  /rate.?limit|resource_exhausted|quota exceeded/i.test(error?.message || "");

const getRetryDelay = (error, attempt) => {
  if (isRateLimitError(error)) {
    const match = (error.message || "").match(/try again in ([\d.]+)s/i);
    if (match) {
      return Math.ceil(parseFloat(match[1]) * 1000) + 200;
    }
    return 4000;
  }
  return attempt * 500;
};

export const generateText = async (prompt) => {
  const providers = getAvailableProviders();

  if (providers.length === 0) {
    throw new Error(
      "No AI providers configured. Set GROQ_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY.",
    );
  }

  const errors = [];

  for (const provider of providers) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[AI] Trying ${provider.name} (attempt ${attempt})`);
        const text = await provider.generate(prompt);
        console.log(`[AI] Success with ${provider.name}`);
        return text;
      } catch (error) {
        const message = error?.message || String(error);
        console.error(`[AI] ${provider.name} attempt ${attempt} failed:`, message);
        errors.push(`${provider.name}: ${message}`);

        if (attempt < 2) {
          const delay = getRetryDelay(error, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw new Error(`All AI providers failed. ${errors.join(" | ")}`);
};
