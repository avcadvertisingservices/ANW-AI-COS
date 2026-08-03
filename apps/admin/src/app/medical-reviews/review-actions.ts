"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "../../lib/supabase/admin";

type ReviewerActor = {
  name: string;
  role: string;
  email: string | null;
  actor_type: "medical_reviewer";
};

type ReviewDecision =
  | "changes_requested"
  | "approved"
  | "rejected";

type UnknownObject = Record<string, unknown>;

export async function startMedicalReview(
  formData: FormData,
): Promise<void> {
  const reviewRequestId = readRequiredString(
    formData,
    "reviewRequestId",
  );

  const knowledgeEntryId = readRequiredString(
    formData,
    "knowledgeEntryId",
  );

  const knowledgeSlug =
    readOptionalString(
      formData,
      "knowledgeSlug",
    ) ?? "";

  const reviewerName = readRequiredString(
    formData,
    "reviewerName",
  );

  const reviewerRole =
    readRequiredString(
      formData,
      "reviewerRole",
    ) ?? "Medical Reviewer";

  const reviewerEmail = readOptionalString(
    formData,
    "reviewerEmail",
  );

  const reviewNotes =
    readOptionalString(
      formData,
      "reviewNotes",
    ) ?? "Formal medical review started.";

  if (
    !reviewRequestId ||
    !knowledgeEntryId ||
    !reviewerName
  ) {
    redirectWithError(
      "The review request, knowledge entry, and reviewer name are required.",
    );
  }

  if (
    reviewerEmail &&
    !isValidEmail(reviewerEmail)
  ) {
    redirectWithError(
      "Enter a valid reviewer email address.",
    );
  }

  if (isPlaceholderReviewer(reviewerName)) {
    redirectWithError(
      "Replace the placeholder reviewer name with the real reviewer’s name.",
    );
  }

  const supabase = createAdminClient();

  const {
    data: reviewRequest,
    error: reviewRequestError,
  } = await supabase
    .from("knowledge_review_requests")
    .select(
      "id, knowledge_entry_id, knowledge_slug, knowledge_title, status, assigned_reviewer, review_notes, review_started_at",
    )
    .eq("id", reviewRequestId)
    .single();

  if (
    reviewRequestError ||
    !reviewRequest
  ) {
    redirectWithError(
      reviewRequestError?.message ??
        "The medical-review request could not be found.",
    );
  }

  const currentStatus = normalizeStatus(
    String(reviewRequest.status ?? ""),
  );

  if (currentStatus !== "submitted") {
    redirectWithError(
      `Only submitted review requests can be started. Current status: ${formatLabel(
        currentStatus || "unknown",
      )}.`,
    );
  }

  if (
    String(
      reviewRequest.knowledge_entry_id,
    ) !== knowledgeEntryId
  ) {
    redirectWithError(
      "The review request does not match the selected knowledge entry.",
    );
  }

  const reviewer: ReviewerActor = {
    name: reviewerName,
    role: reviewerRole,
    email: reviewerEmail,
    actor_type: "medical_reviewer",
  };

  const now = new Date().toISOString();

  const previousAssignedReviewer =
    reviewRequest.assigned_reviewer ?? null;

  const previousReviewNotes =
    typeof reviewRequest.review_notes ===
    "string"
      ? reviewRequest.review_notes
      : null;

  const previousReviewStartedAt =
    typeof reviewRequest.review_started_at ===
    "string"
      ? reviewRequest.review_started_at
      : null;

  const {
    data: updatedRequest,
    error: requestUpdateError,
  } = await supabase
    .from("knowledge_review_requests")
    .update({
      status: "in_review",
      assigned_reviewer: reviewer,
      review_notes: reviewNotes,
      review_started_at: now,
      updated_at: now,
    })
    .eq("id", reviewRequestId)
    .eq("status", "submitted")
    .select("id")
    .maybeSingle();

  if (
    requestUpdateError ||
    !updatedRequest
  ) {
    redirectWithError(
      requestUpdateError
        ? formatDatabaseError(
            requestUpdateError.message,
          )
        : "The review could not be started because its status changed. Refresh the page and try again.",
    );
  }

  const {
    error: reviewEventError,
  } = await supabase
    .from("knowledge_review_events")
    .insert({
      review_request_id:
        reviewRequestId,

      knowledge_entry_id:
        knowledgeEntryId,

      event_type: "review_started",

      actor: reviewer,

      notes: reviewNotes,

      metadata: {
        knowledge_slug:
          knowledgeSlug ||
          reviewRequest.knowledge_slug ||
          null,

        knowledge_title:
          reviewRequest.knowledge_title ??
          null,

        previous_status: "submitted",
        new_status: "in_review",
        assigned_reviewer: reviewer,
        review_started_at: now,
      },
    });

  if (reviewEventError) {
    await supabase
      .from("knowledge_review_requests")
      .update({
        status: "submitted",
        assigned_reviewer:
          previousAssignedReviewer,
        review_notes:
          previousReviewNotes,
        review_started_at:
          previousReviewStartedAt,
        updated_at: now,
      })
      .eq("id", reviewRequestId);

    redirectWithError(
      formatDatabaseError(
        reviewEventError.message,
      ),
    );
  }

  revalidateReviewPaths(knowledgeSlug);

  redirect(
    `/medical-reviews?reviewStarted=1&reviewId=${encodeURIComponent(
      reviewRequestId,
    )}`,
  );
}

