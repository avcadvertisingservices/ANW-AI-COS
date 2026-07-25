import { readFile } from "node:fs/promises";
import type { KnowledgeRecord, KnowledgeSource } from "./types.js";
import { validateKnowledgeRecord } from "./validation.js";

export interface KnowledgeDataset {
  records: KnowledgeRecord[];
  sources: KnowledgeSource[];
}

export async function loadKnowledgeDataset(
  filePath: string,
): Promise<KnowledgeDataset> {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as Partial<KnowledgeDataset>;

  if (!Array.isArray(parsed.records) || !Array.isArray(parsed.sources)) {
    throw new Error(`Invalid knowledge dataset: ${filePath}`);
  }

  for (const record of parsed.records) {
    validateKnowledgeRecord(record);
  }

  return {
    records: parsed.records,
    sources: parsed.sources,
  };
}
