import { assembleLexicon } from "./_core/assembler.mjs";
import { validateFiles } from "./_core/validate.mjs";

const WRITE = process.argv.includes("--write");
const VALIDATE_ONLY = process.argv.includes("--validate-only");

const onlyArg = process.argv.find(arg => arg.startsWith("--only="));
const only = onlyArg ? onlyArg.split("=")[1] : null;

const DIR = "public/data/linguistics";

async function main() {
  if (VALIDATE_ONLY) {
    const isValid = validateFiles(DIR);
    process.exit(isValid ? 0 : 1);
  }

  try {
    const success = assembleLexicon({ write: WRITE, only });
    if (!success) {
      console.error("Assembler failed.");
      process.exit(1);
    }

    if (WRITE) {
      console.log("\nRunning validation on newly written files...");
      const isValid = validateFiles(DIR);
      if (!isValid) {
        console.error("Validation failed for the written files!");
        process.exit(1);
      }
    } else {
      console.log("\nValidation skipped in dry-run mode. Run with --write to generate and validate.");
    }
  } catch (err) {
    console.error("\nPipeline run failed with error:", err);
    process.exit(1);
  }
}

main();
