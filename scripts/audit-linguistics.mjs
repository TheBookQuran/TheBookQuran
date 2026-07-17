// READ-ONLY audit of public/data/linguistics/*.json
// Produces diagnostic numbers for docs/linguistics-audit.md. Does NOT modify any data.
import fs from "fs";

const DIR = "public/data/linguistics";
const roots = JSON.parse(fs.readFileSync(`${DIR}/roots.json`, "utf8"));
const w2r = JSON.parse(fs.readFileSync(`${DIR}/word_to_root.json`, "utf8"));
const occ = JSON.parse(fs.readFileSync(`${DIR}/occurrences.json`, "utf8"));

const rootIds = Object.keys(roots);
const locs = Object.keys(w2r);

// Actual per-root occurrence counts derived from the mapping
const actualCount = {};
for (const rid of Object.values(w2r)) actualCount[rid] = (actualCount[rid] || 0) + 1;

const out = (s) => console.log(s);

// ---------- A. Mapping defects ----------
out("## A. ROOT-MAPPING DEFECTS");
out(`- Total roots in roots.json: ${rootIds.length}`);
out(`- Total word→root mappings: ${locs.length}`);

// A1. "fake" roots = arabic_text length <= 2 (affixes/particles/pronouns/letters)
const fake = rootIds.filter((id) => roots[id].arabic_text.length <= 2);
const fakeSet = new Set(fake);
let mappingsToFake = 0;
for (const rid of Object.values(w2r)) if (fakeSet.has(rid)) mappingsToFake++;
out(
  `- Roots with arabic_text length <= 2 ("fake"/affix roots): ${fake.length}  (${(
    (100 * fake.length) / rootIds.length
  ).toFixed(1)}% of roots)`
);
out(
  `- Mappings pointing to a fake root: ${mappingsToFake}  (${(
    (100 * mappingsToFake) /
    locs.length
  ).toFixed(1)}% of all mappings)`
);

// A2. length === 1 (single letters)
const oneChar = rootIds.filter((id) => roots[id].arabic_text.length === 1);
let m1 = 0;
const oneSet = new Set(oneChar);
for (const rid of Object.values(w2r)) if (oneSet.has(rid)) m1++;
out(`- Single-letter "roots" (length===1): ${oneChar.length}  → mapped by ${m1} words`);

// ---------- B. Classify the fake roots ----------
out("\n## B. FAKE-ROOT CLASSIFICATION (top by mapping count)");
const PRONOUNS = new Set(["هم", "كم", "ه", "ها", "نا", "هن", "كم", "هما", "كما", "كان", "كن"]);
const PREFIX = new Set(["و", "ف", "ب", "ل", "س", "ك", "ت", "ن"]);
const PARTICLE = new Set(["من", "عن", "في", "فى", "إلى", "الى", "على", "علي", "ما", "لا", "لم", "لن", "قد", "ثم", "بل", "كل", "ان", "إن", "أو", "او", "إما", "اما", "حيث", "كيف", "هو", "هي", "يا", "أم", "ام", "هذا", "ذلك", "التي", "الذي", "الذين", "مع", "إلا", "الا"]);
const rows = fake
  .map((id) => ({ id, t: roots[id].arabic_text, c: actualCount[id] || 0 }))
  .sort((a, b) => b.c - a.c);
out("  rank  rootId  text   class          words");
let rank = 0;
for (const r of rows.slice(0, 40)) {
  rank++;
  let cls = "other";
  if (PREFIX.has(r.t)) cls = "prefix-letter";
  else if (PRONOUNS.has(r.t)) cls = "pronoun";
  else if (PARTICLE.has(r.t)) cls = "particle/huroof";
  out(
    `  ${String(rank).padStart(3)}  ${r.id.padEnd(7)} ${r.t.padEnd(4)} ${cls.padEnd(14)} ${r.c}`
  );
}

// Aggregate by class
const clsTotals = { "prefix-letter": 0, pronoun: 0, "particle/huroof": 0, other: 0 };
for (const r of rows) {
  let cls = "other";
  if (PREFIX.has(r.t)) cls = "prefix-letter";
  else if (PRONOUNS.has(r.t)) cls = "pronoun";
  else if (PARTICLE.has(r.t)) cls = "particle/huroof";
  clsTotals[cls] += r.c;
}
out("\n  Mapping volume by class (words collapsed → class):");
for (const [k, v] of Object.entries(clsTotals))
  out(`    ${k.padEnd(16)} ${v}  (${((100 * v) / mappingsToFake).toFixed(1)}% of fake-mappings)`);

// ---------- C. Occurrence-count drift ----------
out("\n## C. OCCURRENCE-COUNT DRIFT (stored vs actual-from-mapping)");
let drift = 0,
  exact = 0,
  noMapping = 0;
