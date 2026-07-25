export type EnvironmentValues = Record<string, string | undefined>;

export class EnvironmentValidationError extends Error {
  constructor(public readonly missingKeys: string[]) {
    super(`Missing required environment variables: ${missingKeys.join(", ")}`);
    this.name = "EnvironmentValidationError";
  }
}

export function requireEnvironmentVariables(
  values: EnvironmentValues,
  requiredKeys: readonly string[],
): void {
  const missingKeys = requiredKeys.filter((key) => {
    const value = values[key];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missingKeys.length > 0) {
    throw new EnvironmentValidationError(missingKeys);
  }
}
