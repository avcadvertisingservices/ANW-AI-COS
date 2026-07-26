import {
  createStarterKnowledge,
  InMemoryKnowledgeRepository,
  KnowledgeService,
} from "./index.js";

async function main(): Promise<void> {
  const repository = new InMemoryKnowledgeRepository();
  const service = new KnowledgeService(repository);

  for (const entry of createStarterKnowledge()) {
    await service.create(entry);
  }

  const allResults = await service.search({
    text: "hearing",
    limit: 10,
  });

  const approvedResults = await service.search({
    approvedOnly: true,
  });

  console.log({
    totalSeedEntries: (await repository.list()).length,
    hearingSearchCount: allResults.length,
    topHearingResult: allResults[0]?.entry.title ?? null,
    approvedCount: approvedResults.length,
    missionPresent: approvedResults.some(
      (result) => result.entry.slug === "you-are-not-alone",
    ),
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
