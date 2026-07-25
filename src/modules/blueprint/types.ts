export interface BlueprintOptions { rootDirectory: string; overwrite?: boolean; }
export interface BlueprintResult { docsDirectory: string; created: string[]; skipped: string[]; }
export interface BlueprintDocument { relativePath: string; content: string; }
