import type {
  PatientSupportRepository,
} from "./repository.js";

import {
  PatientSupportService,
} from "./service.js";

export function createPatientSupportService(
  repository: PatientSupportRepository,
): PatientSupportService {
  return new PatientSupportService(
    repository,
  );
}
