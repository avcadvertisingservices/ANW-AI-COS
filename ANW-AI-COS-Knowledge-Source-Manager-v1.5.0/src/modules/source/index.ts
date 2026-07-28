export { KnowledgeSourceManagerService } from "./service.js";
export { InMemoryKnowledgeSourceManagerRepository } from "./in-memory.js";
export { SupabaseKnowledgeSourceManagerRepository } from "./supabase-repository.js";
export { createSupabaseKnowledgeSourceManager } from "./factory.js";
export {
  canonicalizeSourceUrl,
  evaluateKnowledgeSource,
  evaluateSourceCollection,
} from "./policy.js";
export { KnowledgeSourceManagerError } from "./errors.js";
export type { KnowledgeSourceManagerRepository } from "./repository.js";
export type {
  AddKnowledgeSourceInput,
  KnowledgeSourceChanges,
  KnowledgeSourceEvent,
  KnowledgeSourceEventType,
  KnowledgeSourceInput,
  KnowledgeSourceMutationResult,
  RemoveKnowledgeSourceInput,
  SourceCollectionPolicyReport,
  SourceManagerActor,
  SourceManagerActorRole,
  SourcePolicyReport,
  UpdateKnowledgeSourceInput,
} from "./types.js";
