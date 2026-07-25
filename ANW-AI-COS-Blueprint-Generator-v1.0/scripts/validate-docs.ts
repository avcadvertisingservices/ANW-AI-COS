import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const requiredFields = [
  "title:",
  "documentType:",
  "version:",
  "status:",
  "owner:",
  "project:",
  "created:"
];

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(fullPath) : [fullPath];
    })
  );
  return nested.flat();
}

async function main(): Promise<void> {
  const files = (await walk(path.resolve("docs")))
    .filter((file) => file.endsWith(".md"))
    .filter((file) => !file.includes(`${path.sep}templates${path.sep}`));

  const failures: string[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    if (!content.startsWith("---")) {
      failures.push(`${file}: missing frontmatter`);
      continue;
    }

    for (const field of requiredFields) {
      if (!content.includes(field)) {
        failures.push(`${file}: missing ${field}`);
      }
    }
  }

  if (failures.length > 0) {
    console.error("Documentation validation failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Documentation validation passed for ${files.length} files.`);
}

main().catch((error: unknown) => {
  console.error("Documentation validation failed:", error);
  process.exitCode = 1;
});
