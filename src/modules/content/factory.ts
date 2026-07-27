import { createSupabaseKnowledgeService } from "../knowledge/supabase-service.js";
import { ContentEngineService,ContentKnowledgeRetriever } from "./engine.js";
import { MockContentProvider,OpenAIContentProvider } from "./providers.js";
export const createMockContentEngine=()=>new ContentEngineService(new ContentKnowledgeRetriever(createSupabaseKnowledgeService()),new MockContentProvider());
export const createOpenAIContentEngine=()=>new ContentEngineService(new ContentKnowledgeRetriever(createSupabaseKnowledgeService()),new OpenAIContentProvider());
