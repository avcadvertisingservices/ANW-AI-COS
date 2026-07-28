export class KnowledgeSourceManagerError extends Error {
  public constructor(
    message: string,
    public readonly code: string,
    public readonly details: string[] = [],
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "KnowledgeSourceManagerError";
  }
}
