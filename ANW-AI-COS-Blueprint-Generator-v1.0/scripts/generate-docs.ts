import { mkdir, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

const directories = [
  "docs/00-governance",
  "docs/01-enterprise-blueprint",
  "docs/02-module-encyclopedia",
  "docs/03-architecture-decisions",
  "docs/04-engineering",
  "docs/05-api",
  "docs/06-database",
  "docs/07-workflows",
  "docs/08-design-system",
  "docs/09-testing",
  "docs/10-operations",
  "docs/11-release",
  "docs/templates",
  "docs/diagrams"
];

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  for (const directory of directories) {
    await mkdir(path.resolve(directory), { recursive: true });
  }

  const marker = path.resolve("docs/.blueprint-installed");
  if (!(await exists(marker))) {
    await writeFile(
      marker,
      `ANW AI-COS Blueprint Generator installed at ${new Date().toISOString()}\n`,
      "utf8"
    );
  }

  console.log("ANW AI-COS documentation structure is ready.");
}

main().catch((error: unknown) => {
  console.error("Documentation generation failed:", error);
  process.exitCode = 1;
});
