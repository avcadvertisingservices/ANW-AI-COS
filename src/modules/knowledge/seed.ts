import {
  createKnowledgeEntry,
  createKnowledgeSource,
} from "./factory.js";
import type { KnowledgeEntry } from "./types.js";

export function createStarterKnowledge(): KnowledgeEntry[] {
  const educationalSource = createKnowledgeSource({
    id: "source.anw.educational",
    title: "ANW educational content source placeholder",
    publisher: "Acoustic Neuroma Warrior",
    evidenceLevel: "educational",
  });

  return [
    createKnowledgeEntry({
      id: "knowledge.acoustic-neuroma.definition",
      slug: "what-is-acoustic-neuroma",
      title: "What Is Acoustic Neuroma?",
      summary:
        "A structured educational entry explaining acoustic neuroma for future human review.",
      body:
        "Acoustic neuroma, also called vestibular schwannoma, is represented here as draft educational knowledge. Medical claims must be verified against approved clinical sources before publication.",
      category: "medical-fact",
      status: "draft",
      tags: ["acoustic-neuroma", "education", "definition"],
      keywords: [
        "acoustic neuroma",
        "vestibular schwannoma",
        "benign tumor",
      ],
      aliases: ["vestibular schwannoma"],
      sources: [educationalSource],
      medicalReviewRequired: true,
    }),
    createKnowledgeEntry({
      id: "knowledge.symptom.one-sided-hearing-loss",
      slug: "one-sided-hearing-loss",
      title: "One-Sided Hearing Loss",
      summary:
        "A draft knowledge entry for educational content about one-sided hearing loss.",
      body:
        "This entry is a content placeholder. It must not be treated as a diagnostic statement and requires clinical source review before publication.",
      category: "symptom",
      status: "draft",
      tags: ["hearing", "symptoms"],
      keywords: ["one-sided hearing loss", "asymmetric hearing"],
      aliases: ["unilateral hearing loss"],
      sources: [educationalSource],
      medicalReviewRequired: true,
    }),
    createKnowledgeEntry({
      id: "knowledge.recovery.you-are-not-alone",
      slug: "you-are-not-alone",
      title: "You Are Not Alone",
      summary:
        "A community-support entry reflecting the central ANW mission.",
      body:
        "Acoustic Neuroma Warrior exists to help patients, survivors, caregivers, and families feel supported through education, practical resources, and compassionate community.",
      category: "resource",
      status: "approved",
      tags: ["mission", "support", "community"],
      keywords: ["you are not alone", "support"],
      aliases: [],
      sources: [educationalSource],
      medicalReviewRequired: false,
      reviewedBy: "AVC Advertising Services",
      reviewedAt: new Date().toISOString(),
    }),
  ];
}
