export type Platform =
  | "whatsapp-status"
  | "instagram-story"
  | "tiktok-story";

export type CreatePostPayload = {
  text: string;
  platform: Platform;
};

export type CreatePostResult = {
  slug: string;
  shareUrl: string;
  cardUrl: string;
  keyword: string;
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
  };
  meaning: DecodeMeaning;
};

export type CardResponse = {
  slug: string;
  shareUrl: string;
  cardUrl: string;
};
