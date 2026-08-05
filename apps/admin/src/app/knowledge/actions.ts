"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "../../lib/supabase/admin";

import type {
  KnowledgeEntryActionState,
} from "./action-state";

type KnowledgeEntryPayload = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  status: string;
  tags: string[];
  keywords: string[];
  aliases: string[];
  sources: unknown[];
  medical_review_required: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  version: string;
  updated_at: string;
};

type ValidatedKnowledgeEntry = Omit<
  KnowledgeEntryPayload,
  | "id"
  | "reviewed_by"
  | "reviewed_at"
  | "updated_at"
>;

type ValidationResult =
  | {
      success: true;
      data: ValidatedKnowledgeEntry;
    }
  | {
      success: false;
      state: KnowledgeEntryActionState;
    };

type ReviewerActor = {
  name: string;
  role: string;
  email: string | null;
  actor_type: string;
};

type UnknownObject = Record<string, unknown>;

export async function createKnowledgeEntry(
  _previousState: KnowledgeEntryActionState,
  formData: FormData,
): Promise<KnowledgeEntryActionState> {
  const validation =
    validateKnowledgeEntry(formData);

  if (!validation.success) {
    return validation.state;
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const payload: KnowledgeEntryPayload = {
    id: `knowledge.${randomUUID()}`,
    slug: validation.data.slug,
    title: validation.data.title,
    summary: validation.data.summary,
    body: validation.data.body,
    category: validation.data.category,
    status: validation.data.status,
    tags: validation.data.tags,
    keywords: validation.data.keywords,
    aliases: validation.data.aliases,
    sources: validation.data.sources,

    medical_review_required:
      validation.data
        .medical_review_required,

    reviewed_by: null,
    reviewed_at: null,
    version: validation.data.version,
    updated_at: now,
  };

  const { error } = await supabase
    .from("knowledge_entries")
    .insert(payload);

  if (error) {
    return {
      status: "error",
      message: formatDatabaseError(
        error.message,
      ),
      fieldErrors: {},
    };
  }

  revalidateKnowledgePaths(
    validation.data.slug,
  );

  redirect(
    `/knowledge/${encodeURIComponent(
      validation.data.slug,
    )}?created=1`,
  );
}

export async function updateKnowledgeEntry(
  _previousState: KnowledgeEntryActionState,
  formData: FormData,
): Promise<KnowledgeEntryActionState> {
  const entryId = readRequiredString(
    formData,
    "entryId",
  );

  if (!entryId) {
    return {
      status: "error",
      message:
        "The knowledge-entry ID is missing.",
      fieldErrors: {},
    };
  }

  const validation =
    validateKnowledgeEntry(formData);

  if (!validation.success) {
    return validation.state;
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const {
    data: existingEntry,
    error: existingEntryError,
  } = await supabase
    .from("knowledge_entries")
    .select(
      "id, slug, status, medical_review_required, reviewed_by, reviewed_at",
    )
    .eq("id", entryId)
    .single();

  if (
    existingEntryError ||
    !existingEntry
  ) {
    return {
      status: "error",
      message:
        existingEntryError?.message ??
        "The knowledge entry could not be found.",
      fieldErrors: {},
    };
  }

  /*
   * Approval should normally be performed by the
   * medical-review decision workflow.
   *
   * Existing approval information is preserved
   * only when the entry is already approved.
   */
  const remainsApproved =
    validation.data.status ===
      "approved" &&
    existingEntry.status === "approved";

  const reviewedBy = remainsApproved
    ? typeof existingEntry.reviewed_by ===
      "string"
      ? existingEntry.reviewed_by
      : null
    : null;

  const reviewedAt = remainsApproved
    ? typeof existingEntry.reviewed_at ===
      "string"
      ? existingEntry.reviewed_at
      : now
    : null;

  const medicalReviewRequired =
    remainsApproved
      ? false
      : validation.data
          .medical_review_required;

  const updatePayload = {
    slug: validation.data.slug,
    title: validation.data.title,
    summary: validation.data.summary,
    body: validation.data.body,
    category: validation.data.category,
    status: validation.data.status,
    tags: validation.data.tags,
    keywords: validation.data.keywords,
    aliases: validation.data.aliases,
    sources: validation.data.sources,

    medical_review_required:
      medicalReviewRequired,

    reviewed_by: reviewedBy,
    reviewed_at: reviewedAt,
    version: validation.data.version,
    updated_at: now,
  };

  const { error } = await supabase
    .from("knowledge_entries")
    .update(updatePayload)
    .eq("id", entryId);

  if (error) {
    return {
      status: "error",
      message: formatDatabaseError(
        error.message,
      ),
      fieldErrors: {},
    };
  }

  revalidateKnowledgePaths(
    validation.data.slug,
  );

  if (
    existingEntry.slug &&
    existingEntry.slug !==
      validation.data.slug
  ) {
    revalidatePath(
      `/knowledge/${encodeURIComponent(
        existingEntry.slug,
      )}`,
    );
  }

  redirect(
    `/knowledge/${encodeURIComponent(
      validation.data.slug,
    )}?updated=1`,
  );
}

/*
 * Resubmits the same review request after the
 * reviewer previously requested changes.
 *
 * No duplicate review request is created.
 */
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

  const resubmissionNotes =
    readOptionalString(
      formData,
      "resubmissionNotes",
    ) ??
    "Requested corrections have been completed. The knowledge entry is ready for medical re-review.";

  if (!entryId || !slug) {
    redirectWithResubmissionError(
      slug ?? "",
      "The knowledge-entry ID and slug are required.",
    );
  }

  if (resubmissionNotes.length < 10) {
    redirectWithResubmissionError(
      slug,
      "Resubmission notes must contain at least 10 characters.",
    );
  }

  const supabase = createAdminClient();

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
    redirectWithResubmissionError(
      slug,
      knowledgeEntryError?.message ??
        "The knowledge entry could not be found.",
    );
  }

  const currentKnowledgeStatus =
    normalizeStatus(
      String(
        knowledgeEntry.status ?? "",
      ),
    );

  if (currentKnowledgeStatus !== "draft") {
    redirectWithResubmissionError(
      slug,
      `Only a Draft knowledge entry can be resubmitted. Current status: ${formatLabel(
        currentKnowledgeStatus ||
          "unknown",
      )}.`,
    );
  }

  const {
    data: reviewRequest,
    error: reviewRequestError,
  } = await supabase
    .from("knowledge_review_requests")
    .select(
      "id, knowledge_entry_id, knowledge_slug, knowledge_title, status, requested_by, assigned_reviewer, submission_notes, review_notes, decision_reason, decided_at, updated_at",
    )
    .eq("knowledge_entry_id", entryId)
    .eq("status", "changes_requested")
    .order("updated_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (
    reviewRequestError ||
    !reviewRequest
  ) {
    redirectWithResubmissionError(
      slug,
      reviewRequestError?.message ??
        "No Changes Requested review was found for this entry.",
    );
  }

  if (
    String(
      reviewRequest.knowledge_entry_id,
    ) !== entryId
  ) {
    redirectWithResubmissionError(
      slug,
      "The review request does not match the selected knowledge entry.",
    );
  }

  const now = new Date().toISOString();

  const actor =
    normalizeActor(
      reviewRequest.requested_by,
    ) ?? {
      name: "ANW Editorial Team",
      role: "Editorial Reviewer",
      email: null,
      actor_type: "editorial_reviewer",
    };

  const previousRequest = {
    status:
      String(
        reviewRequest.status ??
          "changes_requested",
      ),

    assigned_reviewer:
      reviewRequest.assigned_reviewer ??
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

  const {
    data: updatedRequest,
    error: requestUpdateError,
  } = await supabase
    .from("knowledge_review_requests")
    .update({
      status: "submitted",

      /*
       * A new reviewer may be assigned when the
       * resubmitted entry is started again.
       */
      assigned_reviewer: null,

      submission_notes:
        resubmissionNotes,

      review_notes: null,
      decision_reason: null,
      decided_at: null,
      submitted_at: now,
      review_started_at: null,
      updated_at: now,
      knowledge_snapshot:
        knowledgeEntry,
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
    redirectWithResubmissionError(
      slug,
      requestUpdateError
        ? formatDatabaseError(
            requestUpdateError.message,
          )
        : "The review could not be resubmitted because its status changed. Refresh the page and try again.",
    );
  }

  const {
    data: updatedKnowledgeEntry,
    error: entryUpdateError,
  } = await supabase
    .from("knowledge_entries")
    .update({
      status: "review",
      medical_review_required: true,
      reviewed_by: null,
      reviewed_at: null,
      updated_at: now,
    })
    .eq("id", entryId)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();

  if (
    entryUpdateError ||
    !updatedKnowledgeEntry
  ) {
    await restoreReviewRequestAfterFailedResubmission(
      supabase,
      reviewRequest.id,
      previousRequest,
    );

    redirectWithResubmissionError(
      slug,
      entryUpdateError
        ? formatDatabaseError(
            entryUpdateError.message,
          )
        : "The knowledge entry could not be moved back into Review.",
    );
  }

  const { error: eventError } =
    await supabase
      .from("knowledge_review_events")
      .insert({
        review_request_id:
          reviewRequest.id,

        knowledge_entry_id: entryId,

        event_type: "resubmitted",

        actor,

        notes: resubmissionNotes,

        metadata: {
          knowledge_slug:
            slug ||
            reviewRequest.knowledge_slug ||
            null,

          knowledge_title:
            knowledgeEntry.title ??
            reviewRequest.knowledge_title ??
            null,

          previous_review_status:
            "changes_requested",

          new_review_status:
            "submitted",

          previous_knowledge_status:
            "draft",

          new_knowledge_status:
            "review",

          resubmitted_at: now,

          previous_assigned_reviewer:
            previousRequest
              .assigned_reviewer,
        },
      });

  if (eventError) {
    await supabase
      .from("knowledge_entries")
      .update({
        status: "draft",
        medical_review_required: true,
        reviewed_by: null,
        reviewed_at: null,
        updated_at: now,
      })
      .eq("id", entryId);

    await restoreReviewRequestAfterFailedResubmission(
      supabase,
      reviewRequest.id,
      previousRequest,
    );

    redirectWithResubmissionError(
      slug,
      formatDatabaseError(
        eventError.message,
      ),
    );
  }

  revalidateKnowledgePaths(slug);
  revalidatePath("/medical-reviews");

  redirect(
    `/knowledge/${encodeURIComponent(
      slug,
    )}?reviewResubmitted=1`,
  );
}

function validateKnowledgeEntry(
  formData: FormData,
): ValidationResult {
  const title = readRequiredString(
    formData,
    "title",
  );

  const requestedSlug =
    readRequiredString(
      formData,
      "slug",
    );

  const summary = readRequiredString(
    formData,
    "summary",
  );

  const body = readRequiredString(
    formData,
    "body",
  );

  const category = readRequiredString(
    formData,
    "category",
  );

  const status = normalizeStatus(
    readRequiredString(
      formData,
      "status",
    ) ?? "draft",
  );

  const version =
    readRequiredString(
      formData,
      "version",
    ) ?? "1.0.0";

  const fieldErrors: Record<
    string,
    string
  > = {};

  if (!title) {
    fieldErrors.title =
      "Title is required.";
  }

  const slug = createSlug(
    requestedSlug ?? title ?? "",
  );

  if (!slug) {
    fieldErrors.slug =
      "A valid slug is required.";
  }

  if (!summary) {
    fieldErrors.summary =
      "Summary is required.";
  }

  if (!body) {
    fieldErrors.body =
      "Body content is required.";
  }

  if (!category) {
    fieldErrors.category =
      "Category is required.";
  }

  /*
   * These are the statuses permitted by the
   * knowledge_entries_status_check constraint.
   */
  const allowedStatuses = new Set([
    "draft",
    "review",
    "approved",
    "archived",
  ]);

  if (!allowedStatuses.has(status)) {
    fieldErrors.status =
      "Select Draft, Review, Approved, or Archived.";
  }

  if (!isValidVersion(version)) {
    fieldErrors.version =
      "Use a semantic version such as 1.0.0.";
  }

  const sourcesResult = parseSources(
    readOptionalString(
      formData,
      "sources",
    ),
  );

  if (!sourcesResult.success) {
    fieldErrors.sources =
      sourcesResult.message;
  }

  if (
    Object.keys(fieldErrors).length > 0
  ) {
    return {
      success: false,
      state: {
        status: "error",
        message:
          "Please correct the highlighted fields.",
        fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: {
      slug,
      title: title as string,
      summary: summary as string,
      body: body as string,
      category: category as string,
      status,

      tags: parseCommaSeparatedList(
        readOptionalString(
          formData,
          "tags",
        ),
      ),

      keywords:
        parseCommaSeparatedList(
          readOptionalString(
            formData,
            "keywords",
          ),
        ),

      aliases:
        parseCommaSeparatedList(
          readOptionalString(
            formData,
            "aliases",
          ),
        ),

      sources: sourcesResult.success
        ? sourcesResult.sources
        : [],

      medical_review_required:
        formData.get(
          "medicalReviewRequired",
        ) === "on",

      version,
    },
  };
}

async function restoreReviewRequestAfterFailedResubmission(
  supabase: ReturnType<
    typeof createAdminClient
  >,
  reviewRequestId: string,
  previousRequest: {
    status: string;
    assigned_reviewer: unknown;
    submission_notes: string | null;
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

      assigned_reviewer:
        previousRequest
          .assigned_reviewer,

      submission_notes:
        previousRequest
          .submission_notes,

      review_notes:
        previousRequest.review_notes,

      decision_reason:
        previousRequest
          .decision_reason,

      decided_at:
        previousRequest.decided_at,

      updated_at:
        previousRequest.updated_at,
    })
    .eq("id", reviewRequestId);
}

function normalizeActor(
  value: unknown,
): ReviewerActor | null {
  const object = readObject(value);

  const name =
    readObjectString(
      object,
      "name",
    ) ??
    readObjectString(
      object,
      "displayName",
    ) ??
    readObjectString(
      object,
      "display_name",
    );

  if (!name) {
    return null;
  }

  return {
    name,

    role:
      readObjectString(
        object,
        "role",
      ) ?? "Editorial Reviewer",

    email:
      readObjectString(
        object,
        "email",
      ),

    actor_type:
      readObjectString(
        object,
        "actor_type",
      ) ?? "editorial_reviewer",
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

function parseSources(
  value: string | null,
):
  | {
      success: true;
      sources: unknown[];
    }
  | {
      success: false;
      message: string;
    } {
  if (!value) {
    return {
      success: true,
      sources: [],
    };
  }

  try {
    const parsed: unknown =
      JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return {
        success: false,
        message:
          "Sources must be a JSON array.",
      };
    }

    return {
      success: true,
      sources: parsed,
    };
  } catch {
    return {
      success: false,
      message:
        'Sources must be valid JSON, for example: [{"title":"NHS","url":"https://..."}]',
    };
  }
}

function parseCommaSeparatedList(
  value: string | null,
): string[] {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function revalidateKnowledgePaths(
  slug: string,
): void {
  revalidatePath("/");
  revalidatePath("/knowledge");

  if (slug) {
    revalidatePath(
      `/knowledge/${encodeURIComponent(
        slug,
      )}`,
    );
  }
}

function redirectWithResubmissionError(
  slug: string,
  message: string,
): never {
  redirect(
    `/knowledge/${encodeURIComponent(
      slug,
    )}?resubmissionError=${encodeURIComponent(
      formatDatabaseError(message),
    )}`,
  );
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

function createSlug(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function isValidVersion(
  value: string,
): boolean {
  return /^\d+\.\d+\.\d+$/.test(
    value,
  );
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
    return "Approved entries must contain completed medical-review information.";
  }

  if (
    normalized.includes("duplicate") ||
    normalized.includes("unique")
  ) {
    return "An entry or review with the same identifying information already exists.";
  }

  if (
    normalized.includes("null value") ||
    normalized.includes(
      "not-null constraint",
    )
  ) {
    return "A required database field is missing.";
  }

  if (
    normalized.includes(
      "violates check constraint",
    )
  ) {
    return "The database rejected an unsupported knowledge or review status.";
  }

  return message;
}