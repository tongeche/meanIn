import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("OPENAI_API_KEY is not set. AI features will be disabled.");
}

export function getOpenAI() {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  return new OpenAI({ apiKey });
}

export function getOpenAIOrNull() {
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}
