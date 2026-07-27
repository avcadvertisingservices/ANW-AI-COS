import type {
  CarouselProductionPackage,
  CarouselQualityIssue,
  CarouselQualityReport,
} from "./types.js";

function issue(
  code: string,
  severity: CarouselQualityIssue["severity"],
  message: string,
  slideNumber: number | null = null,
): CarouselQualityIssue {
  return { code, severity, message, slideNumber };
}

export function validateCarouselProductionPackage(
  productionPackage: Omit<CarouselProductionPackage, "quality">,
): CarouselQualityReport {
  const issues: CarouselQualityIssue[] = [];
  const { slides, brand } = productionPackage;

  if (slides.length < 5 || slides.length > 20) {
    issues.push(issue(
      "CAROUSEL_SLIDE_COUNT_INVALID",
      "error",
      "A carousel must contain between 5 and 20 slides.",
    ));
  }

  slides.forEach((slide, index) => {
    const expectedNumber = index + 1;

    if (slide.slideNumber !== expectedNumber) {
      issues.push(issue(
        "CAROUSEL_SLIDE_SEQUENCE_INVALID",
        "error",
        `Expected slide ${expectedNumber}, but received slide ${slide.slideNumber}.`,
        slide.slideNumber,
      ));
    }

    if (!slide.title.trim()) {
      issues.push(issue(
        "CAROUSEL_TITLE_MISSING",
        "error",
        "Slide title is required.",
        slide.slideNumber,
      ));
    }

    if (!slide.altText.trim()) {
      issues.push(issue(
        "CAROUSEL_ALT_TEXT_MISSING",
        "error",
        "Alt text is required for accessibility.",
        slide.slideNumber,
      ));
    }

    if (!slide.productionImagePrompt.trim()) {
      issues.push(issue(
        "CAROUSEL_IMAGE_PROMPT_MISSING",
        "error",
        "Production image prompt is required.",
        slide.slideNumber,
      ));
    }

    if (slide.textMetrics.exceedsRecommendedBodyLength) {
      issues.push(issue(
        "CAROUSEL_BODY_COPY_LONG",
        "warning",
        `Body copy contains ${slide.textMetrics.bodyWords} words; the recommended limit is ${slide.textMetrics.recommendedBodyWordLimit}. Review the copy before design.`,
        slide.slideNumber,
      ));
    }

    if (slide.textMetrics.titleWords > 14) {
      issues.push(issue(
        "CAROUSEL_TITLE_COPY_LONG",
        "warning",
        "The title may be too long for a strong visual hierarchy.",
        slide.slideNumber,
      ));
    }

    if (slide.medicalReviewFlag) {
      issues.push(issue(
        "CAROUSEL_MEDICAL_REVIEW_REQUIRED",
        "info",
        "This slide is marked for medical review before publication.",
        slide.slideNumber,
      ));
    }
  });

  const finalSlide = slides.at(-1);
  if (finalSlide) {
    const finalText = `${finalSlide.title} ${finalSlide.headline} ${finalSlide.body} ${finalSlide.callToAction}`;

    if (!finalText.toLowerCase().includes(brand.missionMessage.toLowerCase())) {
      issues.push(issue(
        "CAROUSEL_MISSION_MESSAGE_MISSING",
        "warning",
        `The final slide should contain the mission message: ${brand.missionMessage}`,
        finalSlide.slideNumber,
      ));
    }

    if (!finalText.toLowerCase().includes(brand.website.toLowerCase())) {
      issues.push(issue(
        "CAROUSEL_WEBSITE_MISSING",
        "warning",
        `The final slide should contain ${brand.website}.`,
        finalSlide.slideNumber,
      ));
    }
  }

  const errorCount = issues.filter((item) => item.severity === "error").length;
  const warningCount = issues.filter((item) => item.severity === "warning").length;
  const infoCount = issues.filter((item) => item.severity === "info").length;

  return {
    passedStructuralValidation: errorCount === 0,
    readyForDesign: errorCount === 0,
    requiresHumanReview: true,
    requiresMedicalReview: slides.some((slide) => slide.medicalReviewFlag),
    errorCount,
    warningCount,
    infoCount,
    issues,
  };
}
