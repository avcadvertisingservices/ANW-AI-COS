import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { contentBundleSchema } from "./schema.js";

import type {
  ContentBundle,
  ContentProvider,
  ContentProviderInput,
} from "./types.js";

export class MockContentProvider implements ContentProvider {
  public readonly name = "mock";
  public readonly model = "mock-anw-v1";

  public async generate({
    request,
    knowledge,
  }: ContentProviderInput): Promise<ContentBundle> {
    const requestedFormats = new Set(request.formats);
    const primaryKnowledge = knowledge[0];

    if (!primaryKnowledge) {
      throw new Error(
        "At least one approved knowledge record is required.",
      );
    }

    const slides = Array.from(
      { length: request.carouselSlideCount },
      (_, index) => {
        const slideNumber = index + 1;
        const isFirstSlide = slideNumber === 1;
        const isLastSlide =
          slideNumber === request.carouselSlideCount;
        const isTakeawaySlide =
          slideNumber === request.carouselSlideCount - 1;

        const role = isFirstSlide
          ? ("hook" as const)
          : isLastSlide
            ? ("cta" as const)
            : isTakeawaySlide
              ? ("takeaways" as const)
              : slideNumber === 2
                ? ("introduction" as const)
                : ("education" as const);

        return {
          slideNumber,
          role,

          title: isLastSlide
            ? "You Are Not Alone"
            : isFirstSlide
              ? request.topic
              : `${primaryKnowledge.title} - ${slideNumber - 1}`,

          headline: isLastSlide
            ? "Support, education, and hope"
            : primaryKnowledge.summary,

          body: isLastSlide
            ? "Continue learning and discuss personal medical decisions with your healthcare team."
            : primaryKnowledge.body,

          imagePrompt:
            "Create a 9:16 premium Acoustic Neuroma Warrior medical-awareness graphic using dark emerald green, white, and soft sage. Include a small ANW shield logo and subtle acousticneuromawarrior.com branding.",

          designNotes:
            "Use a large readable heading, clean visual hierarchy, generous spacing, compassionate imagery, and small website branding.",

          icons: ["brain", "heart", "support"],

          voiceover: isLastSlide
            ? "You are not alone in this journey."
            : primaryKnowledge.summary,

          altText: `Acoustic Neuroma Warrior educational slide ${slideNumber} about ${request.topic}.`,

          callToAction: isLastSlide
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
        (knowledgeEntry) => knowledgeEntry.id,
      ),

      knowledgeSnapshot: knowledge,
      generatedAt: new Date().toISOString(),
      model: this.model,

      blog: requestedFormats.has("blog")
        ? {
            title: primaryKnowledge.title,
            slug: primaryKnowledge.slug,
            excerpt: primaryKnowledge.summary,
            introduction: primaryKnowledge.summary,

            sections: [
              {
                heading: "What to know",
                body: primaryKnowledge.body,
              },
              {
                heading: "Next steps",
                body:
                  "Use this educational information to prepare questions for a qualified healthcare professional.",
              },
            ],

            conclusion:
              "Every Acoustic Neuroma journey is individual, and compassionate support matters.",

            callToAction:
              "Visit acousticneuromawarrior.com. You Are Not Alone.",

            seoTitle:
              `${primaryKnowledge.title} | Acoustic Neuroma Warrior`,

            seoDescription: primaryKnowledge.summary,
            keywords: primaryKnowledge.tags,
          }
        : null,

      facebook: requestedFormats.has("facebook")
        ? {
            hook:
              `What should warriors know about ${request.topic}?`,

            body:
              `${primaryKnowledge.summary}\n\n${primaryKnowledge.body}`,

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

      carousel: requestedFormats.has("carousel")
        ? {
            title:
              `${request.topic}: What Warriors Should Know`,

            slideCount: request.carouselSlideCount,

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
            title: `${request.topic} in 60 Seconds`,

            hook:
              `Here is what warriors should know about ${request.topic}.`,

            durationSeconds: 60,

            scenes: [
              {
                sceneNumber: 1,
                durationSeconds: 5,
                visual:
                  "Acoustic Neuroma Warrior branded opening screen.",
                onScreenText: request.topic,
                voiceover: primaryKnowledge.summary,
              },
              {
                sceneNumber: 2,
                durationSeconds: 45,
                visual:
                  "Supportive educational visuals related to the topic.",
                onScreenText: "Know the facts",
                voiceover: primaryKnowledge.body,
              },
              {
                sceneNumber: 3,
                durationSeconds: 10,
                visual:
                  "ANW logo with acousticneuromawarrior.com branding.",
                onScreenText: "You Are Not Alone",
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

      pinterest: requestedFormats.has("pinterest")
        ? {
            pinTitle: primaryKnowledge.title,

            pinDescription:
              `${primaryKnowledge.summary} ` +
              "Learn more from Acoustic Neuroma Warrior. " +
              "You Are Not Alone.",

            overlayText: primaryKnowledge.title,

            boardSuggestion:
              "Acoustic Neuroma Education and Support",

            keywords: primaryKnowledge.tags,

            imagePrompt:
              "Create a vertical Pinterest pin using dark emerald green, white, cream, and soft sage. Use premium medical-awareness styling, readable typography, a small ANW shield logo, and subtle acousticneuromawarrior.com branding.",

            destinationPath:
              `https://acousticneuromawarrior.com/${primaryKnowledge.slug}`,
          }
        : null,

      email: requestedFormats.has("email")
        ? {
            subject:
              `${primaryKnowledge.title}: A Warrior Guide`,

            previewText: primaryKnowledge.summary,

            greeting: "Dear Warrior,",

            body:
              `${primaryKnowledge.summary}\n\n` +
              `${primaryKnowledge.body}\n\n` +
              "This information is for general education and support. " +
              "Please discuss personal medical concerns with your healthcare team.",

            callToActionLabel: "Continue Learning",

            callToActionPath:
              "https://acousticneuromawarrior.com",

            closing:
              "You Are Not Alone.\n\n" +
              "With compassion,\n" +
              "Acoustic Neuroma Warrior",
          }
        : null,

      youtube: requestedFormats.has("youtube")
        ? {
            title:
              `${primaryKnowledge.title} | Acoustic Neuroma Warrior`,

            thumbnailText: primaryKnowledge.title,

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
                title: "What warriors should know",
              },
              {
                timestamp: "02:00",
                title: "Questions for your healthcare team",
              },
              {
                timestamp: "03:00",
                title: "You Are Not Alone",
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

export class OpenAIContentProvider implements ContentProvider {
  public readonly name = "openai";
  public readonly model: string;

  private readonly client: OpenAI;

  public constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is required for the live OpenAI provider.",
      );
    }

    this.model =
      process.env.OPENAI_MODEL ?? "gpt-5.6";

    this.client = new OpenAI({
      apiKey,
    });
  }

  public async generate(
    input: ContentProviderInput,
  ): Promise<ContentBundle> {
    const response = await this.client.responses.parse({
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

    const parsedBundle = response.output_parsed;

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
              knowledgeEntry.reviewedBy ?? undefined,

            reviewedAt:
              knowledgeEntry.reviewedAt ?? undefined,
          }),
        ),
    } as ContentBundle;
  }
}