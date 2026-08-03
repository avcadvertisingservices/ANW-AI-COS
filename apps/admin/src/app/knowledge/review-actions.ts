"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "../../lib/supabase/admin";

const activeReviewStatuses = [
  "draft",
  "submitted",
  "in_review",
  "changes_requested",
] as const;

export async function submitKnowledgeForReview(
  formData: FormData,
): Promise<void> {
  const entryId = readRequiredString(
    formData,
    "entryId",
  );

  const slug = readRequiredString(
    formData,
    "slug",
  );

  const title = readRequiredString(
    formData,
    "title",
  );

  const submissionNotes =
    readOptionalString(
      formData,
      "submissionNotes",
    ) ??
    "Submitted for formal medical review.";

  if (!entryId || !slug || !title) {
    redirect(
      `/knowledge/${encodeURIComponent(
        slug ?? "",
      )}?reviewError=${encodeURIComponent(
        "Required knowledge-entry information is missing.",
      )}`,
    );
  }

  const supabase = createAdminClient();

  const {
    data: existingRequests,
    error: existingRequestError,
  } = await supabase
    .from("knowledge_review_requests")
    .select("id,status")
    .eq("knowledge_entry_id", entryId)
    .in(
      "status",
      [...activeReviewStatuses],
    )
    .limit(1);

  if (existingRequestError) {
    redirect(
      createErrorRedirect(
        slug,
        existingRequestError.message,
      ),
    );
  }

  if (
    existingRequests &&
    existingRequests.length > 0
  ) {
    redirect(
      createErrorRedirect(
        slug,
        "This knowledge entry already has an active medical-review request.",
      ),
    );
  }

  const {
    data: knowledgeEntry,
    error: knowledgeEntryError,
  } = await supabase
    .from("knowledge_entries")
    .select("*")
    .eq("id", entryId)
    .single();

  if (knowledgeEntryError || !knowledgeEntry) {
    redirect(
      createErrorRedirect(
        slug,
        knowledgeEntryError?.message ??
          "The knowledge entry could not be found.",
      ),
    );
  }

  const now = new Date().toISOString();

  const requestedBy = {
    name: "ANW Editorial Team",
    role: "Editorial Reviewer",
    email: null,
    actor_type: "system_admin",
  };

  const policyReport = {
    medical_review_required:
      Boolean(
        knowledgeEntry.medical_review_required,
      ),

    source_count: Array.isArray(
      knowledgeEntry.sources,
    )
      ? knowledgeEntry.sources.length
      : 0,

    submitted_from:
      "anw-ai-cos-admin",

    generated_at: now,
  };

  const {
    data: reviewRequest,
    error: requestError,
  } = await supabase
    .from("knowledge_review_requests")
    .insert({
      knowledge_entry_id: entryId,
      knowledge_slug: slug,
      knowledge_title: title,
      status: "submitted",
      requested_by: requestedBy,
      assigned_reviewer: null,
      submission_notes: submissionNotes,
      review_notes: null,
      decision_reason: null,
      knowledge_snapshot: knowledgeEntry,
      policy_report: policyReport,
      submitted_at: now,
      review_started_at: null,
      decided_at: null,
      updated_at: now,
    })
    .select("id")
    .single();

  if (requestError || !reviewRequest) {
    redirect(
      createErrorRedirect(
        slug,
        requestError?.message ??
          "The medical-review request could not be created.",
      ),
    );
  }

  const { error: eventError } =
    await supabase
      .from("knowledge_review_events")
      .insert({
        review_request_id:
          reviewRequest.id,

        knowledge_entry_id: entryId,

        event_type: "submitted",

        actor: requestedBy,

        notes: submissionNotes,

        metadata: {
          knowledge_slug: slug,
          knowledge_title: title,
          previous_status:
            knowledgeEntry.status ??
            "draft",
          new_status: "review",
          submitted_at: now,
        },
      });

  if (eventError) {
    await supabase
      .from("knowledge_review_requests")
      .delete()
      .eq("id", reviewRequest.id);

    redirect(
      createErrorRedirect(
        slug,
        eventError.message,
      ),
    );
  }

  const { error: entryUpdateError } =
    await supabase
      .from("knowledge_entries")
      .update({
        status: "review",
        updated_at: now,
      })
      .eq("id", entryId);

  if (entryUpdateError) {
    await supabase
      .from("knowledge_review_events")
      .delete()
      .eq(
        "review_request_id",
        reviewRequest.id,
      );

    await supabase
      .from("knowledge_review_requests")
      .delete()
      .eq("id", reviewRequest.id);

    redirect(
      createErrorRedirect(
        slug,
        entryUpdateError.message,
      ),
    );
  }

  revalidatePath("/");
  revalidatePath("/knowledge");
  revalidatePath("/medical-reviews");

  revalidatePath(
    `/knowledge/${encodeURIComponent(
      slug,
    )}`,
  );

  redirect(
    `/knowledge/${encodeURIComponent(
      slug,
    )}?reviewSubmitted=1`,
  );
}

function createErrorRedirect(
  slug: string,
  message: string,
): string {
  return `/knowledge/${encodeURIComponent(
    slug,
  )}?reviewError=${encodeURIComponent(
    formatDatabaseError(message),
  )}`;
}

function readRequiredString(
  formData: FormData,
  fieldName: string,
): string | null {
  const value = formData.get(fieldName);

  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return null;
  }

  return value.trim();
}

function readOptionalString(
  formData: FormData,
  fieldName: string,
): string | null {
  const value = formData.get(fieldName);

  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return null;
  }

  return value.trim();
}

function formatDatabaseError(
  message: string,
): string {
  const normalized =
    message.toLowerCase();

  if (
    normalized.includes("duplicate") ||
    normalized.includes("unique")
  ) {
    return "An active medical-review request already exists for this entry.";
  }

  if (
    normalized.includes(
      "violates check constraint",
    )
  ) {
    return "The database rejected an unsupported review status or event type.";
  }

  return message;
}