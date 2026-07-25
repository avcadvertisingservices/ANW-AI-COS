import { InMemoryKnowledgeRepository } from "./in-memory-repository.js";
import { KnowledgeService } from "./service.js";
import type { KnowledgeRecord } from "./types.js";

export function createKnowledgeService(
  initialRecords: KnowledgeRecord[] = [],
): KnowledgeService {
  const repository = new InMemoryKnowledgeRepository(initialRecords);
  return new KnowledgeService(repository);
}
