import { describe, expect, it } from "vitest";
import { getBlueprintRegistry, validateBlueprintDocuments } from "../../src/modules/blueprint/index.js";
describe("Blueprint registry", () => { it("contains valid unique documents", () => { const docs = getBlueprintRegistry(); const result = validateBlueprintDocuments(docs); expect(docs.length).toBeGreaterThan(40); expect(result.valid).toBe(true); }); });
