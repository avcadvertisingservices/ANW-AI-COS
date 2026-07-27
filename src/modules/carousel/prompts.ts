import type {
  CarouselAspectRatio,
  CarouselBrandTokens,
  CarouselLayout,
  ContentCarouselSlide,
} from "./types.js";

export function buildProductionImagePrompt(input: {
  slide: ContentCarouselSlide;
  aspectRatio: CarouselAspectRatio;
  layout: CarouselLayout;
  brand: CarouselBrandTokens;
}): string {
  const { slide, aspectRatio, layout, brand } = input;

  return [
    `Create a ${aspectRatio} vertical social-media visual for ${brand.brandName}.`,
    `Slide role: ${slide.role}. Layout direction: ${layout}.`,
    `Subject and visual concept: ${slide.imagePrompt}`,
    `Visual identity: ${brand.visualStyle.join("; ")}.`,
    `Palette: emerald ${brand.palette.emerald}, sage ${brand.palette.sage}, cream ${brand.palette.cream}, white ${brand.palette.white}.`,
    `Use the small ${brand.logoAssetName}.`,
    `Reserve clean negative space for editable title, body, and CTA overlays.`,
    `Do not render paragraphs or tiny text inside the generated artwork.`,
    `Avoid frightening imagery, exaggerated medical claims, graphic surgery, or guaranteed outcomes.`,
    `The emotional tone must be compassionate, hopeful, medically respectful, and trustworthy.`,
    `Small branding reference: ${brand.website}.`,
  ].join(" ");
}
