import { describe, expect, it } from "vitest";
import {
  createKnowledgeEntry,
  createKnowledgeSource,
} from "../../src/modules/knowledge/index.js";
import {
  knowledgeDomainToInsert,
  knowledgeRowToDomain,
} from "../../src/modules/knowledge/supabase-mapper.js";
import type { Database } from "../../src/core/database/database.types.js";

type KnowledgeRow =
  Database["public"]["Tables"]["knowledge_entries"]["Row"];

describe("Supabase knowledge mapper", () => {
  it("maps a domain entry to a database insert", () => {
    const entry = createKnowledgeEntry({
      id: "knowledge.test.supabase",
      slug: "supabase-test",
      title: "Supabase Test",
      summary: "A valid summary for Supabase mapping.",
      body: "A valid body for Supabase mapping and persistence.",
      category: "research",
      sources: [
        createKnowledgeSource({
          id: "source.test",
          title: "Test Source",
          evidenceLevel: "research",
        }),
      ],
    });

    const insert = knowledgeDomainToInsert(entry);

    expect(insert.medical_review_required).toBe(true);
    expect(insert.slug).toBe("supabase-test");
    expect(Array.isArray(insert.sources)).toBe(true);
  });

  it("maps a database row to a domain entry", () => {
    const row: KnowledgeRow = {
      id: "knowledge.test.row",
      slug: "test-row",
      title: "Test Row",
      summary: "A valid database row summary.",
      body: "A valid database row body containing enough detail.",
      category: "faq",
      status: "draft",
      tags: ["test"],
      keywords: ["row"],
      aliases: [],
      sources: [],
      medical_review_required: true,
      reviewed_by: null,
      reviewed_at: null,
      version: "1.0.0",
      created_at: "2026-07-26T00:00:00.000Z",
      updated_at: "2026-07-26T00:00:00.000Z",
    };

    const entry = knowledgeRowToDomain(row);

    expect(entry.category).toBe("faq");
    expect(entry.medicalReviewRequired).toBe(true);
    expect(entry.reviewedBy).toBeUndefined();
  });
});
