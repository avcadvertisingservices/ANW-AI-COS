import "dotenv/config";
import { createSupabaseKnowledgeSourceManager } from "./factory.js";

async function main(): Promise<void> {
  const slug =
    process.env.SOURCE_TOPIC_SLUG?.trim() ||
    "one-sided-hearing-loss";

  const service = createSupabaseKnowledgeSourceManager();
  const { entry, policy } = await service.evaluateEntryBySlug(slug);

  console.log({
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    status: entry.status,
    version: entry.version,
    sourceCount: policy.sourceCount,
    validSourceCount: policy.validSourceCount,
    collectionValid: policy.valid,
    duplicateSourceIds: policy.duplicateSourceIds,
    duplicateUrls: policy.duplicateUrls,
    errors: policy.errors,
    warnings: policy.warnings,
    sources: policy.sourceReports.map(({ sourceId, title, report }) => ({
      sourceId,
      title,
      valid: report.valid,
      domain: report.domain,
      normalizedUrl: report.normalizedUrl,
      errors: report.errors,
      warnings: report.warnings,
    })),
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
