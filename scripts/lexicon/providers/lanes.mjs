import fs from "fs";
import crypto from "crypto";

const LANE_JSON = ".tmp-sqlite/lane_full.json";
const MAX_LENGTH = 8000;

const norm = (s) =>
  s.replace(/أ|إ|آ/g, "ا").replace(/ى/g, "ي").replace(/([ا-ي])\1+/g, "$1");

/**
 * Lane's Lexicon Provider.
 * Matches Quranic roots to definitions from Lane's Lexicon SQLite dump.
 * @param {string[]} quranicRoots - List of unique Arabic roots found in the Quran.
 * @returns {import("../_core/types.mjs").LexiconProviderResult}
 */
export function getLanesData(quranicRoots) {
  if (!fs.existsSync(LANE_JSON)) {
    throw new Error(`Lane's Lexicon source JSON file not found at ${LANE_JSON}`);
  }

  const laneArr = JSON.parse(fs.readFileSync(LANE_JSON, "utf8"));

  // Build exact map + normalized variants for fuzzy matching
  const laneMap = new Map(); // exact root -> definition
  for (const e of laneArr) {
    if (e.root && !laneMap.has(e.root)) {
      laneMap.set(e.root, e.definition);
    }
  }

  // Normalized lookup: many normalized keys can map to the same definition
  const normMap = new Map();
  for (const [root, def] of laneMap) {
    const n = norm(root);
    if (!normMap.has(n)) {
      normMap.set(n, { def, orig: root });
    }
  }

  const rootPatches = [];

  for (const ar of quranicRoots) {
    let def = laneMap.get(ar);
    let method = null;

    if (def) {
      method = "exact";
    } else {
      const hit = normMap.get(norm(ar));
      if (hit) {
        def = hit.def;
        method = `norm(~${hit.orig})`;
      }
    }

    if (!def) continue;

    const capped = def.length > MAX_LENGTH ? def.slice(0, MAX_LENGTH) : def;
    const hash = crypto.createHash("sha256").update(capped, "utf8").digest("hex").slice(0, 16);

    rootPatches.push({
      arabicText: ar,
      field: "lanes_meaning",
      value: capped,
      hash,
      method,
    });
  }

  return {
    provider: {
      id: "lanes-gibreel",
      label: "Lane's Lexicon (GibreelAbdullah/LaneLexicon)",
      license: "GPL-3.0 (app) / Public Domain (text)",
      url: "https://github.com/GibreelAbdullah/LaneLexicon",
      retrievedAt: new Date("2026-06-26").toISOString(),
    },
    rootPatches,
  };
}
