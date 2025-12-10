import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

type Tag = { slug: string; label: string | null };
type Post = { id: string; text: string; keyword_text: string | null; tag_slug: string | null };

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_MIGRATIONS;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

async function fetchTags(): Promise<Tag[]> {
  const { data, error } = await supabase.from("tags").select("slug,label");
  if (error) throw error;
  return data || [];
}

async function fetchUnTaggedPosts(limit = 25): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id,text,keyword_text,tag_slug")
    .is("tag_slug", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

async function fetchTaggedPostsMissingTags(limit = 50): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id,text,keyword_text,tag_slug")
    .not("tag_slug", "is", null)
    .limit(limit);
  if (error) throw error;
  return (data || []).filter((p) => !p.tag_slug);
}

function simpleMatch(post: Post, tags: Tag[]): Tag | null {
  const text = `${post.keyword_text || ""} ${post.text || ""}`.toLowerCase();
  for (const tag of tags) {
    const label = (tag.label || tag.slug).toLowerCase();
    if (label && text.includes(label)) return tag;
  }
  return null;
}

async function aiSuggestTag(post: Post, tags: Tag[]): Promise<{ slug: string; label: string }> {
  if (!openai) {
    const fallback = simpleMatch(post, tags);
    if (fallback) return { slug: fallback.slug, label: fallback.label || fallback.slug };
    return { slug: "general", label: "General" };
  }

  const tagList = tags.map((t) => t.label || t.slug).join(", ");
  const prompt = `
You are assigning a tag to a social post. Choose one of the existing tags when possible.
Existing tags: ${tagList || "none"}

Post text: "${post.text}"
Keyword: "${post.keyword_text || ""}"

Respond as JSON: { "tag": "<existing tag or new label>" }
  `.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    const content = completion.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    const tag = typeof parsed.tag === "string" && parsed.tag.trim() ? parsed.tag.trim() : "General";
    const existing = tags.find((t) => (t.label || t.slug).toLowerCase() === tag.toLowerCase());
    if (existing) return { slug: existing.slug, label: existing.label || existing.slug };
    return { slug: tag.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""), label: tag };
  } catch (error) {
    console.error("AI suggestion failed, using fallback:", error);
    const fallback = simpleMatch(post, tags);
    if (fallback) return { slug: fallback.slug, label: fallback.label || fallback.slug };
    return { slug: "general", label: "General" };
  }
}

async function upsertTag(tag: { slug: string; label: string }) {
  const { error } = await supabase
    .from("tags")
    .upsert({ slug: tag.slug, label: tag.label }, { onConflict: "slug" });
  if (error) throw error;
}

async function updatePostTag(postId: string, tagSlug: string) {
  const { error } = await supabase.from("posts").update({ tag_slug: tagSlug }).eq("id", postId);
  if (error) throw error;
}

async function main() {
  console.log("Fetching tags and untagged posts…");
  const tags = await fetchTags();
  const posts = await fetchUnTaggedPosts();
  const taggedMissing = await fetchTaggedPostsMissingTags();

  const total = posts.length + taggedMissing.length;
  if (!total) {
    console.log("No posts to tag or missing tag metadata.");
    return;
  }

  console.log(`Tagging ${posts.length} untagged posts and ensuring tag records for ${taggedMissing.length} tagged posts…`);
  for (const post of posts) {
    const suggestion = await aiSuggestTag(post, tags);
    if (!tags.find((t) => t.slug === suggestion.slug)) {
      await upsertTag(suggestion);
      tags.push({ slug: suggestion.slug, label: suggestion.label });
      console.log(`Created tag ${suggestion.label} (${suggestion.slug})`);
    }
    await updatePostTag(post.id, suggestion.slug);
    console.log(`Post ${post.id} -> ${suggestion.slug}`);
  }
  // Ensure tags table has rows for already-tagged posts with missing tag definitions
  for (const post of taggedMissing) {
    if (!post.tag_slug) continue;
    if (!tags.find((t) => t.slug === post.tag_slug)) {
      const label = post.tag_slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
      await upsertTag({ slug: post.tag_slug, label });
      tags.push({ slug: post.tag_slug, label });
      console.log(`Created missing tag ${label} (${post.tag_slug}) from existing post.`);
    }
  }
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
