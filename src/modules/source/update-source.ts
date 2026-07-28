import "dotenv/config";
import type { EvidenceLevel } from "../knowledge/types.js";
import type { KnowledgeSourceChanges } from "./types.js";
import {
  environmentActor,
  optionalEnvironment,
  requiredEnvironment,
} from "./cli.js";
import { createSupabaseKnowledgeSourceManager } from "./factory.js";

function changesFromEnvironment(): KnowledgeSourceChanges {
  const evidenceLevel = optionalEnvironment("SOURCE_EVIDENCE_LEVEL");

  if (
    evidenceLevel &&
    evidenceLevel !== "community" &&
    evidenceLevel !== "educational" &&
    evidenceLevel !== "clinical" &&
    evidenceLevel !== "research"
  ) {
    throw new Error(
      "SOURCE_EVIDENCE_LEVEL must be community, educational, clinical, or research.",
    );
  }

  const changes: KnowledgeSourceChanges = {
    title: optionalEnvironment("SOURCE_TITLE"),
    publisher: optionalEnvironment("SOURCE_PUBLISHER"),
    url: optionalEnvironment("SOURCE_URL"),
    publicationDate: optionalEnvironment("SOURCE_PUBLICATION_DATE"),
    accessedDate: optionalEnvironment("SOURCE_ACCESSED_DATE"),
    evidenceLevel: evidenceLevel as EvidenceLevel | undefined,
  };

  if (Object.values(changes).every((value) => value === undefined)) {
    throw new Error("At least one SOURCE_* update value is required.");
  }

  return changes;
}

async function main(): Promise<void> {
  const service = createSupabaseKnowledgeSourceManager();

  const result = await service.updateSourceBySlug(
    requiredEnvironment("SOURCE_TOPIC_SLUG"),
    requiredEnvironment("SOURCE_ID"),
    changesFromEnvironment(),
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
