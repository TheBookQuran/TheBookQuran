export interface LinguisticRoot {
  id: string;
  arabicText: string;
  occurrencesCount: number;
  lanesMeaning?: string;
  maqayisMeaning?: string;
  transliteration?: string;
}

export interface WitnessSet {
  quran?: string[];
  hadith?: string[];
  poetry?: string[];
  examples?: string[];
}

/** A single derived form with its morphological info and meaning */
export interface Derivation {
  lemma: string;    // الكلمة المشتقة بالعربي (e.g. "ضَدَّهُ")
  form: string;     // الوزن / الباب الصرفي (e.g. "Form I", "Form III - فاعل")
  meaning: string;  // معنى المشتق بلغة المعجم (English for Lane's)
}

/** A single cited authority with the relevant quoted text */
export interface LexiconReference {
  source: string;  // رمز المعجم (e.g. "S", "K", "Msb", "TA", "L", "AA")
  text: string;    // النص المقتبس أو السياق المنسوب إليه
}

export interface EnrichedLexiconEntry {
  rootId: string;
  source: "lanes";
  enrichedAt: string;
  modelId: string;

  /** The fundamental conceptual origin/nucleus of the root (concept-level, not literal) */
  semanticCore: string;

  /** The simplest direct meaning to understand the root in the Quran */
  primaryMeaning: string;

  /** Core semantic usage and relevance within the Quranic context */
  quranicRelevance: string;

  /** Key derivations (lemma + form + meaning) that are common or relevant, ignoring rare noise */
  keyDerivations: Derivation[];

  /** Figurative, metaphorical or rare usages, kept optional/collapsible */
  figurativeOrRareUsages: string[];

  /** Discarded noise - extremely rare or obscure details filtered out from the main view (kept for completeness) */
  discardedNoise: string[];

  /** Concise English summary for the collapsed drawer view */
  summaryEn: string;

  /** Arabic translation of summaryEn */
  summaryAr: string;

  /** Verbatim raw HTML text of the original entry */
  rawText: string;
}

export interface RootOccurrence {
  chapterNumber: number;
  verseNumber: number;
  wordPosition: number;
}

export type RootsMap = Record<string, LinguisticRoot>;
export type OccurrencesMap = Record<string, RootOccurrence[]>;
export type WordToRootMap = Record<string, string>;

export interface LexiconProviderMeta {
  id: string;
  label: string;
  license: string;
  url: string | null;
  retrievedAt: string;
}

export interface LexiconFileMeta {
  providerId?: string;
  baseProviderId?: string;
  recordCount: number;
  checksum?: string;
  fields?: Record<string, { provider: string; coverage: number }>;
}

export interface LexiconManifest {
  generatedAt: string;
  schemaVersion: string;
  files: {
    "roots.json": LexiconFileMeta;
    "word_to_root.json": LexiconFileMeta;
    "occurrences.json": LexiconFileMeta;
  };
  providers: LexiconProviderMeta[];
}

