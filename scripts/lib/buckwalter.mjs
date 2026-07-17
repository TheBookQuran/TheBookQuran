export const BUCKWALTER = {
  "'": "ء", ">": "أ", "&": "ؤ", "}": "ئ", "|": "آ", A: "ا",
  b: "ب", p: "ة", t: "ت", v: "ث", j: "ج", H: "ح", x: "خ",
  d: "د", "*": "ذ", r: "ر", z: "ز", s: "س", "$": "ش",
  S: "ص", D: "ض", T: "ط", Z: "ظ", E: "ع", g: "غ",
  f: "ف", q: "ق", k: "ك", l: "ل", m: "م", n: "ن", h: "ه",
  w: "و", y: "ي", Y: "ى",
  F: "ً", N: "ٌ", K: "ٍ", a: "َ", u: "ُ", i: "ِ", "~": "ّ", o: "ْ", "`": "ٰ",
  "{": "ٱ", // corpus uses { for alif-wasla/hamza variants
};

export function buckwalterToArabic(s) {
  let out = "";
  for (const ch of s) out += BUCKWALTER[ch] ?? ch;
  return out;
}
