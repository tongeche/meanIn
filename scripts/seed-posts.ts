import "dotenv/config";
import { OpenAI } from "openai";

type SeedStatus = {
  text: string;
  platform: "whatsapp-status" | "instagram-story" | "tiktok-story";
};

const BASE_URL = process.env.SEED_BASE_URL || "http://localhost:3000";
const DEFAULT_PLATFORM: SeedStatus["platform"] = "whatsapp-status";
const COUNT = Number(process.env.SEED_COUNT || 6);

const openaiKey = process.env.OPENAI_API_KEY;

async function generateSeedTexts(count: number): Promise<string[]> {
  if (!openaiKey) {
    return [
      "Moon mission livestream had everyone up past midnight.",
      "NYC just banned dark stores in residential blocks, shoppers are divided.",
      "The new single dropped at midnight and TikTok already has a dance for it.",
      "AI summary news popups are rolling out in mobile browsers this week.",
      "Everyone is screenshotting their screen time wrap-ups again.",
      "Storm alerts turned the city sky orange—no filter needed.",
    ].slice(0, count);
  }

  const client = new OpenAI({ apiKey: openaiKey });
  const prompt = `
You create short, current social status lines from the last 30 days.
Return a JSON array of ${count} concise, human-sounding sentences (max 140 chars each) about recent news, culture, music, sports, tech, or local happenings. Do not include the array key, only the JSON array. No markdown.
  `.trim();

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const raw = completion.choices?.[0]?.message?.content || "[]";
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((p) => String(p)).slice(0, count);
    }
  } catch {
    // fall through to fallback
  }

  return [
    "Moon mission livestream had everyone up past midnight.",
    "NYC just banned dark stores in residential blocks, shoppers are divided.",
    "The new single dropped at midnight and TikTok already has a dance for it.",
    "AI summary news popups are rolling out in mobile browsers this week.",
    "Everyone is screenshotting their screen time wrap-ups again.",
    "Storm alerts turned the city sky orange—no filter needed.",
  ].slice(0, count);
}

async function createPost(status: SeedStatus) {
  const res = await fetch(`${BASE_URL}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(status),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`Failed to create post (${res.status}): ${error.error || res.statusText}`);
  }

  return res.json();
}

async function main() {
  console.log(`Seeding ${COUNT} posts to ${BASE_URL} ...`);
  const texts = await generateSeedTexts(COUNT);
  for (const text of texts) {
    try {
      const result = await createPost({ text, platform: DEFAULT_PLATFORM });
      console.log(`✔️  Created ${result.slug}: ${result.shareUrl}`);
    } catch (error) {
      console.error(`✖️  Failed for "${text}":`, (error as Error).message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
