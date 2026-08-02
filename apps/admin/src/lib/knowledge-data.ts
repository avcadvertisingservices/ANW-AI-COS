import "server-only";

import { createAdminClient } from "./supabase/admin";

export type KnowledgeSource = {
  id: string;
  title: string;
  organization: string | null;
  publisher: string | null;
  url: string | null;
  status: string;
  eventType: string;
  updatedAt: string | null;
  isRemoved: boolean;
};

export type KnowledgeReviewEvent = {
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

export type KnowledgeLibraryEntry = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string | null;
  body: string | null;
  knowledgeStatus: string;
  reviewStatus: string | null;
  reviewRequestId: string | null;
  reviewerName: string | null;
  sourceCount: number;
  sources: KnowledgeSource[];
  reviewTimeline: KnowledgeReviewEvent[];
  createdAt: string | null;
  updatedAt: string | null;
};

export type KnowledgeLibraryData = {
  entries: KnowledgeLibraryEntry[];
  errorMessage: string | null;
};

type UnknownRow = Record<string, unknown>;

type SourceEventRow = {
  id: string | null;
  knowledge_entry_id: string | null;
  knowledge_slug: string | null;
  source_id: string | null;
  event_type: string | null;
  before_source: unknown;
  after_source: unknown;
  created_at: string | null;
};

type ReviewRequestRow = {
  id: string | null;
  knowledge_entry_id: string | null;
  knowledge_slug: string | null;
  status: string | null;
  assigned_reviewer: unknown;
  reviewer: unknown;
  reviewer_actor: unknown;
  medical_reviewer: unknown;
  created_at: string | null;
  updated_at: string | null;
};

type ReviewEventRow = {
  id: string | null;
  review_request_id: string | null;
  knowledge_entry_id: string | null;
  event_type: string | null;
  actor: unknown;
  notes: string | null;
  created_at: string | null;
};

export async function getKnowledgeLibraryData(): Promise<KnowledgeLibraryData> {
  const supabase = createAdminClient();

  const [
    knowledgeResult,
    sourceEventsResult,
    reviewRequestsResult,
    reviewEventsResult,
  ] = await Promise.all([
    supabase
      .from("knowledge_entries")
      .select("*")
      .order("updated_at", {
        ascending: false,
      }),

    supabase
      .from("knowledge_source_events")
      .select(
        [
          "id",
          "knowledge_entry_id",
          "knowledge_slug",
          "source_id",
          "event_type",
          "before_source",
          "after_source",
          "created_at",
        ].join(","),
      )
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("knowledge_review_requests")
      .select("*")
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("knowledge_review_events")
      .select("*")
      .order("created_at", {
        ascending: false,
      }),
  ]);

  const errorMessages = [
    knowledgeResult.error?.message,
    sourceEventsResult.error?.message,
    reviewRequestsResult.error?.message,
    reviewEventsResult.error?.message,
  ].filter(
    (message): message is string =>
      typeof message === "string" &&
      message.trim().length > 0,
  );

  if (errorMessages.length > 0) {
    return {
      entries: [],
      errorMessage: errorMessages.join(" | "),
    };
  }

  const knowledgeRows =
    (knowledgeResult.data ?? []) as unknown as UnknownRow[];

  const sourceEventRows =
    (sourceEventsResult.data ?? []) as unknown as SourceEventRow[];

  const reviewRequestRows =
    (reviewRequestsResult.data ?? []) as unknown as ReviewRequestRow[];

  const reviewEventRows =
    (reviewEventsResult.data ?? []) as unknown as ReviewEventRow[];

  const sourcesByKnowledge =
    createSourcesByKnowledgeMap(sourceEventRows);

  const latestReviewByKnowledge =
    createLatestReviewByKnowledgeMap(reviewRequestRows);

  const reviewEventsByKnowledge =
    createReviewEventsByKnowledgeMap(
      reviewEventRows,
      reviewRequestRows,
    );

  const entries = knowledgeRows
    .map((row) =>
      normalizeKnowledgeEntry(
        row,
        sourcesByKnowledge,
        latestReviewByKnowledge,
        reviewEventsByKnowledge,
      ),
    )
    .sort(compareKnowledgeEntries);

  return {
    entries,
    errorMessage: null,
  };
}

export async function getKnowledgeEntryBySlug(
  slug: string,
): Promise<KnowledgeLibraryEntry | null> {
  const libraryData = await getKnowledgeLibraryData();

  if (libraryData.errorMessage) {
    return null;
  }

  const normalizedSlug = normalizeSlug(slug);

  return (
    libraryData.entries.find(
      (entry) =>
        normalizeSlug(entry.slug) === normalizedSlug,
    ) ?? null
  );
}

