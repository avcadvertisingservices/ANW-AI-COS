import type {
  KnowledgeRecordSnapshot,
  ReviewerRole,
  ReviewPolicyReport,
} from "./types.js";

const MEDICAL_CATEGORIES = new Set([
  "medical-fact",
  "symptom",
  "diagnosis",
  "treatment",
  "recovery",
  "research",
]);

function hasHttpUrl(value: string | undefined): boolean {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function requiresMedicalReview(
  entry: KnowledgeRecordSnapshot,
): boolean {
  return (
    entry.medicalReviewRequired ||
    MEDICAL_CATEGORIES.has(entry.category)
  );
}

export function evaluateKnowledgeReviewPolicy(
  entry: KnowledgeRecordSnapshot,
  reviewerRole?: ReviewerRole,
): ReviewPolicyReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const medical = requiresMedicalReview(entry);
  const minimumSourceCount = medical ? 2 : 0;

  if (entry.title.trim().length < 5) {
    errors.push("Title must contain at least 5 characters.");
  }

  if (entry.summary.trim().length < 30) {
    errors.push("Summary must contain at least 30 characters.");
  }

  if (entry.body.trim().length < 80) {
    errors.push("Body must contain at least 80 characters.");
  }

  if (entry.sources.length < minimumSourceCount) {
    errors.push(
      `This entry requires at least ${minimumSourceCount} reliable sources before submission.`,
    );
  }

  const untitledSources = entry.sources.filter(
    (source) => source.title.trim().length < 3,
  );

  if (untitledSources.length > 0) {
    errors.push("Every source must have a clear title.");
  }

  if (medical) {
    const sourcesWithoutValidUrls = entry.sources.filter(
      (source) => !hasHttpUrl(source.url),
    );

    if (sourcesWithoutValidUrls.length > 0) {
      errors.push(
        "Every medical source must include a valid http or https URL.",
      );
    }
  } else if (
    entry.sources.some((source) => source.url && !hasHttpUrl(source.url))
  ) {
    warnings.push("One or more optional source URLs are invalid.");
  }

  if (entry.tags.length === 0) {
    warnings.push("No tags are assigned to this knowledge entry.");
  }

  if (entry.keywords.length === 0) {
    warnings.push("No search keywords are assigned to this knowledge entry.");
  }

  const reviewerAuthorized =
    !medical ||
    reviewerRole === "medical_reviewer" ||
    reviewerRole === "administrator";

  if (medical && reviewerRole && !reviewerAuthorized) {
    errors.push(
      "Medical entries can only be approved by a medical reviewer or administrator.",
    );
  }

  return {
    eligibleForSubmission: errors.length === 0,
    eligibleForApproval: errors.length === 0 && reviewerAuthorized,
    requiresMedicalReviewer: medical,
    sourceCount: entry.sources.length,
    minimumSourceCount,
    errors,
    warnings,
  };
}
