import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export interface ShowcasePost {
  id: string;
  text: string;
  keyword_text: string;
  public_slug: string;
  created_at: string;
}

export interface ShowcaseResponse {
  posts: ShowcasePost[];
  categories: { label: string; slug: string; bg_gradient?: string | null; text_color?: string | null; accent_color?: string | null }[];
  tagDetail?: {
    tag: { label: string; slug: string; bg_gradient?: string | null; text_color?: string | null; accent_color?: string | null };
    samplePost?: { text: string; keyword_text: string | null };
    meaning?: {
      short_definition: string | null;
      full_explanation: string | null;
      examples: string[] | string | null;
    };
  };
}

// GET /api/showcase - Fetch posts for showcase with category filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tagParam = searchParams.get("tag");
    
    const supabase = createSupabaseServerClient();
    
    // Build query
    let query = supabase
      .from("posts")
      .select("id, text, keyword_text, public_slug, created_at")
      .not("keyword_text", "is", null)
      .order("created_at", { ascending: false });
    
    // Filter by category if provided
    if (category && category !== "All") {
      query = query.ilike("keyword_text", category);
    }
    
    const { data: posts, error } = await query.limit(30);

    if (error) {
      console.error("Error fetching showcase posts:", error);
      return NextResponse.json({ posts: [], categories: [] });
    }

    // Prefer tags from the tags table; fall back to distinct keywords
    const { data: tagData } = await supabase
      .from("tags")
      .select("label, slug, bg_gradient, text_color, accent_color")
      .order("created_at", { ascending: false })
      .limit(20);

    let categories: { label: string; slug: string; bg_gradient?: string | null; text_color?: string | null; accent_color?: string | null }[] = [];
    if (tagData && tagData.length > 0) {
      categories = tagData
        .map((t) => ({
          label: t.label || t.slug || "",
          slug: t.slug || t.label || "",
          bg_gradient: t.bg_gradient,
          text_color: t.text_color,
          accent_color: t.accent_color,
        }))
        .filter((t) => Boolean(t.slug));
    } else {
      const { data: categoryData } = await supabase
        .from("posts")
        .select("keyword_text")
        .not("keyword_text", "is", null)
        .order("created_at", { ascending: false })
        .limit(100);

      const categorySet = new Set<string>();
      for (const row of categoryData || []) {
        if (row.keyword_text?.trim()) {
          categorySet.add(row.keyword_text.trim());
        }
      }
      
      categories = Array.from(categorySet)
        .slice(0, 12)
        .map((c) => ({ label: c, slug: c }));
    }

    // Tag detail when requested
    let tagDetail = undefined;
    const effectiveTag = tagParam || categories[0]?.slug;
    if (effectiveTag) {
      const { data: tagRow } = await supabase
        .from("tags")
        .select("label, slug, bg_gradient, text_color, accent_color")
        .or(`slug.eq.${effectiveTag},label.ilike.${effectiveTag}`)
        .maybeSingle();

      const tagMeta = {
        label: tagRow?.label ?? effectiveTag,
        slug: tagRow?.slug ?? effectiveTag,
        bg_gradient: tagRow?.bg_gradient ?? null,
        text_color: tagRow?.text_color ?? null,
        accent_color: tagRow?.accent_color ?? null,
      };

      const { data: samplePost } = await supabase
        .from("posts")
        .select("text, keyword_text, keyword_term_id")
        .eq("tag_slug", tagMeta.slug)
        .order("created_at", { ascending: false })
        .maybeSingle();

      let meaning = undefined;
      if (samplePost?.keyword_term_id) {
        const { data: meaningRow } = await supabase
          .from("term_meanings")
          .select("short_definition, full_explanation, examples")
          .eq("term_id", samplePost.keyword_term_id as string)
          .maybeSingle();
        meaning = meaningRow || undefined;
      }

      tagDetail = {
        tag: {
          label: tagMeta.label || tagMeta.slug,
          slug: tagMeta.slug,
          bg_gradient: tagMeta.bg_gradient,
          text_color: tagMeta.text_color,
          accent_color: tagMeta.accent_color,
        },
        samplePost: samplePost
          ? { text: samplePost.text, keyword_text: samplePost.keyword_text }
          : undefined,
        meaning,
      };
    }

    return NextResponse.json({ 
      posts: posts || [], 
      categories,
      tagDetail,
    });
  } catch (error) {
    console.error("Error in GET /api/showcase:", error);
    return NextResponse.json({ posts: [], categories: [] });
  }
}
