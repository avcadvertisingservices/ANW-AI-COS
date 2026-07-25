import { KnowledgeNotFoundError } from "./errors.js";
import type { KnowledgeRepository } from "./repository.js";
import type {
  KnowledgeQuery,
  KnowledgeRecord,
  KnowledgeSearchResult,
} from "./types.js";

export class KnowledgeService {
  constructor(private readonly repository: KnowledgeRepository) {}

  public async getApprovedRecords(
    query: Omit<KnowledgeQuery, "status"> = {},
  ): Promise<KnowledgeRecord[]> {
    return this.repository.list({ ...query, status: "approved" });
  }

  public async getById(id: string): Promise<KnowledgeRecord> {
    const record = await this.repository.findById(id);

    if (!record) {
      throw new KnowledgeNotFoundError(id);
    }

    return record;
  }

  public async getBySlug(slug: string): Promise<KnowledgeRecord> {
    const record = await this.repository.findBySlug(slug);

    if (!record) {
      throw new KnowledgeNotFoundError(slug);
    }

    return record;
  }

  public async saveDraft(record: KnowledgeRecord): Promise<KnowledgeRecord> {
    return this.repository.save({
      ...record,
      status: "draft",
      updatedAt: new Date().toISOString(),
    });
  }

  public async searchApproved(
    query: Omit<KnowledgeQuery, "status">,
  ): Promise<KnowledgeSearchResult[]> {
    return this.repository.search({ ...query, status: "approved" });
  }
}
