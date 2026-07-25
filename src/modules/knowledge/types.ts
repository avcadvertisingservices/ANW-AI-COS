export type KnowledgeStatus = "draft" | "review" | "approved" | "archived";

export type KnowledgeCategory =
  | "symptoms"
  | "diagnosis"
  | "treatment"
  | "recovery"
  | "hearing"
  | "balance"
  | "facial-nerve"
  | "eye-care"
  | "caregiver"
  | "mental-health"
  | "faq"
  | "glossary"
  | "founder-story"
  | "community-insight";

export interface KnowledgeSource {
  id: string;
  title: string;
  publisher?: string;
  url?: string;
  publicationDate?: string;
  accessedAt?: string;
  notes?: string;
}

export interface KnowledgeRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: KnowledgeCategory;
  tags: string[];
  status: KnowledgeStatus;
  medicalReviewRequired: boolean;
  sourceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeQuery {
  text?: string;
  category?: KnowledgeCategory;
  tags?: string[];
  status?: KnowledgeStatus;
  limit?: number;
}

export interface KnowledgeSearchResult {
  record: KnowledgeRecord;
  score: number;
  matchedFields: string[];
}
