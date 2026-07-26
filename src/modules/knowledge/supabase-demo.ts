import "dotenv/config";
import { createStarterKnowledge } from "./seed.js";
import { createSupabaseKnowledgeService } from "./supabase-service.js";

async function main(): Promise<void> {
  const service = createSupabaseKnowledgeService();

  for (const entry of createStarterKnowledge()) {
    const existing = await service
      .getBySlug(entry.slug)
      .catch(() => null);

    if (!existing) {
      await service.create(entry);
      console.log(`CREATED: ${entry.slug}`);
    } else {
      console.log(`EXISTS: ${entry.slug}`);
    }
  }

  const results = await service.search({
    text: "hearing",
    limit: 10,
  });

  console.log({
    hearingSearchCount: results.length,
    topResult: results[0]?.entry.title ?? null,
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
