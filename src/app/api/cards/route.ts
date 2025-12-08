import { NextResponse } from "next/server";
import { appBaseUrl } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = typeof body.slug === "string" ? body.slug : "";
    const text = typeof body.text === "string" ? body.text : "";
    const meaning = typeof body.meaning === "string" ? body.meaning : "";

    if (!slug) {
      return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    // Placeholder card generation. Replace with actual render/upload.
    const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || appBaseUrl();
    const cardUrl = `${baseUrl}/cards/${slug}.png`;
    const shareUrl = `${appBaseUrl()}/p/${slug}`;

    return NextResponse.json({
      slug,
      cardUrl,
      shareUrl,
      preview: {
        text,
        meaning,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
