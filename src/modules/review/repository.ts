import type {
  KnowledgeRecordSnapshot,
  KnowledgeReviewEvent,
  KnowledgeReviewRequest,
} from "./types.js";

export interface KnowledgeReviewRepository {
  createRequest(
    request: KnowledgeReviewRequest,
  ): Promise<KnowledgeReviewRequest>;

  getRequest(
    id: string,
  ): Promise<KnowledgeReviewRequest | null>;

  updateRequest(
    request: KnowledgeReviewRequest,
  ): Promise<KnowledgeReviewRequest>;

  addEvent(
    event: KnowledgeReviewEvent,
  ): Promise<KnowledgeReviewEvent>;

  listEvents(
    reviewRequestId: string,
  ): Promise<KnowledgeReviewEvent[]>;
}

export interface KnowledgeApprovalGateway {
  getById(
    id: string,
  ): Promise<KnowledgeRecordSnapshot | null>;

  getBySlug(
    slug: string,
  ): Promise<KnowledgeRecordSnapshot | null>;

  approve(
    id: string,
    reviewerName: string,
    reviewedAt: string,
  ): Promise<KnowledgeRecordSnapshot>;
}
