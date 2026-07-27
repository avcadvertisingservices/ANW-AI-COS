import type { SupabaseClient } from "@supabase/supabase-js";
import { KnowledgeReviewError } from "./errors.js";
import type {
  KnowledgeApprovalGateway,
  KnowledgeReviewRepository,
} from "./repository.js";
import type {
  KnowledgeRecordSnapshot,
  KnowledgeReviewEvent,
  KnowledgeReviewRequest,
  KnowledgeSourceSnapshot,
  ReviewActor,
  ReviewPolicyReport,
} from "./types.js";

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0
    ? value
    : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string => typeof item === "string",
      )
    : [];
}

function actorFromJson(value: unknown): ReviewActor {
  const input = (value ?? {}) as Record<string, unknown>;

  return {
    name: stringValue(input.name, "Unknown actor"),
    role:
      input.role === "medical_reviewer" ||
      input.role === "editorial_reviewer" ||
      input.role === "administrator"
        ? input.role
        : "editorial_reviewer",
    userId: optionalString(input.userId),
    email: optionalString(input.email),
  };
}

function policyFromJson(value: unknown): ReviewPolicyReport {
  const input = (value ?? {}) as Record<string, unknown>;

  return {
    eligibleForSubmission: Boolean(input.eligibleForSubmission),
    eligibleForApproval: Boolean(input.eligibleForApproval),
    requiresMedicalReviewer: Boolean(input.requiresMedicalReviewer),
    sourceCount:
      typeof input.sourceCount === "number" ? input.sourceCount : 0,
    minimumSourceCount:
      typeof input.minimumSourceCount === "number"
        ? input.minimumSourceCount
        : 0,
    errors: stringArray(input.errors),
    warnings: stringArray(input.warnings),
  };
}

function sourceFromJson(value: unknown): KnowledgeSourceSnapshot {
  const input = (value ?? {}) as Record<string, unknown>;

  return {
    title: stringValue(input.title, "Untitled source"),
    url: optionalString(input.url),
    publisher: optionalString(input.publisher),
    type: optionalString(input.type),
    publishedAt: optionalString(
      input.publishedAt ?? input.published_at,
    ),
    accessedAt: optionalString(
      input.accessedAt ?? input.accessed_at,
    ),
  };
}

function knowledgeFromJson(
  value: unknown,
): KnowledgeRecordSnapshot {
  const input = (value ?? {}) as Record<string, unknown>;

  return {
    id: stringValue(input.id),
    slug: stringValue(input.slug),
    title: stringValue(input.title),
    summary: stringValue(input.summary),
    body: stringValue(input.body),
    category: stringValue(input.category, "resource"),
    status: stringValue(input.status, "draft"),
    tags: stringArray(input.tags),
    keywords: stringArray(input.keywords),
    aliases: stringArray(input.aliases),
    sources: Array.isArray(input.sources)
      ? input.sources.map(sourceFromJson)
      : [],
    medicalReviewRequired: Boolean(
      input.medicalReviewRequired ??
        input.medical_review_required,
    ),
    reviewedBy: optionalString(
      input.reviewedBy ?? input.reviewed_by,
    ),
    reviewedAt: optionalString(
      input.reviewedAt ?? input.reviewed_at,
    ),
    version: stringValue(input.version, "1.0.0"),
    createdAt: optionalString(
      input.createdAt ?? input.created_at,
    ),
    updatedAt: optionalString(
      input.updatedAt ?? input.updated_at,
    ),
  };
}

function mapRequest(row: Record<string, unknown>): KnowledgeReviewRequest {
  return {
    id: stringValue(row.id),
    knowledgeEntryId: stringValue(row.knowledge_entry_id),
    knowledgeSlug: stringValue(row.knowledge_slug),
    knowledgeTitle: stringValue(row.knowledge_title),
    status: row.status as KnowledgeReviewRequest["status"],
    requestedBy: actorFromJson(row.requested_by),
    assignedReviewer: row.assigned_reviewer
      ? actorFromJson(row.assigned_reviewer)
      : undefined,
    submissionNotes: stringValue(row.submission_notes),
    reviewNotes: optionalString(row.review_notes),
    decisionReason: optionalString(row.decision_reason),
    knowledgeSnapshot: knowledgeFromJson(row.knowledge_snapshot),
    policyReport: policyFromJson(row.policy_report),
    createdAt: stringValue(row.created_at),
    updatedAt: stringValue(row.updated_at),
    submittedAt: optionalString(row.submitted_at),
    reviewStartedAt: optionalString(row.review_started_at),
    decidedAt: optionalString(row.decided_at),
  };
}

function requestRow(request: KnowledgeReviewRequest) {
  return {
    id: request.id,
    knowledge_entry_id: request.knowledgeEntryId,
    knowledge_slug: request.knowledgeSlug,
    knowledge_title: request.knowledgeTitle,
    status: request.status,
    requested_by: request.requestedBy,
    assigned_reviewer: request.assignedReviewer ?? null,
    submission_notes: request.submissionNotes,
    review_notes: request.reviewNotes ?? null,
    decision_reason: request.decisionReason ?? null,
    knowledge_snapshot: request.knowledgeSnapshot,
    policy_report: request.policyReport,
    created_at: request.createdAt,
    updated_at: request.updatedAt,
    submitted_at: request.submittedAt ?? null,
    review_started_at: request.reviewStartedAt ?? null,
    decided_at: request.decidedAt ?? null,
  };
}

