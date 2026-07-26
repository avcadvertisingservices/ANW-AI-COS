import { createSupabaseAdminClient } from "../../config/supabase.js";
import { KnowledgeService } from "./service.js";
import { SupabaseKnowledgeRepository } from "./supabase-repository.js";

export function createSupabaseKnowledgeService(): KnowledgeService {
  const client = createSupabaseAdminClient();
  const repository = new SupabaseKnowledgeRepository(client);

  return new KnowledgeService(repository);
}
