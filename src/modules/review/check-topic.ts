import "dotenv/config";
import { createSupabaseKnowledgeReviewService } from "./factory.js";

async function main(): Promise<void> {
  const slug =
    process.env.REVIEW_TOPIC_SLUG?.trim() ||
    "one-sided-hearing-loss";

  const service = createSupabaseKnowledgeReviewService();
  const { entry, policy } = await service.evaluateBySlug(
    slug,
    "medical_reviewer",
  );

  console.log({
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    status: entry.status,
    category: entry.category,
    medicalReviewRequired: entry.medicalReviewRequired,
    sourceCount: policy.sourceCount,
    minimumSourceCount: policy.minimumSourceCount,
    eligibleForSubmission: policy.eligibleForSubmission,
    eligibleForMedicalApproval: policy.eligibleForApproval,
    errors: policy.errors,
    warnings: policy.warnings,
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
