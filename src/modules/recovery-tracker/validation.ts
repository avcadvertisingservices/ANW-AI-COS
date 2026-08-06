export function validateRecoveryTrackerId(
  value: string,
): string {
  const normalized =
    value.trim();

  if (!normalized) {
    throw new Error(
      "RecoveryTracker ID is required.",
    );
  }

  return normalized;
}
