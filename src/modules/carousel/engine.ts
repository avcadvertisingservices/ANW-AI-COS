import { randomUUID } from "node:crypto";
import { ANW_CAROUSEL_BRAND } from "./brand.js";
import {
  chooseCarouselLayout,
  getCarouselCanvas,
  getCarouselLayoutZones,
  getRecommendedBodyWordLimit,
} from "./layout.js";
import { buildProductionImagePrompt } from "./prompts.js";
import type {
  CarouselProductionPackage,
  CarouselProductionRequest,
  CarouselProductionSlide,
  CarouselTextMetrics,
} from "./types.js";
import {
  buildCarouselFilename,
  countWords,
  normalizeCarouselText,
} from "./utils.js";
import { validateCarouselProductionPackage } from "./validator.js";

export class CarouselProductionError extends Error {
  public constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "CarouselProductionError";
  }
}

export class CarouselProductionEngine {
  public create(request: CarouselProductionRequest): CarouselProductionPackage {
    const carousel = request.contentBundle.carousel;

    if (!carousel) {
      throw new CarouselProductionError(
        "The content bundle does not contain carousel content.",
        "CAROUSEL_CONTENT_MISSING",
      );
    }

    if (carousel.slideCount !== carousel.slides.length) {
      throw new CarouselProductionError(
        `Carousel slideCount is ${carousel.slideCount}, but ${carousel.slides.length} slide objects were supplied.`,
        "CAROUSEL_SLIDE_COUNT_MISMATCH",
      );
    }

    const aspectRatio = request.aspectRatio ?? "9:16";
    const platforms = request.platforms ?? ["facebook", "instagram"];
    const version = request.version ?? 1;
    const brand = request.brandTokens ?? ANW_CAROUSEL_BRAND;
    const canvas = getCarouselCanvas(aspectRatio);
    const bodyWordLimit = getRecommendedBodyWordLimit(aspectRatio);

    const slides: CarouselProductionSlide[] = carousel.slides.map((slide) => {
      const layout = chooseCarouselLayout(slide, carousel.slideCount);
      const title = normalizeCarouselText(slide.title);
      const headline = normalizeCarouselText(slide.headline);
      const body = normalizeCarouselText(slide.body);
      const callToAction = normalizeCarouselText(slide.callToAction);

      const textMetrics: CarouselTextMetrics = {
        titleWords: countWords(title),
        headlineWords: countWords(headline),
        bodyWords: countWords(body),
        callToActionWords: countWords(callToAction),
        totalCharacters: `${title}${headline}${body}${callToAction}`.length,
        recommendedBodyWordLimit: bodyWordLimit,
        exceedsRecommendedBodyLength: countWords(body) > bodyWordLimit,
      };

      return {
        slideNumber: slide.slideNumber,
        role: slide.role,
        layout,
        canvas,
        zones: getCarouselLayoutZones(layout),
        title,
        headline,
        body,
        callToAction,
        icons: [...slide.icons],
        voiceover: normalizeCarouselText(slide.voiceover),
        altText: normalizeCarouselText(slide.altText),
        sourceImagePrompt: normalizeCarouselText(slide.imagePrompt),
        productionImagePrompt: buildProductionImagePrompt({
          slide,
          aspectRatio,
          layout,
          brand,
        }),
        designNotes: [
          normalizeCarouselText(slide.designNotes),
          `Use ${brand.typography.titleFamily} for titles and ${brand.typography.bodyFamily} for body copy.`,
          `Keep all important content inside the ${canvas.safeArea.left}px left, ${canvas.safeArea.right}px right, ${canvas.safeArea.top}px top, and ${canvas.safeArea.bottom}px bottom safe areas.`,
          `Footer: ${brand.requiredFooterText}.`,
        ],
        filename: buildCarouselFilename({
          topic: request.contentBundle.topic,
          slideNumber: slide.slideNumber,
          version,
          aspectRatio,
        }),
        textMetrics,
        medicalReviewFlag: slide.medicalReviewFlag,
        copyReviewRequired: textMetrics.exceedsRecommendedBodyLength,
      };
    });

    const packageWithoutQuality = {
      id: randomUUID(),
      contentBundleId: request.contentBundle.id,
      topic: request.contentBundle.topic,
      title: carousel.title,
      caption: carousel.caption,
      hashtags: [...carousel.hashtags],
      status: "medical_review" as const,
      aspectRatio,
      platforms,
      version,
      createdAt: new Date().toISOString(),
      brand,
      canvas,
      slides,
    };

    const quality = validateCarouselProductionPackage(packageWithoutQuality);

    return {
      ...packageWithoutQuality,
      quality,
    };
  }
}
