import type {
  PatientSupportRepository,
} from "./repository.js";

import type {
  PatientSupportId,
  PatientSupportRecord,
} from "./types.js";

export class PatientSupportService {
  constructor(
    private readonly repository:
      PatientSupportRepository,
  ) {}

  async getById(
    id: PatientSupportId,
  ): Promise<PatientSupportRecord | null> {
    return this.repository.findById(id);
  }

  async list(): Promise<
    PatientSupportRecord[]
  > {
    return this.repository.list();
  }
}