export async function decideMedicalReview(
  formData: FormData,
): Promise<void> {
  const reviewRequestId = readRequiredString(
    formData,
    "reviewRequestId",
  );

  const knowledgeEntryId = readRequiredString(
    formData,
    "knowledgeEntryId",
  );

  const knowledgeSlug =
    readOptionalString(
      formData,
      "knowledgeSlug",
    ) ?? "";

  const decisionValue = readRequiredString(
    formData,
    "decision",
  );

  const decisionNotes = readRequiredString(
    formData,
    "decisionNotes",
  );

  if (
    !reviewRequestId ||
    !knowledgeEntryId ||
    !decisionValue ||
    !decisionNotes
  ) {
    redirectWithDecisionError(
      "The review request, knowledge entry, decision, and decision notes are required.",
    );
  }

  const decision =
    normalizeDecision(decisionValue);

  if (!decision) {
    redirectWithDecisionError(
      "Choose Request Changes, Approve, or Reject.",
    );
  }

  if (decisionNotes.length < 10) {
    redirectWithDecisionError(
      "Decision notes must contain at least 10 characters.",
    );
  }

  const supabase = createAdminClient();

  const {
    data: reviewRequest,
    error: reviewRequestError,
  } = await supabase
    .from("knowledge_review_requests")
    .select(
      "id, knowledge_entry_id, knowledge_slug, knowledge_title, status, assigned_reviewer, review_notes, decision_reason, decided_at, updated_at",
    )
    .eq("id", reviewRequestId)
    .single();

  if (
    reviewRequestError ||
    !reviewRequest
  ) {
    redirectWithDecisionError(
      reviewRequestError?.message ??
        "The medical-review request could not be found.",
    );
  }

  const currentStatus = normalizeStatus(
    String(reviewRequest.status ?? ""),
  );

  if (currentStatus !== "in_review") {
    redirectWithDecisionError(
      `Only requests currently In Review can receive a decision. Current status: ${formatLabel(
        currentStatus || "unknown",
      )}.`,
    );
  }

  if (
    String(
      reviewRequest.knowledge_entry_id,
    ) !== knowledgeEntryId
  ) {
    redirectWithDecisionError(
      "The review request does not match the selected knowledge entry.",
    );
  }

  const reviewer = normalizeReviewer(
    reviewRequest.assigned_reviewer,
  );

  if (!reviewer) {
    redirectWithDecisionError(
      "A real assigned medical reviewer is required before recording a decision.",
    );
  }

  if (isPlaceholderReviewer(reviewer.name)) {
    redirectWithDecisionError(
      "The assigned reviewer appears to be a placeholder. Assign a real medical reviewer before recording a decision.",
    );
  }

  const {
    data: knowledgeEntry,
    error: knowledgeEntryError,
  } = await supabase
    .from("knowledge_entries")
    .select(
      "id, status, medical_review_required, reviewed_by, reviewed_at, updated_at",
    )
    .eq("id", knowledgeEntryId)
    .single();

  if (
    knowledgeEntryError ||
    !knowledgeEntry
  ) {
    redirectWithDecisionError(
      knowledgeEntryError?.message ??
        "The linked knowledge entry could not be found.",
    );
  }

  const now = new Date().toISOString();

  const previousRequest = {
    status:
      String(
        reviewRequest.status ??
          "in_review",
      ),

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
          "review",
      ),

    medical_review_required:
      Boolean(
        knowledgeEntry.medical_review_required,
      ),

    reviewed_by:
      typeof knowledgeEntry.reviewed_by ===
      "string"
        ? knowledgeEntry.reviewed_by
        : null,

    reviewed_at:
      typeof knowledgeEntry.reviewed_at ===
      "string"
        ? knowledgeEntry.reviewed_at
        : null,

    updated_at:
      typeof knowledgeEntry.updated_at ===
      "string"
        ? knowledgeEntry.updated_at
        : now,
  };

  const requestUpdate =
    createRequestDecisionUpdate(
      decision,
      decisionNotes,
      now,
    );

  const entryUpdate =
    createKnowledgeDecisionUpdate(
      decision,
      reviewer,
      now,
    );

  const {
    data: updatedRequest,
    error: requestUpdateError,
  } = await supabase
    .from("knowledge_review_requests")
    .update(requestUpdate)
    .eq("id", reviewRequestId)
    .eq("status", "in_review")
    .select("id")
    .maybeSingle();

  if (
    requestUpdateError ||
    !updatedRequest
  ) {
    redirectWithDecisionError(
      requestUpdateError
        ? formatDatabaseError(
            requestUpdateError.message,
          )
        : "The decision could not be saved because the review status changed. Refresh the page and try again.",
    );
  }

  const {
    data: updatedEntry,
    error: entryUpdateError,
  } = await supabase
    .from("knowledge_entries")
    .update(entryUpdate)
    .eq("id", knowledgeEntryId)
    .select("id")
    .maybeSingle();

  if (
    entryUpdateError ||
    !updatedEntry
  ) {
    await restoreReviewRequest(
      supabase,
      reviewRequestId,
      previousRequest,
    );

    redirectWithDecisionError(
      entryUpdateError
        ? formatDatabaseError(
            entryUpdateError.message,
          )
        : "The linked knowledge entry could not be updated.",
    );
  }

  const {
    error: eventError,
  } = await supabase
    .from("knowledge_review_events")
    .insert({
      review_request_id:
        reviewRequestId,

      knowledge_entry_id:
        knowledgeEntryId,

      event_type: decision,

      actor: reviewer,

      notes: decisionNotes,

      metadata: {
        knowledge_slug:
          knowledgeSlug ||
          reviewRequest.knowledge_slug ||
          null,

        knowledge_title:
          reviewRequest.knowledge_title ??
          null,

        previous_review_status:
          "in_review",

        new_review_status:
          decision,

        previous_knowledge_status:
          previousEntry.status,

        new_knowledge_status:
          entryUpdate.status,

        decision_reason:
          decisionNotes,

        decided_at: now,

        reviewer,
      },
    });

  if (eventError) {
    await restoreKnowledgeEntry(
      supabase,
      knowledgeEntryId,
      previousEntry,
    );

    await restoreReviewRequest(
      supabase,
      reviewRequestId,
      previousRequest,
    );

    redirectWithDecisionError(
      formatDatabaseError(
        eventError.message,
      ),
    );
  }

  revalidateReviewPaths(knowledgeSlug);

  redirect(
    `/medical-reviews?decisionSaved=1&decision=${encodeURIComponent(
      decision,
    )}&reviewId=${encodeURIComponent(
      reviewRequestId,
    )}`,
  );
}

