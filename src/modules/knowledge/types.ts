export type KnowledgeCategory =
  | "medical-fact"
  | "symptom"
  | "diagnosis"
  | "treatment"
  | "recovery"
  | "faq"
  | "survivor-story"
  | "research"
  | "glossary"
  | "resource";

export type KnowledgeStatus =
  | "draft"
  | "review"
  | "approved"
  | "archived";

export type EvidenceLevel =
  | "community"
  | "educational"
  | "clinical"
  | "research";

export interface KnowledgeSource {
  id: string;
  title: string;
  publisher?: string;
  url?: string;
  publicationDate?: string;
  accessedDate?: string;
  evidenceLevel: EvidenceLevel;
}

export interface KnowledgeEntry {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: KnowledgeCategory;
  status: KnowledgeStatus;
  tags: string[];
  keywords: string[];
  aliases: string[];
  sources: KnowledgeSource[];
  medicalReviewRequired: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface KnowledgeQuery {
  text?: string;
  category?: KnowledgeCategory;
  status?: KnowledgeStatus;
  tags?: string[];
  approvedOnly?: boolean;
  limit?: number;
}

export interface KnowledgeSearchResult {
  entry: KnowledgeEntry;
  score: number;
  matchedTerms: string[];
}

export interface KnowledgeRepository {
  add(entry: KnowledgeEntry): Promise<void>;
  update(entry: KnowledgeEntry): Promise<void>;
  getById(id: string): Promise<KnowledgeEntry | null>;
  getBySlug(slug: string): Promise<KnowledgeEntry | null>;
  list(): Promise<KnowledgeEntry[]>;
  remove(id: string): Promise<boolean>;
}
