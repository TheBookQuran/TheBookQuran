import fs from "fs";

/**
 * Validate the generated linguistics data files.
 * @param {string} dirPath - Directory containing the JSON files.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateFiles(dirPath) {
  try {
    const rootsPath = `${dirPath}/roots.json`;
    const w2rPath = `${dirPath}/word_to_root.json`;
    const occPath = `${dirPath}/occurrences.json`;

    if (!fs.existsSync(rootsPath) || !fs.existsSync(w2rPath) || !fs.existsSync(occPath)) {
      console.error("Validation error: One or more data files are missing.");
      return false;
    }

    const roots = JSON.parse(fs.readFileSync(rootsPath, "utf8"));
    const w2r = JSON.parse(fs.readFileSync(w2rPath, "utf8"));
    const occ = JSON.parse(fs.readFileSync(occPath, "utf8"));

    console.log(`\nValidating files in ${dirPath}...`);

    // 1. Validate roots.json
    const rootIds = Object.keys(roots);
    const rootIdRegex = /^r\d+$/;
    for (const [id, root] of Object.entries(roots)) {
      if (!rootIdRegex.test(id)) {
        console.error(`Validation error: Root ID "${id}" is invalid (must match rNNN).`);
        return false;
      }
      if (root.id !== id) {
        console.error(`Validation error: Root ID mismatch. Key is "${id}", but record id is "${root.id}".`);
        return false;
      }
      if (typeof root.arabic_text !== "string" || !root.arabic_text) {
        console.error(`Validation error: Root "${id}" has missing or invalid arabic_text.`);
        return false;
      }
      if (typeof root.occurrences_count !== "number") {
        console.error(`Validation error: Root "${id}" has missing or invalid occurrences_count.`);
        return false;
      }
    }
    console.log(`✓ roots.json structure valid (${rootIds.length} roots)`);

    // 2. Validate word_to_root.json
    const w2rKeys = Object.keys(w2r);
    const locRegex = /^\d+:\d+:\d+$/;
    for (const [loc, rootId] of Object.entries(w2r)) {
      if (!locRegex.test(loc)) {
        console.error(`Validation error: Word location "${loc}" is invalid (must be chapter:verse:word).`);
        return false;
      }
      if (!roots[rootId]) {
        console.error(`Validation error: Word location "${loc}" maps to non-existent root ID "${rootId}".`);
        return false;
      }
    }
    console.log(`✓ word_to_root.json structure valid (${w2rKeys.length} mappings)`);

    // 3. Validate occurrences.json
    const occKeys = Object.keys(occ);
    for (const [rootId, list] of Object.entries(occ)) {
      if (!roots[rootId]) {
        console.error(`Validation error: Occurrences key "${rootId}" does not exist in roots.json.`);
        return false;
      }
      if (!Array.isArray(list)) {
        console.error(`Validation error: Occurrences list for "${rootId}" is not an array.`);
        return false;
      }

      // Check each occurrence details
      for (const item of list) {
        if (
          typeof item.chapterNumber !== "number" ||
          typeof item.verseNumber !== "number" ||
          typeof item.wordPosition !== "number"
        ) {
          console.error(`Validation error: Invalid occurrence item format under root "${rootId}":`, item);
          return false;
        }
      }

      // Check count matches roots.json occurrences_count
      const expectedCount = roots[rootId].occurrences_count;
      if (list.length !== expectedCount) {
        console.error(`Validation error: Count mismatch for "${rootId}". roots.json count is ${expectedCount}, occurrences.json list length is ${list.length}.`);
        return false;
      }
    }
    console.log(`✓ occurrences.json structure valid (${occKeys.length} roots mapped)`);

    // Check for orphaned keys (roots with count > 0 but missing in occurrences or vice-versa)
    for (const id of rootIds) {
      if (roots[id].occurrences_count > 0 && !occ[id]) {
        console.error(`Validation error: Root "${id}" has occurrences_count > 0 but no entry in occurrences.json.`);
        return false;
      }
    }

    console.log("✓ All linguistic data integrity checks PASSED successfully!");
    return true;
  } catch (err) {
    console.error("Validation failed with exception:", err);
    return false;
  }
}
