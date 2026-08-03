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

  const knowledgeSlug = readRequiredString(
    formData,
    "knowledgeSlug",
  );

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
    .eq("status", "submitted");

  if (requestUpdateError) {
    redirectWithError(
      formatDatabaseError(
        requestUpdateError.message,
      ),
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
        review_notes: previousReviewNotes,
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

  redirect(
    `/medical-reviews?reviewStarted=1&reviewId=${encodeURIComponent(
      reviewRequestId,
    )}`,
  );
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
  const normalized =
    value.trim().toLowerCase();

  const placeholderTerms = [
    "your medical reviewer",
    "medical reviewer name",
    "your reviewer",
    "reviewer name",
    "real medical reviewer",
    "your me",
    "test reviewer",
    "placeholder",
  ];

  return placeholderTerms.some(
    (term) =>
      normalized.includes(term),
  );
}

function formatDatabaseError(
  message: string,
): string {
  const normalized =
    message.toLowerCase();

  if (
    normalized.includes(
      "violates check constraint",
    )
  ) {
    return "The database rejected an unsupported review status or event type.";
  }

  if (
    normalized.includes("duplicate") ||
    normalized.includes("unique")
  ) {
    return "A conflicting medical-review record already exists.";
  }

  return message;
}