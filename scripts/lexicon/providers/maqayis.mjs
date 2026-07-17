import { DatabaseSync } from "node:sqlite";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "db_extracted", "db.sqlite");

// ─── Arabic normalization helpers ───────────────────────────────────────────

/** Normalize all alef forms (أ, إ, آ, ٱ) to bare alef (ا) */
function normalizeAlef(str) {
  return str.replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627");
}

/**
 * Multi-strategy root lookup against the maqayeesul_luga table.
 *
 * Ibn Faris organizes geminate (مضاعف) roots by their 2-letter stem,
 * e.g., ضدد → ضد, ضرر → ضر. This function handles that gracefully.
 *
 * @param {object} stmtExact - Prepared SELECT statement (takes 1 param: word)
 * @param {string} rootText   - The Arabic root text to look up
 * @returns {{ meanings: string, method: string } | null}
 */
function lookupMaqayis(stmtExact, rootText) {
  // Strategy 1: Exact match
  let result = stmtExact.get(rootText);
  if (result) return { meanings: result.meanings, method: "exact" };

  // Strategy 2: Alef normalization (e.g., 'انس' → 'أنس')
  const normAlef = normalizeAlef(rootText);
  if (normAlef !== rootText) {
    result = stmtExact.get(normAlef);
    if (result) return { meanings: result.meanings, method: "alef_normalized" };
  }

  // Strategy 3: Geminate shortening — root[1] == root[2], try first 2 letters
  // e.g., ضدد → ضد, ضلل → ضل, طفف → طف
  const chars = [...rootText]; // Unicode-safe character split
  if (chars.length === 3 && chars[1] === chars[2]) {
    const stem = chars[0] + chars[1];
    result = stmtExact.get(stem);
    if (result) return { meanings: result.meanings, method: "geminate_suffix" };

    // Also try alef-normalized stem
    const normStem = normalizeAlef(stem);
    if (normStem !== stem) {
      result = stmtExact.get(normStem);
      if (result) return { meanings: result.meanings, method: "geminate_suffix_normalized" };
    }
  }

  // Strategy 4: Bare-alef → hamzated-alef (QAC uses ا, DB uses أ)
  // e.g., 'امن' → 'أمن', 'انس' → 'أنس'
  if (rootText.startsWith("\u0627")) {
    const withHamza = "\u0623" + rootText.slice(1);
    result = stmtExact.get(withHamza);
    if (result) return { meanings: result.meanings, method: "alef_to_hamza" };

    // Also try geminate shortening on the hamzated form
    const hChars = [...withHamza];
    if (hChars.length === 3 && hChars[1] === hChars[2]) {
      const stem = hChars[0] + hChars[1];
      result = stmtExact.get(stem);
      if (result) return { meanings: result.meanings, method: "alef_to_hamza_geminate" };
    }
  }

  return null;
}

/**
 * Maqayis al-Lugha Lexicon Provider.
 *
 * Reads directly from the SQLite database bundled from wizsk/arabic_lexicons.
 * Requires Node.js >= 22.5.0 (node:sqlite) and the database file to be present
 * at scripts/lexicon/db_extracted/db.sqlite (run setup-maqayis-db script first).
 *
 * @param {string[]} quranicRoots - List of unique Arabic roots found in the Quran.
 * @returns {import("../_core/types.mjs").LexiconProviderResult}
 */
export function getMaqayisData(quranicRoots) {
  // Open the DB (throws if the file doesn't exist)
  const db = new DatabaseSync(DB_PATH);
  const stmtExact = db.prepare("SELECT meanings FROM maqayeesul_luga WHERE word = ? LIMIT 1");

  const rootPatches = [];
  let matchedCount = 0;

  for (const ar of quranicRoots) {
    const lookup = lookupMaqayis(stmtExact, ar);

    if (lookup && lookup.meanings) {
      const { meanings, method } = lookup;
      const hash = crypto.createHash("sha256").update(meanings, "utf8").digest("hex").slice(0, 16);
      rootPatches.push({
        arabicText: ar,
        field: "maqayis_meaning",
        value: meanings,
        hash,
        method,
      });
      matchedCount++;
    }
    // Roots with no match are simply not patched → they keep whatever is in roots.json already
  }

  db.close();

  return {
    provider: {
      id: "maqayis-ibn-faris",
      label: "معجم مقاييس اللغة لابن فارس",
      license: "Public Domain",
      url: "https://github.com/wizsk/arabic_lexicons",
      retrievedAt: new Date().toISOString(),
    },
    rootPatches,
    _coverage: `${matchedCount}/${quranicRoots.length}`,
  };
}
