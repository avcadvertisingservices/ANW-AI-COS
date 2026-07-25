import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";
import { describe, expect, it } from "vitest";
import { createBlueprint } from "../../src/modules/blueprint/index.js";
describe("Blueprint generator", () => { it("creates and then skips existing files", async () => { const root = await fs.mkdtemp(path.join(os.tmpdir(), "anw-blueprint-test-")); const first = await createBlueprint({ rootDirectory: root }); const second = await createBlueprint({ rootDirectory: root }); expect(first.created.length).toBeGreaterThan(40); expect(second.created.length).toBe(0); expect(second.skipped.length).toBe(first.created.length); }); });
