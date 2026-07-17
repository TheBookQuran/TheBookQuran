import fs from "fs";
import path from "path";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";
const DIR = "public/data/linguistics";
const ENRICHED_DIR = path.join(DIR, "enriched");

// Command-line arguments
const ROOT_ARG = process.argv.find(arg => arg.startsWith("--root="));
const singleRoot = ROOT_ARG ? ROOT_ARG.split("=")[1] : null;

const LIMIT_ARG = process.argv.find(arg => arg.startsWith("--limit="));
const limit = LIMIT_ARG ? parseInt(LIMIT_ARG.split("=")[1], 10) : null;

const allMode = process.argv.includes("--all");
const force = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry-run");

async function main() {
  if (!allMode && !singleRoot) {
    console.error("Error: Please specify either --all or --root=rID");
    console.log("Usage examples:");
    console.log("  node scripts/lexicon/enrich.mjs --root=r1000");
    console.log("  node scripts/lexicon/enrich.mjs --all --limit=5");
    console.log("  node scripts/lexicon/enrich.mjs --all --force");
    console.log("  node scripts/lexicon/enrich.mjs --all --dry-run");
    process.exit(1);
  }

  if (!API_KEY && !dryRun) {
    console.error("Error: GEMINI_API_KEY environment variable is not set.");
    process.exit(1);
  }

  // Ensure directories exist
  if (!fs.existsSync(ENRICHED_DIR)) {
    fs.mkdirSync(ENRICHED_DIR, { recursive: true });
  }

  // Load roots.json
  const rootsPath = path.join(DIR, "roots.json");
  if (!fs.existsSync(rootsPath)) {
    console.error("Error: public/data/linguistics/roots.json not found.");
    process.exit(1);
  }
  const roots = JSON.parse(fs.readFileSync(rootsPath, "utf8"));

  // Load or initialize index.json
  const indexPath = path.join(ENRICHED_DIR, "index.json");
  let index = { enrichedRoots: {}, lastUpdated: "" };
  if (fs.existsSync(indexPath)) {
    index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  }

  const keys = Object.keys(roots).filter(k => roots[k].lanes_meaning);
  console.log(`Found ${keys.length} roots with Lane's Lexicon entries in roots.json`);

  let targets = [];
  if (singleRoot) {
    if (!roots[singleRoot]) {
      console.error(`Error: Root ${singleRoot} not found in roots.json`);
      process.exit(1);
    }
    targets = [singleRoot];
  } else {
    targets = keys.filter(k => {
      const alreadyDone = index.enrichedRoots[k];
      return force || !alreadyDone;
    });
  }

  if (limit && limit < targets.length) {
    targets = targets.slice(0, limit);
  }

  console.log(`Processing queue: ${targets.length} targets`);

  if (dryRun) {
    console.log("\n[DRY RUN] Plan of action:");
    targets.forEach(k => {
      console.log(`- Would process root ID: ${k} (${roots[k].arabic_text})`);
    });
    return;
  }

  let count = 0;
  for (const rootId of targets) {
    count++;
    const entry = roots[rootId];
    console.log(`\n[${count}/${targets.length}] Processing ${rootId} (${entry.arabic_text})...`);

    try {
      const result = await callGemini(entry.arabic_text, entry.lanes_meaning);
      
      const enrichedEntry = {
        rootId,
        source: "lanes",
        enrichedAt: new Date().toISOString(),
        modelId: MODEL,
        semanticCore: result.semanticCore || "",
        primaryMeaning: result.primaryMeaning || "",
        quranicRelevance: result.quranicRelevance || "",
        keyDerivations: result.keyDerivations || [],
        figurativeOrRareUsages: result.figurativeOrRareUsages || [],
        discardedNoise: result.discardedNoise || [],
        summaryEn: result.summaryEn || "",
        summaryAr: result.summaryAr || "",
        rawText: entry.lanes_meaning
      };

      // Write enriched entry to file
      const entryPath = path.join(ENRICHED_DIR, `${rootId}.json`);
      fs.writeFileSync(entryPath, JSON.stringify(enrichedEntry, null, 2), "utf8");

      // Update index
      index.enrichedRoots[rootId] = {
        arabicText: entry.arabic_text,
        enrichedAt: enrichedEntry.enrichedAt,
        modelId: MODEL
      };
      index.lastUpdated = new Date().toISOString();
      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf8");

      console.log(`✓ Saved ${rootId} enriched definition successfully.`);

      // Rate limiting: sleep to stay within quotas
      if (count < targets.length) {
        await sleep(1500);
      }
    } catch (err) {
      console.error(`✗ Failed to enrich root ${rootId}:`, err);
    }
  }

  console.log("\nEnrichment pipeline run finished.");
}