function createRequestDecisionUpdate(
  decision: ReviewDecision,
  decisionNotes: string,
  now: string,
) {
  return {
    status: decision,
    review_notes: decisionNotes,
    decision_reason: decisionNotes,
    decided_at: now,
    updated_at: now,
  };
}

function createKnowledgeDecisionUpdate(
  decision: ReviewDecision,
  reviewer: ReviewerActor,
  now: string,
) {
  if (decision === "approved") {
    return {
      status: "approved",
      medical_review_required: false,
      reviewed_by: reviewer.name,
      reviewed_at: now,
      updated_at: now,
    };
  }

  return {
    status: "draft",
    medical_review_required: true,
    reviewed_by: null,
    reviewed_at: null,
    updated_at: now,
  };
}

async function restoreReviewRequest(
  supabase: ReturnType<
    typeof createAdminClient
  >,
  reviewRequestId: string,
  previousRequest: {
    status: string;
    review_notes: string | null;
    decision_reason: string | null;
    decided_at: string | null;
    updated_at: string;
  },
): Promise<void> {
  await supabase
    .from("knowledge_review_requests")
    .update({
      status: previousRequest.status,
      review_notes:
        previousRequest.review_notes,
      decision_reason:
        previousRequest.decision_reason,
      decided_at:
        previousRequest.decided_at,
      updated_at:
        previousRequest.updated_at,
    })
    .eq("id", reviewRequestId);
}

