import type { KnowledgeEntry } from "../knowledge/types.js";

export type ContentFormat = "blog" | "facebook" | "carousel" | "reel" | "pinterest" | "email" | "youtube";
export type ContentTone = "compassionate" | "educational" | "hopeful" | "survivor-led" | "professional";
export type ContentStatus = "draft" | "medical_review" | "approved" | "rejected" | "archived";

export interface ContentGenerationRequest {
  topic: string;
  audience: string;
  formats: ContentFormat[];
  tone: ContentTone;
  language: string;
  carouselSlideCount: number;
  knowledgeLimit: number;
}

export interface KnowledgeContextItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: KnowledgeEntry["category"];
  tags: string[];
  sourceTitles: string[];
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ContentBundle {
  id: string;
  topic: string;
  audience: string;
  language: string;
  status: ContentStatus;
  knowledgeEntryIds: string[];
  knowledgeSnapshot: KnowledgeContextItem[];
  generatedAt: string;
  model: string;
  blog: null | { title:string; slug:string; excerpt:string; introduction:string; sections:Array<{heading:string;body:string}>; conclusion:string; callToAction:string; seoTitle:string; seoDescription:string; keywords:string[] };
  facebook: null | { hook:string; body:string; callToAction:string; hashtags:string[]; firstComment:string };
  carousel: null | { title:string; slideCount:number; caption:string; hashtags:string[]; slides:Array<{ slideNumber:number; role:"hook"|"introduction"|"education"|"tips"|"myth"|"survivor-insight"|"takeaways"|"cta"; title:string; headline:string; body:string; imagePrompt:string; designNotes:string; icons:string[]; voiceover:string; altText:string; callToAction:string; medicalReviewFlag:boolean }> };
  reel: null | { title:string; hook:string; durationSeconds:number; scenes:Array<{sceneNumber:number;durationSeconds:number;visual:string;onScreenText:string;voiceover:string}>; caption:string; callToAction:string; hashtags:string[] };
  pinterest: null | { pinTitle:string; pinDescription:string; overlayText:string; boardSuggestion:string; keywords:string[]; imagePrompt:string; destinationPath:string };
  email: null | { subject:string; previewText:string; greeting:string; body:string; callToActionLabel:string; callToActionPath:string; closing:string };
  youtube: null | { title:string; thumbnailText:string; description:string; hook:string; script:string; callToAction:string; chapters:Array<{timestamp:string;title:string}>; tags:string[] };
  safety: { requiresMedicalReview:boolean; approvedKnowledgeOnly:boolean; containsDiagnosisLanguage:boolean; containsGuaranteedOutcomeLanguage:boolean; containsUnsupportedStatistics:boolean; containsAbsoluteMedicalAdvice:boolean; warnings:string[] };
  brand: { includesMissionMessage:boolean; includesWebsiteBranding:boolean; compassionateTone:boolean; warnings:string[] };
}

export interface ContentProviderInput { request:ContentGenerationRequest; knowledge:KnowledgeContextItem[]; systemPrompt:string; userPrompt:string }
export interface ContentProvider { readonly name:string; readonly model:string; generate(input:ContentProviderInput):Promise<ContentBundle> }
