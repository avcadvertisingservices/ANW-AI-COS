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

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = createAdminClient();

  const [
    knowledgeResult,
    sourceResult,
    submittedReviewsResult,
    activeReviewResult,
  ] = await Promise.all([
    supabase
      .from("knowledge_entries")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("knowledge_sources")
      .select("*", { count: "exact", head: true }),

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
        "changes_requested",
      ])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const errors = [
    knowledgeResult.error,
    sourceResult.error,
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

  return {
    knowledgeTopicCount: knowledgeResult.count ?? 0,
    sourceCount: sourceResult.count ?? 0,
    submittedReviewCount: submittedReviewsResult.count ?? 0,
    activeReview: activeReviewResult.data
      ? {
          id: activeReviewResult.data.id,
          status: activeReviewResult.data.status,
          knowledgeEntryId: activeReviewResult.data.knowledge_entry_id,
          knowledgeSlug: activeReviewResult.data.knowledge_slug ?? null,
        }
      : null,
    errorMessage: null,
  };
}
