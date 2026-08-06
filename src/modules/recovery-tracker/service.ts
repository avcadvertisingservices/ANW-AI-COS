import type {
  RecoveryTrackerRepository,
} from "./repository.js";

import type {
  RecoveryTrackerId,
  RecoveryTrackerRecord,
} from "./types.js";

export class RecoveryTrackerService {
  constructor(
    private readonly repository:
      RecoveryTrackerRepository,
  ) {}

  async getById(
    id: RecoveryTrackerId,
  ): Promise<RecoveryTrackerRecord | null> {
    return this.repository.findById(id);
  }

  async list(): Promise<
    RecoveryTrackerRecord[]
  > {
    return this.repository.list();
  }

  async save(
    record: RecoveryTrackerRecord,
  ): Promise<RecoveryTrackerRecord> {
    return this.repository.save(
      record,
    );
  }
}
