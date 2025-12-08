import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchResult = {
  public_slug: string;
  keyword_text: string | null;
  text: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select("public_slug, keyword_text, text")
      .or(`text.ilike.%${q}%,keyword_text.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ results: [] }, { status: 500 });
    }

    const results =
      data?.map((row: SearchResult) => ({
        slug: row.public_slug,
        keyword: row.keyword_text || "",
        text: row.text,
      })) || [];

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Unexpected search error:", err);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
