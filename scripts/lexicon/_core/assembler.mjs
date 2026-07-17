import fs from "fs";
import crypto from "crypto";
import path from "path";

// Providers
import { getQacData } from "../providers/qac.mjs";
import { getLanesData } from "../providers/lanes.mjs";
import { getMaqayisData } from "../providers/maqayis.mjs";

const DIR = "public/data/linguistics";

function sortKeys(obj) {
  const out = {};
  for (const k of Object.keys(obj).sort()) {
    out[k] = obj[k];
  }
  return out;
}

function calculateChecksum(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Run the lexicon pipeline.
 * @param {Object} options
 * @param {boolean} options.write - If true, writes the generated files to disk.
 * @param {string} [options.only] - If set, only runs specific providers (comma-separated, e.g., 'qac,lanes').
 */
export function assembleLexicon({ write = false, only = null } = {}) {
  console.log("Starting Lexicon Pipeline Assembler...");
  const enabledProviders = only ? only.split(",").map(p => p.trim()) : ["qac", "lanes", "maqayis"];

  // 1. Run QAC Provider to get canonical structures
  console.log("\n[1/3] Running QAC Provider...");
  const qacResult = getQacData();
  const rawWordToRoot = qacResult.wordToRoot;
  const rawOccurrences = qacResult.occurrences;
  
  const quranicRoots = Object.keys(rawOccurrences).sort();
  console.log(`✓ Parsed QAC data. Found ${quranicRoots.length} distinct roots.`);

  // 2. Load existing roots.json for ID mapping
  let oldRoots = {};
  const oldRootsPath = `${DIR}/roots.json`;
  if (fs.existsSync(oldRootsPath)) {
    try {
      oldRoots = JSON.parse(fs.readFileSync(oldRootsPath, "utf8"));
      console.log(`✓ Loaded existing roots.json (${Object.keys(oldRoots).length} entries) to preserve IDs.`);
    } catch (err) {
      console.warn("⚠ Failed to parse existing roots.json. Will generate clean IDs.", err.message);
    }
  }

  // Map: arabic_text -> existing rootId, for REAL roots (length >= 3).
  const arabicToOldId = new Map();
  let maxRootNum = 0;
  for (const [id, r] of Object.entries(oldRoots)) {
    const num = parseInt(id.slice(1), 10);
    if (!isNaN(num) && num > maxRootNum) {
      maxRootNum = num;
    }
    if (r.arabic_text && r.arabic_text.length >= 3) {
      arabicToOldId.set(r.arabic_text, id);
    }
  }

  // Allocate ID helper
  const rootArabicToId = new Map();
  const allocateId = (arabicText) => {
    if (arabicToOldId.has(arabicText)) {
      const id = arabicToOldId.get(arabicText);
      rootArabicToId.set(arabicText, id);
      return id;
    }
    maxRootNum += 1;
    const id = "r" + maxRootNum;
    rootArabicToId.set(arabicText, id);
    return id;
  };

  // 3. Build new roots structure with canonical IDs
  console.log("\n[2/3] Mapping roots to IDs...");
  const rootsOut = {};
  for (const ar of quranicRoots) {
    const id = allocateId(ar);
    const count = rawOccurrences[ar].length;
    
    rootsOut[id] = {
      id,
      arabic_text: ar,
      transliteration: oldRoots[id]?.transliteration || "",
      occurrences_count: count,
    };
  }

  // Map occurrences and wordToRoot using the new IDs
  const wordToRootOut = {};
  for (const [loc, ar] of Object.entries(rawWordToRoot)) {
    const id = rootArabicToId.get(ar);
    if (id) {
      wordToRootOut[loc] = id;
    }
  }

  const occurrencesOut = {};
  for (const ar of quranicRoots) {
    const id = rootArabicToId.get(ar);
    if (id) {
      occurrencesOut[id] = rawOccurrences[ar];
    }
  }

  // 4. Run other providers and apply patches
  console.log("\n[3/3] Running secondary providers and patching meanings...");
  
  const providersUsed = [qacResult.provider];
  const coverageMeta = {
    arabic_text: { provider: qacResult.provider.id, coverage: 1.0 },
    occurrences_count: { provider: qacResult.provider.id, coverage: 1.0 }
  };

  // Run Lane's
  let lanesHashes = {};
  if (enabledProviders.includes("lanes")) {
    console.log("  Running Lane's Lexicon Provider...");
    try {
      const lanesResult = getLanesData(quranicRoots);
      providersUsed.push(lanesResult.provider);
      
      let matchedCount = 0;
      for (const patch of lanesResult.rootPatches) {
        const id = rootArabicToId.get(patch.arabicText);
        if (id && rootsOut[id]) {
          rootsOut[id][patch.field] = patch.value;
          lanesHashes[id] = patch.hash;
          matchedCount++;
        }
      }
      
      const cov = quranicRoots.length > 0 ? matchedCount / quranicRoots.length : 0;
      coverageMeta.lanes_meaning = { provider: lanesResult.provider.id, coverage: parseFloat(cov.toFixed(3)) };
      console.log(`    ✓ Patched Lanes meanings for ${matchedCount} roots (${(cov * 100).toFixed(1)}% coverage).`);
    } catch (err) {
      console.error(`    ❌ Lane's Lexicon failed: ${err.message}`);
    }
  }

  // Run Maqayis
  if (enabledProviders.includes("maqayis")) {
    console.log("  Running Maqayis al-Lugha Provider...");
    try {
      const maqayisResult = getMaqayisData(quranicRoots);
      providersUsed.push(maqayisResult.provider);
      
      let matchedCount = 0;
      for (const patch of maqayisResult.rootPatches) {
        const id = rootArabicToId.get(patch.arabicText);
        if (id && rootsOut[id]) {
          rootsOut[id][patch.field] = patch.value;
          matchedCount++;
        }
      }
      
      const cov = quranicRoots.length > 0 ? matchedCount / quranicRoots.length : 0;
      coverageMeta.maqayis_meaning = { provider: maqayisResult.provider.id, coverage: parseFloat(cov.toFixed(3)) };
      console.log(`    ✓ Patched Maqayis meanings for ${matchedCount} roots (${(cov * 100).toFixed(1)}% coverage).`);
    } catch (err) {
      console.error(`    ❌ Maqayis failed: ${err.message}`);
    }
  }

  // 5. Generate Manifest
  const manifest = {
    generatedAt: new Date().toISOString(),
    schemaVersion: "1",
    files: {
      "word_to_root.json": {
        providerId: qacResult.provider.id,
        recordCount: Object.keys(wordToRootOut).length,
      },
      "roots.json": {
        baseProviderId: qacResult.provider.id,
        recordCount: Object.keys(rootsOut).length,
        fields: coverageMeta,
      },
      "occurrences.json": {
        providerId: qacResult.provider.id,
        recordCount: Object.keys(occurrencesOut).length,
      }
    },
    providers: providersUsed,
  };

  // Output summary
  console.log("\n=== Pipeline Summary ===");
  console.log(`Roots count: ${Object.keys(rootsOut).length}`);
  console.log(`Word mappings: ${Object.keys(wordToRootOut).length}`);
  console.log(`Occurrences mapped: ${Object.keys(occurrencesOut).length}`);

  if (!write) {
    console.log("\nDRY-RUN mode. No files written. Run with --write to save changes.");
    return true;
  }

  // 6. Write files
  console.log(`\nWriting generated files to ${DIR}...`);
  if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR, { recursive: true });
  }

  const ts = Date.now();
  // Backup existing files first
  for (const f of ["roots.json", "word_to_root.json", "occurrences.json"]) {
    const fileLoc = `${DIR}/${f}`;
    if (fs.existsSync(fileLoc)) {
      fs.copyFileSync(fileLoc, `${fileLoc}.bak.${ts}`);
    }
  }
  console.log(`  ✓ Backed up old files to *.bak.${ts}`);

  const rootsString = JSON.stringify(sortKeys(rootsOut), null, 0) + "\n";
  const w2rString = JSON.stringify(sortKeys(wordToRootOut), null, 0) + "\n";
  const occString = JSON.stringify(sortKeys(occurrencesOut), null, 0) + "\n";

  // Calculate checksums for manifest
  manifest.files["roots.json"].checksum = calculateChecksum(rootsString);
  manifest.files["word_to_root.json"].checksum = calculateChecksum(w2rString);
  manifest.files["occurrences.json"].checksum = calculateChecksum(occString);

  fs.writeFileSync(`${DIR}/roots.json`, rootsString);
  fs.writeFileSync(`${DIR}/word_to_root.json`, w2rString);
  fs.writeFileSync(`${DIR}/occurrences.json`, occString);
  fs.writeFileSync(`${DIR}/manifest.json`, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`  ✓ Wrote roots.json, word_to_root.json, occurrences.json, and manifest.json`);

  // Write Lanes hash list and Lanes hash ts expected by UI
  fs.writeFileSync(`${DIR}/lane_hashes.json`, JSON.stringify(lanesHashes, null, 2) + "\n");
  
  const tsContent = `export const LANES_HASHES: Record<string, string> = ${JSON.stringify(lanesHashes, null, 2)};\n`;
  fs.writeFileSync("src/hooks/lanes-hashes.ts", tsContent);
  console.log(`  ✓ Wrote lane_hashes.json & src/hooks/lanes-hashes.ts`);

  console.log("Lexicon assembly completed successfully!");
  return true;
}
