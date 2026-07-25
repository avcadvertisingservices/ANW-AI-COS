import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";
import { createBlueprint } from "./index.js";
async function main(): Promise<void> { const demoRoot = await fs.mkdtemp(path.join(os.tmpdir(), "anw-blueprint-demo-")); const result = await createBlueprint({ rootDirectory: demoRoot }); console.log({ demoRoot, createdCount: result.created.length, skippedCount: result.skipped.length }); }
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
