import "dotenv/config";

import {
  createSupabaseKnowledgeReviewService,
} from "./factory.js";

import {
  createActorFromEnvironment,
  optionalEnvironmentValue,
  requiredEnvironmentValue,
} from "./cli-utils.js";

async function main(): Promise<void> {
  const reviewRequestId =
    requiredEnvironmentValue(
      "REVIEW_REQUEST_ID",
    );

  const reviewer =
    createActorFromEnvironment(
      "REVIEWER",
    );

  const notes =
    optionalEnvironmentValue(
      "REVIEW_NOTES",
    ) ??
    "Formal knowledge review has started.";

  const service =
    createSupabaseKnowledgeReviewService();

  const updated =
    await service.startReview(
      reviewRequestId,
      {
        reviewer,
        notes,
      },
    );

  console.log({
    reviewRequestId: updated.id,
    knowledgeEntryId:
      updated.knowledgeEntryId,
    knowledgeSlug:
      updated.knowledgeSlug,
    knowledgeTitle:
      updated.knowledgeTitle,
    requestStatus: updated.status,
    assignedReviewer:
      updated.assignedReviewer?.name,
    reviewerRole:
      updated.assignedReviewer?.role,
    reviewStartedAt:
      updated.reviewStartedAt,
    nextAction:
      "The assigned reviewer must now review the complete knowledge content against every cited source.",
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});