import "dotenv/config";
import OpenAI from "openai";

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY");
    process.exit(1);
  }

  const client = new OpenAI({ apiKey });
  try {
    const res = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: 'Return JSON: {"status":"ok"}' }],
      response_format: { type: "json_object" },
    });
    const parsed = safeJson(res.choices?.[0]?.message?.content || "{}");
    console.log("AI reachable:", parsed);
    process.exit(0);
  } catch (error) {
    console.error("AI check failed:", error);
    process.exit(1);
  }
}

function safeJson(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

void main();
