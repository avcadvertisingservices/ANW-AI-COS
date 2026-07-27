import type {
  CarouselAspectRatio,
  CarouselCanvasSpec,
  CarouselLayout,
  CarouselLayoutZones,
  ContentCarouselSlide,
} from "./types.js";

const canvasByRatio: Record<CarouselAspectRatio, CarouselCanvasSpec> = {
  "9:16": {
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    safeArea: { top: 120, right: 72, bottom: 150, left: 72 },
  },
  "4:5": {
    aspectRatio: "4:5",
    width: 1080,
    height: 1350,
    safeArea: { top: 80, right: 64, bottom: 100, left: 64 },
  },
  "1:1": {
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    safeArea: { top: 64, right: 64, bottom: 84, left: 64 },
  },
};

const zonesByLayout: Record<CarouselLayout, CarouselLayoutZones> = {
  hero: {
    title: { xPercent: 7, yPercent: 10, widthPercent: 86, heightPercent: 23 },
    media: { xPercent: 8, yPercent: 34, widthPercent: 84, heightPercent: 45 },
    body: { xPercent: 9, yPercent: 78, widthPercent: 82, heightPercent: 10 },
    footer: { xPercent: 7, yPercent: 91, widthPercent: 86, heightPercent: 5 },
  },
  editorial: {
    title: { xPercent: 7, yPercent: 8, widthPercent: 86, heightPercent: 18 },
    media: { xPercent: 58, yPercent: 28, widthPercent: 34, heightPercent: 45 },
    body: { xPercent: 8, yPercent: 29, widthPercent: 46, heightPercent: 52 },
    footer: { xPercent: 7, yPercent: 91, widthPercent: 86, heightPercent: 5 },
  },
  "split-visual": {
    title: { xPercent: 7, yPercent: 8, widthPercent: 86, heightPercent: 17 },
    media: { xPercent: 7, yPercent: 28, widthPercent: 40, heightPercent: 52 },
    body: { xPercent: 52, yPercent: 28, widthPercent: 40, heightPercent: 52 },
    footer: { xPercent: 7, yPercent: 91, widthPercent: 86, heightPercent: 5 },
  },
  checklist: {
    title: { xPercent: 7, yPercent: 8, widthPercent: 86, heightPercent: 17 },
    media: { xPercent: 68, yPercent: 28, widthPercent: 24, heightPercent: 22 },
    body: { xPercent: 8, yPercent: 28, widthPercent: 82, heightPercent: 56 },
    footer: { xPercent: 7, yPercent: 91, widthPercent: 86, heightPercent: 5 },
  },
  "myth-fact": {
    title: { xPercent: 7, yPercent: 8, widthPercent: 86, heightPercent: 17 },
    media: { xPercent: 8, yPercent: 28, widthPercent: 84, heightPercent: 20 },
    body: { xPercent: 8, yPercent: 51, widthPercent: 84, heightPercent: 34 },
    footer: { xPercent: 7, yPercent: 91, widthPercent: 86, heightPercent: 5 },
  },
  "survivor-quote": {
    title: { xPercent: 9, yPercent: 14, widthPercent: 82, heightPercent: 16 },
    media: { xPercent: 65, yPercent: 63, widthPercent: 27, heightPercent: 20 },
    body: { xPercent: 10, yPercent: 33, widthPercent: 78, heightPercent: 38 },
    footer: { xPercent: 7, yPercent: 91, widthPercent: 86, heightPercent: 5 },
  },
  summary: {
    title: { xPercent: 7, yPercent: 8, widthPercent: 86, heightPercent: 18 },
    media: { xPercent: 70, yPercent: 29, widthPercent: 21, heightPercent: 20 },
    body: { xPercent: 8, yPercent: 29, widthPercent: 82, heightPercent: 55 },
    footer: { xPercent: 7, yPercent: 91, widthPercent: 86, heightPercent: 5 },
  },
  "call-to-action": {
    title: { xPercent: 9, yPercent: 14, widthPercent: 82, heightPercent: 22 },
    media: { xPercent: 26, yPercent: 38, widthPercent: 48, heightPercent: 28 },
    body: { xPercent: 12, yPercent: 68, widthPercent: 76, heightPercent: 15 },
    footer: { xPercent: 7, yPercent: 90, widthPercent: 86, heightPercent: 6 },
  },
};

export function getCarouselCanvas(aspectRatio: CarouselAspectRatio): CarouselCanvasSpec {
  return canvasByRatio[aspectRatio];
}

export function chooseCarouselLayout(
  slide: ContentCarouselSlide,
  slideCount: number,
): CarouselLayout {
  if (slide.slideNumber === 1 || slide.role === "hook") return "hero";
  if (slide.slideNumber === slideCount || slide.role === "cta") return "call-to-action";
  if (slide.role === "introduction") return "editorial";
  if (slide.role === "tips") return "checklist";
  if (slide.role === "myth") return "myth-fact";
  if (slide.role === "survivor-insight") return "survivor-quote";
  if (slide.role === "takeaways") return "summary";
  return "split-visual";
}

export function getCarouselLayoutZones(layout: CarouselLayout): CarouselLayoutZones {
  return zonesByLayout[layout];
}

export function getRecommendedBodyWordLimit(aspectRatio: CarouselAspectRatio): number {
  if (aspectRatio === "1:1") return 34;
  if (aspectRatio === "4:5") return 44;
  return 56;
}
