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

type KnowledgeEntry =
  KnowledgeSearchResult["entry"];

interface RankedKnowledgeEntry {
  entry: KnowledgeEntry;
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

function tokenize(value: string): string[] {
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

function getStringArrayProperty(
  entry: KnowledgeEntry,
  propertyName: "keywords" | "aliases",
): string[] {
  if (
    propertyName in entry &&
    Array.isArray(entry[propertyName])
  ) {
    return entry[propertyName].filter(
      (value): value is string =>
        typeof value === "string",
    );
  }

  return [];
}

function isGenericMissionEntry(
  entry: KnowledgeEntry,
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
  entry: KnowledgeEntry,
  requestedTopic: string,
): number {
  const topic = normalizeText(requestedTopic);

  const title = normalizeText(entry.title);
  const slug = normalizeText(entry.slug);
  const summary = normalizeText(entry.summary);
  const body = normalizeText(entry.body);
  const category = normalizeText(
    String(entry.category ?? ""),
  );

  const tags = (entry.tags ?? []).map(
    normalizeText,
  );

  const keywords =
    getStringArrayProperty(
      entry,
      "keywords",
    ).map(normalizeText);

  const aliases =
    getStringArrayProperty(
      entry,
      "aliases",
    ).map(normalizeText);

  const topicTokens = tokenize(requestedTopic);

  let score = 0;

  /*
   * Exact matches receive the strongest ranking.
   */
  if (title === topic) {
    score += 10_000;
  }

  if (slug === topic) {
    score += 9_500;
  }

  if (aliases.includes(topic)) {
    score += 9_000;
  }

  if (keywords.includes(topic)) {
    score += 8_500;
  }

  if (tags.includes(topic)) {
    score += 8_000;
  }

  /*
   * Phrase matches.
   */
  if (title.includes(topic)) {
    score += 3_000;
  }

  if (slug.includes(topic)) {
    score += 2_800;
  }

  if (
    aliases.some((alias) =>
      alias.includes(topic),
    )
  ) {
    score += 2_500;
  }

  if (
    keywords.some((keyword) =>
      keyword.includes(topic),
    )
  ) {
    score += 2_300;
  }

  if (
    tags.some((tag) =>
      tag.includes(topic),
    )
  ) {
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
      score += 450;
    }

    if (
      aliases.some((alias) =>
        alias.includes(token),
      )
    ) {
      score += 400;
    }

    if (
      keywords.some((keyword) =>
        keyword.includes(token),
      )
    ) {
      score += 350;
    }

    if (
      tags.some((tag) =>
        tag.includes(token),
      )
    ) {
      score += 300;
    }

    if (summary.includes(token)) {
      score += 100;
    }

    if (body.includes(token)) {
      score += 25;
    }

    if (category.includes(token)) {
      score += 50;
    }
  }

  /*
   * Extra support for hearing-loss terminology.
   */
  if (
    topic.includes("hearing") &&
    (
      title.includes("hearing") ||
      slug.includes("hearing") ||
      summary.includes("hearing") ||
      tags.some((tag) =>
        tag.includes("hearing"),
      ) ||
      keywords.some((keyword) =>
        keyword.includes("hearing"),
      )
    )
  ) {
    score += 500;
  }

  if (
    topic.includes("one sided") &&
    (
      title.includes("one sided") ||
      slug.includes("one sided") ||
      aliases.some((alias) =>
        alias.includes("one sided"),
      ) ||
      keywords.some((keyword) =>
        keyword.includes("one sided"),
      ) ||
      aliases.some((alias) =>
        alias.includes("unilateral"),
      ) ||
      keywords.some((keyword) =>
        keyword.includes("unilateral"),
      )
    )
  ) {
    score += 500;
  }

  /*
   * A generic mission record must never replace a
   * specific medical, symptom, recovery, or treatment topic.
   */
  const topicIsMission =
    topic === "you are not alone" ||
    topic.includes("anw mission") ||
    topic.includes("community mission");

  if (
    !topicIsMission &&
    isGenericMissionEntry(entry)
  ) {
    score -= 20_000;
  }

  return score;
}

function rankKnowledgeEntries(
  results: KnowledgeSearchResult[],
  requestedTopic: string,
  requestedLimit: number,
): KnowledgeEntry[] {
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
    const diagnostic = ranked
      .slice(0, 5)
      .map(
        ({ entry, score }) =>
          `${entry.slug}:${score}`,
      )
      .join(", ");

    throw new ContentEngineError(
      [
        `Approved knowledge was found, but none was sufficiently relevant to "${requestedTopic}".`,
        diagnostic
          ? `Top results: ${diagnostic}`
          : "No ranked results were available.",
      ].join(" "),
      "NO_RELEVANT_APPROVED_KNOWLEDGE",
    );
  }

