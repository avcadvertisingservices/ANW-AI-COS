import { createBlueprint } from "../src/modules/blueprint/index.js";

async function main(): Promise<void> {
  const result = await createBlueprint({ rootDirectory: process.cwd(), overwrite: false });
  console.log("\nANW AI-COS Blueprint Generator complete.");
  console.log(`Created: ${result.created.length}`);
  console.log(`Skipped: ${result.skipped.length}`);
  console.log(`Documentation root: ${result.docsDirectory}`);
}

main().catch((error: unknown) => {
  console.error("Blueprint generation failed.");
  console.error(error);
  process.exitCode = 1;
});
