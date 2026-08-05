export function validatePatientSupportId(
  value: string,
): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(
      "PatientSupport ID is required.",
    );
  }

  return normalized;
}