async function restoreKnowledgeEntry(
  supabase: ReturnType<
    typeof createAdminClient
  >,
  knowledgeEntryId: string,
  previousEntry: {
    status: string;
    medical_review_required: boolean;
    reviewed_by: string | null;
    reviewed_at: string | null;
    updated_at: string;
  },
): Promise<void> {
  await supabase
    .from("knowledge_entries")
    .update({
      status: previousEntry.status,
      medical_review_required:
        previousEntry.medical_review_required,
      reviewed_by:
        previousEntry.reviewed_by,
      reviewed_at:
        previousEntry.reviewed_at,
      updated_at:
        previousEntry.updated_at,
    })
    .eq("id", knowledgeEntryId);
}

function normalizeDecision(
  value: string,
): ReviewDecision | null {
  const normalized =
    normalizeStatus(value);

  if (
    normalized ===
      "changes_requested" ||
    normalized === "approved" ||
    normalized === "rejected"
  ) {
    return normalized;
  }

  return null;
}

function normalizeReviewer(
  value: unknown,
): ReviewerActor | null {
  const reviewer = readObject(value);

  const name =
    readObjectString(
      reviewer,
      "name",
    ) ??
    readObjectString(
      reviewer,
      "displayName",
    ) ??
    readObjectString(
      reviewer,
      "display_name",
    );

  if (!name) {
    return null;
  }

  return {
    name,

    role:
      readObjectString(
        reviewer,
        "role",
      ) ?? "Medical Reviewer",

    email:
      readObjectString(
        reviewer,
        "email",
      ),

    actor_type:
      "medical_reviewer",
  };
}

function readObject(
  value: unknown,
): UnknownObject {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return value as UnknownObject;
  }

  return {};
}

function readObjectString(
  object: UnknownObject,
  key: string,
): string | null {
  const value = object[key];

  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return value.trim();
  }

  return null;
}

function revalidateReviewPaths(
  knowledgeSlug: string,
): void {
  revalidatePath("/");
  revalidatePath("/medical-reviews");
  revalidatePath("/knowledge");

  if (knowledgeSlug) {
    revalidatePath(
      `/knowledge/${encodeURIComponent(
        knowledgeSlug,
      )}`,
    );
  }
}

function redirectWithError(
  message: string,
): never {
  redirect(
    `/medical-reviews?reviewError=${encodeURIComponent(
      formatDatabaseError(message),
    )}`,
  );
}

function redirectWithDecisionError(
  message: string,
): never {
  redirect(
    `/medical-reviews?decisionError=${encodeURIComponent(
      formatDatabaseError(message),
    )}`,
  );
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

function isValidEmail(
  value: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value,
  );
}

function isPlaceholderReviewer(
  value: string,
): boolean {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const exactPlaceholders = new Set([
    "your medical reviewer name",
    "medical reviewer name",
    "your reviewer name",
    "reviewer name",
    "your medical reviewer",
    "your reviewer",
    "real medical reviewer",
    "test reviewer",
    "placeholder reviewer",
    "placeholder",
  ]);

  return exactPlaceholders.has(normalized);
}

function formatDatabaseError(
  message: string,
): string {
  const normalized =
    message.toLowerCase();

  if (
    normalized.includes(
      "knowledge_entries_review_guard",
    )
  ) {
    return "Approval requires medical review to be completed and the approved knowledge record to contain reviewer information.";
  }

  if (
    normalized.includes(
      "violates check constraint",
    )
  ) {
    return "The database rejected an unsupported review status, decision, or knowledge-entry state.";
  }

  if (
    normalized.includes("duplicate") ||
    normalized.includes("unique")
  ) {
    return "A conflicting medical-review record already exists.";
  }

  return message;
}