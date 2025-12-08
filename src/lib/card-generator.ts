import { appBaseUrl } from "./utils";
import type { TagSlug } from "./types";

// Theme configurations for each tag
const TAG_THEMES: Record<TagSlug, { gradient: string; accent: string; textColor: string }> = {
  love: {
    gradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a0a14"/>
      <stop offset="50%" stop-color="#2d1f2f"/>
      <stop offset="100%" stop-color="#1a0a14"/>
    </linearGradient>`,
    accent: "#FF6B9D",
    textColor: "#F4F4F7",
  },
  conflict: {
    gradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a0f0a"/>
      <stop offset="50%" stop-color="#2f1f1a"/>
      <stop offset="100%" stop-color="#1a0f0a"/>
    </linearGradient>`,
    accent: "#FF6B3D",
    textColor: "#F4F4F7",
  },
  existential: {
    gradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a1a"/>
      <stop offset="50%" stop-color="#1a1a2f"/>
      <stop offset="100%" stop-color="#0a0a1a"/>
    </linearGradient>`,
    accent: "#8B5CFF",
    textColor: "#F4F4F7",
  },
  growth: {
    gradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a1a0f"/>
      <stop offset="50%" stop-color="#1a2f1f"/>
      <stop offset="100%" stop-color="#0a1a0f"/>
    </linearGradient>`,
    accent: "#4ADE80",
    textColor: "#F4F4F7",
  },
  hustle: {
    gradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1a0a"/>
      <stop offset="50%" stop-color="#2f2f1a"/>
      <stop offset="100%" stop-color="#1a1a0a"/>
    </linearGradient>`,
    accent: "#FBBF24",
    textColor: "#F4F4F7",
  },
  shade: {
    gradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f0a1a"/>
      <stop offset="50%" stop-color="#1f1a2f"/>
      <stop offset="100%" stop-color="#0f0a1a"/>
    </linearGradient>`,
    accent: "#A78BFA",
    textColor: "#F4F4F7",
  },
  peace: {
    gradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a1414"/>
      <stop offset="50%" stop-color="#1a2424"/>
      <stop offset="100%" stop-color="#0a1414"/>
    </linearGradient>`,
    accent: "#5EEAD4",
    textColor: "#F4F4F7",
  },
  faith: {
    gradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#14140a"/>
      <stop offset="50%" stop-color="#24241a"/>
      <stop offset="100%" stop-color="#14140a"/>
    </linearGradient>`,
    accent: "#F9F7C9",
    textColor: "#F4F4F7",
  },
  flex: {
    gradient: `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a0a0a"/>
      <stop offset="50%" stop-color="#2f1a1a"/>
      <stop offset="100%" stop-color="#1a0a0a"/>
    </linearGradient>`,
    accent: "#F472B6",
    textColor: "#F4F4F7",
  },
  general: {
    gradient: `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A0A0F"/>
      <stop offset="100%" stop-color="#1B1B24"/>
    </linearGradient>`,
    accent: "#4A90FF",
    textColor: "#F4F4F7",
  },
};

type CardParams = {
  slug: string;
  text: string;
  meaning: string;
  bucket: string;
  tagSlug?: TagSlug;
  supabase: ReturnType<typeof import("./supabase/server").createSupabaseServerClient>;
};

export async function generateCard({
  slug,
  text,
  meaning,
  bucket,
  tagSlug = "general",
  supabase,
}: CardParams) {
  const svg = buildSvg(text, meaning, slug, tagSlug);
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

function buildSvg(text: string, meaning: string, slug: string, tagSlug: TagSlug = "general") {
  const theme = TAG_THEMES[tagSlug] || TAG_THEMES.general;
  const safeText = escapeXml(text).slice(0, 180);
  const safeMeaning = escapeXml(meaning).slice(0, 280);
  
  // Word wrap text for better display
  const wrappedText = wrapText(safeText, 36);
  const wrappedMeaning = wrapText(safeMeaning, 45);
  
  return `
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${theme.gradient}
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)" />
  
  <!-- Decorative elements -->
  <circle cx="900" cy="200" r="150" fill="${theme.accent}" opacity="0.08" />
  <circle cx="180" cy="1700" r="120" fill="${theme.accent}" opacity="0.06" />
  
  <!-- Quote marks -->
  <text x="60" y="380" font-family="Georgia, serif" font-size="120" fill="${theme.accent}" opacity="0.3">"</text>
  
  <!-- Main text -->
  ${wrappedText.map((line, i) => 
    `<text x="80" y="${440 + i * 56}" font-family="Inter, system-ui, sans-serif" font-size="46" fill="${theme.textColor}" font-weight="600">${line}</text>`
  ).join('\n  ')}
  
  <!-- Divider line -->
  <rect x="80" y="${480 + wrappedText.length * 56}" width="120" height="4" fill="${theme.accent}" rx="2" />
  
  <!-- Meaning label -->
  <text x="80" y="${560 + wrappedText.length * 56}" font-family="Inter, system-ui, sans-serif" font-size="28" fill="${theme.accent}" font-weight="600" letter-spacing="0.15em">MEANING</text>
  
  <!-- Meaning text -->
  ${wrappedMeaning.map((line, i) => 
    `<text x="80" y="${620 + wrappedText.length * 56 + i * 44}" font-family="Inter, system-ui, sans-serif" font-size="32" fill="${theme.textColor}" font-weight="400" opacity="0.9">${line}</text>`
  ).join('\n  ')}
  
  <!-- Footer -->
  <rect x="0" y="1820" width="1080" height="100" fill="${theme.accent}" opacity="0.1" />
  <text x="80" y="1870" font-family="Inter, system-ui, sans-serif" font-size="24" fill="${theme.textColor}" opacity="0.7">
    meanin.app/p/${slug}
  </text>
  <text x="1000" y="1870" font-family="Inter, system-ui, sans-serif" font-size="24" fill="${theme.accent}" font-weight="600" text-anchor="end">
    MeanIn
  </text>
</svg>`;
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  return lines.slice(0, 4); // Max 4 lines
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
