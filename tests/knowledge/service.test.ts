import { describe, expect, it } from "vitest";
import {
  createKnowledgeEntry,
  InMemoryKnowledgeRepository,
  KnowledgeService,
} from "../../src/modules/knowledge/index.js";

describe("KnowledgeService", () => {
  it("creates, searches, and approves an entry", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const service = new KnowledgeService(repository);

    const entry = createKnowledgeEntry({
      id: "knowledge.balance.recovery",
      slug: "balance-recovery",
      title: "Balance Recovery",
      summary: "A structured draft about balance recovery.",
      body:
        "This educational draft requires human medical review before publication.",
      category: "recovery",
      tags: ["balance", "recovery"],
      keywords: ["balance recovery"],
    });

    await service.create(entry);

    const results = await service.search({ text: "balance" });
    expect(results).toHaveLength(1);
    expect(results[0]?.entry.id).toBe(entry.id);

    const approved = await service.approve({
      id: entry.id,
      reviewedBy: "Medical Reviewer",
    });

    expect(approved.status).toBe("approved");
    expect(approved.reviewedBy).toBe("Medical Reviewer");
    expect(approved.reviewedAt).toBeTruthy();
  });
});
