// End-to-end verification: random sample of words from the NEW word_to_root.json
// must agree with the corpus-derived root (independently re-derived here).
import fs from "fs";
const B = {
  "'": "ء", ">": "أ", "&": "ؤ", "}": "ئ", "|": "آ", A: "ا", b: "ب", p: "ة", t: "ت",
  v: "ث", j: "ج", H: "ح", x: "خ", d: "د", "*": "ذ", r: "ر", z: "ز", s: "س",
  $: "ش", S: "ص", D: "ض", T: "ط", Z: "ظ", E: "ع", g: "غ", f: "ف", q: "ق",
  k: "ك", l: "ل", m: "م", n: "ن", h: "ه", w: "و", y: "ي", Y: "ى", "{": "ٱ",
};
const ba = (s) => [...s].map((c) => B[c] ?? c).join("");
const re = /^\((\d+):(\d+):(\d+):(\d+)\)\t([^\t]*)\t([^\t]*)\t(.*)$/;
const raw = fs.readFileSync("data/morphology/quranic-corpus-morphology-0.4.txt", "utf8").split(/\r?\n/);
const corpus = new Map();
for (const line of raw) {
  if (!line || line.startsWith("#")) continue;
  const m = line.match(re);
  if (!m || !m[7].startsWith("STEM")) continue;
  const loc = `${m[1]}:${m[2]}:${m[3]}`;
  if (corpus.has(loc)) continue;
  const rm = m[7].match(/ROOT:([^|]+)/);
  corpus.set(loc, rm ? ba(rm[1]) : null);
}

const w2r = JSON.parse(fs.readFileSync("public/data/linguistics/word_to_root.json", "utf8"));
const roots = JSON.parse(fs.readFileSync("public/data/linguistics/roots.json", "utf8"));

const locs = Object.keys(w2r);
// deterministic pseudo-random sample
const sample = [];
for (let i = 0; i < 60; i++) sample.push(locs[Math.floor((i * 7919) % locs.length)]);

let ok = 0,
  mismatches = 0;
const bad = [];
for (const loc of [...new Set(sample)]) {
  const id = w2r[loc];
  const storedArabic = roots[id]?.arabic_text;
  const corpusArabic = corpus.get(loc);
  if (storedArabic === corpusArabic) ok++;
  else {
    mismatches++;
    bad.push(`${loc}: stored=${id}"${storedArabic}" corpus="${corpusArabic}"`);
  }
}
console.log(`Sampled ${[...new Set(sample)].length} words: ${ok} agree with corpus, ${mismatches} mismatch.`);
// Also verify every mapped location actually has a corpus root (no phantom mappings)
let phantom = 0;
for (const loc of locs) if (!corpus.get(loc)) phantom++;
console.log(`Mapped locations with no corpus root (phantom): ${phantom}`);
// Verify reverse: corpus-rooted words all present in mapping
let missing = 0;
for (const [loc, root] of corpus) if (root && !w2r[loc]) missing++;
console.log(`Corpus-rooted words missing from mapping: ${missing} of ${[...corpus.values()].filter(Boolean).length}`);
if (bad.length) console.log("Mismatches:\n  " + bad.join("\n  "));
