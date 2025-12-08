import { createSupabaseServerClient } from "@/lib/supabase/server";
import { appBaseUrl, generateSlug, slugify } from "@/lib/utils";
import { keywordPrompt, meaningPrompt } from "@/lib/openai/prompts";
import { getOpenAIOrNull } from "@/lib/openai/client";
import { generateCard } from "@/lib/card-generator";
import type { Platform } from "@/lib/types";
import { NextResponse } from "next/server";

// GET /api/posts - Fetch suggested terms from recent posts
export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("posts")
      .select("keyword_text")
      .not("keyword_text", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching suggested terms:", error);
      return NextResponse.json({ suggestions: [] });
    }

    // Get unique terms, max 6
    const seen = new Set<string>();
    const suggestions: string[] = [];
    
    for (const row of data || []) {
      const term = row.keyword_text?.trim();
      if (term && !seen.has(term.toLowerCase())) {
        seen.add(term.toLowerCase());
        suggestions.push(term);
        if (suggestions.length >= 6) break;
      }
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error in GET /api/posts:", error);
    return NextResponse.json({ suggestions: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const platform = body.platform as Platform;

    if (!text) {
      return NextResponse.json(
        { error: "Text is required." },
        { status: 400 },
      );
    }

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required." },
        { status: 400 },
      );
    }

  const supabase = createSupabaseServerClient();

  const keyword = await detectOrCreateKeyword(supabase, text);
  const termInfo = await ensureTermExists(supabase, keyword);
  const termId = termInfo?.id || null;
    await ensureMeaningExists(supabase, termId, keyword);
    const publicSlug = await createUniquePostSlug(supabase);

  const { error: insertError } = await supabase.from("posts").insert({
    text,
    keyword_text: keyword,
    keyword_term_id: termId,
    platform,
    public_slug: publicSlug,
    });

    if (insertError) {
      console.error(insertError);
      return NextResponse.json(
        { error: "Could not create post." },
        { status: 500 },
      );
    }

  const shareUrl = `${appBaseUrl()}/p/${publicSlug}`;

  let cardUrl = `${process.env.NEXT_PUBLIC_CDN_URL || appBaseUrl()}/cards/${publicSlug}.svg`;
  try {
    const meaningRow = await fetchMeaning(supabase, termId);
    const meaningText =
      meaningRow?.short_definition ||
      meaningRow?.full_explanation ||
      "Created on MeanIn.";
      const card = await generateCard({
        supabase,
        slug: publicSlug,
        text,
        meaning: meaningText,
        bucket: process.env.STORAGE_BUCKET || "cards",
      });
      cardUrl = card.cardUrl;
    } catch (cardError) {
      console.warn("Card generation failed", cardError);
    }

    return NextResponse.json({
      slug: publicSlug,
      shareUrl,
      cardUrl,
      keyword,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

async function detectOrCreateKeyword(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  text: string,
) {
  const ai = getOpenAIOrNull();

  // Try to match existing terms in text
  const { data: termList } = await supabase
    .from("terms")
    .select("phrase")
    .limit(25);

  const lower = text.toLowerCase();
  const directHit = termList?.find((t) =>
    t.phrase ? lower.includes(t.phrase.toLowerCase()) : false,
  );
  if (directHit?.phrase) return directHit.phrase;

  // AI extraction
  if (ai) {
    try {
      const completion = await ai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: keywordPrompt(text) }],
        response_format: { type: "json_object" },
      });
      const parsed = safeJson(
        completion.choices?.[0]?.message?.content || "{}",
      );
      if (parsed.keyword) return parsed.keyword;
    } catch (error) {
      console.warn("Keyword AI failed, falling back", error);
    }
  }

  return simpleKeyword(text) || "untitled";
}

async function ensureTermExists(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  keyword: string,
) {
  const { data: existing } = await supabase
    .from("terms")
    .select("id, status")
    .ilike("phrase", `%${keyword}%`)
    .maybeSingle();

  if (existing?.id) return { id: existing.id as string, status: existing.status as string | undefined };

  const slug = slugify(keyword);
  const { data, error } = await supabase
    .from("terms")
    .insert({
      phrase: keyword,
      slug,
      status: "draft",
    })
    .select("id, status")
    .single();

  if (error) {
    console.error("Failed to create term", error);
    return null;
  }

  return { id: data.id as string | null, status: data.status as string | undefined };
}

async function ensureMeaningExists(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  termId: string | null,
  keyword: string,
) {
  if (!termId) return null;

  const { data: meaningRow } = await supabase
    .from("term_meanings")
    .select("id")
    .eq("term_id", termId)
    .maybeSingle();

  if (meaningRow?.id) return meaningRow.id;

  const ai = getOpenAIOrNull();

  let parsed: Record<string, unknown> = {};
  if (ai) {
    try {
      const completion = await ai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: meaningPrompt(keyword) }],
        response_format: { type: "json_object" },
      });
      parsed = safeJson(completion.choices?.[0]?.message?.content || "{}");
    } catch (error) {
      console.warn("Meaning AI failed, inserting placeholder", error);
    }
  }

  const { data, error } = await supabase
    .from("term_meanings")
    .insert({
      term_id: termId,
      short_definition:
        parsed.short_definition || `What "${keyword}" means in this post.`,
      full_explanation: parsed.full_explanation || null,
      examples: parsed.examples || null,
    })
    .select("id, short_definition, full_explanation")
    .single();

  if (error) {
    console.error("Failed to insert meaning", error);
    return null;
  }

  return data.id as string;
}

async function createUniquePostSlug(
  supabase: ReturnType<typeof createSupabaseServerClient>,
) {
  let attempts = 0;
  while (attempts < 5) {
    const candidate = generateSlug();
    const { data } = await supabase
      .from("posts")
      .select("public_slug")
      .eq("public_slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    attempts += 1;
  }
  return generateSlug();
}

function simpleKeyword(text: string) {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    return `${words[0]} ${words[1]} ${words[2]}`;
  }
  if (words.length === 2) {
    return `${words[0]} ${words[1]}`;
  }
  return words[0] || "";
}

async function fetchMeaning(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  termId: string | null,
) {
  if (!termId) return null;
  const { data } = await supabase
    .from("term_meanings")
    .select("short_definition, full_explanation")
    .eq("term_id", termId)
    .maybeSingle();
  return data;
}

function safeJson(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

async function recordInterest(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  termId: string,
  slug: string,
  source: "viewer" | "creator",
) {
  try {
    await supabase
      .from("term_requests")
      .insert({
        term_id: termId,
        source,
        post_slug: slug,
      })
      .select("id")
      .maybeSingle();
  } catch (error) {
    console.warn("Failed to record term request", error);
  }
}
