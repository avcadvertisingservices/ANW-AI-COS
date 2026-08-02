import "server-only";

import { createAdminClient } from "./supabase/admin";

export type MedicalReviewEvent = {
  id: string;
  reviewRequestId: string;
  eventType: string;
  actorName: string;
  actorRole: string | null;
  actorEmail: string | null;
  notes: string | null;
  createdAt: string | null;
  isPlaceholderActor: boolean;
};

export type MedicalReviewRecord = {
  id: string;
  knowledgeEntryId: string;
  knowledgeSlug: string | null;
  knowledgeTitle: string;
  status: string;
  assignedReviewerName: string | null;
  assignedReviewerRole: string | null;
  assignedReviewerEmail: string | null;
  submissionNotes: string | null;
  reviewNotes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  submittedAt: string | null;
  reviewStartedAt: string | null;
  completedAt: string | null;
  events: MedicalReviewEvent[];
  hasPlaceholderReviewer: boolean;
};

export type MedicalReviewData = {
  reviews: MedicalReviewRecord[];
  activeReviews: MedicalReviewRecord[];
  completedReviews: MedicalReviewRecord[];
  counts: {
    total: number;
    draft: number;
    submitted: number;
    inReview: number;
    changesRequested: number;
    approved: number;
    rejected: number;
  };
  errorMessage: string | null;
};

type UnknownRow = Record<string, unknown>;

type KnowledgeEntrySummary = {
  id: string;
  slug: string | null;
  title: string;
};

export async function getMedicalReviewData(): Promise<MedicalReviewData> {
  const supabase = createAdminClient();

  const [
    reviewRequestsResult,
    reviewEventsResult,
    knowledgeEntriesResult,
  ] = await Promise.all([
    supabase
      .from("knowledge_review_requests")
      .select("*")
      .order("created_at", { ascending: false }),

    supabase
      .from("knowledge_review_events")
      .select("*")
      .order("created_at", { ascending: false }),

    supabase
      .from("knowledge_entries")
      .select("*"),
  ]);

  const errors = [
    reviewRequestsResult.error,
    reviewEventsResult.error,
    knowledgeEntriesResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    return {
      reviews: [],
      activeReviews: [],
      completedReviews: [],
      counts: createEmptyCounts(),
      errorMessage: errors
        .map((error) => error?.message)
        .filter(Boolean)
        .join(" | "),
    };
  }

  const requestRows =
    (reviewRequestsResult.data ?? []) as UnknownRow[];

  const eventRows =
    (reviewEventsResult.data ?? []) as UnknownRow[];

  const knowledgeRows =
    (knowledgeEntriesResult.data ?? []) as UnknownRow[];

  const knowledgeById = createKnowledgeMap(knowledgeRows);
  const eventsByRequest = createReviewEventMap(eventRows);

  const reviews = requestRows.map((row) => {
    return normalizeReviewRequest(
      row,
      knowledgeById,
      eventsByRequest,
    );
  });

  const activeStatuses = new Set([
    "draft",
    "submitted",
    "in_review",
    "changes_requested",
  ]);

  const completedStatuses = new Set([
    "approved",
    "rejected",
    "cancelled",
  ]);

  const activeReviews = reviews.filter((review) =>
    activeStatuses.has(review.status),
  );

  const completedReviews = reviews.filter((review) =>
    completedStatuses.has(review.status),
  );

  return {
    reviews,
    activeReviews,
    completedReviews,
    counts: createCounts(reviews),
    errorMessage: null,
  };
}

function normalizeReviewRequest(
  row: UnknownRow,
  knowledgeById: Map<string, KnowledgeEntrySummary>,
  eventsByRequest: Map<string, MedicalReviewEvent[]>,
): MedicalReviewRecord {
  const id =
    readString(row.id) ??
    "unknown-review-request";

  const knowledgeEntryId =
    readString(row.knowledge_entry_id) ??
    "unknown-knowledge-entry";

  const knowledgeSlug =
    readString(row.knowledge_slug) ??
    null;

  const knowledgeEntry =
    knowledgeById.get(knowledgeEntryId);

  const status =
    normalizeStatus(
      readString(row.status) ??
        "draft",
    );

  const assignedReviewer = readFirstObject([
    row.assigned_reviewer,
    row.reviewer,
    row.reviewer_actor,
    row.medical_reviewer,
  ]);

  const events =
    eventsByRequest.get(id) ?? [];

  const latestReviewStartedEvent = events.find(
    (event) =>
      event.eventType === "review_started",
  );

  const latestApprovedEvent = events.find(
    (event) =>
      event.eventType === "approved",
  );

  const latestRejectedEvent = events.find(
    (event) =>
      event.eventType === "rejected",
  );

  const completionEvent =
    latestApprovedEvent ??
    latestRejectedEvent;

  const assignedReviewerName =
    readString(assignedReviewer.name) ??
    readString(assignedReviewer.displayName) ??
    latestReviewStartedEvent?.actorName ??
    null;

  const assignedReviewerRole =
    readString(assignedReviewer.role) ??
    latestReviewStartedEvent?.actorRole ??
    null;

  const assignedReviewerEmail =
    readString(assignedReviewer.email) ??
    latestReviewStartedEvent?.actorEmail ??
    null;

  const hasPlaceholderReviewer =
    isPlaceholderReviewer(
      assignedReviewerName,
    ) ||
    events.some(
      (event) =>
        event.isPlaceholderActor,
    );

  return {
    id,
    knowledgeEntryId,
    knowledgeSlug:
      knowledgeSlug ??
      knowledgeEntry?.slug ??
      null,
    knowledgeTitle:
      knowledgeEntry?.title ??
      (knowledgeSlug
        ? formatSlug(knowledgeSlug)
        : formatKnowledgeId(
            knowledgeEntryId,
          )),
    status,
    assignedReviewerName,
    assignedReviewerRole,
    assignedReviewerEmail,
    submissionNotes:
      readString(row.submission_notes) ??
      readString(row.submit_notes) ??
      readString(row.notes) ??
      findEventNotes(
        events,
        "submitted",
      ),
    reviewNotes:
      readString(row.review_notes) ??
      readString(row.decision_notes) ??
      completionEvent?.notes ??
      latestReviewStartedEvent?.notes ??
      null,
    createdAt:
      readString(row.created_at),
    updatedAt:
      readString(row.updated_at),
    submittedAt:
      readString(row.submitted_at) ??
      findEventDate(
        events,
        "submitted",
      ),
    reviewStartedAt:
      readString(row.review_started_at) ??
      readString(row.started_at) ??
      latestReviewStartedEvent?.createdAt ??
      null,
    completedAt:
      readString(row.completed_at) ??
      readString(row.approved_at) ??
      readString(row.rejected_at) ??
      completionEvent?.createdAt ??
      null,
    events,
    hasPlaceholderReviewer,
  };
}