const driftSamples = [];
for (const id of rootIds) {
  const stored = roots[id].occurrences_count;
  const act = actualCount[id] || 0;
  if (!act) {
    noMapping++;
    continue;
  }
  if (stored === act) exact++;
  else {
    drift++;
    if (driftSamples.length < 25)
      driftSamples.push({ id, t: roots[id].arabic_text, stored, act, diff: stored - act });
  }
}
out(`- Roots where occurrences_count matches mapping: ${exact}`);
out(`- Roots where occurrences_count DRIFTS from mapping: ${drift}`);
out(`- Roots with 0 mappings in word_to_root.json (orphan root entries): ${noMapping}`);
out("\n  Sample drift rows (top 25):");
out("  rootId  text   stored  actual  diff(stored-actual)");
for (const s of driftSamples) {
  const cls = s.t.length <= 2 ? "  [fake]" : "";
  out(`  ${s.id.padEnd(7)} ${s.t.padEnd(5)} ${String(s.stored).padStart(6)} ${String(s.act).padStart(7)} ${String(s.diff).padStart(7)}${cls}`);
}

// ---------- D. Meaning defects ----------
out("\n## D. MEANING/DEFINITION DEFECTS");
const MQ_PLACEHOLDER_TOKEN = "بيانات المعجم قيد الإضافة";
const LEX_PLACEHOLDER_PREFIX = "Classical meaning of";
let mqPh = 0,
  lexPh = 0,
  lanesSet = 0,
  mqReal = 0,
  lexReal = 0,
  lanesReal = 0;
const mqRealSamples = [];
const lexRealSamples = [];
for (const r of Object.values(roots)) {
  const mq = r.maqayis_meaning || "";
  const lex = r.lexical_meaning || "";
  const lanes = r.lanes_meaning || "";
  if (mq.includes(MQ_PLACEHOLDER_TOKEN)) mqPh++;
  else if (mq.trim()) {
    mqReal++;
    if (mqRealSamples.length < 5) mqRealSamples.push(`${r.id} "${r.arabic_text}": ${mq.slice(0, 90)}`);
  }
  if (lex.startsWith(LEX_PLACEHOLDER_PREFIX)) lexPh++;
  else if (lex.trim()) {
    lexReal++;
    if (lexRealSamples.length < 5) lexRealSamples.push(`${r.id} "${r.arabic_text}": ${lex.slice(0, 90)}`);
  }
  if (lanes.trim()) {
    lanesSet++;
    lanesReal++;
  }
}
out(`- Maqayis (مقاييس) placeholder entries: ${mqPh} / ${rootIds.length}`);
out(`- Maqayis NON-placeholder entries: ${mqReal} / ${rootIds.length}`);
out(`- Lane's/Lexical placeholder ("Classical meaning of X"): ${lexPh} / ${rootIds.length}`);
out(`- Lane's/Lexical NON-placeholder entries: ${lexReal} / ${rootIds.length}`);
out(`- roots with lanes_meaning field populated: ${lanesSet} / ${rootIds.length}`);
if (mqRealSamples.length) {
  out("\n  Non-placeholder Maqayis samples (if any):");
  for (const s of mqRealSamples) out(`    ${s}`);
}
if (lexRealSamples.length) {
  out("\n  Non-placeholder Lane's/Lexical samples (if any):");
  for (const s of lexRealSamples) out(`    ${s}`);
}

// ---------- E. Spot-checks for user-reported cases ----------
out("\n## E. SPOT-CHECKS — USER-REPORTED CASES");
// Build location→surface text proxy via actual text isn't in data; we instead show which roots
// the pronoun/prefix fake roots currently absorb.
out("  (data has no surface word text; we list which fake root each case maps to)");
out(`  سمعهم-type (words mapped to "هم" r1785): ${actualCount["r1785"] || 0} words`);
out(`  و-prefixed words mapped to "و" r1810: ${actualCount["r1810"] || 0} words`);
out(`  ه-pronoun words mapped to "ه" r1746: ${actualCount["r1746"] || 0} words`);
out(`  ل-prefixed words mapped to "ل" r1476: ${actualCount["r1476"] || 0} words`);

// Show a few concrete locations currently mapped to fake roots (for manual verification)
out("\n  Sample locations currently mapped to fake root r1810 ('و'):");
const wLocs = Object.entries(w2r).filter(([, rid]) => rid === "r1810").slice(0, 12).map(([k]) => k);
out(`    ${wLocs.join(", ")}`);
out("  Sample locations currently mapped to fake root r1785 ('هم'):");
const hLocs = Object.entries(w2r).filter(([, rid]) => rid === "r1785").slice(0, 12).map(([k]) => k);
out(`    ${hLocs.join(", ")}`);

// ---------- F. occurrences.json consistency ----------
out("\n## F. occurrences.json CONSISTENCY");
let occRootCount = 0,
  occMatchesMapping = 0,
  occDrift = 0,
  occOrphan = 0;
for (const id of rootIds) {
  const list = occ[id];
  const act = actualCount[id] || 0;
  if (Array.isArray(list)) {
    occRootCount++;
    if (list.length === act) occMatchesMapping++;
    else occDrift++;
  } else if (act > 0) occOrphan++;
}
out(`- Roots present in occurrences.json: ${occRootCount}`);
out(`- Whose occurrences length matches mapping count: ${occMatchesMapping}`);
out(`- Whose occurrences length DRIFTS from mapping count: ${occDrift}`);
out(`- Roots mapped in word_to_root but missing from occurrences.json: ${occOrphan}`);

console.log("\n--- END OF AUDIT OUTPUT ---");
