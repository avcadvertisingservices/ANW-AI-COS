import { randomUUID } from "node:crypto";

import type { KnowledgeService } from "../knowledge/service.js";

import type {
  ContentBundle,
  ContentGenerationRequest,
  ContentProvider,
  KnowledgeContextItem,
} from "./types.js";

type KnowledgeSearchResult = Awaited<
  ReturnType<KnowledgeService["search"]>
>[number];

type KnowledgeSearchEntry =
  KnowledgeSearchResult["entry"];

interface RankedKnowledgeEntry {
  entry: KnowledgeSearchEntry;
  score: number;
}

export class ContentEngineError extends Error {
  public constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ContentEngineError";
  }
}

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createTokens(value: string): string[] {
  const ignoredWords = new Set([
    "a",
    "an",
    "and",
    "are",
    "for",
    "in",
    "is",
    "of",
    "on",
    "the",
    "to",
    "what",
    "with",
  ]);

  return normalizeText(value)
    .split(" ")
    .filter(
      (token) =>
        token.length > 1 &&
        !ignoredWords.has(token),
    );
}

function getEntryKeywords(
  entry: KnowledgeSearchEntry,
): string[] {
  if (
    "keywords" in entry &&
    Array.isArray(entry.keywords)
  ) {
    return entry.keywords.filter(
      (keyword): keyword is string =>
        typeof keyword === "string",
    );
  }

  return [];
}

function isGenericMissionEntry(
  entry: KnowledgeSearchEntry,
): boolean {
  const title = normalizeText(entry.title);
  const slug = normalizeText(entry.slug);
  const summary = normalizeText(entry.summary);

  return (
    title === "you are not alone" ||
    slug === "you are not alone" ||
    summary.includes("central anw mission") ||
    summary.includes("community support entry") ||
    title.includes("anw mission")
  );
}

function scoreKnowledgeEntry(
  entry: KnowledgeSearchEntry,
  requestedTopic: string,
): number {
  const topic = normalizeText(requestedTopic);
  const topicSlug = topic.replace(/\s+/g, "-");

  const title = normalizeText(entry.title);
  const slug = normalizeText(entry.slug);
  const summary = normalizeText(entry.summary);
  const body = normalizeText(entry.body);

  const tags = (entry.tags ?? []).map(normalizeText);
  const keywords =
    getEntryKeywords(entry).map(normalizeText);

  const topicTokens = createTokens(requestedTopic);

  let score = 0;

  /*
   * Exact topic matches receive the greatest priority.
   */
  if (title === topic) {
    score += 10_000;
  }

  if (
    slug === topic ||
    entry.slug.toLowerCase() === topicSlug
  ) {
    score += 9_000;
  }

  /*
   * Strong phrase matches.
   */
  if (title.includes(topic)) {
    score += 3_000;
  }

  if (slug.includes(topic)) {
    score += 2_500;
  }

  if (tags.includes(topic)) {
    score += 2_000;
  }

  if (keywords.includes(topic)) {
    score += 2_000;
  }

  /*
   * Token-level relevance.
   */
  for (const token of topicTokens) {
    if (title.includes(token)) {
      score += 500;
    }

    if (slug.includes(token)) {
      score += 400;
    }

    if (
      tags.some((tag) => tag.includes(token))
    ) {
      score += 300;
    }

    if (
      keywords.some((keyword) =>
        keyword.includes(token),
      )
    ) {
      score += 300;
    }

    if (summary.includes(token)) {
      score += 80;
    }

    if (body.includes(token)) {
      score += 20;
    }
  }

  /*
   * Generic mission records must not override a
   * specific medical or recovery topic.
   */
  const topicIsMission =
    topic === "you are not alone" ||
    topic.includes("anw mission") ||
    topic.includes("community mission");

  if (
    !topicIsMission &&
    isGenericMissionEntry(entry)
  ) {
    score -= 10_000;
  }

  return score;
}

