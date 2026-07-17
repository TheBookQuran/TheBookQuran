import fs from "fs";
import { buckwalterToArabic } from "../../lib/buckwalter.mjs";

const CORPUS = "data/morphology/quranic-corpus-morphology-0.4.txt";



function compareLoc(a, b) {
  const [a1, a2, a3] = a.split(":").map(Number);
  const [b1, b2, b3] = b.split(":").map(Number);
  return a1 - b1 || a2 - b2 || a3 - b3;
}

function locToOcc(loc) {
  const [c, v, w] = loc.split(":").map(Number);
  return { chapterNumber: c, verseNumber: v, wordPosition: w };
}

/**
 * QAC Lexicon Provider.
 * Extracts word-to-root and root occurrences from Quranic Arabic Corpus morphology.
 * @returns {import("../_core/types.mjs").LexiconProviderResult}
 */
export function getQacData() {
  if (!fs.existsSync(CORPUS)) {
    throw new Error(`Corpus source file not found at ${CORPUS}`);
  }

  const raw = fs.readFileSync(CORPUS, "utf8").split(/\r?\n/);
  const locRe = /^\((\d+):(\d+):(\d+):(\d+)\)\t([^\t]*)\t([^\t]*)\t(.*)$/;

  const wordMap = new Map();
  let dataLines = 0;

  for (const line of raw) {
    if (!line || line.startsWith("#")) continue;
    const m = line.match(locRe);
    if (!m) continue;
    dataLines++;
    const [, chap, verse, word, , form, tag, feats] = m;
    const loc = `${chap}:${verse}:${word}`;
    
    if (!feats.startsWith("STEM")) continue;
    const rootMatch = feats.match(/ROOT:([^|]+)/);
    const rootBuck = rootMatch ? rootMatch[1] : null;
    const posMatch = feats.match(/POS:([^|]+)/);
    const lemMatch = feats.match(/LEM:([^|]+)/);
    const rec = wordMap.get(loc);
    
    if (rec) {
      if (!rec.rootBuck && rootBuck) rec.rootBuck = rootBuck;
    } else {
      wordMap.set(loc, {
        rootBuck,
        pos: posMatch ? posMatch[1] : "",
        lemBuck: lemMatch ? lemMatch[1] : "",
      });
    }
  }

  const wordToRoot = {};
  const occurrences = {};

  const sortedLocs = [...wordMap.keys()].sort(compareLoc);
  for (const loc of sortedLocs) {
    const rec = wordMap.get(loc);
    if (!rec.rootBuck) continue; // particle / pronoun / rootless proper noun

    const arabicRoot = buckwalterToArabic(rec.rootBuck);
    wordToRoot[loc] = arabicRoot;
    
    (occurrences[arabicRoot] ||= []).push(locToOcc(loc));
  }

  return {
    provider: {
      id: "qac-v0.4",
      label: "Quranic Arabic Corpus v0.4",
      license: "GPL-3.0",
      url: "https://github.com/cltk/arabic_morphology_quranic-corpus",
      retrievedAt: new Date("2026-06-26").toISOString(),
    },
    wordToRoot,
    occurrences,
    rootPatches: [], // Base provider has no patches, it defines the roots
  };
}
