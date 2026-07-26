import type { KnowledgeEntry } from "./types.js";
import { KnowledgeValidationError } from "./errors.js";

const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{2,99}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateKnowledgeEntry(entry: KnowledgeEntry): void {
  if (!ID_PATTERN.test(entry.id)) {
    throw new KnowledgeValidationError(
      `Invalid knowledge id: "${entry.id}".`,
    );
  }

  if (!SLUG_PATTERN.test(entry.slug)) {
    throw new KnowledgeValidationError(
      `Invalid knowledge slug: "${entry.slug}".`,
    );
  }

  if (entry.title.trim().length < 3) {
    throw new KnowledgeValidationError(
      "Knowledge title must contain at least 3 characters.",
    );
  }

  if (entry.summary.trim().length < 10) {
    throw new KnowledgeValidationError(
      "Knowledge summary must contain at least 10 characters.",
    );
  }

  if (entry.body.trim().length < 20) {
    throw new KnowledgeValidationError(
      "Knowledge body must contain at least 20 characters.",
    );
  }

  if (entry.medicalReviewRequired && entry.status === "approved") {
    if (!entry.reviewedBy || !entry.reviewedAt) {
      throw new KnowledgeValidationError(
        "Approved medical knowledge requires reviewedBy and reviewedAt.",
      );
    }
  }

  if (entry.sources.some((source) => !source.id || !source.title)) {
    throw new KnowledgeValidationError(
      "Every source requires an id and title.",
    );
  }
}
