import type { BlueprintDocument } from "./types.js";
export function validateBlueprintDocuments(documents: BlueprintDocument[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []; const paths = new Set<string>();
  for (const document of documents) {
    if (!document.relativePath.trim()) errors.push("Empty relativePath.");
    if (!document.content.trim()) errors.push(`Empty content: ${document.relativePath}`);
    if (paths.has(document.relativePath)) errors.push(`Duplicate path: ${document.relativePath}`);
    paths.add(document.relativePath);
  }
  return { valid: errors.length === 0, errors };
}
