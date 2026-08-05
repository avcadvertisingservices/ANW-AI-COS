export class PatientSupportNotFoundError extends Error {
  constructor(id: string) {
    super(
      "PatientSupport record not found: " +
        id,
    );

    this.name =
      "PatientSupportNotFoundError";
  }
}
