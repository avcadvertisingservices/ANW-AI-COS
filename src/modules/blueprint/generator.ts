import { promises as fs } from "node:fs";
import path from "node:path";
import { getBlueprintRegistry } from "./registry.js";
import type { BlueprintOptions, BlueprintResult } from "./types.js";
async function exists(filePath: string): Promise<boolean> { try { await fs.access(filePath); return true; } catch { return false; } }
export async function createBlueprint(options: BlueprintOptions): Promise<BlueprintResult> {
  const docsDirectory = path.resolve(options.rootDirectory, "docs");
  const overwrite = options.overwrite ?? false;
  const created: string[] = [];
  const skipped: string[] = [];
  await fs.mkdir(docsDirectory, { recursive: true });
  for (const document of getBlueprintRegistry()) {
    const targetPath = path.join(docsDirectory, document.relativePath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    if (!overwrite && await exists(targetPath)) { skipped.push(document.relativePath); console.log(`SKIPPED: ${document.relativePath}`); continue; }
    await fs.writeFile(targetPath, document.content, "utf8");
    created.push(document.relativePath); console.log(`CREATED: ${document.relativePath}`);
  }
  return { docsDirectory, created, skipped };
}
