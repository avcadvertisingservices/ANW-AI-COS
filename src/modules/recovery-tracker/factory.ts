import type {
  RecoveryTrackerRepository,
} from "./repository.js";

import {
  RecoveryTrackerService,
} from "./service.js";

export function createRecoveryTrackerService(
  repository: RecoveryTrackerRepository,
): RecoveryTrackerService {
  return new RecoveryTrackerService(
    repository,
  );
}
