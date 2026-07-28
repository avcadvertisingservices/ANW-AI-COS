import "dotenv/config";
import {
  environmentActor,
  environmentEvidenceLevel,
  optionalEnvironment,
  requiredEnvironment,
} from "./cli.js";
import { createSupabaseKnowledgeSourceManager } from "./factory.js";

async function main(): Promise<void> {
  const service = createSupabaseKnowledgeSourceManager();

  const result = await service.addSourceBySlug(
    requiredEnvironment("SOURCE_TOPIC_SLUG"),
    {
      id: optionalEnvironment("SOURCE_ID"),
      title: requiredEnvironment("SOURCE_TITLE"),
      publisher: requiredEnvironment("SOURCE_PUBLISHER"),
      url: requiredEnvironment("SOURCE_URL"),
      publicationDate: optionalEnvironment("SOURCE_PUBLICATION_DATE"),
      accessedDate: optionalEnvironment("SOURCE_ACCESSED_DATE"),
      evidenceLevel: environmentEvidenceLevel(),
    },
    environmentActor(),
    optionalEnvironment("SOURCE_NOTES"),
  );

  console.log({
    action: result.event.type,
    knowledgeEntryId: result.entry.id,
    slug: result.entry.slug,
    sourceId: result.event.sourceId,
    sourceCount: result.entry.sources.length,
    status: result.entry.status,
    version: result.entry.version,
    reviewReset: result.reviewReset,
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
