import { randomUUID } from "node:crypto";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { contentBundleSchema } from "./schema.js";

import type {
  ContentBundle,
  ContentProvider,
  ContentProviderInput,
  KnowledgeContextItem,
} from "./types.js";

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function shorten(
  value: string,
  maximumLength = 260,
): string {
  const normalized = normalizeWhitespace(value);

  if (normalized.length <= maximumLength) {
    return normalized;
  }

  const shortened = normalized
    .slice(0, maximumLength - 1)
    .trimEnd();

  return `${shortened}…`;
}

function splitIntoApprovedPoints(
  knowledge: KnowledgeContextItem[],
): string[] {
  const candidates: string[] = [];

  for (const entry of knowledge) {
    candidates.push(entry.summary);

    const bodyPoints = entry.body
      .split(
        /(?<=[.!?])\s+|\n+|(?:\s*[•▪◦]\s*)/,
      )
      .map((point) => normalizeWhitespace(point))
      .filter((point) => point.length >= 15);

    candidates.push(...bodyPoints);
  }

  const uniquePoints = new Map<string, string>();

  for (const candidate of candidates) {
    const cleaned = shorten(candidate);

    if (!cleaned) {
      continue;
    }

    const key = cleaned
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

    if (!uniquePoints.has(key)) {
      uniquePoints.set(key, cleaned);
    }
  }

  return [...uniquePoints.values()];
}

function getApprovedPoint(
  points: string[],
  index: number,
  fallback: string,
): string {
  if (points.length === 0) {
    return shorten(fallback);
  }

  return points[index % points.length] ?? shorten(fallback);
}

function createSlideRole(
  slideNumber: number,
  slideCount: number,
):
  | "hook"
  | "introduction"
  | "education"
  | "tips"
  | "survivor-insight"
  | "takeaways"
  | "cta" {
  if (slideNumber === 1) {
    return "hook";
  }

  if (slideNumber === 2) {
    return "introduction";
  }

  if (slideNumber === slideCount) {
    return "cta";
  }

  if (slideNumber === slideCount - 1) {
    return "takeaways";
  }

  if (slideNumber === 5) {
    return "tips";
  }

  if (slideNumber === 7) {
    return "survivor-insight";
  }

  return "education";
}

function createSlideTitle(
  slideNumber: number,
  slideCount: number,
  topic: string,
  primaryKnowledge: KnowledgeContextItem,
): string {
  if (slideNumber === 1) {
    return topic;
  }

  if (slideNumber === 2) {
    return `Understanding ${primaryKnowledge.title}`;
  }

  if (slideNumber === slideCount) {
    return "You Are Not Alone";
  }

  if (slideNumber === slideCount - 1) {
    return "Key Takeaways";
  }

  const standardTitles = [
    "What the Approved Knowledge Says",
    "A Key Point to Understand",
    "Questions Worth Asking",
    "Why Trusted Information Matters",
    "Every Experience Is Individual",
    "Preparing for Your Next Conversation",
    "Support Through Knowledge",
    "Moving Forward With Clarity",
    "Important Points to Remember",
    "Your Healthcare Questions Matter",
  ];

  return (
    standardTitles[
      (slideNumber - 3) % standardTitles.length
    ] ?? `Important Point ${slideNumber - 2}`
  );
}

function createSlideHeadline(
  slideNumber: number,
  slideCount: number,
  primaryKnowledge: KnowledgeContextItem,
): string {
  if (slideNumber === 1) {
    return `What every warrior should know about ${primaryKnowledge.title}`;
  }

  if (slideNumber === 2) {
    return primaryKnowledge.summary;
  }

  if (slideNumber === slideCount) {
    return "Support, education, and hope";
  }

  if (slideNumber === slideCount - 1) {
    return "Keep the most important information close";
  }

  const headlines = [
    "Start with reviewed, approved information",
    "Break the topic into clear, manageable points",
    "Write down questions for your healthcare team",
    "Personal experiences and needs can differ",
    "Reliable education can make conversations easier",
    "Use this information to support—not replace—medical care",
    "Compassion belongs in every part of the journey",
    "You deserve clear explanations and respectful support",
    "Learning one step at a time is enough",
    "Trusted knowledge can help you feel more prepared",
  ];

  return (
    headlines[
      (slideNumber - 3) % headlines.length
    ] ?? primaryKnowledge.summary
  );
}

