import { validateKnowledgeRecord } from "./validation.js";
import type { KnowledgeRepository } from "./repository.js";
import type {
  KnowledgeQuery,
  KnowledgeRecord,
  KnowledgeSearchResult,
} from "./types.js";

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

export class InMemoryKnowledgeRepository implements KnowledgeRepository {
  private readonly records = new Map<string, KnowledgeRecord>();

  constructor(initialRecords: KnowledgeRecord[] = []) {
    for (const record of initialRecords) {
      validateKnowledgeRecord(record);
      this.records.set(record.id, structuredClone(record));
    }
  }

  public async list(query: KnowledgeQuery = {}): Promise<KnowledgeRecord[]> {
    let records = [...this.records.values()];

    if (query.category) {
      records = records.filter((record) => record.category === query.category);
    }

    if (query.status) {
      records = records.filter((record) => record.status === query.status);
    }

    if (query.tags?.length) {
      const requiredTags = query.tags.map(normalize);
      records = records.filter((record) => {
        const recordTags = record.tags.map(normalize);
        return requiredTags.every((tag) => recordTags.includes(tag));
      });
    }

    return records.slice(0, query.limit ?? 100).map(structuredClone);
  }

  public async findById(id: string): Promise<KnowledgeRecord | null> {
    const record = this.records.get(id);
    return record ? structuredClone(record) : null;
  }

  public async findBySlug(slug: string): Promise<KnowledgeRecord | null> {
    const match = [...this.records.values()].find((record) => record.slug === slug);
    return match ? structuredClone(match) : null;
  }

  public async save(record: KnowledgeRecord): Promise<KnowledgeRecord> {
    validateKnowledgeRecord(record);
    this.records.set(record.id, structuredClone(record));
    return structuredClone(record);
  }

  public async search(query: KnowledgeQuery): Promise<KnowledgeSearchResult[]> {
    const needle = normalize(query.text ?? "");
    const candidates = await this.list(query);

    if (!needle) {
      return candidates.map((record) => ({
        record,
        score: 1,
        matchedFields: [],
      }));
    }

    const results: KnowledgeSearchResult[] = [];

    for (const record of candidates) {
      let score = 0;
      const matchedFields: string[] = [];

      const weightedFields: Array<[string, string, number]> = [
        ["title", record.title, 5],
        ["summary", record.summary, 3],
        ["body", record.body, 2],
        ["tags", record.tags.join(" "), 4],
      ];

      for (const [field, value, weight] of weightedFields) {
        if (normalize(value).includes(needle)) {
          score += weight;
          matchedFields.push(field);
        }
      }

      if (score > 0) {
        results.push({ record, score, matchedFields });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit ?? 20);
  }
}