function normalizeKnowledgeEntry(
  row: UnknownRow,
  sourcesByKnowledge: Map<string, KnowledgeSource[]>,
  latestReviewByKnowledge: Map<string, ReviewRequestRow>,
  reviewEventsByKnowledge: Map<string, KnowledgeReviewEvent[]>,
): KnowledgeLibraryEntry {
  const id =
    readString(row.id) ??
    readString(row.knowledge_entry_id) ??
    "unknown-knowledge-entry";

  const slug =
    readString(row.slug) ??
    readString(row.knowledge_slug) ??
    createSlugFromId(id);

  const title =
    readString(row.title) ??
    readString(row.name) ??
    formatSlug(slug);

  const category =
    readString(row.category) ??
    readString(row.topic_category) ??
    readString(row.type) ??
    "General";

  const summary =
    readString(row.summary) ??
    readString(row.description) ??
    readString(row.excerpt) ??
    null;

  const body =
    readString(row.body) ??
    readString(row.content) ??
    readString(row.knowledge_body) ??
    readString(row.details) ??
    null;

  const knowledgeStatus = normalizeStatus(
    readString(row.status) ??
      readString(row.knowledge_status) ??
      "draft",
  );

  const sources =
    sourcesByKnowledge.get(id) ??
    sourcesByKnowledge.get(slug) ??
    [];

  const latestReview =
    latestReviewByKnowledge.get(id) ??
    latestReviewByKnowledge.get(slug) ??
    null;

  const reviewTimeline =
    reviewEventsByKnowledge.get(id) ??
    reviewEventsByKnowledge.get(slug) ??
    [];

  const reviewer = latestReview
    ? readFirstObject([
        latestReview.assigned_reviewer,
        latestReview.reviewer,
        latestReview.reviewer_actor,
        latestReview.medical_reviewer,
      ])
    : {};

  const reviewerName =
    readString(reviewer.name) ??
    readString(reviewer.displayName) ??
    readString(reviewer.display_name) ??
    findLatestReviewerName(reviewTimeline);

  const reviewStatus = latestReview?.status
    ? normalizeStatus(latestReview.status)
    : null;

  return {
    id,
    slug,
    title,
    category,
    summary,
    body,
    knowledgeStatus,
    reviewStatus,
    reviewRequestId: latestReview?.id ?? null,
    reviewerName,
    sourceCount: sources.length,
    sources,
    reviewTimeline,
    createdAt: readString(row.created_at),
    updatedAt:
      readString(row.updated_at) ??
      readString(row.modified_at) ??
      readString(row.created_at),
  };
}

function createSourcesByKnowledgeMap(
  rows: SourceEventRow[],
): Map<string, KnowledgeSource[]> {
  const latestEventBySource =
    new Map<string, SourceEventRow>();

  for (const row of rows) {
    if (!row.source_id) {
      continue;
    }

    const knowledgeKey =
      row.knowledge_entry_id ??
      row.knowledge_slug ??
      "unknown-knowledge";

    const compositeKey =
      `${knowledgeKey}::${row.source_id}`;

    if (!latestEventBySource.has(compositeKey)) {
      latestEventBySource.set(compositeKey, row);
    }
  }

  const result =
    new Map<string, KnowledgeSource[]>();

  for (const row of latestEventBySource.values()) {
    const eventType = normalizeStatus(
      row.event_type ?? "source_updated",
    );

    const isRemoved =
      eventType === "source_removed" ||
      eventType === "source_deleted";

    if (isRemoved) {
      continue;
    }

    const afterSource = readObject(row.after_source);
    const beforeSource = readObject(row.before_source);

    const sourceData =
      Object.keys(afterSource).length > 0
        ? afterSource
        : beforeSource;

    const sourceId =
      row.source_id ?? "unknown-source";

    const source: KnowledgeSource = {
      id: sourceId,

      title:
        readString(sourceData.title) ??
        readString(sourceData.name) ??
        formatSourceId(sourceId),

      organization:
        readString(sourceData.organization) ??
        readString(sourceData.organisation) ??
        null,

      publisher:
        readString(sourceData.publisher) ??
        readString(sourceData.provider) ??
        null,

      url:
        readString(sourceData.url) ??
        readString(sourceData.sourceUrl) ??
        readString(sourceData.source_url) ??
        null,

      status: normalizeStatus(
        readString(sourceData.status) ?? "active",
      ),

      eventType,

      updatedAt:
        readString(sourceData.updatedAt) ??
        readString(sourceData.updated_at) ??
        row.created_at,

      isRemoved: false,
    };

    const knowledgeKeys = [
      row.knowledge_entry_id,
      row.knowledge_slug,
    ].filter(isNonEmptyString);

    for (const key of knowledgeKeys) {
      const existingSources = result.get(key) ?? [];

      const withoutDuplicate = existingSources.filter(
        (existingSource) =>
          existingSource.id !== source.id,
      );

      result.set(
        key,
        [...withoutDuplicate, source].sort(
          (first, second) =>
            first.title.localeCompare(second.title),
        ),
      );
    }
  }

  return result;
}

