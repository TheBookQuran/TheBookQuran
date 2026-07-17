// Spot-check corpus-derived roots for well-known Quranic words.
import fs from "fs";
const B = {
  "'": "ء", ">": "أ", "&": "ؤ", "}": "ئ", "|": "آ", A: "ا", b: "ب", p: "ة", t: "ت",
  v: "ث", j: "ج", H: "ح", x: "خ", d: "د", "*": "ذ", r: "ر", z: "ز", s: "س",
  $: "ش", S: "ص", D: "ض", T: "ط", Z: "ظ", E: "ع", g: "غ", f: "ف", q: "ق",
  k: "ك", l: "ل", m: "م", n: "ن", h: "ه", w: "و", y: "ي", Y: "ى", "{": "ٱ",
};
const ba = (s) => [...s].map((c) => B[c] ?? c).join("");
const re = /^\((\d+):(\d+):(\d+):(\d+)\)\t([^\t]*)\t([^\t]*)\t(.*)$/;
const raw = fs.readFileSync("Reference/morphology/quranic-corpus-morphology-0.4.txt", "utf8").split(/\r?\n/);
const wm = new Map();
for (const line of raw) {
  if (!line || line.startsWith("#")) continue;
  const m = line.match(re);
  if (!m) continue;
  const [, c, v, w, , form, tag, feats] = m;
  if (!feats.startsWith("STEM")) continue;
  const loc = `${c}:${v}:${w}`;
  const rm = feats.match(/ROOT:([^|]+)/);
  if (!wm.has(loc)) wm.set(loc, rm ? ba(rm[1]) : null);
}
const show = (loc, note) =>
  console.log(`  ${loc}  ${note.padEnd(14)} -> ${wm.has(loc) ? (wm.get(loc) ? `"${wm.get(loc)}"` : "(no root — function word)") : "(not in corpus)"}`);
console.log("Known-word spot checks (expected root):");
show("1:1:1", "بسم"); // expect سمو (root of اسم) per corpus
show("1:2:3", "رب"); // رب
show("1:5:4", "نستعين"); // عون
show("2:2:3", "الكتاب"); // كتب
show("2:255:1", "الله"); // اله (Alh)
show("2:255:3", "إله"); // اله
show("2:6:6", "ءأنذرتهم"); // نذر (was هم — bug case)
show("2:100:1", "أوكلما"); // كلل (was و — bug case)
show("112:1:1", "قل"); // قول
show("112:1:2", "هوالله"); // rootless particle
