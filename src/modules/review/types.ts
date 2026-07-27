export type KnowledgeReviewStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "cancelled";

export type ReviewerRole =
  | "medical_reviewer"
  | "editorial_reviewer"
  | "administrator";

export type ReviewEventType =
  | "draft_created"
  | "submitted"
  | "review_started"
  | "changes_requested"
  | "resubmitted"
  | "approved"
  | "rejected"
  | "cancelled";

export interface KnowledgeSourceSnapshot {
  title: string;
  url?: string | undefined;
  publisher?: string | undefined;
  type?: string | undefined;
  publishedAt?: string | undefined;
  accessedAt?: string | undefined;
}

export interface KnowledgeRecordSnapshot {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  status: string;
  tags: string[];
  keywords: string[];
  aliases: string[];
  sources: KnowledgeSourceSnapshot[];
  medicalReviewRequired: boolean;
  reviewedBy?: string | undefined;
  reviewedAt?: string | undefined;
  version: string;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

export interface ReviewPolicyReport {
  eligibleForSubmission: boolean;
  eligibleForApproval: boolean;
  requiresMedicalReviewer: boolean;
  sourceCount: number;
  minimumSourceCount: number;
  errors: string[];
  warnings: string[];
}

export interface ReviewActor {
  name: string;
  role: ReviewerRole;
  userId?: string | undefined;
  email?: string | undefined;
}

export interface KnowledgeReviewRequest {
  id: string;
  knowledgeEntryId: string;
  knowledgeSlug: string;
  knowledgeTitle: string;
  status: KnowledgeReviewStatus;
  requestedBy: ReviewActor;
  assignedReviewer?: ReviewActor | undefined;
  submissionNotes: string;
  reviewNotes?: string | undefined;
  decisionReason?: string | undefined;
  knowledgeSnapshot: KnowledgeRecordSnapshot;
  policyReport: ReviewPolicyReport;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | undefined;
  reviewStartedAt?: string | undefined;
  decidedAt?: string | undefined;
}

export interface KnowledgeReviewEvent {
  id: string;
  reviewRequestId: string;
  knowledgeEntryId: string;
  type: ReviewEventType;
  actor: ReviewActor;
  notes?: string | undefined;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CreateReviewDraftInput {
  knowledgeEntryId: string;
  requestedBy: ReviewActor;
  submissionNotes?: string | undefined;
}

export interface StartReviewInput {
  reviewer: ReviewActor;
  notes?: string | undefined;
}

export interface ReviewDecisionInput {
  reviewer: ReviewActor;
  notes: string;
}
