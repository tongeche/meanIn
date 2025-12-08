import { appBaseUrl } from "./utils";

type CardParams = {
  slug: string;
  text: string;
  meaning: string;
  bucket: string;
  supabase: ReturnType<typeof import("./supabase/server").createSupabaseServerClient>;
};

export async function generateCard({
  slug,
  text,
  meaning,
  bucket,
  supabase,
}: CardParams) {
  const svg = buildSvg(text, meaning, slug);
  const path = `cards/${slug}.svg`;

  const upload = await supabase.storage.from(bucket).upload(path, svg, {
    upsert: true,
    contentType: "image/svg+xml",
  });

  if (upload.error) {
    throw upload.error;
  }

  const publicUrl =
    supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl ||
    `${appBaseUrl()}/cards/${slug}.svg`;

  return { cardUrl: publicUrl };
}

function buildSvg(text: string, meaning: string, slug: string) {
  const safeText = escapeXml(text).slice(0, 180);
  const safeMeaning = escapeXml(meaning).slice(0, 280);
  return `
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A0A0F"/>
      <stop offset="100%" stop-color="#1B1B24"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)" />
  <text x="80" y="420" font-family="Inter, sans-serif" font-size="44" fill="#F4F4F7" font-weight="600">
    ${safeText}
  </text>
  <text x="80" y="640" font-family="Inter, sans-serif" font-size="34" fill="#8B5CFF" font-weight="600">
    Meaning
  </text>
  <text x="80" y="700" font-family="Inter, sans-serif" font-size="32" fill="#F4F4F7" font-weight="500">
    ${safeMeaning}
  </text>
  <text x="80" y="1800" font-family="Inter, sans-serif" font-size="24" fill="#A7A7B2">
    meanin.com/p/${slug}
  </text>
</svg>`;
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
