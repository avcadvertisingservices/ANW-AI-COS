import { createSupabaseServerClient } from "../knowledge/supabase-service.js";
import { KnowledgeSourceManagerService } from "./service.js";
import { SupabaseKnowledgeSourceManagerRepository } from "./supabase-repository.js";

export function createSupabaseKnowledgeSourceManager(): KnowledgeSourceManagerService {
  return new KnowledgeSourceManagerService(
    new SupabaseKnowledgeSourceManagerRepository(
      createSupabaseServerClient(),
    ),
  );
}
