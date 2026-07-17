const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

export function decodeHtmlEntities(text: string): string {
  return text.replace(/&[#a-zA-Z0-9]+;/g, (match) => HTML_ENTITIES[match] || match);
}

/**
 * Strips HTML tags and decodes common entities, safe for both SSR and client-side execution.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";

  // Replace HTML tags with space
  let text = html.replace(/<[^>]*>/g, " ");

  // Normalize multiple spaces/newlines to a single space
  text = text.replace(/\s+/g, " ");

  return decodeHtmlEntities(text).trim();
}

/**
 * Truncates text to a maximum character length, avoiding cutting words in half.
 */
export function truncateAtWord(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  // Slice to maxChars
  const slice = text.slice(0, maxChars);
  // Find last space to avoid cutting a word in half
  const lastSpace = slice.lastIndexOf(" ");

  // Only cut at space if it's within a reasonable range (75%) of the max size
  if (lastSpace > maxChars * 0.75) {
    return slice.slice(0, lastSpace).trim() + "...";
  }

  return slice.trim() + "...";
}

export interface LexParagraph {
  verbForm: number | null;
  headword: string;
  rawHtml: string;
  isReferenceOnly: boolean;
}

/**
 * Parses Lane's Lexicon HTML into structured paragraphs.
 */
export function parseLanesParagraphs(html: string): LexParagraph[] {
  if (!html) return [];

  // Split by newline to get paragraphs
  const lines = html.split("\n");
  const paragraphs: LexParagraph[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Strip HTML tags to find the raw text pattern at the start
    const stripped = trimmedLine.replace(/<[^>]*>/g, "").trim();

    // Match Arabic word at the start, followed by optional Form number
    const match = stripped.match(/^([\u0600-\u06FF\u0671\u064B-\u065F\u200F\u200E]+)(?:\s+(\d+))?/);
    const headword = match ? match[1] : "";
    const verbForm = match && match[2] ? parseInt(match[2], 10) : null;

    // Check if it's reference only (e.g. contains 'see' and is relatively short)
    const plain = stripped.toLowerCase();
    const isReferenceOnly = (plain.includes("see ") || plain.includes("see")) && stripped.length < 150;

    paragraphs.push({
      verbForm,
      headword,
      rawHtml: trimmedLine,
      isReferenceOnly,
    });
  }

  return paragraphs;
}

/**
 * Selects the best primary paragraph for the summary view.
 */
export function selectPrimaryParagraph(paras: LexParagraph[]): LexParagraph | null {
  if (paras.length === 0) return null;

  let bestPara = paras[0];
  let bestScore = -999;

  for (const para of paras) {
    let score = 0;

    // Form I verbs are the highest priority
    if (para.verbForm === 1) {
      score += 100;
    }
    // Nouns/Adjectives are second priority
    else if (para.verbForm === null && para.headword) {
      score += 80;
    }
    // Common derived verb forms (II - IV)
    else if (para.verbForm !== null && para.verbForm >= 2 && para.verbForm <= 4) {
      score += 60;
    }
    // Rare verb forms (V - X)
    else if (para.verbForm !== null && para.verbForm > 4) {
      score += 40;
    }

    // Reference-only entries are lowest priority
    if (para.isReferenceOnly) {
      score -= 70;
    }

    // Small length bonus to prefer richer entries
    score += Math.min(para.rawHtml.length / 200, 10);

    if (score > bestScore) {
      bestScore = score;
      bestScore = score;
      bestPara = para;
    }
  }

  return bestPara;
}

/**
 * Extracts the core meaning of a paragraph by cleaning up sources and grammar prefixes.
 */
export function extractCoreMeaning(paraHtml: string): {
  headword: string;
  coreSentence: string;
} {
  if (!paraHtml) return { headword: "", coreSentence: "" };

  // 1. Extract headword
  const stripped = paraHtml.replace(/<[^>]*>/g, " ").trim();
  const firstWordMatch = stripped.match(/^([\u0600-\u06FF\u0671\u064B-\u065F\u200F\u200E]+)/);
  const headword = firstWordMatch ? firstWordMatch[1] : "";

  // 2. Take only the primary sense (before ===)
  let cleaned = paraHtml.split("===")[0].trim();

  // 3. Remove leading headword and form number
  cleaned = cleaned.replace(/^[\s\u0600-\u06FF\u0671\u064B-\u065F\d,🡻\u200F\u200E]+/, "");

  // 4. Remove common sources in parentheses, e.g. (S, K) or (S, Msb, K)
  cleaned = cleaned.replace(/\s*\(\s*(?:[A-Z][A-Za-z0-9]*|\*)(?:\s*,\s*(?:[A-Z][A-Za-z0-9]*|\*|\.\s*))*\s*\)/g, "");
  cleaned = cleaned.replace(/\s*\(\s*\)/g, ""); // empty parens

  // 5. Remove grammatical prefix patterns (e.g. inf. n., [aor. ], first pers. )
  cleaned = cleaned.replace(/^\s*,?\s*\(inf\.\s*n\.\s*[^)]+\)/g, "");
  cleaned = cleaned.replace(/^\s*,?\s*\[aor\.\s*[^\]]+\]/g, "");
  cleaned = cleaned.replace(/^\s*,?\s*first\s+pers\.\s*[^,]+,/g, "");
  cleaned = cleaned.replace(/^\s*,?\s*inf\.\s*n\.\s*[^,]+,/g, "");
  cleaned = cleaned.replace(/^\s*,?\s*aor\.\s*[^,]+,/g, "");

  // Clean leading punctuation
  cleaned = cleaned.replace(/^[\s,;.:]+/, "").trim();

  // 6. Get first sentence (splitting on dot followed by space/tag)
  const sentences = cleaned.split(/\.\s+(?=[A-Z<])/);
  let coreSentence = sentences[0] || cleaned;

  // If the sentence is extremely short, append the second one if available
  if (coreSentence.replace(/<[^>]*>/g, "").length < 25 && sentences.length > 1) {
    coreSentence = coreSentence + ". " + sentences[1];
  }

  // Ensure sentence ends with a dot
  const plainCore = coreSentence.replace(/<[^>]*>/g, "").trim();
  if (plainCore && !plainCore.endsWith(".") && !plainCore.endsWith(":") && !plainCore.endsWith(";")) {
    coreSentence = coreSentence.trim() + ".";
  }

  // Decode HTML entities
  coreSentence = decodeHtmlEntities(coreSentence);

  return {
    headword,
    coreSentence: coreSentence.trim(),
  };
}

