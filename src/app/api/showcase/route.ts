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
  categories: string[];
}

// GET /api/showcase - Fetch posts for showcase with category filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    
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
    
    const { data: posts, error } = await query.limit(9);

    if (error) {
      console.error("Error fetching showcase posts:", error);
      return NextResponse.json({ posts: [], categories: [] });
    }

    // Get distinct categories
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
    
    // Get top 5 categories
    const categories = Array.from(categorySet).slice(0, 5);

    return NextResponse.json({ 
      posts: posts || [], 
      categories 
    });
  } catch (error) {
    console.error("Error in GET /api/showcase:", error);
    return NextResponse.json({ posts: [], categories: [] });
  }
}
