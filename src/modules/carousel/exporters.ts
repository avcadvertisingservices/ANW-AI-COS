import type { CarouselProductionPackage } from "./types.js";
import { escapeCsvCell } from "./utils.js";

export function carouselPackageToCanvaCsv(productionPackage: CarouselProductionPackage): string {
  const headers = [
    "slide_number",
    "role",
    "layout",
    "title",
    "headline",
    "body",
    "call_to_action",
    "icons",
    "image_prompt",
    "design_notes",
    "voiceover",
    "alt_text",
    "website",
    "logo_asset",
    "background_hex",
    "text_hex",
    "accent_hex",
    "filename",
    "medical_review_required",
    "copy_review_required",
  ];

  const rows = productionPackage.slides.map((slide) => [
    slide.slideNumber,
    slide.role,
    slide.layout,
    slide.title,
    slide.headline,
    slide.body,
    slide.callToAction,
    slide.icons.join(" | "),
    slide.productionImagePrompt,
    slide.designNotes.join(" | "),
    slide.voiceover,
    slide.altText,
    productionPackage.brand.website,
    productionPackage.brand.logoAssetName,
    productionPackage.brand.palette.cream,
    productionPackage.brand.palette.charcoal,
    productionPackage.brand.palette.emerald,
    slide.filename,
    slide.medicalReviewFlag,
    slide.copyReviewRequired,
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
}

export function carouselPackageToStoryboardMarkdown(
  productionPackage: CarouselProductionPackage,
): string {
  const lines: string[] = [
    `# ${productionPackage.title}`,
    "",
    `- Package ID: ${productionPackage.id}`,
    `- Topic: ${productionPackage.topic}`,
    `- Aspect ratio: ${productionPackage.aspectRatio}`,
    `- Canvas: ${productionPackage.canvas.width} × ${productionPackage.canvas.height}`,
    `- Status: ${productionPackage.status}`,
    `- Structural validation: ${productionPackage.quality.passedStructuralValidation ? "PASS" : "FAIL"}`,
    `- Human review required: YES`,
    "",
  ];

  for (const slide of productionPackage.slides) {
    lines.push(
      `## Slide ${slide.slideNumber} — ${slide.role}`,
      "",
      `**Layout:** ${slide.layout}`,
      "",
      `**Title:** ${slide.title}`,
      "",
      `**Headline:** ${slide.headline}`,
      "",
      `**Body:** ${slide.body}`,
      "",
      `**CTA:** ${slide.callToAction || "None"}`,
      "",
      `**Image prompt:** ${slide.productionImagePrompt}`,
      "",
      `**Voiceover:** ${slide.voiceover}`,
      "",
      `**Alt text:** ${slide.altText}`,
      "",
      `**Filename:** ${slide.filename}`,
      "",
      `**Medical review:** ${slide.medicalReviewFlag ? "Required" : "Not flagged"}`,
      `**Copy review:** ${slide.copyReviewRequired ? "Required" : "Within recommended length"}`,
      "",
      "---",
      "",
    );
  }

  lines.push(
    "## Caption",
    "",
    productionPackage.caption,
    "",
    productionPackage.hashtags.join(" "),
    "",
  );

  return lines.join("\n");
}

export function carouselPackageToImagePromptDocument(
  productionPackage: CarouselProductionPackage,
): string {
  return productionPackage.slides
    .map((slide) => [
      `SLIDE ${slide.slideNumber}`,
      `FILENAME: ${slide.filename}`,
      `PROMPT: ${slide.productionImagePrompt}`,
    ].join("\n"))
    .join("\n\n---\n\n");
}

export function carouselPackageToJson(productionPackage: CarouselProductionPackage): string {
  return JSON.stringify(productionPackage, null, 2);
}
