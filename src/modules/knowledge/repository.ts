import type {
  KnowledgeQuery,
  KnowledgeRecord,
  KnowledgeSearchResult,
} from "./types.js";

export interface KnowledgeRepository {
  list(query?: KnowledgeQuery): Promise<KnowledgeRecord[]>;
  findById(id: string): Promise<KnowledgeRecord | null>;
  findBySlug(slug: string): Promise<KnowledgeRecord | null>;
  save(record: KnowledgeRecord): Promise<KnowledgeRecord>;
  search(query: KnowledgeQuery): Promise<KnowledgeSearchResult[]>;
}