function createSlideBody(
  slideNumber: number,
  slideCount: number,
  approvedPoints: string[],
  primaryKnowledge: KnowledgeContextItem,
): string {
  const summary = shorten(primaryKnowledge.summary);
  const body = shorten(primaryKnowledge.body);

  if (slideNumber === 1) {
    return summary;
  }

  if (slideNumber === 2) {
    return [
      "Approved overview:",
      getApprovedPoint(
        approvedPoints,
        0,
        summary,
      ),
    ].join(" ");
  }

  if (slideNumber === slideCount) {
    return (
      "Continue learning, write down your questions, " +
      "and discuss personal medical decisions with your healthcare team."
    );
  }

  if (slideNumber === slideCount - 1) {
    const firstPoint = getApprovedPoint(
      approvedPoints,
      0,
      summary,
    );

    const secondPoint = getApprovedPoint(
      approvedPoints,
      1,
      body,
    );

    return shorten(
      `Remember these approved points: ${firstPoint} ${secondPoint}`,
    );
  }

  const pointIndex = slideNumber - 3;

  const approvedPoint = getApprovedPoint(
    approvedPoints,
    pointIndex,
    body,
  );

  const bodyTemplates = [
    `The reviewed knowledge explains: ${approvedPoint}`,

    `One approved point to understand is this: ${approvedPoint}`,

    `Use this approved information to prepare questions: ${approvedPoint}`,

    `For clearer understanding, keep this reviewed point in mind: ${approvedPoint}`,

    `Every experience is individual. The approved context says: ${approvedPoint}`,

    `Before making personal medical decisions, discuss this reviewed information with your healthcare team: ${approvedPoint}`,

    `Trusted education can support better conversations. Approved context: ${approvedPoint}`,

    `A compassionate, informed approach begins with this reviewed point: ${approvedPoint}`,

    `This approved information may help you organize your questions: ${approvedPoint}`,

    `Another important reviewed point is: ${approvedPoint}`,
  ];

  return shorten(
    bodyTemplates[
      pointIndex % bodyTemplates.length
    ] ?? approvedPoint,
  );
}

function createImagePrompt(
  slideNumber: number,
  slideCount: number,
  topic: string,
  role: string,
): string {
  const finalSlide =
    slideNumber === slideCount;

  return [
    "Create a 9:16 premium Acoustic Neuroma Warrior medical-awareness graphic.",
    `Topic: ${topic}.`,
    `Slide role: ${role}.`,
    "Use dark emerald green, white, cream, and soft sage.",
    "Use a strong readable title hierarchy, clean medical iconography, elegant botanical accents, and generous negative space.",
    "Include a small official ANW shield logo with white awareness ribbon.",
    "Include small subtle acousticneuromawarrior.com branding.",
    finalSlide
      ? 'Create a hopeful closing composition centered on the message "You Are Not Alone."'
      : "Create a compassionate educational composition appropriate for editable text overlays.",
    "Do not render paragraphs or tiny text inside the artwork.",
    "Avoid graphic surgery, frightening imagery, exaggerated claims, and guaranteed outcomes.",
  ].join(" ");
}

