import type {
  RecoveryTrackerId,
  RecoveryTrackerRecord,
} from "./types.js";

export interface RecoveryTrackerRepository {
  findById(
    id: RecoveryTrackerId,
  ): Promise<RecoveryTrackerRecord | null>;

  list(): Promise<
    RecoveryTrackerRecord[]
  >;

  save(
    record: RecoveryTrackerRecord,
  ): Promise<RecoveryTrackerRecord>;
}
