// Cross-tab lexical_meaning kind by root length & occurrence count (read-only)
import fs from "fs";
const roots = JSON.parse(fs.readFileSync("public/data/linguistics/roots.json", "utf8"));
const w2r = JSON.parse(fs.readFileSync("public/data/linguistics/word_to_root.json", "utf8"));
const cnt = {};
for (const v of Object.values(w2r)) cnt[v] = (cnt[v] || 0) + 1;

const tell = ["The root", "refers to", "primarily means", "is an Arabic", "conveys", "means to"];
const buckets = { placeholder: 0, generated: 0, other: 0, empty: 0 };
const byLen = {};
let phHi = 0,
  genLo = 0,
  phTotal = 0,
  genTotal = 0;
for (const r of Object.values(roots)) {
  const lx = (r.lexical_meaning || "").trim();
  const len = r.arabic_text.length;
  const c = cnt[r.id] || 0;
  let kind = "other";
  if (!lx) kind = "empty";
  else if (lx.startsWith("Classical meaning of")) kind = "placeholder";
  else if (tell.some((t) => lx.includes(t))) kind = "generated";
  buckets[kind]++;
  if (kind === "placeholder" || kind === "generated") {
    byLen[len] = byLen[len] || { p: 0, g: 0 };
    byLen[len][kind === "placeholder" ? "p" : "g"]++;
    if (kind === "placeholder") {
      phTotal++;
      if (c >= 20) phHi++;
    } else {
      genTotal++;
      if (c < 5) genLo++;
    }
  }
}
console.log("Lexical kind totals:", JSON.stringify(buckets));
console.log("By root length {p:placeholder, g:generated}:", JSON.stringify(byLen));
console.log("Common roots (occ>=20) left as PLACEHOLDER:", phHi, "of", phTotal);
console.log("Rare roots (occ<5) given GENERATED text:", genLo, "of", genTotal);