function createLatestReviewByKnowledgeMap(
  rows: ReviewRequestRow[],
): Map<string, ReviewRequestRow> {
  const result =
    new Map<string, ReviewRequestRow>();

  for (const row of rows) {
    const knowledgeKeys = [
      row.knowledge_entry_id,
      row.knowledge_slug,
    ].filter(isNonEmptyString);

    for (const key of knowledgeKeys) {
      if (!result.has(key)) {
        result.set(key, row);
      }
    }
  }

  return result;
}

function createReviewEventsByKnowledgeMap(
  eventRows: ReviewEventRow[],
  requestRows: ReviewRequestRow[],
): Map<string, KnowledgeReviewEvent[]> {
  const requestById =
    new Map<string, ReviewRequestRow>();

  for (const request of requestRows) {
    if (request.id) {
      requestById.set(request.id, request);
    }
  }

  const result =
    new Map<string, KnowledgeReviewEvent[]>();

  for (const row of eventRows) {
    const reviewRequestId =
      row.review_request_id ??
      "unknown-review-request";

    const request =
      requestById.get(reviewRequestId);

    const knowledgeEntryId =
      row.knowledge_entry_id ??
      request?.knowledge_entry_id ??
      null;

    const knowledgeSlug =
      request?.knowledge_slug ?? null;

    if (!knowledgeEntryId && !knowledgeSlug) {
      continue;
    }

    const actor = readObject(row.actor);

    const actorName =
      readString(actor.name) ??
      readString(actor.displayName) ??
      readString(actor.display_name) ??
      "System";

    const event: KnowledgeReviewEvent = {
      id:
        row.id ??
        `${reviewRequestId}-${row.created_at ?? "event"}`,

      reviewRequestId,

      eventType: normalizeStatus(
        row.event_type ?? "review_event",
      ),

      actorName,

      actorRole:
        readString(actor.role) ?? null,

      actorEmail:
        readString(actor.email) ?? null,

      notes: row.notes ?? null,

      createdAt: row.created_at,

      isPlaceholderActor:
        isPlaceholderReviewer(actorName),
    };

    const knowledgeKeys = [
      knowledgeEntryId,
      knowledgeSlug,
    ].filter(isNonEmptyString);

    for (const key of knowledgeKeys) {
      const existingEvents = result.get(key) ?? [];

      const withoutDuplicate = existingEvents.filter(
        (existingEvent) =>
          existingEvent.id !== event.id,
      );

      result.set(
        key,
        [...withoutDuplicate, event].sort(
          (first, second) =>
            getTimestamp(second.createdAt) -
            getTimestamp(first.createdAt),
        ),
      );
    }
  }

  return result;
}

function findLatestReviewerName(
  events: KnowledgeReviewEvent[],
): string | null {
  const reviewerEvent = events.find(
    (event) =>
      event.actorName !== "System",
  );

  return reviewerEvent?.actorName ?? null;
}

function compareKnowledgeEntries(
  first: KnowledgeLibraryEntry,
  second: KnowledgeLibraryEntry,
): number {
  const firstTimestamp =
    getTimestamp(first.updatedAt);

  const secondTimestamp =
    getTimestamp(second.updatedAt);

  if (firstTimestamp !== secondTimestamp) {
    return secondTimestamp - firstTimestamp;
  }

  return first.title.localeCompare(second.title);
}

function readFirstObject(
  values: unknown[],
): Record<string, unknown> {
  for (const value of values) {
    const object = readObject(value);

    if (Object.keys(object).length > 0) {
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
    return value as Record<string, unknown>;
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

function isNonEmptyString(
  value: string | null,
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function normalizeStatus(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function normalizeSlug(
  value: string,
): string {
  try {
    return decodeURIComponent(value)
      .trim()
      .toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
}

function createSlugFromId(
  value: string,
): string {
  return value
    .replace(/^knowledge\./, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatSlug(
  slug: string,
): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function formatSourceId(
  sourceId: string,
): string {
  return sourceId
    .replace(/^source\./, "")
    .split(/[._-]/)
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function isPlaceholderReviewer(
  value: string | null,
): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase();

  const placeholderTerms = [
    "your medical reviewer",
    "real medical reviewer",
    "medical reviewer name",
    "reviewer name",
    "your reviewer",
    "test reviewer",
    "placeholder reviewer",
  ];

  return placeholderTerms.some((term) =>
    normalized.includes(term),
  );
}

function getTimestamp(
  value: string | null,
): number {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}