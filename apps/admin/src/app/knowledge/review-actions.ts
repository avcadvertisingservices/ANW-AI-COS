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

type EditorialActor = {
  name: string;
  role: string;
  email: string | null;
  actor_type: "system_admin";
};

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
    .select("id, status")
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

  if (
    knowledgeEntryError ||
    !knowledgeEntry
  ) {
    redirect(
      createErrorRedirect(
        slug,
        knowledgeEntryError?.message ??
          "The knowledge entry could not be found.",
      ),
    );
  }

  const now = new Date().toISOString();
  const requestedBy =
    createEditorialActor();

  const policyReport =
    createPolicyReport(
      knowledgeEntry,
      now,
      "initial_submission",
    );

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
      knowledge_snapshot:
        knowledgeEntry,
      policy_report: policyReport,
      submitted_at: now,
      review_started_at: null,
      decided_at: null,
      updated_at: now,
    })
    .select("id")
    .single();

  if (
    requestError ||
    !reviewRequest
  ) {
    redirect(
      createErrorRedirect(
        slug,
        requestError?.message ??
          "The medical-review request could not be created.",
      ),
    );
  }

  const {
    data: reviewEvent,
    error: eventError,
  } = await supabase
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

        previous_review_status:
          "not_submitted",

        new_review_status:
          "submitted",

        previous_knowledge_status:
          knowledgeEntry.status ??
          "draft",

        new_knowledge_status:
          "review",

        submitted_at: now,
      },
    })
    .select("id")
    .single();

  if (
    eventError ||
    !reviewEvent
  ) {
    await supabase
      .from("knowledge_review_requests")
      .delete()
      .eq("id", reviewRequest.id);

    redirect(
      createErrorRedirect(
        slug,
        eventError?.message ??
          "The submission audit event could not be created.",
      ),
    );
  }

  const {
    data: updatedEntry,
    error: entryUpdateError,
  } = await supabase
    .from("knowledge_entries")
    .update({
      status: "review",
      updated_at: now,
    })
    .eq("id", entryId)
    .select("id")
    .maybeSingle();

  if (
    entryUpdateError ||
    !updatedEntry
  ) {
    await supabase
      .from("knowledge_review_events")
      .delete()
      .eq("id", reviewEvent.id);

    await supabase
      .from("knowledge_review_requests")
      .delete()
      .eq("id", reviewRequest.id);

    redirect(
      createErrorRedirect(
        slug,
        entryUpdateError?.message ??
          "The knowledge entry could not be moved to Review.",
      ),
    );
  }

  revalidateKnowledgePaths(slug);

  redirect(
    `/knowledge/${encodeURIComponent(
      slug,
    )}?reviewSubmitted=1`,
  );
}

