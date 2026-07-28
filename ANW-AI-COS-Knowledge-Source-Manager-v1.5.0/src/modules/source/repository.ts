import type { KnowledgeEntry } from "../knowledge/types.js";
import type { KnowledgeSourceEvent } from "./types.js";

export interface KnowledgeSourceManagerRepository {
  getKnowledgeById(id: string): Promise<KnowledgeEntry | null>;
  getKnowledgeBySlug(slug: string): Promise<KnowledgeEntry | null>;
  saveKnowledge(entry: KnowledgeEntry): Promise<KnowledgeEntry>;
  addEvent(event: KnowledgeSourceEvent): Promise<KnowledgeSourceEvent>;
  listEvents(knowledgeEntryId: string): Promise<KnowledgeSourceEvent[]>;
}
