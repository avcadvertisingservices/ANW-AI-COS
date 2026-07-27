import { randomUUID } from "node:crypto";
import type { KnowledgeService } from "../knowledge/service.js";
import type { ContentBundle,ContentGenerationRequest,ContentProvider,KnowledgeContextItem } from "./types.js";

export class ContentEngineError extends Error { constructor(message:string,public readonly code:string){super(message);this.name="ContentEngineError";} }

export class ContentKnowledgeRetriever {
 constructor(private readonly service:KnowledgeService){}
 async retrieve(request:ContentGenerationRequest):Promise<KnowledgeContextItem[]> {
  const results=await this.service.search({text:request.topic,approvedOnly:true,limit:request.knowledgeLimit});
  if(!results.length) throw new ContentEngineError(`No approved knowledge found for "${request.topic}".`,"NO_APPROVED_KNOWLEDGE");
  return results.map(({entry})=>({id:entry.id,slug:entry.slug,title:entry.title,summary:entry.summary,body:entry.body,category:entry.category,tags:entry.tags,sourceTitles:entry.sources.map(s=>s.title),reviewedBy:entry.reviewedBy,reviewedAt:entry.reviewedAt}));
 }
}

export function validateRequest(r:ContentGenerationRequest):void {
 if(r.topic.trim().length<3) throw new ContentEngineError("Topic is too short.","INVALID_REQUEST");
 if(!r.formats.length) throw new ContentEngineError("Choose at least one format.","INVALID_REQUEST");
 if(r.carouselSlideCount<5||r.carouselSlideCount>20) throw new ContentEngineError("Carousel slide count must be between 5 and 20.","INVALID_REQUEST");
 if(r.knowledgeLimit<1||r.knowledgeLimit>20) throw new ContentEngineError("Knowledge limit must be between 1 and 20.","INVALID_REQUEST");
}

export function prompts(r:ContentGenerationRequest,k:KnowledgeContextItem[]){
 const system=`You are the ANW AI-COS Content Engine. Return only structured output. Use only approved knowledge supplied. Never diagnose, prescribe, promise outcomes, invent statistics or citations, or give absolute medical advice. All patient-facing medical content requires human review. Brand: Acoustic Neuroma Warrior. Mission: You Are Not Alone. Website: acousticneuromawarrior.com. Tone: compassionate, clear, survivor-led, hopeful, trustworthy. Carousel must contain exactly ${r.carouselSlideCount} slides: hook, introduction, education, practical guidance, takeaways, final CTA. Every slide needs an image prompt, design notes, voiceover, alt text, and medical review flag. Return null for formats not requested.`;
 const user=`Topic: ${r.topic}
Audience: ${r.audience}
Formats: ${r.formats.join(", ")}
Tone: ${r.tone}
Language: ${r.language}
Approved knowledge:
${JSON.stringify(k,null,2)}
Create the full bundle. Use exact knowledge IDs. Set status medical_review and approvedKnowledgeOnly true.`;
 return {system,user};
}

function text(b:ContentBundle){return JSON.stringify({blog:b.blog,facebook:b.facebook,carousel:b.carousel,reel:b.reel,pinterest:b.pinterest,email:b.email,youtube:b.youtube});}
export function safetyReport(b:ContentBundle){const t=text(b),w:string[]=[];const d=/you have|this means you have/i.test(t),g=/guaranteed|will cure|100%/i.test(t),a=/you must choose surgery|stop taking/i.test(t);if(d)w.push("Potential diagnostic language detected.");if(g)w.push("Guaranteed outcome language detected.");if(a)w.push("Absolute medical advice detected.");return {requiresMedicalReview:true,approvedKnowledgeOnly:b.safety.approvedKnowledgeOnly,containsDiagnosisLanguage:d,containsGuaranteedOutcomeLanguage:g,containsUnsupportedStatistics:false,containsAbsoluteMedicalAdvice:a,warnings:w};}
export function brandReport(b:ContentBundle){const t=text(b),m=/you are not alone/i.test(t),s=/acousticneuromawarrior\.com/i.test(t),c=!/just get over it/i.test(t),w:string[]=[];if(!m)w.push("Mission message is missing.");if(!s)w.push("Website branding is missing.");if(!c)w.push("Uncompassionate language detected.");return {includesMissionMessage:m,includesWebsiteBranding:s,compassionateTone:c,warnings:w};}

export class ContentEngineService {
 constructor(private readonly retriever:ContentKnowledgeRetriever,private readonly provider:ContentProvider){}
 async generate(request:ContentGenerationRequest):Promise<ContentBundle>{
  validateRequest(request);const knowledge=await this.retriever.retrieve(request);const p=prompts(request,knowledge);const raw=await this.provider.generate({request,knowledge,systemPrompt:p.system,userPrompt:p.user});
  const bundle:ContentBundle={...raw,id:raw.id||randomUUID(),topic:request.topic,audience:request.audience,language:request.language,status:"medical_review",knowledgeEntryIds:knowledge.map(x=>x.id),knowledgeSnapshot:knowledge,generatedAt:raw.generatedAt||new Date().toISOString(),model:this.provider.model};
  if(bundle.carousel && (bundle.carousel.slideCount!==request.carouselSlideCount||bundle.carousel.slides.length!==request.carouselSlideCount)) throw new ContentEngineError("Provider returned the wrong carousel slide count.","INVALID_PROVIDER_OUTPUT");
  return {...bundle,safety:safetyReport(bundle),brand:brandReport(bundle)};
 }
}
