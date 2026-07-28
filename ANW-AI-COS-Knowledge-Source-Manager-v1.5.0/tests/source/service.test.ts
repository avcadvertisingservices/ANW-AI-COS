import { describe, expect, it } from "vitest";
import type { KnowledgeEntry } from "../../src/modules/knowledge/types.js";
import { InMemoryKnowledgeSourceManagerRepository } from "../../src/modules/source/in-memory.js";
import { KnowledgeSourceManagerService } from "../../src/modules/source/service.js";

function approvedEntry(): KnowledgeEntry {
  return {
    id: "knowledge.hearing",
    slug: "one-sided-hearing-loss",
    title: "One-Sided Hearing Loss",
    summary: "A sufficiently detailed knowledge summary for testing.",
    body:
      "A sufficiently detailed knowledge body used only for technical source-management tests.",
    category: "symptom",
    status: "approved",
    tags: ["hearing"],
    keywords: ["one-sided hearing loss"],
    aliases: ["unilateral hearing loss"],
    sources: [],
    medicalReviewRequired: true,
    reviewedBy: "Medical Reviewer",
    reviewedAt: "2026-07-27T00:00:00.000Z",
    createdAt: "2026-07-27T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
    version: "1.0.0",
  };
}

const actor = {
  name: "ANW Editorial Team",
  role: "editorial_reviewer" as const,
};

function service() {
  const repository = new InMemoryKnowledgeSourceManagerRepository([
    approvedEntry(),
  ]);

  return {
    repository,
    service: new KnowledgeSourceManagerService(repository),
  };
}

describe("Knowledge Source Manager", () => {
  it("adds a source and resets prior approval", async () => {
    const context = service();

    const result = await context.service.addSourceBySlug(
      "one-sided-hearing-loss",
      {
        title: "Clinical source",
        publisher: "Health Publisher",
        url: "https://health.example.edu/clinical-source",
        evidenceLevel: "clinical",
      },
      actor,
    );

    expect(result.entry.sources).toHaveLength(1);
    expect(result.entry.status).toBe("draft");
    expect(result.entry.reviewedBy).toBeUndefined();
    expect(result.entry.reviewedAt).toBeUndefined();
    expect(result.entry.version).toBe("1.0.1");
    expect(result.reviewReset).toBe(true);
  });

  it("rejects a duplicate source URL", async () => {
    const context = service();
    const input = {
      title: "Clinical source",
      publisher: "Health Publisher",
      url: "https://health.example.edu/clinical-source",
      evidenceLevel: "clinical" as const,
    };

    await context.service.addSourceBySlug(
      "one-sided-hearing-loss",
      input,
      actor,
    );

    await expect(
      context.service.addSourceBySlug(
        "one-sided-hearing-loss",
        {
          ...input,
          title: "Duplicate clinical source",
          url: "https://health.example.edu/clinical-source/",
        },
        actor,
      ),
    ).rejects.toMatchObject({
      code: "SOURCE_URL_CONFLICT",
    });
  });

  it("records add and remove events", async () => {
    const context = service();
    const added = await context.service.addSourceBySlug(
      "one-sided-hearing-loss",
      {
        id: "source.removable",
        title: "Removable source",
        publisher: "Health Publisher",
        url: "https://health.example.edu/removable",
        evidenceLevel: "educational",
      },
      actor,
    );

    const removed = await context.service.removeSourceBySlug(
      "one-sided-hearing-loss",
      "source.removable",
      actor,
    );

    const events = await context.service.listEvents(added.entry.id);

    expect(removed.entry.sources).toHaveLength(0);
    expect(events.map((event) => event.type)).toEqual([
      "source_added",
      "source_removed",
    ]);
  });
});
