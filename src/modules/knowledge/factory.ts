import type {
  EvidenceLevel,
  KnowledgeCategory,
  KnowledgeEntry,
  KnowledgeSource,
  KnowledgeStatus,
} from "./types.js";

export interface CreateKnowledgeEntryInput {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: KnowledgeCategory;
  status?: KnowledgeStatus;
  tags?: string[];
  keywords?: string[];
  aliases?: string[];
  sources?: KnowledgeSource[];
  medicalReviewRequired?: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  version?: string;
}

export function createKnowledgeSource(input: {
  id: string;
  title: string;
  publisher?: string;
  url?: string;
  publicationDate?: string;
  accessedDate?: string;
  evidenceLevel?: EvidenceLevel;
}): KnowledgeSource {
  return {
    ...input,
    evidenceLevel: input.evidenceLevel ?? "educational",
  };
}

export function createKnowledgeEntry(
  input: CreateKnowledgeEntryInput,
): KnowledgeEntry {
  const now = new Date().toISOString();

  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    body: input.body,
    category: input.category,
    status: input.status ?? "draft",
    tags: input.tags ?? [],
    keywords: input.keywords ?? [],
    aliases: input.aliases ?? [],
    sources: input.sources ?? [],
    medicalReviewRequired:
      input.medicalReviewRequired ?? true,
    reviewedBy: input.reviewedBy,
    reviewedAt: input.reviewedAt,
    createdAt: now,
    updatedAt: now,
    version: input.version ?? "1.0.0",
  };
}
