const KEYWORD_PROMPT = `
You are the Keyword Engine for MeanIn, an app that explains the hidden meaning behind short status posts.

Extract the ONE phrase in the user's sentence that carries the strongest cultural, emotional, or metaphorical meaning.
- Prefer multi-word expressions over single words.
- Do NOT invent new slang.
- If nothing stands out, return the most meaningful 1-3 word phrase you can find.

Return JSON:
{ "keyword": "string" }

Sentence: "{{TEXT}}"
`;

const MEANING_PROMPT = `
You are the Meaning Generator for MeanIn.

Define the keyword in simple, human language.
- Provide a short definition and a deeper explanation.
- Keep it friendly, not academic.
- Include one example sentence if possible.

Keyword: "{{KEYWORD}}"

Return JSON:
{
  "short_definition": "1-2 sentences",
  "full_explanation": "3-6 sentences",
  "examples": ["one short example sentence"]
}
`;

export function keywordPrompt(text: string) {
  return KEYWORD_PROMPT.replace("{{TEXT}}", text);
}

export function meaningPrompt(keyword: string) {
  return MEANING_PROMPT.replace(/{{KEYWORD}}/g, keyword);
}

const DECODE_PROMPT = `
You are the Decode Engine for MeanIn. Summarize the meaning of a phrase in the context of a specific post.

Return JSON:
{
  "base_meaning": "1-2 line universal definition of the keyword",
  "contextual_meaning": "1-2 lines explaining what the author likely meant in THIS post",
  "local_context": "1 line of regional/cultural context if relevant, else null",
  "local_example": "1 short example in local slang/language if relevant, else null",
  "origin": "2-3 sentences about the history, sources, and usage of this phrase — include etymology, how it evolved, and 1-2 notable recent mentions (news, music, social, or pop culture) like a dictionary entry. null if unknown",
  "related_terms": ["array","of","related","keywords"]
}

Post text: "{{TEXT}}"
Keyword: "{{KEYWORD}}"
Definition: "{{DEFINITION}}"
Explanation: "{{EXPLANATION}}"
`;

export function decodePrompt(
  text: string,
  keyword: string,
  definition?: string | null,
  explanation?: string | null,
) {
  return DECODE_PROMPT.replace("{{TEXT}}", text)
    .replace(/{{KEYWORD}}/g, keyword)
    .replace("{{DEFINITION}}", definition || "")
    .replace("{{EXPLANATION}}", explanation || "");
}
