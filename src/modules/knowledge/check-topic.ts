import "dotenv/config";

import {
  createSupabaseKnowledgeService,
} from "./supabase-service.js";

async function main(): Promise<void> {
  const service =
    createSupabaseKnowledgeService();

  const queries = [
    "one-sided hearing loss",
    "hearing loss",
    "hearing",
    "you are not alone",
  ];

  for (const query of queries) {
    console.log(
      `\n========== ${query.toUpperCase()} ==========`,
    );

    const allResults = await service.search({
      text: query,
      approvedOnly: false,
      limit: 20,
    });

    console.log("\nALL MATCHING RECORDS:");

    if (allResults.length === 0) {
      console.log("No records found.");
    }

    for (const {
      entry,
      score,
    } of allResults) {
      console.log({
        id: entry.id,
        slug: entry.slug,
        title: entry.title,
        status: entry.status,
        category: entry.category,
        score,
        reviewedBy:
          entry.reviewedBy ?? "NOT REVIEWED",
        reviewedAt:
          entry.reviewedAt ?? "NOT REVIEWED",
      });
    }

    const approvedResults =
      await service.search({
        text: query,
        approvedOnly: true,
        limit: 20,
      });

    console.log("\nAPPROVED RECORDS ONLY:");

    if (approvedResults.length === 0) {
      console.log(
        "No approved records found.",
      );
    }

    for (const {
      entry,
      score,
    } of approvedResults) {
      console.log({
        id: entry.id,
        slug: entry.slug,
        title: entry.title,
        status: entry.status,
        category: entry.category,
        score,
      });
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});