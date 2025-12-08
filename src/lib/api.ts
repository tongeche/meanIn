import type {
  CardResponse,
  CreatePostPayload,
  CreatePostResult,
  DecodeResponse,
} from "./types";

export async function createPost(
  payload: CreatePostPayload,
): Promise<CreatePostResult> {
  const response = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create post");
  }

  return response.json();
}

export async function fetchDecode(slug: string): Promise<DecodeResponse> {
  const response = await fetch(`/api/decode/${slug}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch decode");
  }

  return response.json();
}

export async function createCard(
  slug: string,
  text: string,
  meaning?: string,
): Promise<CardResponse> {
  const response = await fetch("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, text, meaning }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create card");
  }

  return response.json();
}