export async function resubmitKnowledgeForReview(
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

  const resubmissionNotes =
    readOptionalString(
      formData,
      "resubmissionNotes",
    ) ??
    "Requested corrections were completed and the entry was resubmitted for medical review.";

  if (!entryId || !slug || !title) {
    redirect(
      `/knowledge/${encodeURIComponent(
        slug ?? "",
      )}?resubmitError=${encodeURIComponent(
        "Required knowledge-entry information is missing.",
      )}`,
    );
  }

  if (resubmissionNotes.length < 10) {
    redirect(
      createResubmitErrorRedirect(
        slug,
        "Resubmission notes must contain at least 10 characters.",
      ),
    );
  }

  const supabase = createAdminClient();

  const {
    data: reviewRequest,
    error: requestLookupError,
  } = await supabase
    .from("knowledge_review_requests")
    .select(
      "id, knowledge_entry_id, knowledge_slug, knowledge_title, status, requested_by, assigned_reviewer, submission_notes, review_notes, decision_reason, knowledge_snapshot, policy_report, submitted_at, review_started_at, decided_at, updated_at",
    )
    .eq("knowledge_entry_id", entryId)
    .eq("status", "changes_requested")
    .order("updated_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (requestLookupError) {
    redirect(
      createResubmitErrorRedirect(
        slug,
        requestLookupError.message,
      ),
    );
  }

  if (!reviewRequest) {
    redirect(
      createResubmitErrorRedirect(
        slug,
        "No Changes Requested medical-review record was found for this entry.",
      ),
    );
  }

  if (
    String(
      reviewRequest.knowledge_entry_id,
    ) !== entryId
  ) {
    redirect(
      createResubmitErrorRedirect(
        slug,
        "The medical-review request does not match this knowledge entry.",
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

  if (
    knowledgeEntryError ||
    !knowledgeEntry
  ) {
    redirect(
      createResubmitErrorRedirect(
        slug,
        knowledgeEntryError?.message ??
          "The knowledge entry could not be found.",
      ),
    );
  }

  const knowledgeStatus =
    normalizeStatus(
      String(
        knowledgeEntry.status ??
          "",
      ),
    );

  if (knowledgeStatus !== "draft") {
    redirect(
      createResubmitErrorRedirect(
        slug,
        `Only a Draft knowledge entry can be resubmitted. Current status: ${formatLabel(
          knowledgeStatus || "unknown",
        )}.`,
      ),
    );
  }

  const now = new Date().toISOString();
  const requestedBy =
    createEditorialActor();

  const previousRequest = {
    status:
      String(
        reviewRequest.status ??
          "changes_requested",
      ),

    requested_by:
      reviewRequest.requested_by ??
      null,

    submission_notes:
      typeof reviewRequest.submission_notes ===
      "string"
        ? reviewRequest.submission_notes
        : null,

    review_notes:
      typeof reviewRequest.review_notes ===
      "string"
        ? reviewRequest.review_notes
        : null,

    decision_reason:
      typeof reviewRequest.decision_reason ===
      "string"
        ? reviewRequest.decision_reason
        : null,

    knowledge_snapshot:
      reviewRequest.knowledge_snapshot ??
      null,

    policy_report:
      reviewRequest.policy_report ??
      null,

    submitted_at:
      typeof reviewRequest.submitted_at ===
      "string"
        ? reviewRequest.submitted_at
        : null,

    review_started_at:
      typeof reviewRequest.review_started_at ===
      "string"
        ? reviewRequest.review_started_at
        : null,

    decided_at:
      typeof reviewRequest.decided_at ===
      "string"
        ? reviewRequest.decided_at
        : null,

    updated_at:
      typeof reviewRequest.updated_at ===
      "string"
        ? reviewRequest.updated_at
        : now,
  };

  const previousEntry = {
    status:
      String(
        knowledgeEntry.status ??
          "draft",
      ),

    updated_at:
      typeof knowledgeEntry.updated_at ===
      "string"
        ? knowledgeEntry.updated_at
        : now,
  };

  const policyReport =
    createPolicyReport(
      knowledgeEntry,
      now,
      "resubmission",
    );

  const {
    data: updatedRequest,
    error: requestUpdateError,
  } = await supabase
    .from("knowledge_review_requests")
    .update({
      status: "submitted",

      requested_by: requestedBy,

      /*
       * The assigned reviewer is intentionally not
       * changed. This preserves the reviewer from
       * the previous review cycle.
       */

      submission_notes:
        resubmissionNotes,

      /*
       * Preserve the reviewer’s previous correction
       * notes in review_notes for historical context.
       */

      decision_reason: null,

      knowledge_snapshot:
        knowledgeEntry,

      policy_report: policyReport,

      submitted_at: now,

      /*
       * The reviewer must formally start the new
       * review cycle again.
       */
      review_started_at: null,

      decided_at: null,
      updated_at: now,
    })
    .eq("id", reviewRequest.id)
    .eq(
      "status",
      "changes_requested",
    )
    .select("id")
    .maybeSingle();

  if (
    requestUpdateError ||
    !updatedRequest
  ) {
    redirect(
      createResubmitErrorRedirect(
        slug,
        requestUpdateError
          ? formatDatabaseError(
              requestUpdateError.message,
            )
          : "The review could not be resubmitted because its status changed. Refresh the page and try again.",
      ),
    );
  }

  const {
    data: resubmissionEvent,
    error: eventError,
  } = await supabase
    .from("knowledge_review_events")
    .insert({
      review_request_id:
        reviewRequest.id,

      knowledge_entry_id: entryId,

      event_type: "resubmitted",

      actor: requestedBy,

      notes: resubmissionNotes,

      metadata: {
        knowledge_slug: slug,
        knowledge_title: title,

        previous_review_status:
          "changes_requested",

        new_review_status:
          "submitted",

        previous_knowledge_status:
          previousEntry.status,

        new_knowledge_status:
          "review",

        assigned_reviewer_preserved:
          reviewRequest.assigned_reviewer ??
          null,

        previous_decision_reason:
          previousRequest.decision_reason,

        resubmitted_at: now,
      },
    })
    .select("id")
    .single();

  if (
    eventError ||
    !resubmissionEvent
  ) {
    await restoreReviewRequest(
      reviewRequest.id,
      previousRequest,
    );

    redirect(
      createResubmitErrorRedirect(
        slug,
        eventError?.message ??
          "The resubmission audit event could not be created.",
      ),
    );
  }

  const {
    data: updatedEntry,
    error: entryUpdateError,
  } = await supabase
    .from("knowledge_entries")
    .update({
      status: "review",
      reviewed_by: null,
      reviewed_at: null,
      medical_review_required: true,
      updated_at: now,
    })
    .eq("id", entryId)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();

  if (
    entryUpdateError ||
    !updatedEntry
  ) {
    await supabase
      .from("knowledge_review_events")
      .delete()
      .eq(
        "id",
        resubmissionEvent.id,
      );

    await restoreReviewRequest(
      reviewRequest.id,
      previousRequest,
    );

    redirect(
      createResubmitErrorRedirect(
        slug,
        entryUpdateError
          ? formatDatabaseError(
              entryUpdateError.message,
            )
          : "The knowledge entry could not be returned to Review because its status changed.",
      ),
    );
  }

  revalidateKnowledgePaths(slug);

  redirect(
    `/knowledge/${encodeURIComponent(
      slug,
    )}?reviewResubmitted=1`,
  );
}

async function restoreReviewRequest(
  reviewRequestId: string,
  previousRequest: {
    status: string;
    requested_by: unknown;
    submission_notes: string | null;
    review_notes: string | null;
    decision_reason: string | null;
    knowledge_snapshot: unknown;
    policy_report: unknown;
    submitted_at: string | null;
    review_started_at: string | null;
    decided_at: string | null;
    updated_at: string;
  },
): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from("knowledge_review_requests")
    .update({
      status:
        previousRequest.status,

      requested_by:
        previousRequest.requested_by,

      submission_notes:
        previousRequest.submission_notes,

      review_notes:
        previousRequest.review_notes,

      decision_reason:
        previousRequest.decision_reason,

      knowledge_snapshot:
        previousRequest.knowledge_snapshot,

      policy_report:
        previousRequest.policy_report,

      submitted_at:
        previousRequest.submitted_at,

      review_started_at:
        previousRequest.review_started_at,

      decided_at:
        previousRequest.decided_at,

      updated_at:
        previousRequest.updated_at,
    })
    .eq("id", reviewRequestId);
}

function createEditorialActor(): EditorialActor {
  return {
    name: "ANW Editorial Team",
    role: "Editorial Reviewer",
    email: null,
    actor_type: "system_admin",
  };
}

function createPolicyReport(
  knowledgeEntry: Record<
    string,
    unknown
  >,
  generatedAt: string,
  submissionType:
    | "initial_submission"
    | "resubmission",
) {
  return {
    medical_review_required:
      Boolean(
        knowledgeEntry
          .medical_review_required,
      ),

    source_count: Array.isArray(
      knowledgeEntry.sources,
    )
      ? knowledgeEntry.sources.length
      : 0,

    submitted_from:
      "anw-ai-cos-admin",

    submission_type:
      submissionType,

    generated_at:
      generatedAt,
  };
}

function revalidateKnowledgePaths(
  slug: string,
): void {
  revalidatePath("/");
  revalidatePath("/knowledge");
  revalidatePath("/medical-reviews");

  revalidatePath(
    `/knowledge/${encodeURIComponent(
      slug,
    )}`,
  );

  revalidatePath(
    `/knowledge/${encodeURIComponent(
      slug,
    )}/edit`,
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

function createResubmitErrorRedirect(
  slug: string,
  message: string,
): string {
  return `/knowledge/${encodeURIComponent(
    slug,
  )}?resubmitError=${encodeURIComponent(
    formatDatabaseError(message),
  )}`;
}

function readRequiredString(
  formData: FormData,
  fieldName: string,
): string | null {
  const value =
    formData.get(fieldName);

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
  const value =
    formData.get(fieldName);

  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return null;
  }

  return value.trim();
}

function normalizeStatus(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function formatLabel(
  value: string,
): string {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function formatDatabaseError(
  message: string,
): string {
  const normalized =
    message.toLowerCase();

  if (
    normalized.includes(
      "duplicate",
    ) ||
    normalized.includes("unique")
  ) {
    return "An active medical-review request already exists for this entry.";
  }

  if (
    normalized.includes(
      "violates check constraint",
    )
  ) {
    return "The database rejected an unsupported review status, event type, or knowledge-entry state.";
  }

  return message;
}