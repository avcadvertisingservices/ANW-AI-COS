import type {
  KnowledgeEntry,
  KnowledgeRepository,
} from "./types.js";
import {
  KnowledgeConflictError,
  KnowledgeNotFoundError,
} from "./errors.js";
import { validateKnowledgeEntry } from "./validators.js";

export class InMemoryKnowledgeRepository
  implements KnowledgeRepository
{
  private readonly entries = new Map<string, KnowledgeEntry>();

  public async add(entry: KnowledgeEntry): Promise<void> {
    validateKnowledgeEntry(entry);

    if (this.entries.has(entry.id)) {
      throw new KnowledgeConflictError(
        `Knowledge entry "${entry.id}" already exists.`,
      );
    }

    const slugExists = [...this.entries.values()].some(
      (existing) => existing.slug === entry.slug,
    );

    if (slugExists) {
      throw new KnowledgeConflictError(
        `Knowledge slug "${entry.slug}" already exists.`,
      );
    }

    this.entries.set(entry.id, structuredClone(entry));
  }

  public async update(entry: KnowledgeEntry): Promise<void> {
    validateKnowledgeEntry(entry);

    if (!this.entries.has(entry.id)) {
      throw new KnowledgeNotFoundError(
        `Knowledge entry "${entry.id}" was not found.`,
      );
    }

    const slugConflict = [...this.entries.values()].some(
      (existing) =>
        existing.slug === entry.slug && existing.id !== entry.id,
    );

    if (slugConflict) {
      throw new KnowledgeConflictError(
        `Knowledge slug "${entry.slug}" already exists.`,
      );
    }

    this.entries.set(entry.id, structuredClone(entry));
  }

  public async getById(id: string): Promise<KnowledgeEntry | null> {
    const entry = this.entries.get(id);
    return entry ? structuredClone(entry) : null;
  }

  public async getBySlug(slug: string): Promise<KnowledgeEntry | null> {
    const entry = [...this.entries.values()].find(
      (candidate) => candidate.slug === slug,
    );

    return entry ? structuredClone(entry) : null;
  }

  public async list(): Promise<KnowledgeEntry[]> {
    return [...this.entries.values()].map((entry) =>
      structuredClone(entry),
    );
  }

  public async remove(id: string): Promise<boolean> {
    return this.entries.delete(id);
  }
}
