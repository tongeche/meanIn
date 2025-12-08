import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOpenAIOrNull } from "@/lib/openai/client";
import { decodePrompt } from "@/lib/openai/prompts";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServerClient();

    const { data: post, error } = await supabase
      .from("posts")
      .select(
        `
        id,
        text,
        keyword_text,
        platform,
        public_slug,
        keyword_term_id,
        tag_slug,
        terms:keyword_term_id (
          phrase,
          status,
          term_meanings (
            short_definition,
            full_explanation,
            examples,
            origin
          )
        )
      `,
      )
      .eq("public_slug", slug)
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Could not fetch post." },
        { status: 500 },
      );
    }

    if (!post) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const meaning = await normalizeMeaning(supabase, post);
    if (post.keyword_term_id) {
      await recordInterest(supabase, post.keyword_term_id, slug);
      try {
        await supabase.rpc("bump_term_interest", { p_term_id: post.keyword_term_id });
      } catch {
        // Ignore bump errors
      }
    }

    // Log this decode for analytics
    await logDecode(supabase, post.id, meaning);

    // Get decode count for this post
    const { count: decodeCount } = await supabase
      .from("decodes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id);

    return NextResponse.json({
      post: {
        text: post.text,
        keywordText: post.keyword_text,
        platform: post.platform,
        slug: post.public_slug,
        tagSlug: post.tag_slug,
      },
      meaning,
      decodeCount: decodeCount || 0,
    });
  } catch (error) {
    console.error("Decode route error:", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type MeaningRow = {
  short_definition: string | null;
  full_explanation: string | null;
  examples: string[] | null;
  origin: string | null;
};

type ParsedAIMeaning = {
  base_meaning?: string;
  contextual_meaning?: string;
  local_context?: string;
  local_example?: string;
  origin?: string;
  related_terms?: string[];
};

type PostRow = {
  id: string;
  text: string;
  keyword_text: string;
  platform: string;
  public_slug: string;
  keyword_term_id?: string | null;
  tag_slug?: string | null;
  terms?: {
    phrase: string;
    status?: string | null;
    term_meanings?: MeaningRow[];
  }[] | null;
};

async function normalizeMeaning(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  post: PostRow,
) {
  const ai = getOpenAIOrNull();
  let meaningRow: MeaningRow | undefined = post.terms?.[0]?.term_meanings?.[0];
  let aiParsed: ParsedAIMeaning = {};

  const termId = post.keyword_term_id;

  const runDecodeAI = async (
    definition?: string | null,
    explanation?: string | null,
  ) => {
    if (!ai) return {};
    const completion = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: decodePrompt(
            post.text,
            post.keyword_text || post.text,
            definition,
            explanation,
          ),
        },
      ],
      response_format: { type: "json_object" },
    });
    return safeJson(completion.choices?.[0]?.message?.content || "{}");
  };

  // If we have a termId but no meaning in DB, generate via AI and save it
  if (!meaningRow && termId) {
    // First, try to fetch from DB directly (in case it wasn't joined)
    const { data: existingMeaning } = await supabase
      .from("term_meanings")
      .select("short_definition, full_explanation, examples, origin")
      .eq("term_id", termId)
      .maybeSingle();

    if (existingMeaning) {
      meaningRow = existingMeaning as MeaningRow;
    } else {
      // Generate via AI and save to DB
      if (ai) {
        try {
          aiParsed = (await runDecodeAI(null, null)) as ParsedAIMeaning;
        } catch (error) {
          console.warn("Decode meaning AI failed, inserting placeholder", error);
        }
      }

      if (aiParsed.base_meaning) {
        meaningRow = {
          short_definition: aiParsed.base_meaning,
          full_explanation: aiParsed.contextual_meaning || null,
          examples: aiParsed.local_example ? [aiParsed.local_example] : null,
          origin: aiParsed.origin || null,
        };

        // Save to DB for future requests (fire and forget)
        supabase
          .from("term_meanings")
          .insert({
            term_id: termId,
            short_definition: meaningRow.short_definition,
            full_explanation: meaningRow.full_explanation,
            examples: meaningRow.examples,
            origin: meaningRow.origin,
          })
          .then(({ error }) => {
            if (error) console.warn("Failed to save AI meaning to DB", error);
          });
      }
    }
  }

  // If still no meaningRow (e.g., no term_id), generate a transient meaning without saving.
  if (!meaningRow) {
    if (ai) {
      try {
        aiParsed = (await runDecodeAI(null, null)) as ParsedAIMeaning;
      } catch (error) {
        console.warn("Decode meaning AI failed (no term_id), using fallback", error);
      }
    }
    meaningRow = {
      short_definition:
        aiParsed.base_meaning ||
        `People use "${post.keyword_text}" to hint at something deeper.`,
      full_explanation:
        aiParsed.contextual_meaning ||
        `They mean something specific with "${post.keyword_text}".`,
      examples: aiParsed.local_example ? [aiParsed.local_example] : null,
      origin: aiParsed.origin || null,
    };
  }

  // If we have a meaning row but missing origin/context/example, enrich via AI
  if (
    ai &&
    (!meaningRow?.origin || !meaningRow?.examples?.length || !meaningRow?.full_explanation)
  ) {
    try {
      const aiFill = (await runDecodeAI(
        meaningRow?.short_definition,
        meaningRow?.full_explanation,
      )) as ParsedAIMeaning;
      aiParsed = { ...aiParsed, ...aiFill };
    } catch (error) {
      console.warn("Decode meaning AI enrich failed", error);
    }
  }

  const parsedFallback = {
    base_meaning:
      meaningRow?.short_definition ||
      `People use "${post.keyword_text}" to hint at something deeper.`,
    contextual_meaning:
      meaningRow?.full_explanation ||
      `They mean something specific with "${post.keyword_text}".`,
    local_context: aiParsed.local_context || null,
    local_example:
      meaningRow?.examples && meaningRow.examples.length > 0
        ? meaningRow.examples[0]
        : aiParsed.local_example || null,
    origin: meaningRow?.origin || aiParsed.origin || null,
    related_terms: aiParsed.related_terms || [],
  };

  type MappedMeaning = {
    base_meaning?: string;
    contextual_meaning?: string;
    local_context?: string | null;
    local_example?: string | null;
    origin?: string | null;
    related_terms?: string[];
  };

  const mapped: MappedMeaning =
    (meaningRow as unknown as MappedMeaning)?.base_meaning ||
    (meaningRow as unknown as MappedMeaning)?.contextual_meaning
      ? (meaningRow as unknown as MappedMeaning)
      : parsedFallback;

  return {
    baseMeaning: mapped.base_meaning ?? parsedFallback.base_meaning,
    contextualMeaning:
      mapped.contextual_meaning ?? parsedFallback.contextual_meaning,
    localContext: mapped.local_context ?? parsedFallback.local_context,
    localExample: mapped.local_example ?? parsedFallback.local_example,
    origin: mapped.origin ?? parsedFallback.origin,
    relatedTerms: mapped.related_terms ?? parsedFallback.related_terms ?? [],
    isDraft: post.terms?.[0]?.status === "draft",
  };
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
) {
  try {
    await supabase
      .from("term_requests")
      .insert({
        term_id: termId,
        source: "viewer",
        post_slug: slug,
      })
      .select("id")
      .maybeSingle();
  } catch (error) {
    console.warn("Failed to record term request", error);
  }
}

// Log each decode for analytics
async function logDecode(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  postId: string,
  meaning: {
    baseMeaning: string;
    contextualMeaning: string;
    localContext?: string | null;
  },
) {
  try {
    // Get viewer context from headers
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language");
    const viewerLanguage = acceptLanguage?.split(",")[0]?.split("-")[0] || null;
    
    // Create a summary of the decode
    const decodedText = `${meaning.baseMeaning} ${meaning.contextualMeaning}`.slice(0, 500);
    
    await supabase.from("decodes").insert({
      post_id: postId,
      decoded_text: decodedText,
      base_meaning: meaning.baseMeaning,
      contextual_meaning: meaning.contextualMeaning,
      local_context: meaning.localContext || null,
      viewer_language: viewerLanguage,
    });
  } catch (error) {
    // Non-blocking - just log the error
    console.warn("Failed to log decode", error);
  }
}
