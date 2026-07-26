import type {
  KnowledgeEntry,
  KnowledgeQuery,
  KnowledgeRepository,
  KnowledgeSearchResult,
} from "./types.js";
import { searchKnowledgeEntries } from "./search.js";
import { KnowledgeNotFoundError } from "./errors.js";

export class KnowledgeService {
  public constructor(
    private readonly repository: KnowledgeRepository,
  ) {}

  public async create(entry: KnowledgeEntry): Promise<KnowledgeEntry> {
    await this.repository.add(entry);
    return entry;
  }

  public async update(entry: KnowledgeEntry): Promise<KnowledgeEntry> {
    const updated: KnowledgeEntry = {
      ...entry,
      updatedAt: new Date().toISOString(),
    };

    await this.repository.update(updated);
    return updated;
  }

  public async getById(id: string): Promise<KnowledgeEntry> {
    const entry = await this.repository.getById(id);

    if (!entry) {
      throw new KnowledgeNotFoundError(
        `Knowledge entry "${id}" was not found.`,
      );
    }

    return entry;
  }

  public async getBySlug(slug: string): Promise<KnowledgeEntry> {
    const entry = await this.repository.getBySlug(slug);

    if (!entry) {
      throw new KnowledgeNotFoundError(
        `Knowledge slug "${slug}" was not found.`,
      );
    }

    return entry;
  }

  public async search(
    query: KnowledgeQuery,
  ): Promise<KnowledgeSearchResult[]> {
    const entries = await this.repository.list();
    return searchKnowledgeEntries(entries, query);
  }

  public async approve(input: {
    id: string;
    reviewedBy: string;
  }): Promise<KnowledgeEntry> {
    const entry = await this.getById(input.id);
    const reviewedAt = new Date().toISOString();

    return this.update({
      ...entry,
      status: "approved",
      reviewedBy: input.reviewedBy,
      reviewedAt,
    });
  }

  public async archive(id: string): Promise<KnowledgeEntry> {
    const entry = await this.getById(id);

    return this.update({
      ...entry,
      status: "archived",
    });
  }
}