export class MockContentProvider
  implements ContentProvider
{
  public readonly name = "mock";
  public readonly model = "mock-anw-v1.3.1";

  public async generate({
    request,
    knowledge,
  }: ContentProviderInput): Promise<ContentBundle> {
    const requestedFormats = new Set(
      request.formats,
    );

    const primaryKnowledge = knowledge[0];

    if (!primaryKnowledge) {
      throw new Error(
        "At least one approved knowledge record is required.",
      );
    }

    const approvedPoints =
      splitIntoApprovedPoints(knowledge);

    const slides = Array.from(
      {
        length: request.carouselSlideCount,
      },
      (_, index) => {
        const slideNumber = index + 1;

        const role = createSlideRole(
          slideNumber,
          request.carouselSlideCount,
        );

        const title = createSlideTitle(
          slideNumber,
          request.carouselSlideCount,
          request.topic,
          primaryKnowledge,
        );

        const headline = createSlideHeadline(
          slideNumber,
          request.carouselSlideCount,
          primaryKnowledge,
        );

        const body = createSlideBody(
          slideNumber,
          request.carouselSlideCount,
          approvedPoints,
          primaryKnowledge,
        );

        const isFinalSlide =
          slideNumber ===
          request.carouselSlideCount;

        return {
          slideNumber,
          role,
          title,
          headline,
          body,

          imagePrompt: createImagePrompt(
            slideNumber,
            request.carouselSlideCount,
            request.topic,
            role,
          ),

          designNotes:
            "Use a large readable heading, clear visual hierarchy, generous spacing, accessible contrast, small ANW logo, and subtle acousticneuromawarrior.com branding.",

          icons:
            role === "cta"
              ? ["heart", "support", "community"]
              : role === "tips"
                ? ["notes", "question", "medical-team"]
                : [
                    "brain",
                    "hearing",
                    "education",
                  ],

          voiceover: isFinalSlide
            ? "You are not alone in this journey. Continue learning and bring your personal questions to your healthcare team."
            : body,

          altText:
            `Acoustic Neuroma Warrior slide ${slideNumber} of ${request.carouselSlideCount} about ${request.topic}. ${headline}`,

          callToAction: isFinalSlide
            ? "Visit acousticneuromawarrior.com"
            : "",

          medicalReviewFlag: true,
        };
      },
    );

    return {
      id: randomUUID(),
      topic: request.topic,
      audience: request.audience,
      language: request.language,
      status: "medical_review",

      knowledgeEntryIds: knowledge.map(
        (entry) => entry.id,
      ),

      knowledgeSnapshot: knowledge,
      generatedAt: new Date().toISOString(),
      model: this.model,

      blog: requestedFormats.has("blog")
        ? {
            title: primaryKnowledge.title,
            slug: primaryKnowledge.slug,
            excerpt: primaryKnowledge.summary,
            introduction:
              primaryKnowledge.summary,

            sections: approvedPoints
              .slice(0, 5)
              .map((point, index) => ({
                heading:
                  index === 0
                    ? "What to know"
                    : `Approved point ${index + 1}`,
                body: point,
              })),

            conclusion:
              "Every Acoustic Neuroma journey is individual. Trusted education and compassionate support can help you prepare for conversations with your healthcare team.",

            callToAction:
              "Visit acousticneuromawarrior.com. You Are Not Alone.",

            seoTitle:
              `${primaryKnowledge.title} | Acoustic Neuroma Warrior`,

            seoDescription:
              primaryKnowledge.summary,

            keywords: primaryKnowledge.tags,
          }
        : null,

      facebook: requestedFormats.has(
        "facebook",
      )
        ? {
            hook:
              `What should warriors know about ${request.topic}?`,

            body:
              `${primaryKnowledge.summary}\n\n` +
              `${primaryKnowledge.body}\n\n` +
              "This information is for general education and support. " +
              "Discuss personal concerns with your healthcare team.",

            callToAction:
              "Share your experience respectfully in the comments. You Are Not Alone.",

            hashtags: [
              "#AcousticNeuromaWarrior",
              "#AcousticNeuroma",
              "#VestibularSchwannoma",
              "#YouAreNotAlone",
            ],

            firstComment:
              "Learn more at acousticneuromawarrior.com",
          }
        : null,

      carousel: requestedFormats.has(
        "carousel",
      )
        ? {
            title:
              `${request.topic}: What Warriors Should Know`,

            slideCount:
              request.carouselSlideCount,

            caption:
              `${primaryKnowledge.summary}\n\n` +
              "This content is for general education and support only. " +
              "Discuss personal medical concerns with your healthcare team.\n\n" +
              "You Are Not Alone.\n\n" +
              "acousticneuromawarrior.com",

            hashtags: [
              "#AcousticNeuroma",
              "#AcousticNeuromaWarrior",
              "#VestibularSchwannoma",
              "#BrainTumorAwareness",
              "#YouAreNotAlone",
            ],

            slides,
          }
        : null,

      reel: requestedFormats.has("reel")
        ? {
            title:
              `${request.topic} in 60 Seconds`,

            hook:
              `Here is what warriors should know about ${request.topic}.`,

            durationSeconds: 60,

            scenes: [
              {
                sceneNumber: 1,
                durationSeconds: 6,
                visual:
                  "ANW branded opening screen with clear topic title.",
                onScreenText: request.topic,
                voiceover:
                  primaryKnowledge.summary,
              },
              {
                sceneNumber: 2,
                durationSeconds: 24,
                visual:
                  "Compassionate educational visuals related to the approved topic.",
                onScreenText:
                  "Start with approved information",
                voiceover: getApprovedPoint(
                  approvedPoints,
                  0,
                  primaryKnowledge.body,
                ),
              },
              {
                sceneNumber: 3,
                durationSeconds: 20,
                visual:
                  "Notebook and healthcare discussion visual.",
                onScreenText:
                  "Write down your questions",
                voiceover: getApprovedPoint(
                  approvedPoints,
                  1,
                  primaryKnowledge.summary,
                ),
              },
              {
                sceneNumber: 4,
                durationSeconds: 10,
                visual:
                  "ANW logo and website closing screen.",
                onScreenText:
                  "You Are Not Alone",
                voiceover:
                  "Continue learning at acousticneuromawarrior.com. You are not alone.",
              },
            ],

            caption:
              `${primaryKnowledge.summary}\n\n` +
              "Educational content only. Discuss personal medical concerns with your healthcare team.",

            callToAction:
              "Follow Acoustic Neuroma Warrior for trusted education, support, and community.",

            hashtags: [
              "#AcousticNeuromaWarrior",
              "#AcousticNeuroma",
              "#YouAreNotAlone",
            ],
          }
        : null,

      pinterest: requestedFormats.has(
        "pinterest",
      )
        ? {
            pinTitle:
              primaryKnowledge.title,

            pinDescription:
              `${primaryKnowledge.summary} ` +
              "Learn more from Acoustic Neuroma Warrior. " +
              "You Are Not Alone.",

            overlayText:
              primaryKnowledge.title,

            boardSuggestion:
              "Acoustic Neuroma Education and Support",

            keywords: primaryKnowledge.tags,

            imagePrompt:
              "Create a vertical Pinterest pin using dark emerald green, white, cream, and soft sage. Use premium medical-awareness styling, readable typography, a small official ANW shield logo, and subtle acousticneuromawarrior.com branding.",

            destinationPath:
              `https://acousticneuromawarrior.com/${primaryKnowledge.slug}`,
          }
        : null,

      email: requestedFormats.has("email")
        ? {
            subject:
              `${primaryKnowledge.title}: A Warrior Guide`,

            previewText:
              primaryKnowledge.summary,

            greeting: "Dear Warrior,",

            body:
              `${primaryKnowledge.summary}\n\n` +
              `${primaryKnowledge.body}\n\n` +
              "This information is for general education and support. " +
              "Please discuss personal medical concerns with your healthcare team.",

            callToActionLabel:
              "Continue Learning",

            callToActionPath:
              "https://acousticneuromawarrior.com",

            closing:
              "You Are Not Alone.\n\n" +
              "With compassion,\n" +
              "Acoustic Neuroma Warrior",
          }
        : null,

      youtube: requestedFormats.has(
        "youtube",
      )
        ? {
            title:
              `${primaryKnowledge.title} | Acoustic Neuroma Warrior`,

            thumbnailText:
              primaryKnowledge.title,

            description:
              `${primaryKnowledge.summary}\n\n` +
              "This video is for general education and support only. " +
              "Discuss personal medical concerns with your healthcare team.\n\n" +
              "Learn more at acousticneuromawarrior.com\n\n" +
              "You Are Not Alone.",

            hook:
              `What should you know about ${request.topic}?`,

            script:
              `${primaryKnowledge.summary}\n\n` +
              `${primaryKnowledge.body}\n\n` +
              "Every Acoustic Neuroma journey is different. " +
              "Discuss personal medical questions and treatment decisions with your healthcare team.\n\n" +
              "You Are Not Alone.",

            callToAction:
              "Subscribe and visit acousticneuromawarrior.com for more trusted education and support.",

            chapters: [
              {
                timestamp: "00:00",
                title: "Introduction",
              },
              {
                timestamp: "00:30",
                title:
                  "What the approved knowledge says",
              },
              {
                timestamp: "02:00",
                title:
                  "Questions for your healthcare team",
              },
              {
                timestamp: "03:00",
                title:
                  "You Are Not Alone",
              },
            ],

            tags: primaryKnowledge.tags,
          }
        : null,

      safety: {
        requiresMedicalReview: true,
        approvedKnowledgeOnly: true,
        containsDiagnosisLanguage: false,
        containsGuaranteedOutcomeLanguage: false,
        containsUnsupportedStatistics: false,
        containsAbsoluteMedicalAdvice: false,
        warnings: [],
      },

      brand: {
        includesMissionMessage: true,
        includesWebsiteBranding: true,
        compassionateTone: true,
        warnings: [],
      },
    };
  }
}

