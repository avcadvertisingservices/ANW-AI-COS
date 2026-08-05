import type {
  PatientSupportId,
  PatientSupportRecord,
} from "./types.js";

export interface PatientSupportRepository {
  findById(
    id: PatientSupportId,
  ): Promise<PatientSupportRecord | null>;

  list(): Promise<
    PatientSupportRecord[]
  >;

  save(
    record: PatientSupportRecord,
  ): Promise<PatientSupportRecord>;
}
