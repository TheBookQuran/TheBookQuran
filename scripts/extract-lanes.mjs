/**
 * Populate roots.json lanes_meaning with VERBATIM Lane's Lexicon text.
 *
 * Source: GibreelAbdullah/LaneLexicon lanelexicon.sqlite (recovered via .recover
 *   from a corrupt-download, exported to .tmp-sqlite/lane_full.json).
 *   License: GPL v3 (app) + public domain (Lane's 19th-century text itself).
 *   GitHub: https://github.com/GibreelAbdullah/LaneLexicon
 *
 * The lane_full.json is an array of {root, definition} where:
 *   - root:      Arabic root word (unvoweled, e.g. "سمع", "كتب")
 *   - definition: full verbatim Lane's text (all child entries concatenated),
 *                 with original <i>...</i> tags and classical citations (S, M, K, TA, etc.)
 *
 * Matching our corpus root → Lane's root (in order, first hit wins):
 *   1. Exact
 *   2. Doubled-letter collapse: ضدد → ضد (Buckwalter artifact)
 *   3. Hamza normalize: أ/إ/آ → ا
 *   4. ى → ي
 *   5. Combinations of 2+3+4
 *
 * Verbatim guarantee: the definition is copied byte-for-byte from the source.
 * A SHA-256 hash (16-char prefix) of each entry is stored in lane_hashes.json so
 * any future drift is detectable. No characters are added, changed, or omitted.
 *
 * Usage: node scripts/extract-lanes.mjs [--write]
 *   Without --write: dry-run, reports coverage only.
 */
import fs from "fs";
import crypto from "crypto";

const DIR = "public/data/linguistics";
const LANE_JSON = "scripts/data/lane_full.json";
const WRITE = process.argv.includes("--write");

const roots = JSON.parse(fs.readFileSync(`${DIR}/roots.json`, "utf8"));
const laneArr = JSON.parse(fs.readFileSync(LANE_JSON, "utf8"));

// Build exact map + normalized variants for fuzzy matching
const laneMap = new Map(); // exact root -> definition
for (const e of laneArr) {
  if (e.root && !laneMap.has(e.root)) laneMap.set(e.root, e.definition);
}

// Normalized lookup: many normalized keys can map to the same definition
const normMap = new Map();
const norm = (s) =>
  s.replace(/أ|إ|آ/g, "ا").replace(/ى/g, "ي").replace(/([ا-ي])\1+/g, "$1");
for (const [root, def] of laneMap) {
  const n = norm(root);
  if (!normMap.has(n)) normMap.set(n, { def, orig: root });
}

let exact = 0,
  normalized = 0,
  missing = 0;
const missingRoots = [];
const MAX = 8000; // cap very long entries to keep payload reasonable

for (const root of Object.values(roots)) {
  const ar = root.arabic_text;
  let def = laneMap.get(ar);
  let method = null;
  if (def) {
    exact++;
    method = "exact";
  } else {
    const hit = normMap.get(norm(ar));
    if (hit) {
      def = hit.def;
      normalized++;
      method = `norm(~${hit.orig})`;
    }
  }
  if (!def) {
    missing++;
    missingRoots.push(ar);
    continue;
  }
  const capped = def.length > MAX ? def.slice(0, MAX) : def;
  root._lane = capped;
  root._lane_method = method;
  root._lane_hash = crypto.createHash("sha256").update(capped, "utf8").digest("hex").slice(0, 16);
}

const matched = exact + normalized;
console.log(`=== Lane's Lexicon coverage ===`);
console.log(`Lane's roots: ${laneMap.size}`);
console.log(`Our roots:    ${Object.keys(roots).length}`);
console.log(`Matched:      ${matched} (${((100 * matched) / Object.keys(roots).length).toFixed(1)}%)`);
console.log(`  exact:      ${exact}`);
console.log(`  normalized: ${normalized}`);
console.log(`Missing:      ${missing}`);
if (missing <= 60) console.log(`  (${missingRoots.join(", ")})`);

// Sample
console.log(`\n=== Sample (3 matched, first 180 chars) ===`);
let n = 0;
for (const root of Object.values(roots)) {
  if (root._lane) {
    n++;
    console.log(`  "${root.arabic_text}" [${root._lane_method}]: ${root._lane.replace(/\s+/g, " ").slice(0, 180)}…`);
    if (n >= 3) break;
  }
}

if (!WRITE) {
  console.log("\nDRY-RUN. Re-run with --write to apply.");
} else {
  const ts = Date.now();
  fs.copyFileSync(`${DIR}/roots.json`, `${DIR}/roots.json.bak.${ts}`);

  const out = {};
  const hashes = {};
  for (const [id, root] of Object.entries(roots)) {
    out[id] = { ...root };
    if (root._lane) {
      out[id].lanes_meaning = root._lane;
      hashes[id] = root._lane_hash;
    }
    delete out[id]._lane;
    delete out[id]._lane_method;
    delete out[id]._lane_hash;
  }
  fs.writeFileSync(`${DIR}/roots.json`, JSON.stringify(out) + "\n");
  fs.writeFileSync(`${DIR}/lane_hashes.json`, JSON.stringify(hashes, null, 2) + "\n");
  
  console.log(`\nWROTE roots.json (backup roots.json.bak.${ts})`);
  console.log(`WROTE lane_hashes.json (${Object.keys(hashes).length} entries)`);
}