export class OpenAIContentProvider
  implements ContentProvider
{
  public readonly name = "openai";
  public readonly model: string;

  private readonly client: OpenAI;

  public constructor() {
    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is required for the live OpenAI provider.",
      );
    }

    this.model =
      process.env.OPENAI_MODEL ??
      "gpt-5.6";

    this.client = new OpenAI({
      apiKey,
    });
  }

  public async generate(
    input: ContentProviderInput,
  ): Promise<ContentBundle> {
    const response =
      await this.client.responses.parse({
        model: this.model,

        input: [
          {
            role: "system",
            content: input.systemPrompt,
          },
          {
            role: "user",
            content: input.userPrompt,
          },
        ],

        text: {
          format: zodTextFormat(
            contentBundleSchema,
            "anw_content_bundle",
          ),
        },
      });

    const parsedBundle =
      response.output_parsed;

    if (!parsedBundle) {
      throw new Error(
        "OpenAI returned no parsed content bundle.",
      );
    }

    return {
      ...parsedBundle,
      model: this.model,

      knowledgeSnapshot:
        parsedBundle.knowledgeSnapshot.map(
          (knowledgeEntry) => ({
            ...knowledgeEntry,

            reviewedBy:
              knowledgeEntry.reviewedBy ??
              undefined,

            reviewedAt:
              knowledgeEntry.reviewedAt ??
              undefined,
          }),
        ),
    } as ContentBundle;
  }
}