export type KnowledgeEntryActionState = {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: Record<string, string>;
};

export const initialKnowledgeEntryActionState: KnowledgeEntryActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};