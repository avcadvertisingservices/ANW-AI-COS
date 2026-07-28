import "dotenv/config";
import {
  environmentActor,
  optionalEnvironment,
  requiredEnvironment,
} from "./cli.js";
import { createSupabaseKnowledgeSourceManager } from "./factory.js";

async function main(): Promise<void> {
  const service = createSupabaseKnowledgeSourceManager();

  const result = await service.removeSourceBySlug(
    requiredEnvironment("SOURCE_TOPIC_SLUG"),
    requiredEnvironment("SOURCE_ID"),
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
