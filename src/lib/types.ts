export type Platform =
  | "whatsapp-status"
  | "instagram-story"
  | "tiktok-story";

// Tag themes for card backgrounds
export type Tag = {
  id: string;
  slug: string;
  label: string;
  description?: string;
  bgGradient?: string;
  bgImageUrls?: string[];
  textColor: string;
  accentColor: string;
};

// All available tag slugs
export type TagSlug = 
  | "love" 
  | "conflict" 
  | "existential" 
  | "growth" 
  | "hustle" 
  | "shade" 
  | "peace" 
  | "faith" 
  | "flex" 
  | "general";

export type CreatePostPayload = {
  text: string;
  platform: Platform;
  tagSlug?: TagSlug;
};

export type CreatePostResult = {
  slug: string;
  shareUrl: string;
  cardUrl: string;
  keyword: string;
  tagSlug?: TagSlug;
};

export type DecodeMeaning = {
  baseMeaning: string;
  contextualMeaning: string;
  localContext?: string | null;
  localExample?: string | null;
  origin?: string | null;
  relatedTerms: string[];
  isDraft?: boolean;
};

export type DecodeResponse = {
  post: {
    text: string;
    keywordText: string;
    platform: Platform;
    slug: string;
    tagSlug?: TagSlug;
  };
  meaning: DecodeMeaning;
  decodeCount?: number;
};

// Decode log entry
export type DecodeLog = {
  id: string;
  postId: string;
  decodedText: string;
  baseMeaning?: string;
  contextualMeaning?: string;
  localContext?: string;
  viewerCountry?: string;
  viewerLanguage?: string;
  createdAt: string;
};

export type CardResponse = {
  slug: string;
  shareUrl: string;
  cardUrl: string;
};
