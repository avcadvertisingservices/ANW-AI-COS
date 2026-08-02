import "server-only";

import { createAdminClient } from "./supabase/admin";

export type KnowledgeLibraryEntry = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  knowledgeStatus: string;
  reviewStatus: string | null;
  sourceCount: number;
  updatedAt: string | null;
};

export type KnowledgeLibraryData = {
  entries: KnowledgeLibraryEntry[];
  errorMessage: string | null;
};

type UnknownRow = Record<string, unknown>;

type SourceEventRow = {
  knowledge_entry_id: string | null;
  source_id: string | null;
  event_type: string | null;
  created_at: string | null;
};

type ReviewRequestRow = {
  id: string;
  knowledge_entry_id: string | null;
  knowledge_slug: string | null;
  status: string | null;
  created_at: string | null;
};

export async function getKnowledgeLibraryData(): Promise<KnowledgeLibraryData> {
  const supabase = createAdminClient();

  const [
    knowledgeResult,
    sourceEventsResult,
    reviewRequestsResult,
  ] = await Promise.all([
    supabase
      .from("knowledge_entries")
      .select("*")
      .order("updated_at", { ascending: false }),

    supabase
      .from("knowledge_source_events")
      .select(
        "knowledge_entry_id,source_id,event_type,created_at",
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("knowledge_review_requests")
      .select(
        "id,knowledge_entry_id,knowledge_slug,status,created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  const errors = [
    knowledgeResult.error,
    sourceEventsResult.error,
    reviewRequestsResult.error,
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

  const knowledgeRows = (knowledgeResult.data ?? []) as UnknownRow[];

  const sourceEvents =
    (sourceEventsResult.data ?? []) as SourceEventRow[];

  const reviewRequests =
    (reviewRequestsResult.data ?? []) as ReviewRequestRow[];

  const sourceCounts = createSourceCountMap(sourceEvents);

  const latestReviewByEntry =
    createLatestReviewMap(reviewRequests);

  const entries = knowledgeRows.map((row) => {
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

    return {
      id,
      slug,
      title,
      summary,
      category,
      knowledgeStatus,
      reviewStatus: latestReview?.status ?? null,
      sourceCount: sourceCounts.get(id) ?? 0,
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

function createSourceCountMap(
  events: SourceEventRow[],
): Map<string, number> {
  const latestEventByEntryAndSource =
    new Map<string, SourceEventRow>();

  for (const event of events) {
    if (!event.knowledge_entry_id || !event.source_id) {
      continue;
    }

    const compositeKey =
      event.knowledge_entry_id + "::" + event.source_id;

    if (!latestEventByEntryAndSource.has(compositeKey)) {
      latestEventByEntryAndSource.set(
        compositeKey,
        event,
      );
    }
  }

  const countByEntry = new Map<string, number>();

  for (const event of latestEventByEntryAndSource.values()) {
    if (!event.knowledge_entry_id) {
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

    const currentCount =
      countByEntry.get(event.knowledge_entry_id) ?? 0;

    countByEntry.set(
      event.knowledge_entry_id,
      currentCount + 1,
    );
  }

  return countByEntry;
}

function createLatestReviewMap(
  reviews: ReviewRequestRow[],
): Map<string, ReviewRequestRow> {
  const latestReview = new Map<
    string,
    ReviewRequestRow
  >();

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

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim()
    ? value
    : null;
}

function formatSlug(slug: string): string {
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