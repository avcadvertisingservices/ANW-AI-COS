import type { KnowledgeEntry } from "../knowledge/types.js";
import { InMemoryKnowledgeSourceManagerRepository } from "./in-memory.js";
import { KnowledgeSourceManagerService } from "./service.js";

async function main(): Promise<void> {
  const entry: KnowledgeEntry = {
    id: "knowledge.demo.hearing",
    slug: "one-sided-hearing-loss",
    title: "One-Sided Hearing Loss",
    summary:
      "A demo knowledge entry used to validate source-management behavior.",
    body:
      "This technical demo verifies source validation, audit events, version updates, and automatic review reset. It is not production medical content.",
    category: "symptom",
    status: "approved",
    tags: ["hearing"],
    keywords: ["one-sided hearing loss"],
    aliases: ["unilateral hearing loss"],
    sources: [],
    medicalReviewRequired: true,
    reviewedBy: "Demo Reviewer",
    reviewedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: "1.0.0",
  };

  const repository = new InMemoryKnowledgeSourceManagerRepository([entry]);
  const service = new KnowledgeSourceManagerService(repository);
  const actor = {
    name: "ANW Editorial Team",
    role: "editorial_reviewer" as const,
  };

  const first = await service.addSourceBySlug(
    entry.slug,
    {
      title: "Demo clinical source one",
      publisher: "Demo Publisher",
      url: "https://example.org/source-one?utm_source=demo",
      evidenceLevel: "clinical",
    },
    actor,
    "Technical demo source only.",
  );

  const second = await service.addSourceBySlug(
    entry.slug,
    {
      title: "Demo research source two",
      publisher: "Demo Publisher",
      url: "https://example.org/source-two",
      evidenceLevel: "research",
    },
    actor,
    "Technical demo source only.",
  );

  const evaluation = await service.evaluateEntryBySlug(entry.slug);
  const events = await service.listEvents(entry.id);

  console.log({
    entryId: second.entry.id,
    entryStatus: second.entry.status,
    sourceCount: evaluation.policy.sourceCount,
    validSourceCount: evaluation.policy.validSourceCount,
    collectionValid: evaluation.policy.valid,
    firstMutationResetReview: first.reviewReset,
    secondMutationResetReview: second.reviewReset,
    reviewedByCleared: second.entry.reviewedBy === undefined,
    version: second.entry.version,
    eventCount: events.length,
    events: events.map((event) => event.type),
    warningCount: evaluation.policy.warnings.length,
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
