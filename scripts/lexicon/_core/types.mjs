/**
 * @typedef {Object} ProviderInfo
 * @property {string} id          - Unique identifier for the provider (e.g., 'qac-v0.4', 'lanes-gibreel')
 * @property {string} label       - Human-readable name (e.g., 'Quranic Arabic Corpus v0.4')
 * @property {string} license     - License under which the text is distributed (e.g., 'GPL-3.0', 'Public Domain')
 * @property {string} [url]       - URL of the source repository or website
 * @property {string} retrievedAt - ISO timestamp of when the data was retrieved
 */

/**
 * @typedef {Object} RootPatch
 * @property {string} arabicText - The Arabic text of the root (e.g., 'كتب', 'ضرب')
 * @property {string} field      - The field to patch (e.g., 'lanes_meaning', 'maqayis_meaning')
 * @property {string} value      - The text definition value
 * @property {string} hash       - A 16-character SHA-256 hash prefix of the value for integrity verification
 * @property {string} method     - Matching method (e.g., 'exact', 'normalized')
 */

/**
 * @typedef {Object} LexiconProviderResult
 * @property {ProviderInfo} provider - Provider metadata
 * @property {Record<string, string>} [wordToRoot] - Optional mapping of "chapter:verse:word" to Arabic root text
 * @property {Record<string, Array<{chapterNumber: number, verseNumber: number, wordPosition: number}>>} [occurrences] - Optional occurrence lists per root text
 * @property {RootPatch[]} rootPatches - Array of patches for root meanings
 */

export {};
