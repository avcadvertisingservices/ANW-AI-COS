import { createKnowledgeService } from "./factory.js";
import type { KnowledgeRecord } from "./types.js";

const now = new Date().toISOString();

const demoRecord: KnowledgeRecord = {
  id: "demo-001",
  slug: "welcome-to-the-knowledge-engine",
  title: "Welcome to the Knowledge Engine",
  summary: "A non-medical demonstration record used to verify the module.",
  body: "This record confirms that loading, validation, filtering, and search work.",
  category: "glossary",
  tags: ["demo", "system"],
  status: "approved",
  medicalReviewRequired: false,
  sourceIds: [],
  createdAt: now,
  updatedAt: now,
};

const knowledge = createKnowledgeService([demoRecord]);
const results = await knowledge.searchApproved({ text: "knowledge" });

console.log(
  JSON.stringify(
    {
      module: "knowledge",
      resultCount: results.length,
      titles: results.map((result) => result.record.title),
    },
    null,
    2,
  ),
);
