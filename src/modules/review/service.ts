import { randomUUID } from "node:crypto";
import { KnowledgeReviewError } from "./errors.js";
import { evaluateKnowledgeReviewPolicy } from "./policy.js";
import type {
  KnowledgeApprovalGateway,
  KnowledgeReviewRepository,
} from "./repository.js";
import type {
  CreateReviewDraftInput,
  KnowledgeRecordSnapshot,
  KnowledgeReviewEvent,
  KnowledgeReviewRequest,
  ReviewActor,
  ReviewDecisionInput,
  ReviewEventType,
  ReviewerRole,
  StartReviewInput,
} from "./types.js";

function nowIso(): string {
  return new Date().toISOString();
}

export class KnowledgeReviewService {
  public constructor(
    private readonly repository: KnowledgeReviewRepository,
    private readonly knowledgeGateway: KnowledgeApprovalGateway,
  ) {}

  private async requiredRequest(
    id: string,
  ): Promise<KnowledgeReviewRequest> {
    const request = await this.repository.getRequest(id);

    if (!request) {
      throw new KnowledgeReviewError(
        `Knowledge review request ${id} was not found.`,
        "REVIEW_REQUEST_NOT_FOUND",
      );
    }

    return request;
  }

  private async requiredEntry(
    id: string,
  ): Promise<KnowledgeRecordSnapshot> {
    const entry = await this.knowledgeGateway.getById(id);

    if (!entry) {
      throw new KnowledgeReviewError(
        `Knowledge entry ${id} was not found.`,
        "KNOWLEDGE_ENTRY_NOT_FOUND",
      );
    }

    return entry;
  }

  private async addEvent(
    request: KnowledgeReviewRequest,
    type: ReviewEventType,
    actor: ReviewActor,
    notes?: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    const event: KnowledgeReviewEvent = {
      id: randomUUID(),
      reviewRequestId: request.id,
      knowledgeEntryId: request.knowledgeEntryId,
      type,
      actor,
      notes,
      metadata,
      createdAt: nowIso(),
    };

    await this.repository.addEvent(event);
  }

  public async evaluateEntry(
    knowledgeEntryId: string,
    reviewerRole?: ReviewerRole,
  ) {
    const entry = await this.requiredEntry(knowledgeEntryId);

    return {
      entry,
      policy: evaluateKnowledgeReviewPolicy(entry, reviewerRole),
    };
  }

  public async evaluateBySlug(
    slug: string,
    reviewerRole?: ReviewerRole,
  ) {
    const entry = await this.knowledgeGateway.getBySlug(slug);

    if (!entry) {
      throw new KnowledgeReviewError(
        `Knowledge entry with slug ${slug} was not found.`,
        "KNOWLEDGE_ENTRY_NOT_FOUND",
      );
    }

    return {
      entry,
      policy: evaluateKnowledgeReviewPolicy(entry, reviewerRole),
    };
  }

