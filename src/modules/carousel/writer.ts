import { promises as fs } from "node:fs";
import path from "node:path";
import {
  carouselPackageToCanvaCsv,
  carouselPackageToImagePromptDocument,
  carouselPackageToJson,
  carouselPackageToStoryboardMarkdown,
} from "./exporters.js";
import type {
  CarouselProductionPackage,
  CarouselWrittenFiles,
} from "./types.js";
import { slugifyCarouselValue } from "./utils.js";

function safeTimestamp(value: string): string {
  return value.replace(/[:.]/g, "-");
}

export async function writeCarouselProductionPackage(
  productionPackage: CarouselProductionPackage,
  outputRoot = path.resolve(process.cwd(), "output", "carousels"),
): Promise<CarouselWrittenFiles> {
  const outputDirectory = path.join(
    outputRoot,
    slugifyCarouselValue(productionPackage.topic),
    safeTimestamp(productionPackage.createdAt),
  );
  const slideDirectory = path.join(outputDirectory, "slides");

  await fs.mkdir(slideDirectory, { recursive: true });

  const manifestPath = path.join(outputDirectory, "carousel-manifest.json");
  const canvaCsvPath = path.join(outputDirectory, "canva-bulk-create.csv");
  const storyboardPath = path.join(outputDirectory, "storyboard.md");
  const imagePromptsPath = path.join(outputDirectory, "image-prompts.txt");

  await Promise.all([
    fs.writeFile(manifestPath, carouselPackageToJson(productionPackage), "utf8"),
    fs.writeFile(canvaCsvPath, carouselPackageToCanvaCsv(productionPackage), "utf8"),
    fs.writeFile(storyboardPath, carouselPackageToStoryboardMarkdown(productionPackage), "utf8"),
    fs.writeFile(imagePromptsPath, carouselPackageToImagePromptDocument(productionPackage), "utf8"),
    ...productionPackage.slides.flatMap((slide) => [
      fs.writeFile(
        path.join(slideDirectory, `slide-${String(slide.slideNumber).padStart(2, "0")}-copy.json`),
        JSON.stringify({
          slideNumber: slide.slideNumber,
          role: slide.role,
          layout: slide.layout,
          title: slide.title,
          headline: slide.headline,
          body: slide.body,
          callToAction: slide.callToAction,
          voiceover: slide.voiceover,
          altText: slide.altText,
          filename: slide.filename,
          medicalReviewFlag: slide.medicalReviewFlag,
          copyReviewRequired: slide.copyReviewRequired,
        }, null, 2),
        "utf8",
      ),
      fs.writeFile(
        path.join(slideDirectory, `slide-${String(slide.slideNumber).padStart(2, "0")}-image-prompt.txt`),
        slide.productionImagePrompt,
        "utf8",
      ),
    ]),
  ]);

  return {
    outputDirectory,
    manifestPath,
    canvaCsvPath,
    storyboardPath,
    imagePromptsPath,
    slideDirectory,
  };
}
