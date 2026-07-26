export { KnowledgeService } from "./service.js";
export { InMemoryKnowledgeRepository } from "./repository.js";
export {
  createKnowledgeEntry,
  createKnowledgeSource,
} from "./factory.js";
export { createStarterKnowledge } from "./seed.js";
export { searchKnowledgeEntries } from "./search.js";
export { validateKnowledgeEntry } from "./validators.js";
export {
  KnowledgeError,
  KnowledgeConflictError,
  KnowledgeNotFoundError,
  KnowledgeValidationError,
} from "./errors.js";
export type {
  EvidenceLevel,
  KnowledgeCategory,
  KnowledgeEntry,
  KnowledgeQuery,
  KnowledgeRepository,
  KnowledgeSearchResult,
  KnowledgeSource,
  KnowledgeStatus,
} from "./types.js";

export { SupabaseKnowledgeRepository } from "./supabase-repository.js";
export { createSupabaseKnowledgeService } from "./supabase-service.js";
export {
  knowledgeDomainToInsert,
  knowledgeDomainToUpdate,
  knowledgeRowToDomain,
} from "./supabase-mapper.js";