  public async createDraft(
    input: CreateReviewDraftInput,
  ): Promise<KnowledgeReviewRequest> {
    const entry = await this.requiredEntry(input.knowledgeEntryId);
    const timestamp = nowIso();
    const policy = evaluateKnowledgeReviewPolicy(entry);

    const request: KnowledgeReviewRequest = {
      id: randomUUID(),
      knowledgeEntryId: entry.id,
      knowledgeSlug: entry.slug,
      knowledgeTitle: entry.title,
      status: "draft",
      requestedBy: input.requestedBy,
      submissionNotes: input.submissionNotes?.trim() ?? "",
      knowledgeSnapshot: entry,
      policyReport: policy,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const created = await this.repository.createRequest(request);

    await this.addEvent(
      created,
      "draft_created",
      input.requestedBy,
      input.submissionNotes,
      {
        eligibleForSubmission: policy.eligibleForSubmission,
        policyErrors: policy.errors,
      },
    );

    return created;
  }

  public async submit(
    id: string,
    actor: ReviewActor,
    notes?: string,
  ): Promise<KnowledgeReviewRequest> {
    const request = await this.requiredRequest(id);

    if (request.status !== "draft" && request.status !== "changes_requested") {
      throw new KnowledgeReviewError(
        `A ${request.status} request cannot be submitted.`,
        "INVALID_REVIEW_TRANSITION",
      );
    }

    const entry = await this.requiredEntry(request.knowledgeEntryId);
    const policy = evaluateKnowledgeReviewPolicy(entry);

    if (!policy.eligibleForSubmission) {
      throw new KnowledgeReviewError(
        "Knowledge entry is not eligible for review submission.",
        "REVIEW_POLICY_FAILED",
        policy.errors,
      );
    }

    const timestamp = nowIso();
    const eventType: ReviewEventType =
      request.status === "changes_requested" ? "resubmitted" : "submitted";

    const updated: KnowledgeReviewRequest = {
      ...request,
      status: "submitted",
      requestedBy: actor,
      submissionNotes: notes?.trim() || request.submissionNotes,
      knowledgeSnapshot: entry,
      policyReport: policy,
      submittedAt: timestamp,
      updatedAt: timestamp,
      reviewNotes: undefined,
      decisionReason: undefined,
      decidedAt: undefined,
    };

    const saved = await this.repository.updateRequest(updated);
    await this.addEvent(saved, eventType, actor, notes);
    return saved;
  }

  public async startReview(
    id: string,
    input: StartReviewInput,
  ): Promise<KnowledgeReviewRequest> {
    const request = await this.requiredRequest(id);

    if (request.status !== "submitted") {
      throw new KnowledgeReviewError(
        `A ${request.status} request cannot enter review.`,
        "INVALID_REVIEW_TRANSITION",
      );
    }

    const timestamp = nowIso();

    const updated: KnowledgeReviewRequest = {
      ...request,
      status: "in_review",
      assignedReviewer: input.reviewer,
      reviewNotes: input.notes?.trim() || undefined,
      reviewStartedAt: timestamp,
      updatedAt: timestamp,
    };

    const saved = await this.repository.updateRequest(updated);
    await this.addEvent(
      saved,
      "review_started",
      input.reviewer,
      input.notes,
    );
    return saved;
  }

  public async requestChanges(
    id: string,
    input: ReviewDecisionInput,
  ): Promise<KnowledgeReviewRequest> {
    const request = await this.requiredRequest(id);

    if (request.status !== "in_review") {
      throw new KnowledgeReviewError(
        `A ${request.status} request cannot receive change requests.`,
        "INVALID_REVIEW_TRANSITION",
      );
    }

    if (input.notes.trim().length < 10) {
      throw new KnowledgeReviewError(
        "Change-request notes must contain at least 10 characters.",
        "REVIEW_NOTES_REQUIRED",
      );
    }

    const timestamp = nowIso();
    const updated: KnowledgeReviewRequest = {
      ...request,
      status: "changes_requested",
      assignedReviewer: input.reviewer,
      reviewNotes: input.notes.trim(),
      decisionReason: input.notes.trim(),
      decidedAt: timestamp,
      updatedAt: timestamp,
    };

    const saved = await this.repository.updateRequest(updated);
    await this.addEvent(
      saved,
      "changes_requested",
      input.reviewer,
      input.notes,
    );
    return saved;
  }

  public async approve(
    id: string,
    input: ReviewDecisionInput,
  ): Promise<{
    request: KnowledgeReviewRequest;
    knowledgeEntry: KnowledgeRecordSnapshot;
  }> {
    const request = await this.requiredRequest(id);

    if (request.status !== "in_review") {
      throw new KnowledgeReviewError(
        `A ${request.status} request cannot be approved.`,
        "INVALID_REVIEW_TRANSITION",
      );
    }

    if (input.notes.trim().length < 10) {
      throw new KnowledgeReviewError(
        "Approval notes must contain at least 10 characters.",
        "REVIEW_NOTES_REQUIRED",
      );
    }

    const entry = await this.requiredEntry(request.knowledgeEntryId);
    const policy = evaluateKnowledgeReviewPolicy(
      entry,
      input.reviewer.role,
    );

    if (!policy.eligibleForApproval) {
      throw new KnowledgeReviewError(
        "Knowledge entry is not eligible for approval.",
        "REVIEW_APPROVAL_POLICY_FAILED",
        policy.errors,
      );
    }

    const timestamp = nowIso();
    const approvedEntry = await this.knowledgeGateway.approve(
      entry.id,
      input.reviewer.name,
      timestamp,
    );

    const updated: KnowledgeReviewRequest = {
      ...request,
      status: "approved",
      assignedReviewer: input.reviewer,
      reviewNotes: input.notes.trim(),
      decisionReason: input.notes.trim(),
      knowledgeSnapshot: approvedEntry,
      policyReport: policy,
      decidedAt: timestamp,
      updatedAt: timestamp,
    };

    const saved = await this.repository.updateRequest(updated);
    await this.addEvent(
      saved,
      "approved",
      input.reviewer,
      input.notes,
      {
        approvedKnowledgeStatus: approvedEntry.status,
        reviewedAt: approvedEntry.reviewedAt,
      },
    );

    return {
      request: saved,
      knowledgeEntry: approvedEntry,
    };
  }

  public async reject(
    id: string,
    input: ReviewDecisionInput,
  ): Promise<KnowledgeReviewRequest> {
    const request = await this.requiredRequest(id);

    if (request.status !== "in_review") {
      throw new KnowledgeReviewError(
        `A ${request.status} request cannot be rejected.`,
        "INVALID_REVIEW_TRANSITION",
      );
    }

    if (input.notes.trim().length < 10) {
      throw new KnowledgeReviewError(
        "Rejection notes must contain at least 10 characters.",
        "REVIEW_NOTES_REQUIRED",
      );
    }

    const timestamp = nowIso();
    const updated: KnowledgeReviewRequest = {
      ...request,
      status: "rejected",
      assignedReviewer: input.reviewer,
      reviewNotes: input.notes.trim(),
      decisionReason: input.notes.trim(),
      decidedAt: timestamp,
      updatedAt: timestamp,
    };

    const saved = await this.repository.updateRequest(updated);
    await this.addEvent(
      saved,
      "rejected",
      input.reviewer,
      input.notes,
    );
    return saved;
  }

  public getRequest(
    id: string,
  ): Promise<KnowledgeReviewRequest | null> {
    return this.repository.getRequest(id);
  }

  public listEvents(
    id: string,
  ): Promise<KnowledgeReviewEvent[]> {
    return this.repository.listEvents(id);
  }
}
