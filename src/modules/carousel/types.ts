import type { ContentBundle } from "../content/types.js";

export type CarouselAspectRatio = "9:16" | "4:5" | "1:1";
export type CarouselPlatform = "facebook" | "instagram" | "linkedin" | "pinterest";
export type CarouselProjectStatus = "draft" | "design_review" | "medical_review" | "approved" | "rendered" | "archived";
export type CarouselLayout =
  | "hero"
  | "editorial"
  | "split-visual"
  | "checklist"
  | "myth-fact"
  | "survivor-quote"
  | "summary"
  | "call-to-action";

export type QualitySeverity = "error" | "warning" | "info";

export type ContentCarousel = NonNullable<ContentBundle["carousel"]>;
export type ContentCarouselSlide = ContentCarousel["slides"][number];

export interface CarouselCanvasSpec {
  aspectRatio: CarouselAspectRatio;
  width: number;
  height: number;
  safeArea: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface CarouselBrandTokens {
  brandName: string;
  missionMessage: string;
  website: string;
  logoAssetName: string;
  palette: {
    emerald: string;
    sage: string;
    cream: string;
    white: string;
    charcoal: string;
    accent: string;
  };
  typography: {
    titleFamily: string;
    bodyFamily: string;
    titleWeight: number;
    bodyWeight: number;
  };
  visualStyle: string[];
  requiredFooterText: string;
}

export interface CarouselZone {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
}

export interface CarouselLayoutZones {
  title: CarouselZone;
  media: CarouselZone;
  body: CarouselZone;
  footer: CarouselZone;
}

export interface CarouselTextMetrics {
  titleWords: number;
  headlineWords: number;
  bodyWords: number;
  callToActionWords: number;
  totalCharacters: number;
  recommendedBodyWordLimit: number;
  exceedsRecommendedBodyLength: boolean;
}

export interface CarouselProductionSlide {
  slideNumber: number;
  role: ContentCarouselSlide["role"];
  layout: CarouselLayout;
  canvas: CarouselCanvasSpec;
  zones: CarouselLayoutZones;
  title: string;
  headline: string;
  body: string;
  callToAction: string;
  icons: string[];
  voiceover: string;
  altText: string;
  sourceImagePrompt: string;
  productionImagePrompt: string;
  designNotes: string[];
  filename: string;
  textMetrics: CarouselTextMetrics;
  medicalReviewFlag: boolean;
  copyReviewRequired: boolean;
}

export interface CarouselQualityIssue {
  code: string;
  severity: QualitySeverity;
  message: string;
  slideNumber: number | null;
}

export interface CarouselQualityReport {
  passedStructuralValidation: boolean;
  readyForDesign: boolean;
  requiresHumanReview: boolean;
  requiresMedicalReview: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: CarouselQualityIssue[];
}

export interface CarouselProductionRequest {
  contentBundle: ContentBundle;
  aspectRatio?: CarouselAspectRatio;
  platforms?: CarouselPlatform[];
  version?: number;
  brandTokens?: CarouselBrandTokens;
}

export interface CarouselProductionPackage {
  id: string;
  contentBundleId: string;
  topic: string;
  title: string;
  caption: string;
  hashtags: string[];
  status: CarouselProjectStatus;
  aspectRatio: CarouselAspectRatio;
  platforms: CarouselPlatform[];
  version: number;
  createdAt: string;
  brand: CarouselBrandTokens;
  canvas: CarouselCanvasSpec;
  slides: CarouselProductionSlide[];
  quality: CarouselQualityReport;
}

export interface CarouselWrittenFiles {
  outputDirectory: string;
  manifestPath: string;
  canvaCsvPath: string;
  storyboardPath: string;
  imagePromptsPath: string;
  slideDirectory: string;
}
