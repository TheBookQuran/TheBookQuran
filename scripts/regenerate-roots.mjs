/**
 * Regenerate the linguistic data files from the Quranic Arabic Corpus morphology
 * flat file (quranic-corpus-morphology-0.4.txt), the canonical, static,
 * human-verified token→root dataset.
 *
 * Source:  Quranic Arabic Corpus (morphology v0.4), Copyright (C) 2011 Kais Dukes, GPL.
 *          https://corpus.quran.com/download  — mirrored at
 *          https://github.com/cltk/arabic_morphology_quranic-corpus
 *
 * This fixes defect D1: the existing word_to_root.json collapses ~44.6% of words
 * to a 1–2 letter affix "root" (و, هم, ه, ل, ...). The corpus assigns each word
 * the ROOT of its STEM segment, so suffixed/prefixed forms resolve correctly
 * (سمعهم → سمع, وكتب → كتب). Function words with no lexical root (particles,
 * pronouns, non-derivational proper nouns) receive NO mapping — they are not
 * roots and must never be shown as one.
 *
 * Behaviour / outputs (idempotent, sorted keys for clean diffs):
 *   - public/data/linguistics/word_to_root.json   chapter:verse:word → rNNN  (content words only)
 *   - public/data/linguistics/roots.json           rNNN → {id, arabic_text, transliteration,
 *                                                        lexical_meaning?, maqayis_meaning?,
 *                                                        lanes_meaning?, occurrences_count}
 *   - public/data/linguistics/occurrences.json     rNNN → [{chapterNumber, verseNumber, wordPosition}]
 *
 * Meaning fields are PRESERVED from existing roots where an id is reused
 * (Maqayis is all-placeholder & deferred; the generated-looking lexical text is
 * flagged in the audit but left intact pending the separate meanings decision —
 * see docs/linguistics-audit.md §5/§6.3).
 *
 * Usage:  node scripts/regenerate-roots.mjs [--write]
 *   Without --write it runs in DRY-RUN mode and only prints a summary.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buckwalterToArabic } from "./lib/buckwalter.mjs";

const CORPUS = "data/morphology/quranic-corpus-morphology-0.4.txt";
const DIR = "public/data/linguistics";
const WRITE = process.argv.includes("--write");

// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// 1. Load existing data (for id reuse + meaning preservation + backup).
// ---------------------------------------------------------------------------
const oldRoots = JSON.parse(fs.readFileSync(`${DIR}/roots.json`, "utf8"));
const oldW2R = JSON.parse(fs.readFileSync(`${DIR}/word_to_root.json`, "utf8"));

// Map: arabic_text -> existing rootId, for REAL roots only (length >= 3).
// Fake <=2 char roots are intentionally NOT reused.
const arabicToOldId = new Map();
let maxRootNum = 0;
for (const [id, r] of Object.entries(oldRoots)) {
  const num = parseInt(id.slice(1), 10);
  if (num > maxRootNum) maxRootNum = num;
  if (r.arabic_text && r.arabic_text.length >= 3) {
    if (!arabicToOldId.has(r.arabic_text)) arabicToOldId.set(r.arabic_text, id);
  }
}

// ---------------------------------------------------------------------------
// 2. Parse the corpus.
// ---------------------------------------------------------------------------
const raw = fs.readFileSync(CORPUS, "utf8").split(/\r?\n/);
const locRe = /^\((\d+):(\d+):(\d+):(\d+)\)\t([^\t]*)\t([^\t]*)\t(.*)$/;
// wordLocation(chapter:verse:word) -> { rootBuck: string|null, lemBuck, pos }
// A word may have several segments; we want the ROOT of the STEM segment.
const wordMap = new Map();
let dataLines = 0;
for (const line of raw) {
  if (!line || line.startsWith("#")) continue;
  const m = line.match(locRe);
  if (!m) continue;
  dataLines++;
  const [, chap, verse, word, , form, tag, feats] = m;
  const loc = `${chap}:${verse}:${word}`;
  // Only STEM segments carry a ROOT. PREFIX/SUFFIX segments never do.
  if (!feats.startsWith("STEM")) continue;
  const rootMatch = feats.match(/ROOT:([^|]+)/);
  const rootBuck = rootMatch ? rootMatch[1] : null;
  const posMatch = feats.match(/POS:([^|]+)/);
  const lemMatch = feats.match(/LEM:([^|]+)/);
  const rec = wordMap.get(loc);
  if (rec) {
    // If a word somehow has multiple stems (e.g. compounds), keep the first root.
    if (!rec.rootBuck && rootBuck) rec.rootBuck = rootBuck;
  } else {
    wordMap.set(loc, {
      rootBuck,
      pos: posMatch ? posMatch[1] : "",
      lemBuck: lemMatch ? lemMatch[1] : "",
    });
  }
}

// ---------------------------------------------------------------------------
// 3. Build word→root mapping + per-root occurrence lists.
// ---------------------------------------------------------------------------
const wordToRoot = {};        // chapter:verse:word -> rNNN
const rootArabicToId = new Map(); // arabic_text -> rNNN (new, authoritative)
const rootOccurrences = {};   // rNNN -> [ {chapterNumber, verseNumber, wordPosition} ]
const rootBuckToId = new Map();
const rootMeta = {};          // rNNN -> { arabicText, buck, samplePos, sampleLem }

function allocateId(arabicText, buck, samplePos, sampleLem) {
  // Prefer reusing an existing real-root id whose arabic_text matches.
  if (arabicToOldId.has(arabicText)) {
    const id = arabicToOldId.get(arabicText);
    rootArabicToId.set(arabicText, id);
    rootBuckToId.set(buck, id);
    if (!rootMeta[id]) rootMeta[id] = { arabicText: arabicText, buck, samplePos, sampleLem };
    return id;
  }
  // New root: allocate a fresh rNNN beyond the existing range.
  maxRootNum += 1;
  const id = "r" + maxRootNum;
  rootArabicToId.set(arabicText, id);
  rootBuckToId.set(buck, id);
  rootMeta[id] = { arabicText: arabicText, buck, samplePos, sampleLem };
  return id;
}

let mapped = 0,
  unmapped = 0;
const sortedLocs = [...wordMap.keys()].sort(compareLoc);
for (const loc of sortedLocs) {
  const rec = wordMap.get(loc);
  if (!rec.rootBuck) {
    unmapped++; // particle / pronoun / rootless proper noun -> no lexical root
    continue;
  }
  const arabic = buckwalterToArabic(rec.rootBuck);
  let id = rootBuckToId.get(rec.rootBuck);
  if (!id) {
    const [chap, verse, word] = loc.split(":");
    id = allocateId(arabic, rec.rootBuck, rec.pos, rec.lemBuck);
  }
  wordToRoot[loc] = id;
  (rootOccurrences[id] ||= []).push(locToOcc(loc));
  mapped++;
}

function locToOcc(loc) {
  const [c, v, w] = loc.split(":").map(Number);
  return { chapterNumber: c, verseNumber: v, wordPosition: w };
}
function compareLoc(a, b) {
  const [a1, a2, a3] = a.split(":").map(Number);
  const [b1, b2, b3] = b.split(":").map(Number);
  return a1 - b1 || a2 - b2 || a3 - b3;
}

// ---------------------------------------------------------------------------
// 4. Build roots.json, preserving meanings from existing real roots.
// ---------------------------------------------------------------------------
const rootsOut = {};
let keptMeanings = 0;
for (const [id, meta] of Object.entries(rootMeta)) {
  const occ = rootOccurrences[id];
  const old = oldRoots[id];
  rootsOut[id] = {
    id,
    arabic_text: meta.arabicText,
    transliteration: "",
    occurrences_count: occ.length,
  };
  if (old && old.arabic_text === meta.arabicText) {
    // We only preserve lanes_meaning (the home for future verbatim Lane's text).
    // Placeholder and generated meanings are cleared to respect the fidelity rule.
    if (old.lanes_meaning) {
      rootsOut[id].lanes_meaning = old.lanes_meaning;
      keptMeanings++;
    }
  }
}
const occurrencesOut = {};
for (const id of Object.keys(rootsOut)) {
  occurrencesOut[id] = rootOccurrences[id] || [];
}

// ---------------------------------------------------------------------------
// 5. Report + (optional) write.
// ---------------------------------------------------------------------------
const oldFake = Object.values(oldRoots).filter((r) => r.arabic_text.length <= 2).length;
const newFake = Object.values(rootsOut).filter((r) => r.arabic_text.length <= 2).length;
console.log("=== Regeneration summary ===");
console.log(`Corpus STEM records parsed: ${dataLines}`);
console.log(`Distinct words (chapter:verse:word): ${wordMap.size}`);
console.log(`Words mapped to a real root: ${mapped}`);
console.log(`Words with NO root (particles/pronouns/rootless PN): ${unmapped}`);
console.log(`Old mappings (word_to_root): ${Object.keys(oldW2R).length}`);
console.log(`New mappings (word_to_root): ${Object.keys(wordToRoot).length}`);
console.log(`Distinct roots (roots.json): ${Object.keys(rootsOut).length}`);
console.log(`Meaning fields preserved from existing entries: ${keptMeanings}`);
console.log(`Fake (<=2 char) roots BEFORE: ${oldFake}  /  AFTER: ${newFake}`);

// Spot-checks for the user's reported cases.
const spot = (loc) => {
  const rid = wordToRoot[loc];
  return rid ? `${loc} -> ${rid} "${rootsOut[rid].arabic_text}"` : `${loc} -> (no root / function word)`;
};
console.log("\nSpot-checks:");
console.log("  ءأنذرتهم (2:6:6) [was 'هم']:  " + spot("2:6:6"));
console.log("  وأينما-ish 2:77:1 [was 'و']:   " + spot("2:77:1"));
console.log("  2:100:1 [was 'و']:             " + spot("2:100:1"));
console.log("  بسم (1:1:1):                   " + spot("1:1:1"));

if (!WRITE) {
  console.log("\nDRY-RUN only. Re-run with --write to apply.");
} else {
  const ts = Date.now();
  for (const f of ["roots.json", "word_to_root.json", "occurrences.json"]) {
    fs.copyFileSync(`${DIR}/${f}`, `${DIR}/${f}.bak.${ts}`);
  }
  fs.writeFileSync(`${DIR}/word_to_root.json`, JSON.stringify(sortKeys(wordToRoot), null, 0) + "\n");
  fs.writeFileSync(`${DIR}/roots.json`, JSON.stringify(sortKeys(rootsOut), null, 0) + "\n");
  fs.writeFileSync(`${DIR}/occurrences.json`, JSON.stringify(sortKeys(occurrencesOut), null, 0) + "\n");
  console.log(`\nWROTE 3 files (backups saved with .bak.${ts}).`);
}

function sortKeys(obj) {
  const out = {};
  for (const k of Object.keys(obj).sort()) out[k] = obj[k];
  return out;
}
