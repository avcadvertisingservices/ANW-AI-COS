import { AppError } from "../../core/errors/index.js";

export class KnowledgeValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: "KNOWLEDGE_VALIDATION_ERROR",
      message,
      statusCode: 400,
      details,
    });
    this.name = "KnowledgeValidationError";
  }
}

export class KnowledgeNotFoundError extends AppError {
  constructor(idOrSlug: string) {
    super({
      code: "KNOWLEDGE_NOT_FOUND",
      message: `Knowledge record not found: ${idOrSlug}`,
      statusCode: 404,
      details: { idOrSlug },
    });
    this.name = "KnowledgeNotFoundError";
  }
}
