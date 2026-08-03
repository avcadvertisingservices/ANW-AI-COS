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
  "id" | "reviewed_by" | "reviewed_at" | "updated_at"
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

export async function createKnowledgeEntry(
  _previousState: KnowledgeEntryActionState,
  formData: FormData,
): Promise<KnowledgeEntryActionState> {
  const validation = validateKnowledgeEntry(formData);

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
      validation.data.medical_review_required,
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
      message: formatDatabaseError(error.message),
      fieldErrors: {},
    };
  }

  revalidatePath("/");
  revalidatePath("/knowledge");

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
      message: "The knowledge-entry ID is missing.",
      fieldErrors: {},
    };
  }

  const validation = validateKnowledgeEntry(formData);

  if (!validation.success) {
    return validation.state;
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const reviewedBy =
    validation.data.status === "approved"
      ? readOptionalString(formData, "reviewedBy")
      : null;

  const reviewedAt =
    validation.data.status === "approved"
      ? readOptionalString(formData, "reviewedAt") ??
        now
      : null;

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
      validation.data.medical_review_required,
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
      message: formatDatabaseError(error.message),
      fieldErrors: {},
    };
  }

  revalidatePath("/");
  revalidatePath("/knowledge");

  revalidatePath(
    `/knowledge/${encodeURIComponent(
      validation.data.slug,
    )}`,
  );

  redirect(
    `/knowledge/${encodeURIComponent(
      validation.data.slug,
    )}?updated=1`,
  );
}

function validateKnowledgeEntry(
  formData: FormData,
): ValidationResult {
  const title = readRequiredString(
    formData,
    "title",
  );

  const requestedSlug = readRequiredString(
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
    readRequiredString(formData, "status") ??
      "draft",
  );

  const version =
    readRequiredString(formData, "version") ??
    "1.0.0";

  const fieldErrors: Record<string, string> = {};

  if (!title) {
    fieldErrors.title = "Title is required.";
  }

  const slug = createSlug(
    requestedSlug ?? title ?? "",
  );

  if (!slug) {
    fieldErrors.slug = "A valid slug is required.";
  }

  if (!summary) {
    fieldErrors.summary = "Summary is required.";
  }

  if (!body) {
    fieldErrors.body =
      "Body content is required.";
  }

  if (!category) {
    fieldErrors.category =
      "Category is required.";
  }

  const allowedStatuses = new Set([
    "draft",
    "submitted",
    "in_review",
    "changes_requested",
    "approved",
    "rejected",
    "archived",
  ]);

  if (!allowedStatuses.has(status)) {
    fieldErrors.status =
      "Select a valid status.";
  }

  if (!isValidVersion(version)) {
    fieldErrors.version =
      "Use a semantic version such as 1.0.0.";
  }

  const sourcesResult = parseSources(
    readOptionalString(formData, "sources"),
  );

  if (!sourcesResult.success) {
    fieldErrors.sources =
      sourcesResult.message;
  }

  if (Object.keys(fieldErrors).length > 0) {
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
        readOptionalString(formData, "tags"),
      ),

      keywords: parseCommaSeparatedList(
        readOptionalString(
          formData,
          "keywords",
        ),
      ),

      aliases: parseCommaSeparatedList(
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
    const parsed: unknown = JSON.parse(value);

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

function createSlug(value: string): string {
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

function isValidVersion(
  value: string,
): boolean {
  return /^\d+\.\d+\.\d+$/.test(value);
}

function formatDatabaseError(
  message: string,
): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("duplicate") ||
    normalized.includes("unique")
  ) {
    return "An entry with this ID or slug already exists.";
  }

  if (
    normalized.includes("null value") ||
    normalized.includes(
      "not-null constraint",
    )
  ) {
    return "A required database field is missing.";
  }

  return message;
}