import "dotenv/config";

import {
  createSupabaseKnowledgeReviewService,
} from "./factory.js";

import {
  createActorFromEnvironment,
  requiredEnvironmentValue,
  requireMinimumLength,
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
    requireMinimumLength(
      requiredEnvironmentValue(
        "REVIEW_NOTES",
      ),
      10,
      "REVIEW_NOTES",
    );

  const service =
    createSupabaseKnowledgeReviewService();

  const rejected =
    await service.reject(
      reviewRequestId,
      {
        reviewer,
        notes,
      },
    );

  const events =
    await service.listEvents(
      reviewRequestId,
    );

  console.log({
    reviewRequestId: rejected.id,
    knowledgeEntryId:
      rejected.knowledgeEntryId,
    knowledgeSlug:
      rejected.knowledgeSlug,
    requestStatus: rejected.status,
    rejectedBy:
      rejected.assignedReviewer?.name,
    reviewerRole:
      rejected.assignedReviewer?.role,
    decisionReason:
      rejected.decisionReason,
    decidedAt: rejected.decidedAt,
    eventCount: events.length,
    events: events.map(
      (event) => event.type,
    ),
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});