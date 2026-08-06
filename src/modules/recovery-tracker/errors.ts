export class RecoveryTrackerNotFoundError extends Error {
  constructor(id: string) {
    super(
      "RecoveryTracker record not found: " +
        id,
    );

    this.name =
      "RecoveryTrackerNotFoundError";
  }
}