  const bestScore =
    relevantEntries[0]?.score ?? 0;

  /*
   * When an exact match exists, allow only strongly
   * related supporting records.
   */
  const minimumAcceptedScore =
    bestScore >= 8_000
      ? 500
      : Math.max(
          1,
          Math.floor(bestScore * 0.15),
        );

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
     * Retrieve a wider candidate pool before applying
     * ANW-specific topic relevance ranking.
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

    return rankedEntries.map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      summary: entry.summary,
      body: entry.body,
      category: entry.category,
      tags: entry.tags ?? [],

      sourceTitles:
        (entry.sources ?? []).map(
          (source) => source.title,
        ),

      reviewedBy:
        entry.reviewedBy,

      reviewedAt:
        entry.reviewedAt,
    }));
  }
}

export function validateRequest(
  request: ContentGenerationRequest,
): void {
  if (
    request.topic.trim().length < 3
  ) {
    throw new ContentEngineError(
      "Topic is too short.",
      "INVALID_REQUEST",
    );
  }

  if (
    request.audience.trim().length < 3
  ) {
    throw new ContentEngineError(
      "Audience is too short.",
      "INVALID_REQUEST",
    );
  }

  if (
    request.formats.length === 0
  ) {
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
    "The first knowledge record is the strongest topic match.",
    "Never diagnose an individual.",
    "Never prescribe treatment.",
    "Never promise outcomes.",
    "Never invent statistics, citations, doctors, hospitals, or research.",
    "Never give absolute medical advice.",
    "All patient-facing medical content requires human review.",
    "Brand: Acoustic Neuroma Warrior.",
    'Mission: "You Are Not Alone."',
    "Website: acousticneuromawarrior.com.",
    "Tone: compassionate, clear, survivor-led, hopeful, and trustworthy.",
    `Carousel must contain exactly ${request.carouselSlideCount} slides.`,
    "Use a meaningful progression: hook, introduction, topic education, practical guidance, takeaways, and final CTA.",
    "Do not repeat identical titles, headlines, or body copy across several slides.",
    'Reserve "You Are Not Alone" mainly for the final CTA.',
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
    JSON.stringify(
      knowledge,
      null,
      2,
    ),
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
    /\bguaranteed\b|\bwill cure\b|\bwill fully recover\b|\b100%\b/i.test(
      value,
    );

  const containsAbsoluteMedicalAdvice =
    /\byou must choose surgery\b|\bstop taking\b|\bdo not take\b/i.test(
      value,
    );

  if (containsDiagnosisLanguage) {
    warnings.push(
      "Potential diagnostic language detected.",
    );
  }

  if (
    containsGuaranteedOutcomeLanguage
  ) {
    warnings.push(
      "Guaranteed outcome language detected.",
    );
  }

  if (
    containsAbsoluteMedicalAdvice
  ) {
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
    /acousticneuromawarrior\.com/i.test(
      value,
    );

  const compassionateTone =
    !/just get over it|stop complaining|you are weak/i.test(
      value,
    );

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

    private readonly provider:
      ContentProvider,
  ) {}

  public async generate(
    request: ContentGenerationRequest,
  ): Promise<ContentBundle> {
    validateRequest(request);

    const knowledge =
      await this.retriever.retrieve(
        request,
      );

    const promptValues =
      prompts(request, knowledge);

    const raw =
      await this.provider.generate({
        request,
        knowledge,

        systemPrompt:
          promptValues.system,

        userPrompt:
          promptValues.user,
      });

    const bundle: ContentBundle = {
      ...raw,

      id:
        raw.id ||
        randomUUID(),

      topic:
        request.topic,

      audience:
        request.audience,

      language:
        request.language,

      status:
        "medical_review",

      knowledgeEntryIds:
        knowledge.map(
          (entry) => entry.id,
        ),

      knowledgeSnapshot:
        knowledge,

      generatedAt:
        raw.generatedAt ||
        new Date().toISOString(),

      model:
        this.provider.model,
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

    const safety =
      safetyReport(bundle);

    const brand =
      brandReport(bundle);

    return {
      ...bundle,
      safety,
      brand,
      status: "medical_review",
    };
  }
}