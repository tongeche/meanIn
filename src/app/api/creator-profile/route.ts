import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getOpenAIOrNull } from "@/lib/openai/client";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.warn("Supabase environment variables are missing for creator-profile route.");
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization") || "";
  const user = await getUserFromAuth(authHeader);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseService = createClient(supabaseUrl!, supabaseServiceKey!);
  const { data, error } = await supabaseService
    .from("profiles")
    .select("creator_profile")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }

  return NextResponse.json({ profile: data?.creator_profile ?? {} });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization") || "";
  const user = await getUserFromAuth(authHeader);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const cep = body?.cep || {};

  const analyzed = await analyzeCep(cep);

  const supabaseService = createClient(supabaseUrl!, supabaseServiceKey!);
  const { error } = await supabaseService
    .from("profiles")
    .update({
      creator_profile: {
        version: "v1",
        cep,
        analyzed,
        updatedAt: new Date().toISOString(),
      },
    })
    .eq("id", user.id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, analyzed });
}

async function getUserFromAuth(authHeader: string) {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return null;
  }
  return data.user;
}

async function analyzeCep(cep: Record<string, unknown>) {
  const ai = getOpenAIOrNull();
  if (!ai) {
    return { summary: "AI offline", derived: {} };
  }

  try {
    const completion = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You summarize a user's creative profile for generating short coded statuses in their voice. Return compact JSON with tone, style, themes, avoid, metaphor_density (0-1), cryptic_level (0-1), slang_level (0-1), and reference pools from music/films/hobbies.",
        },
        {
          role: "user",
          content: `Profile input (JSON): ${JSON.stringify(cep)}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const parsed =
      (completion.choices?.[0]?.message?.content &&
        JSON.parse(completion.choices[0].message.content)) ||
      {};
    return parsed;
  } catch (error) {
    console.error("AI analyze failed", error);
    return { summary: "analysis_failed", derived: {} };
  }
}