function rankKnowledgeEntries(
  results: KnowledgeSearchResult[],
  requestedTopic: string,
  requestedLimit: number,
): KnowledgeSearchEntry[] {
  const ranked: RankedKnowledgeEntry[] =
    results
      .map(({ entry }) => ({
        entry,
        score: scoreKnowledgeEntry(
          entry,
          requestedTopic,
        ),
      }))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        return left.entry.title.localeCompare(
          right.entry.title,
        );
      });

  const relevantEntries = ranked.filter(
    ({ score }) => score > 0,
  );

  if (relevantEntries.length === 0) {
    return [];
  }

  const bestScore =
    relevantEntries[0]?.score ?? 0;

  /*
   * When an exact match exists, exclude weak,
   * generic, or accidental search matches.
   */
  const minimumAcceptedScore =
    bestScore >= 9_000
      ? 500
      : Math.max(1, Math.floor(bestScore * 0.15));

  return relevantEntries
    .filter(
      ({ score }) =>
        score >= minimumAcceptedScore,
    )
    .slice(0, requestedLimit)
    .map(({ entry }) => entry);
}

export class ContentKnowledgeRetriever {
  public constructor(
    private readonly service: KnowledgeService,
  ) {}

  public async retrieve(
    request: ContentGenerationRequest,
  ): Promise<KnowledgeContextItem[]> {
    /*
     * Retrieve a wider candidate pool before ranking.
     * Otherwise, an imprecise first database result can
     * hide the exact topic match.
     */
    const results =
      await this.service.search({
        text: request.topic,
        approvedOnly: true,
        limit: 20,
      });

    if (results.length === 0) {
      throw new ContentEngineError(
        `No approved knowledge found for "${request.topic}".`,
        "NO_APPROVED_KNOWLEDGE",
      );
    }

    const rankedEntries =
      rankKnowledgeEntries(
        results,
        request.topic,
        request.knowledgeLimit,
      );

    if (rankedEntries.length === 0) {
      throw new ContentEngineError(
        `Approved knowledge was found, but none was sufficiently relevant to "${request.topic}".`,
        "NO_RELEVANT_APPROVED_KNOWLEDGE",
      );
    }

    return rankedEntries.map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      summary: entry.summary,
      body: entry.body,
      category: entry.category,
      tags: entry.tags,
      sourceTitles: entry.sources.map(
        (source) => source.title,
      ),
      reviewedBy: entry.reviewedBy,
      reviewedAt: entry.reviewedAt,
    }));
  }
}

export function validateRequest(
  request: ContentGenerationRequest,
): void {
  if (request.topic.trim().length < 3) {
    throw new ContentEngineError(
      "Topic is too short.",
      "INVALID_REQUEST",
    );
  }

  if (request.formats.length === 0) {
    throw new ContentEngineError(
      "Choose at least one format.",
      "INVALID_REQUEST",
    );
  }

  if (
    request.carouselSlideCount < 5 ||
    request.carouselSlideCount > 20
  ) {
    throw new ContentEngineError(
      "Carousel slide count must be between 5 and 20.",
      "INVALID_REQUEST",
    );
  }

  if (
    request.knowledgeLimit < 1 ||
    request.knowledgeLimit > 20
  ) {
    throw new ContentEngineError(
      "Knowledge limit must be between 1 and 20.",
      "INVALID_REQUEST",
    );
  }
}

export function prompts(
  request: ContentGenerationRequest,
  knowledge: KnowledgeContextItem[],
): {
  system: string;
  user: string;
} {
  const system = [
    "You are the ANW AI-COS Content Engine.",
    "Return only structured output.",
    "Use only the approved knowledge supplied.",
    "Prioritize the first knowledge record because it is the strongest topic match.",
    "Never diagnose, prescribe, promise outcomes, invent statistics or citations, or give absolute medical advice.",
    "All patient-facing medical content requires human review.",
    "Brand: Acoustic Neuroma Warrior.",
    'Mission: "You Are Not Alone."',
    "Website: acousticneuromawarrior.com.",
    "Tone: compassionate, clear, survivor-led, hopeful, and trustworthy.",
    `Carousel must contain exactly ${request.carouselSlideCount} slides.`,
    "Use a meaningful progression: hook, introduction, topic education, practical guidance, takeaways, and final CTA.",
    "Do not repeat identical titles, headlines, or body copy across several slides.",
    'Reserve "You Are Not Alone" primarily for the final CTA instead of using it as every slide title.',
    "Every slide needs an image prompt, design notes, voiceover, alt text, and medical review flag.",
    "Return null for formats not requested.",
  ].join(" ");

  const user = [
    `Topic: ${request.topic}`,
    `Audience: ${request.audience}`,
    `Formats: ${request.formats.join(", ")}`,
    `Tone: ${request.tone}`,
    `Language: ${request.language}`,
    "Approved knowledge, ordered from most relevant to least relevant:",
    JSON.stringify(knowledge, null, 2),
    "Create the complete content bundle.",
    "Use the exact supplied knowledge IDs.",
    "Set status to medical_review.",
    "Set approvedKnowledgeOnly to true.",
  ].join("\n");

  return {
    system,
    user,
  };
}

