import "server-only";

import { createAdminClient } from "./supabase/admin";

export type DashboardData = {
  knowledgeTopicCount: number;
  sourceCount: number;
  submittedReviewCount: number;
  activeReview: {
    id: string;
    status: string;
    knowledgeEntryId: string;
    knowledgeSlug: string | null;
  } | null;
  errorMessage: string | null;
};

type SourceEventRow = {
  source_id: string | null;
  event_type: string | null;
  created_at: string;
};

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = createAdminClient();

  const [
    knowledgeResult,
    sourceEventsResult,
    submittedReviewsResult,
    activeReviewResult,
  ] = await Promise.all([
    supabase
      .from("knowledge_entries")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("knowledge_source_events")
      .select("source_id,event_type,created_at")
      .order("created_at", { ascending: false }),

    supabase
      .from("knowledge_review_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "submitted"),

    supabase
      .from("knowledge_review_requests")
      .select("id,status,knowledge_entry_id,knowledge_slug,created_at")
      .in("status", [
        "draft",
        "submitted",
        "in_review",
        "changes_requested"
      ])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const errors = [
    knowledgeResult.error,
    sourceEventsResult.error,
    submittedReviewsResult.error,
    activeReviewResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    return {
      knowledgeTopicCount: 0,
      sourceCount: 0,
      submittedReviewCount: 0,
      activeReview: null,
      errorMessage: errors
        .map((error) => error?.message)
        .filter(Boolean)
        .join(" | "),
    };
  }

  const sourceCount = countActiveSources(
    (sourceEventsResult.data ?? []) as SourceEventRow[],
  );

  return {
    knowledgeTopicCount: knowledgeResult.count ?? 0,
    sourceCount,
    submittedReviewCount: submittedReviewsResult.count ?? 0,
    activeReview: activeReviewResult.data
      ? {
          id: activeReviewResult.data.id,
          status: activeReviewResult.data.status,
          knowledgeEntryId:
            activeReviewResult.data.knowledge_entry_id,
          knowledgeSlug:
            activeReviewResult.data.knowledge_slug ?? null,
        }
      : null,
    errorMessage: null,
  };
}

function countActiveSources(events: SourceEventRow[]): number {
  const latestEventBySource = new Map<string, string>();

  for (const event of events) {
    if (!event.source_id) {
      continue;
    }

    if (!latestEventBySource.has(event.source_id)) {
      latestEventBySource.set(
        event.source_id,
        event.event_type ?? "",
      );
    }
  }

  let count = 0;

  for (const eventType of latestEventBySource.values()) {
    const normalized = eventType.toLowerCase();

    const removed =
      normalized === "source_removed" ||
      normalized === "source_deleted";

    if (!removed) {
      count += 1;
    }
  }

  return count;
}
