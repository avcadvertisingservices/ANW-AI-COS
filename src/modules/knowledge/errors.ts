export class KnowledgeError extends Error {
  public readonly code: string;

  public constructor(message: string, code: string) {
    super(message);
    this.name = "KnowledgeError";
    this.code = code;
  }
}

export class KnowledgeValidationError extends KnowledgeError {
  public constructor(message: string) {
    super(message, "KNOWLEDGE_VALIDATION_ERROR");
    this.name = "KnowledgeValidationError";
  }
}

export class KnowledgeConflictError extends KnowledgeError {
  public constructor(message: string) {
    super(message, "KNOWLEDGE_CONFLICT_ERROR");
    this.name = "KnowledgeConflictError";
  }
}

export class KnowledgeNotFoundError extends KnowledgeError {
  public constructor(message: string) {
    super(message, "KNOWLEDGE_NOT_FOUND");
    this.name = "KnowledgeNotFoundError";
  }
}
