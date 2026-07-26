import type { Database, Json } from "../../core/database/database.types.js";
import type {
  KnowledgeCategory,
  KnowledgeEntry,
  KnowledgeSource,
  KnowledgeStatus,
} from "./types.js";

type KnowledgeRow =
  Database["public"]["Tables"]["knowledge_entries"]["Row"];

type KnowledgeInsert =
  Database["public"]["Tables"]["knowledge_entries"]["Insert"];

type KnowledgeUpdate =
  Database["public"]["Tables"]["knowledge_entries"]["Update"];

function parseSources(value: Json): KnowledgeSource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is KnowledgeSource =>
      typeof item === "object" &&
      item !== null &&
      !Array.isArray(item) &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.evidenceLevel === "string",
  );
}

export function knowledgeRowToDomain(
  row: KnowledgeRow,
): KnowledgeEntry {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    category: row.category as KnowledgeCategory,
    status: row.status as KnowledgeStatus,
    tags: row.tags,
    keywords: row.keywords,
    aliases: row.aliases,
    sources: parseSources(row.sources),
    medicalReviewRequired: row.medical_review_required,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
  };
}

export function knowledgeDomainToInsert(
  entry: KnowledgeEntry,
): KnowledgeInsert {
  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    body: entry.body,
    category: entry.category,
    status: entry.status,
    tags: entry.tags,
    keywords: entry.keywords,
    aliases: entry.aliases,
    sources: entry.sources as unknown as Json,
    medical_review_required: entry.medicalReviewRequired,
    reviewed_by: entry.reviewedBy ?? null,
    reviewed_at: entry.reviewedAt ?? null,
    version: entry.version,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  };
}

export function knowledgeDomainToUpdate(
  entry: KnowledgeEntry,
): KnowledgeUpdate {
  return {
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    body: entry.body,
    category: entry.category,
    status: entry.status,
    tags: entry.tags,
    keywords: entry.keywords,
    aliases: entry.aliases,
    sources: entry.sources as unknown as Json,
    medical_review_required: entry.medicalReviewRequired,
    reviewed_by: entry.reviewedBy ?? null,
    reviewed_at: entry.reviewedAt ?? null,
    version: entry.version,
    updated_at: entry.updatedAt,
  };
}
