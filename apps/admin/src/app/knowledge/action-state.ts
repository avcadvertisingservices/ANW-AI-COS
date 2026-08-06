export type KnowledgeEntryActionStatus =
  | "idle"
  | "success"
  | "error";

export type KnowledgeEntryFieldError =
  | string
  | string[]
  | undefined;

export type KnowledgeEntryFieldErrors =
  Record<
    string,
    KnowledgeEntryFieldError
  >;

export type KnowledgeEntryActionState = {
  status: KnowledgeEntryActionStatus;
  message: string;

  /*
   * Optional for compatibility with existing
   * action return objects and components.
   */
  success?: boolean;
  errors?: KnowledgeEntryFieldErrors;
  fieldErrors?: KnowledgeEntryFieldErrors;
};

export const initialKnowledgeEntryActionState:
  KnowledgeEntryActionState = {
    status: "idle",
    success: false,
    message: "",
    errors: {},
    fieldErrors: {},
  };

export function createKnowledgeEntrySuccessState(
  message =
    "Knowledge entry saved successfully.",
): KnowledgeEntryActionState {
  return {
    status: "success",
    success: true,
    message,
    errors: {},
    fieldErrors: {},
  };
}

export function createKnowledgeEntryErrorState(
  message: string,
  fieldErrors:
    KnowledgeEntryFieldErrors = {},
): KnowledgeEntryActionState {
  return {
    status: "error",
    success: false,
    message,
    errors: fieldErrors,
    fieldErrors,
  };
}