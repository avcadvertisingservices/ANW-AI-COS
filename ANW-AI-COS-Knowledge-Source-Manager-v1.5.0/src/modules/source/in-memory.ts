import type { KnowledgeEntry } from "../knowledge/types.js";
import type { KnowledgeSourceManagerRepository } from "./repository.js";
import type { KnowledgeSourceEvent } from "./types.js";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class InMemoryKnowledgeSourceManagerRepository
  implements KnowledgeSourceManagerRepository
{
  private readonly entries = new Map<string, KnowledgeEntry>();
  private readonly events: KnowledgeSourceEvent[] = [];

  public constructor(entries: KnowledgeEntry[] = []) {
    for (const entry of entries) {
      this.entries.set(entry.id, clone(entry));
    }
  }

  public async getKnowledgeById(
    id: string,
  ): Promise<KnowledgeEntry | null> {
    const entry = this.entries.get(id);
    return entry ? clone(entry) : null;
  }

  public async getKnowledgeBySlug(
    slug: string,
  ): Promise<KnowledgeEntry | null> {
    const entry = [...this.entries.values()].find(
      (candidate) => candidate.slug === slug,
    );

    return entry ? clone(entry) : null;
  }

  public async saveKnowledge(
    entry: KnowledgeEntry,
  ): Promise<KnowledgeEntry> {
    this.entries.set(entry.id, clone(entry));
    return clone(entry);
  }

  public async addEvent(
    event: KnowledgeSourceEvent,
  ): Promise<KnowledgeSourceEvent> {
    this.events.push(clone(event));
    return clone(event);
  }

  public async listEvents(
    knowledgeEntryId: string,
  ): Promise<KnowledgeSourceEvent[]> {
    return this.events
      .filter((event) => event.knowledgeEntryId === knowledgeEntryId)
      .map(clone);
  }
}
