import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getOpenAIOrNull } from "@/lib/openai/client";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("Authorization") || "";
  const user = await getUserFromAuth(authHeader);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const seed = typeof body.seed === "string" ? body.seed : "";

  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
  const { data: profileRow } = await supabaseService
    .from("profiles")
    .select("creator_profile")
    .eq("id", user.id)
    .maybeSingle();

  const analyzed = profileRow?.creator_profile?.analyzed || {};

  const ai = getOpenAIOrNull();
  if (!ai) {
    return NextResponse.json({ suggestions: fallbackSuggestions() });
  }

  try {
    const completion = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You write short, coded status lines under 140 chars in the user's voice. Use tone/style/themes/avoid from the profile. Keep it human and subtle, not generic.",
        },
        {
          role: "user",
          content: `Profile: ${JSON.stringify(analyzed)}\nSeed (optional): ${seed}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    const suggestions: string[] = Array.isArray(parsed.suggestions)
      ? parsed.suggestions.map((s: unknown) => String(s)).slice(0, 6)
      : [];

    return NextResponse.json({
      suggestions: suggestions.length > 0 ? suggestions : fallbackSuggestions(),
      suggestion_id: crypto.randomUUID(),
    });
  } catch (error) {
    console.error("Predict error", error);
    return NextResponse.json({ suggestions: fallbackSuggestions() }, { status: 200 });
  }
}

async function getUserFromAuth(authHeader: string) {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

function fallbackSuggestions() {
  return [
    "Silence isn’t empty—it’s where I keep the parts of me you don’t see.",
    "We’re fine. That’s the loudest lie two people can tell together.",
    "Work is loud; purpose is quiet. I’m tuning the static.",
    "If you know the song, you know what I mean. I’m on the verse before the chorus.",
    "Weekends feel like sunlight on the floor—here for a moment, gone if you blink.",
    "Inside jokes age like wine. Ours just got another year older.",
  ];
}
