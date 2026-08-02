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
};

export type KnowledgeLibraryEntry = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  knowledgeStatus: string;
  reviewStatus: string | null;
  sourceCount: number;
  sources: KnowledgeSource[];
  reviewEvents: KnowledgeReviewEvent[];
  updatedAt: string | null;
};

export type KnowledgeLibraryData = {
  entries: KnowledgeLibraryEntry[];
  errorMessage: string | null;
};

type UnknownRow = Record<string, unknown>;

type SourceEventRow = {
  knowledge_entry_id: string | null;
  knowledge_slug: string | null;
  source_id: string | null;
  event_type: string | null;
  after_source: unknown;
  created_at: string | null;
};

type ReviewRequestRow = {
  id: string;
  knowledge_entry_id: string | null;
  knowledge_slug: string | null;
  status: string | null;
  created_at: string | null;
};

type ReviewEventRow = {
  id: string;
  review_request_id: string;
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
      .order("updated_at", { ascending: false }),

    supabase
      .from("knowledge_source_events")
      .select(
        "knowledge_entry_id,knowledge_slug,source_id,event_type,after_source,created_at",
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("knowledge_review_requests")
      .select(
        "id,knowledge_entry_id,knowledge_slug,status,created_at",
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("knowledge_review_events")
      .select(
        "id,review_request_id,knowledge_entry_id,event_type,actor,notes,created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  const errors = [
    knowledgeResult.error,
    sourceEventsResult.error,
    reviewRequestsResult.error,
    reviewEventsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    return {
      entries: [],
      errorMessage: errors
        .map((error) => error?.message)
        .filter(Boolean)
        .join(" | "),
    };
  }

  const knowledgeRows =
    (knowledgeResult.data ?? []) as UnknownRow[];

  const sourceEvents =
    (sourceEventsResult.data ?? []) as SourceEventRow[];

  const reviewRequests =
    (reviewRequestsResult.data ?? []) as ReviewRequestRow[];

  const reviewEvents =
    (reviewEventsResult.data ?? []) as ReviewEventRow[];

  const sourcesByEntry = createSourceMap(sourceEvents);
  const latestReviewByEntry = createLatestReviewMap(reviewRequests);
  const reviewEventsByEntry = createReviewEventMap(reviewEvents);

  const entries: KnowledgeLibraryEntry[] = knowledgeRows.map((row) => {
    const id = readString(row.id) ?? "";

    const slug =
      readString(row.slug) ??
      readString(row.knowledge_slug) ??
      id;

    const title =
      readString(row.title) ??
      formatSlug(slug);

    const summary =
      readString(row.summary) ??
      readString(row.description) ??
      "";

    const body =
      readString(row.body) ??
      readString(row.content) ??
      "";

    const category =
      readString(row.category) ??
      "General";

    const knowledgeStatus =
      readString(row.status) ??
      readString(row.approval_status) ??
      "draft";

    const updatedAt =
      readString(row.updated_at) ??
      readString(row.created_at);

    const latestReview =
      latestReviewByEntry.get(id) ??
      latestReviewByEntry.get(slug);

    const sources =
      sourcesByEntry.get(id) ??
      sourcesByEntry.get(slug) ??
      [];

    const entryReviewEvents =
      reviewEventsByEntry.get(id) ?? [];

    return {
      id,
      slug,
      title,
      summary,
      body,
      category,
      knowledgeStatus,
      reviewStatus: latestReview?.status ?? null,
      sourceCount: sources.length,
      sources,
      reviewEvents: entryReviewEvents,
      updatedAt,
    };
  });

  return {
    entries,
    errorMessage: null,
  };
}

export async function getKnowledgeEntryBySlug(
  requestedSlug: string,
): Promise<{
  entry: KnowledgeLibraryEntry | null;
  errorMessage: string | null;
}> {
  const libraryData = await getKnowledgeLibraryData();

  if (libraryData.errorMessage) {
    return {
      entry: null,
      errorMessage: libraryData.errorMessage,
    };
  }

  const decodedSlug = decodeURIComponent(requestedSlug);

  const entry =
    libraryData.entries.find(
      (item) =>
        item.slug === decodedSlug ||
        item.id === decodedSlug,
    ) ?? null;

  return {
    entry,
    errorMessage: null,
  };
}

function createSourceMap(
  events: SourceEventRow[],
): Map<string, KnowledgeSource[]> {
  const latestEventByEntryAndSource =
    new Map<string, SourceEventRow>();

  for (const event of events) {
    if (!event.knowledge_entry_id || !event.source_id) {
      continue;
    }

    const key =
      event.knowledge_entry_id +
      "::" +
      event.source_id;

    // Events are newest first, so retain only the first event
    // encountered for each knowledge-entry/source pair.
    if (!latestEventByEntryAndSource.has(key)) {
      latestEventByEntryAndSource.set(key, event);
    }
  }

  const sourcesByEntry =
    new Map<string, KnowledgeSource[]>();

  for (const event of latestEventByEntryAndSource.values()) {
    if (!event.knowledge_entry_id || !event.source_id) {
      continue;
    }

    const eventType =
      event.event_type?.toLowerCase() ?? "";

    const removed =
      eventType === "source_removed" ||
      eventType === "source_deleted";

    if (removed) {
      continue;
    }

    const sourceData = readObject(event.after_source);

    const source: KnowledgeSource = {
      id: event.source_id,
      title:
        readString(sourceData.title) ??
        readString(sourceData.name) ??
        formatSourceId(event.source_id),
      organization:
        readString(sourceData.organization) ??
        null,
      publisher:
        readString(sourceData.publisher) ??
        readString(sourceData.provider) ??
        null,
      url:
        readString(sourceData.url) ??
        readString(sourceData.sourceUrl) ??
        null,
      status:
        readString(sourceData.status) ??
        "active",
      eventType:
        event.event_type ??
        "source_updated",
      updatedAt:
        event.created_at,
    };

    const current =
      sourcesByEntry.get(event.knowledge_entry_id) ?? [];

    current.push(source);

    sourcesByEntry.set(
      event.knowledge_entry_id,
      current,
    );

    if (event.knowledge_slug) {
      sourcesByEntry.set(
        event.knowledge_slug,
        current,
      );
    }
  }

  return sourcesByEntry;
}

function createLatestReviewMap(
  reviews: ReviewRequestRow[],
): Map<string, ReviewRequestRow> {
  const latestReview =
    new Map<string, ReviewRequestRow>();

  for (const review of reviews) {
    if (
      review.knowledge_entry_id &&
      !latestReview.has(review.knowledge_entry_id)
    ) {
      latestReview.set(
        review.knowledge_entry_id,
        review,
      );
    }

    if (
      review.knowledge_slug &&
      !latestReview.has(review.knowledge_slug)
    ) {
      latestReview.set(
        review.knowledge_slug,
        review,
      );
    }
  }

  return latestReview;
}

function createReviewEventMap(
  events: ReviewEventRow[],
): Map<string, KnowledgeReviewEvent[]> {
  const eventsByEntry =
    new Map<string, KnowledgeReviewEvent[]>();

  for (const event of events) {
    if (!event.knowledge_entry_id) {
      continue;
    }

    const actor = readObject(event.actor);

    const normalizedEvent: KnowledgeReviewEvent = {
      id: event.id,
      reviewRequestId: event.review_request_id,
      eventType:
        event.event_type ??
        "review_event",
      actorName:
        readString(actor.name) ??
        readString(actor.displayName) ??
        "System",
      actorRole:
        readString(actor.role) ??
        null,
      actorEmail:
        readString(actor.email) ??
        null,
      notes:
        event.notes,
      createdAt:
        event.created_at,
    };

    const current =
      eventsByEntry.get(event.knowledge_entry_id) ?? [];

    current.push(normalizedEvent);

    eventsByEntry.set(
      event.knowledge_entry_id,
      current,
    );
  }

  return eventsByEntry;
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

function formatSourceId(
  sourceId: string,
): string {
  return sourceId
    .replace(/^source\./, "")
    .split(/[.-]/)
    .filter(Boolean)
    .map((word) => {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}