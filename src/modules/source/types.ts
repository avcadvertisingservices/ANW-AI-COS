import type {
  EvidenceLevel,
  KnowledgeEntry,
  KnowledgeSource,
} from "../knowledge/types.js";

export type SourceManagerActorRole =
  | "editorial_reviewer"
  | "medical_reviewer"
  | "administrator";

export type KnowledgeSourceEventType =
  | "source_added"
  | "source_updated"
  | "source_removed";

export interface SourceManagerActor {
  name: string;
  role: SourceManagerActorRole;
  userId?: string;
  email?: string;
}

export interface KnowledgeSourceInput {
  id?: string;
  title: string;
  publisher: string;
  url: string;
  publicationDate?: string;
  accessedDate?: string;
  evidenceLevel: EvidenceLevel;
}

export interface KnowledgeSourceChanges {
  title?: string;
  publisher?: string;
  url?: string;
  publicationDate?: string;
  accessedDate?: string;
  evidenceLevel?: EvidenceLevel;
}

export interface SourcePolicyReport {
  valid: boolean;
  normalizedUrl?: string;
  domain?: string;
  errors: string[];
  warnings: string[];
}

export interface SourceCollectionPolicyReport {
  valid: boolean;
  sourceCount: number;
  validSourceCount: number;
  duplicateSourceIds: string[];
  duplicateUrls: string[];
  errors: string[];
  warnings: string[];
  sourceReports: Array<{
    sourceId: string;
    title: string;
    report: SourcePolicyReport;
  }>;
}

export interface KnowledgeSourceEvent {
  id: string;
  knowledgeEntryId: string;
  knowledgeSlug: string;
  sourceId: string;
  type: KnowledgeSourceEventType;
  actor: SourceManagerActor;
  beforeSource?: KnowledgeSource;
  afterSource?: KnowledgeSource;
  notes?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AddKnowledgeSourceInput {
  knowledgeEntryId: string;
  source: KnowledgeSourceInput;
  actor: SourceManagerActor;
  notes?: string;
}

export interface UpdateKnowledgeSourceInput {
  knowledgeEntryId: string;
  sourceId: string;
  changes: KnowledgeSourceChanges;
  actor: SourceManagerActor;
  notes?: string;
}

export interface RemoveKnowledgeSourceInput {
  knowledgeEntryId: string;
  sourceId: string;
  actor: SourceManagerActor;
  notes?: string;
}

export interface KnowledgeSourceMutationResult {
  entry: KnowledgeEntry;
  event: KnowledgeSourceEvent;
  reviewReset: boolean;
}