function createKnowledgeMap(
  rows: UnknownRow[],
): Map<string, KnowledgeEntrySummary> {
  const result =
    new Map<string, KnowledgeEntrySummary>();

  for (const row of rows) {
    const id = readString(row.id);

    if (!id) {
      continue;
    }

    const slug =
      readString(row.slug) ??
      readString(row.knowledge_slug) ??
      null;

    const title =
      readString(row.title) ??
      (slug
        ? formatSlug(slug)
        : formatKnowledgeId(id));

    const value = {
      id,
      slug,
      title,
    };

    result.set(id, value);

    if (slug) {
      result.set(slug, value);
    }
  }

  return result;
}

function createReviewEventMap(
  rows: UnknownRow[],
): Map<string, MedicalReviewEvent[]> {
  const result =
    new Map<string, MedicalReviewEvent[]>();

  for (const row of rows) {
    const id =
      readString(row.id) ??
      crypto.randomUUID();

    const reviewRequestId =
      readString(row.review_request_id);

    if (!reviewRequestId) {
      continue;
    }

    const actor =
      readObject(row.actor);

    const actorName =
      readString(actor.name) ??
      readString(actor.displayName) ??
      readString(actor.display_name) ??
      "System";

    const event: MedicalReviewEvent = {
      id,
      reviewRequestId,
      eventType: normalizeStatus(
        readString(row.event_type) ??
          "review_event",
      ),
      actorName,
      actorRole:
        readString(actor.role) ??
        null,
      actorEmail:
        readString(actor.email) ??
        null,
      notes:
        readString(row.notes) ??
        null,
      createdAt:
        readString(row.created_at),
      isPlaceholderActor:
        isPlaceholderReviewer(actorName),
    };

    const current =
      result.get(reviewRequestId) ?? [];

    current.push(event);

    result.set(
      reviewRequestId,
      current,
    );
  }

  return result;
}

function createCounts(
  reviews: MedicalReviewRecord[],
): MedicalReviewData["counts"] {
  const counts = createEmptyCounts();

  counts.total = reviews.length;

  for (const review of reviews) {
    switch (review.status) {
      case "draft":
        counts.draft += 1;
        break;

      case "submitted":
        counts.submitted += 1;
        break;

      case "in_review":
        counts.inReview += 1;
        break;

      case "changes_requested":
        counts.changesRequested += 1;
        break;

      case "approved":
        counts.approved += 1;
        break;

      case "rejected":
        counts.rejected += 1;
        break;
    }
  }

  return counts;
}

function createEmptyCounts(): MedicalReviewData["counts"] {
  return {
    total: 0,
    draft: 0,
    submitted: 0,
    inReview: 0,
    changesRequested: 0,
    approved: 0,
    rejected: 0,
  };
}

function findEventNotes(
  events: MedicalReviewEvent[],
  eventType: string,
): string | null {
  return (
    events.find(
      (event) =>
        event.eventType === eventType &&
        event.notes,
    )?.notes ??
    null
  );
}

function findEventDate(
  events: MedicalReviewEvent[],
  eventType: string,
): string | null {
  return (
    events.find(
      (event) =>
        event.eventType === eventType,
    )?.createdAt ??
    null
  );
}

function readFirstObject(
  values: unknown[],
): Record<string, unknown> {
  for (const value of values) {
    const object = readObject(value);

    if (
      Object.keys(object).length > 0
    ) {
      return object;
    }
  }

  return {};
}

function readObject(
  value: unknown,
): Record<string, unknown> {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      unknown
    >;
  }

  return {};
}

function readString(
  value: unknown,
): string | null {
  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return value.trim();
  }

  return null;
}

function normalizeStatus(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function isPlaceholderReviewer(
  value: string | null,
): boolean {
  if (!value) {
    return false;
  }

  const normalized =
    value.toLowerCase();

  const placeholderTerms = [
    "real medical reviewer",
    "your medical reviewer",
    "reviewer name",
    "your reviewer",
    "medical reviewer name",
    "your me",
  ];

  return placeholderTerms.some(
    (term) =>
      normalized.includes(term),
  );
}

function formatSlug(
  slug: string,
): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}

function formatKnowledgeId(
  value: string,
): string {
  return value
    .replace(/^knowledge\./, "")
    .split(/[._-]/)
    .filter(Boolean)
    .map((word) => {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}