async function callGemini(arabicRoot, text) {
  const prompt = `You are an expert Arabic linguist, Quranic scholar, and classical lexicographer.
Your task is to analyze a classical Arabic lexicon entry from Lane's Lexicon and organize it into clean, semantic layers prioritizing Quranic comprehension and relevance.

STRICT RULES — follow precisely:
1. Extract ONLY information explicitly stated in the text. Do NOT infer, assume, or add any details.
2. ALL extracted text (meanings, summaryEn, relevance, etc.) must be in the LEXICON'S LANGUAGE — English.
3. "summaryAr" is the ONLY Arabic field — it is a DIRECT TRANSLATION of "summaryEn" into Arabic, not an independent extraction.
4. If a category has no relevant data in the text, return an empty array or empty string.

Fields to extract:
- semanticCore: A single very short conceptual phrase (3-7 words) representing the fundamental conceptual origin/nucleus of the root (concept-level, not literal translation).
- primaryMeaning: The simplest direct meaning of the root's Form I verb or main noun that serves as the foundation to understand the root in the Quran.
- quranicRelevance: Analyze and summarize how this root is relevant to understanding Quranic verses. Highlight the meanings that appear or serve comprehension in the context of the Quran.
- keyDerivations: Extract only the common, significant, or Quran-relevant derivations. Ignore rare, obscure, or highly dialectal forms. Each element must contain:
  - lemma: the Arabic word
  - form: the morphological form/class (e.g. "Form I", "Noun", "Form IV")
  - meaning: direct English meaning of this form.
- figurativeOrRareUsages: List metaphorical, figurative (tropical), or rare linguistic usages mentioned in the text. Keep them concise.
- discardedNoise: List extremely rare, obscure, or dialectal usages, or highly technical details that are not relevant to understanding the Quran.
- summaryEn: Concise English summary (1-2 sentences) of the primary meaning.
- summaryAr: Direct Arabic translation of summaryEn.

Root being extracted: «${arabicRoot}»
Lexicon text:
---
${text}
---`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  
  const retries = 5;
  let delay = 20000; // Start with 20 seconds delay on 429

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                semanticCore: { type: "STRING" },
                primaryMeaning: { type: "STRING" },
                quranicRelevance: { type: "STRING" },
                keyDerivations: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      lemma: { type: "STRING" },
                      form: { type: "STRING" },
                      meaning: { type: "STRING" }
                    },
                    required: ["lemma", "form", "meaning"]
                  }
                },
                figurativeOrRareUsages: { type: "ARRAY", items: { type: "STRING" } },
                discardedNoise: { type: "ARRAY", items: { type: "STRING" } },
                summaryEn: { type: "STRING" },
                summaryAr: { type: "STRING" }
              },
              required: ["semanticCore", "primaryMeaning", "quranicRelevance", "keyDerivations", "figurativeOrRareUsages", "discardedNoise", "summaryEn", "summaryAr"]
            }
          }
        })
      });

      if (response.status === 429) {
        console.warn(`[429 Quota Exceeded] Attempt ${attempt}/${retries}. Waiting ${delay / 1000} seconds before retrying...`);
        await sleep(delay);
        delay *= 1.5; // Exponential backoff
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API call failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      return JSON.parse(responseText);
    } catch (err) {
      if (attempt === retries) {
        throw err;
      }
      console.warn(`[Attempt ${attempt}/${retries}] Request failed with error: ${err.message}. Retrying in ${delay / 1000} seconds...`);
      await sleep(delay);
      delay *= 1.5;
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();