function mapEvent(row: Record<string, unknown>): KnowledgeReviewEvent {
  return {
    id: stringValue(row.id),
    reviewRequestId: stringValue(row.review_request_id),
    knowledgeEntryId: stringValue(row.knowledge_entry_id),
    type: row.event_type as KnowledgeReviewEvent["type"],
    actor: actorFromJson(row.actor),
    notes: optionalString(row.notes),
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
    createdAt: stringValue(row.created_at),
  };
}

export class SupabaseKnowledgeReviewRepository
  implements KnowledgeReviewRepository
{
  public constructor(private readonly client: SupabaseClient) {}

  public async createRequest(
    request: KnowledgeReviewRequest,
  ): Promise<KnowledgeReviewRequest> {
    const { data, error } = await this.client
      .from("knowledge_review_requests")
      .insert(requestRow(request))
      .select("*")
      .single();

    if (error || !data) {
      throw new KnowledgeReviewError(
        `Failed to create knowledge review request: ${error?.message ?? "Unknown database error"}`,
        "REVIEW_DATABASE_CREATE_FAILED",
        undefined,
        error,
      );
    }

    return mapRequest(data as Record<string, unknown>);
  }

  public async getRequest(
    id: string,
  ): Promise<KnowledgeReviewRequest | null> {
    const { data, error } = await this.client
      .from("knowledge_review_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new KnowledgeReviewError(
        `Failed to read knowledge review request: ${error.message}`,
        "REVIEW_DATABASE_READ_FAILED",
        undefined,
        error,
      );
    }

    return data
      ? mapRequest(data as Record<string, unknown>)
      : null;
  }

  public async updateRequest(
    request: KnowledgeReviewRequest,
  ): Promise<KnowledgeReviewRequest> {
    const row = requestRow(request);
    const { id: _id, ...changes } = row;

    const { data, error } = await this.client
      .from("knowledge_review_requests")
      .update(changes)
      .eq("id", request.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new KnowledgeReviewError(
        `Failed to update knowledge review request: ${error?.message ?? "Unknown database error"}`,
        "REVIEW_DATABASE_UPDATE_FAILED",
        undefined,
        error,
      );
    }

    return mapRequest(data as Record<string, unknown>);
  }

  public async addEvent(
    event: KnowledgeReviewEvent,
  ): Promise<KnowledgeReviewEvent> {
    const { data, error } = await this.client
      .from("knowledge_review_events")
      .insert({
        id: event.id,
        review_request_id: event.reviewRequestId,
        knowledge_entry_id: event.knowledgeEntryId,
        event_type: event.type,
        actor: event.actor,
        notes: event.notes ?? null,
        metadata: event.metadata,
        created_at: event.createdAt,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new KnowledgeReviewError(
        `Failed to create knowledge review event: ${error?.message ?? "Unknown database error"}`,
        "REVIEW_EVENT_CREATE_FAILED",
        undefined,
        error,
      );
    }

    return mapEvent(data as Record<string, unknown>);
  }

  public async listEvents(
    reviewRequestId: string,
  ): Promise<KnowledgeReviewEvent[]> {
    const { data, error } = await this.client
      .from("knowledge_review_events")
      .select("*")
      .eq("review_request_id", reviewRequestId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new KnowledgeReviewError(
        `Failed to list knowledge review events: ${error.message}`,
        "REVIEW_EVENT_LIST_FAILED",
        undefined,
        error,
      );
    }

    return (data ?? []).map((row) =>
      mapEvent(row as Record<string, unknown>),
    );
  }
}

export class SupabaseKnowledgeApprovalGateway
  implements KnowledgeApprovalGateway
{
  public constructor(private readonly client: SupabaseClient) {}

  private async find(
    field: "id" | "slug",
    value: string,
  ): Promise<KnowledgeRecordSnapshot | null> {
    const { data, error } = await this.client
      .from("knowledge_entries")
      .select("*")
      .eq(field, value)
      .maybeSingle();

    if (error) {
      throw new KnowledgeReviewError(
        `Failed to read knowledge entry: ${error.message}`,
        "KNOWLEDGE_REVIEW_ENTRY_READ_FAILED",
        undefined,
        error,
      );
    }

    return data ? knowledgeFromJson(data) : null;
  }

  public getById(
    id: string,
  ): Promise<KnowledgeRecordSnapshot | null> {
    return this.find("id", id);
  }

  public getBySlug(
    slug: string,
  ): Promise<KnowledgeRecordSnapshot | null> {
    return this.find("slug", slug);
  }

  public async approve(
    id: string,
    reviewerName: string,
    reviewedAt: string,
  ): Promise<KnowledgeRecordSnapshot> {
    const { data, error } = await this.client
      .from("knowledge_entries")
      .update({
        status: "approved",
        reviewed_by: reviewerName,
        reviewed_at: reviewedAt,
        updated_at: reviewedAt,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      throw new KnowledgeReviewError(
        `Failed to approve knowledge entry: ${error?.message ?? "Unknown database error"}`,
        "KNOWLEDGE_REVIEW_APPROVAL_FAILED",
        undefined,
        error,
      );
    }

    return knowledgeFromJson(data);
  }
}