function contentText(
  bundle: ContentBundle,
): string {
  return JSON.stringify({
    blog: bundle.blog,
    facebook: bundle.facebook,
    carousel: bundle.carousel,
    reel: bundle.reel,
    pinterest: bundle.pinterest,
    email: bundle.email,
    youtube: bundle.youtube,
  });
}

export function safetyReport(
  bundle: ContentBundle,
) {
  const value = contentText(bundle);
  const warnings: string[] = [];

  const containsDiagnosisLanguage =
    /\byou have\b|\bthis means you have\b/i.test(
      value,
    );

  const containsGuaranteedOutcomeLanguage =
    /\bguaranteed\b|\bwill cure\b|\b100%\b/i.test(
      value,
    );

  const containsAbsoluteMedicalAdvice =
    /\byou must choose surgery\b|\bstop taking\b/i.test(
      value,
    );

  if (containsDiagnosisLanguage) {
    warnings.push(
      "Potential diagnostic language detected.",
    );
  }

  if (containsGuaranteedOutcomeLanguage) {
    warnings.push(
      "Guaranteed outcome language detected.",
    );
  }

  if (containsAbsoluteMedicalAdvice) {
    warnings.push(
      "Absolute medical advice detected.",
    );
  }

  return {
    requiresMedicalReview: true,
    approvedKnowledgeOnly:
      bundle.safety.approvedKnowledgeOnly,
    containsDiagnosisLanguage,
    containsGuaranteedOutcomeLanguage,
    containsUnsupportedStatistics: false,
    containsAbsoluteMedicalAdvice,
    warnings,
  };
}

export function brandReport(
  bundle: ContentBundle,
) {
  const value = contentText(bundle);
  const warnings: string[] = [];

  const includesMissionMessage =
    /you are not alone/i.test(value);

  const includesWebsiteBranding =
    /acousticneuromawarrior\.com/i.test(value);

  const compassionateTone =
    !/just get over it/i.test(value);

  if (!includesMissionMessage) {
    warnings.push(
      "Mission message is missing.",
    );
  }

  if (!includesWebsiteBranding) {
    warnings.push(
      "Website branding is missing.",
    );
  }

  if (!compassionateTone) {
    warnings.push(
      "Uncompassionate language detected.",
    );
  }

  return {
    includesMissionMessage,
    includesWebsiteBranding,
    compassionateTone,
    warnings,
  };
}

export class ContentEngineService {
  public constructor(
    private readonly retriever:
      ContentKnowledgeRetriever,
    private readonly provider: ContentProvider,
  ) {}

  public async generate(
    request: ContentGenerationRequest,
  ): Promise<ContentBundle> {
    validateRequest(request);

    const knowledge =
      await this.retriever.retrieve(request);

    const promptValues =
      prompts(request, knowledge);

    const raw =
      await this.provider.generate({
        request,
        knowledge,
        systemPrompt: promptValues.system,
        userPrompt: promptValues.user,
      });

    const bundle: ContentBundle = {
      ...raw,
      id: raw.id || randomUUID(),
      topic: request.topic,
      audience: request.audience,
      language: request.language,
      status: "medical_review",
      knowledgeEntryIds: knowledge.map(
        (entry) => entry.id,
      ),
      knowledgeSnapshot: knowledge,
      generatedAt:
        raw.generatedAt ||
        new Date().toISOString(),
      model: this.provider.model,
    };

    if (
      bundle.carousel &&
      (
        bundle.carousel.slideCount !==
          request.carouselSlideCount ||
        bundle.carousel.slides.length !==
          request.carouselSlideCount
      )
    ) {
      throw new ContentEngineError(
        "Provider returned the wrong carousel slide count.",
        "INVALID_PROVIDER_OUTPUT",
      );
    }

    return {
      ...bundle,
      safety: safetyReport(bundle),
      brand: brandReport(bundle),
    };
  }
}