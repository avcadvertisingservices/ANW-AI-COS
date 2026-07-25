import { KnowledgeValidationError } from "./errors.js";
import type { KnowledgeRecord } from "./types.js";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

export function validateKnowledgeRecord(record: KnowledgeRecord): void {
  const requiredTextFields: Array<keyof KnowledgeRecord> = [
    "id",
    "slug",
    "title",
    "summary",
    "body",
    "category",
    "status",
    "createdAt",
    "updatedAt",
  ];

  const emptyFields = requiredTextFields.filter((field) => {
    const value = record[field];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (emptyFields.length > 0) {
    throw new KnowledgeValidationError("Knowledge record has empty required fields", {
      recordId: record.id,
      emptyFields,
    });
  }

  if (!Array.isArray(record.tags) || !Array.isArray(record.sourceIds)) {
    throw new KnowledgeValidationError("tags and sourceIds must be arrays", {
      recordId: record.id,
    });
  }

  if (
    !ISO_DATE_PATTERN.test(record.createdAt) ||
    !ISO_DATE_PATTERN.test(record.updatedAt)
  ) {
    throw new KnowledgeValidationError("createdAt and updatedAt must be ISO timestamps", {
      recordId: record.id,
    });
  }

  if (record.status === "approved" && record.medicalReviewRequired) {
    throw new KnowledgeValidationError(
      "Approved records cannot still require medical review",
      { recordId: record.id },
    );
  }
}
