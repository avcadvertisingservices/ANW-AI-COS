import { describe, expect, it } from "vitest";
import type {
  KnowledgeEntry,
  KnowledgeSearchResult,
} from "../../src/modules/knowledge/types.js";
import type { KnowledgeService } from "../../src/modules/knowledge/service.js";
import {
  ContentEngineService,
  ContentKnowledgeRetriever,
} from "../../src/modules/content/engine.js";
import { MockContentProvider } from "../../src/modules/content/providers.js";

function makeEntry(
  input: Partial<KnowledgeEntry> &
    Pick<KnowledgeEntry, "id" | "slug" | "title" | "summary" | "body">,
): KnowledgeEntry {
  return {
    category: "resource",
    status: "approved",
    tags: [],
    keywords: [],
    aliases: [],
    sources: [],
    medicalReviewRequired: true,
    createdAt: "2026-07-27T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
    version: "1.0.0",
    ...input,
  };
}

describe("Content topic relevance", () => {
  it("prioritizes the exact medical topic over a generic mission entry", async () => {
    const missionEntry = makeEntry({
      id: "knowledge.mission",
      slug: "you-are-not-alone",
      title: "You Are Not Alone",
      summary:
        "A community-support entry reflecting the central ANW mission.",
      body:
        "Acoustic Neuroma Warrior supports patients, survivors, caregivers, and families.",
      keywords: ["mission"],
      tags: ["support"],
    });

    const hearingEntry = makeEntry({
      id: "knowledge.hearing",
      slug: "one-sided-hearing-loss",
      title: "One-Sided Hearing Loss",
      summary:
        "One-sided hearing loss affects hearing in one ear.",
      body:
        "It can make it harder to locate sounds. Conversations in noisy places may also be more difficult. Listening can require more effort.",
      category: "symptom",
      keywords: ["one-sided hearing loss"],
      aliases: ["unilateral hearing loss"],
      tags: ["hearing loss"],
    });

    const searchResults: KnowledgeSearchResult[] = [
      {
        entry: missionEntry,
        score: 999,
        matchedTerms: ["support"],
      },
      {
        entry: hearingEntry,
        score: 10,
        matchedTerms: ["one-sided", "hearing", "loss"],
      },
    ];

    const fakeService = {
      search: async () => searchResults,
    } as unknown as KnowledgeService;

    const engine = new ContentEngineService(
      new ContentKnowledgeRetriever(fakeService),
      new MockContentProvider(),
    );

    const bundle = await engine.generate({
      topic: "one-sided hearing loss",
      audience: "Acoustic Neuroma patients and caregivers",
      formats: ["carousel"],
      tone: "compassionate",
      language: "English",
      carouselSlideCount: 10,
      knowledgeLimit: 5,
    });

    expect(bundle.knowledgeEntryIds[0]).toBe("knowledge.hearing");
    expect(bundle.knowledgeEntryIds).not.toContain("knowledge.mission");
    expect(bundle.carousel?.slides).toHaveLength(10);

    const nonCtaMissionTitles =
      bundle.carousel?.slides.filter(
        (slide) =>
          slide.role !== "cta" &&
          /you are not alone/i.test(slide.title),
      ) ?? [];

    expect(nonCtaMissionTitles).toHaveLength(0);

    const uniqueBodies = new Set(
      bundle.carousel?.slides.map((slide) => slide.body),
    );

    expect(uniqueBodies.size).toBeGreaterThanOrEqual(7);
  });
});
