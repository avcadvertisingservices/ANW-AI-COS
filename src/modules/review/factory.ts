import { createSupabaseServerClient } from "../knowledge/supabase-service.js";
import { KnowledgeReviewService } from "./service.js";
import {
  SupabaseKnowledgeApprovalGateway,
  SupabaseKnowledgeReviewRepository,
} from "./supabase-repository.js";

export function createSupabaseKnowledgeReviewService(): KnowledgeReviewService {
  const client = createSupabaseServerClient();

  return new KnowledgeReviewService(
    new SupabaseKnowledgeReviewRepository(client),
    new SupabaseKnowledgeApprovalGateway(client),
  );
}

export function createSupabaseKnowledgeApprovalGateway(): SupabaseKnowledgeApprovalGateway {
  return new SupabaseKnowledgeApprovalGateway(
    createSupabaseServerClient(),
  );
}
