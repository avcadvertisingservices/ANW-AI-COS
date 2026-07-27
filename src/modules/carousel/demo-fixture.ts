import type { ContentBundle } from "../content/types.js";

export function createCarouselDemoContentBundle(): ContentBundle {
  const topic = "One-Sided Hearing Loss";
  const slideCount = 10;

  const slides = Array.from({ length: slideCount }, (_, index) => {
    const slideNumber = index + 1;
    const isFirst = slideNumber === 1;
    const isLast = slideNumber === slideCount;
    const isTakeaway = slideNumber === slideCount - 1;

    return {
      slideNumber,
      role: isFirst
        ? ("hook" as const)
        : isLast
          ? ("cta" as const)
          : isTakeaway
            ? ("takeaways" as const)
            : slideNumber === 2
              ? ("introduction" as const)
              : ("education" as const),
      title: isFirst
        ? topic
        : isLast
          ? "You Are Not Alone."
          : `What Warriors Should Know — ${slideNumber - 1}`,
      headline: isLast
        ? "Support, education, and hope"
        : "One-sided hearing changes deserve attention and compassionate support.",
      body: isLast
        ? "Continue learning, prepare your questions, and visit acousticneuromawarrior.com."
        : "Hearing changes can affect communication, confidence, energy, and daily routines. This educational slide does not diagnose an individual and should be reviewed before publication.",
      imagePrompt: "A calm, respectful visual representing hearing support and an Acoustic Neuroma warrior journey.",
      designNotes: "Use clean medical icons, premium spacing, and an uncluttered composition.",
      icons: ["ear", "support", "brain"],
      voiceover: isLast
        ? "You are not alone."
        : "Every hearing journey is individual, and support matters.",
      altText: `Educational slide ${slideNumber} about one-sided hearing loss.`,
      callToAction: isLast
        ? "Visit acousticneuromawarrior.com — You Are Not Alone."
        : "",
      medicalReviewFlag: true,
    };
  });

  return {
    id: "11111111-1111-4111-8111-111111111111",
    topic,
    audience: "Acoustic Neuroma patients, survivors, and caregivers",
    language: "English",
    status: "medical_review",
    knowledgeEntryIds: ["knowledge.one-sided-hearing-loss"],
    knowledgeSnapshot: [],
    generatedAt: new Date().toISOString(),
    model: "carousel-demo-fixture",
    blog: null,
    facebook: null,
    carousel: {
      title: "One-Sided Hearing Loss: What Warriors Should Know",
      slideCount,
      caption: "One-sided hearing changes can affect everyday life. This carousel is educational and requires human review before publication. You Are Not Alone. acousticneuromawarrior.com",
      hashtags: ["#AcousticNeuroma", "#HearingLoss", "#YouAreNotAlone"],
      slides,
    },
    reel: null,
    pinterest: null,
    email: null,
    youtube: null,
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
