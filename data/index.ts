import { riverside } from './riverside/facility';
import { harborview } from './harborview/facility';
import { departments as riversideDepartments } from './riverside/departments';
import { providers as riversideProviders } from './riverside/providers';
import { patients as riversidePatients } from './riverside/patients';
import { encounters as riversideEncounters } from './riverside/encounters';
import { departments as harborviewDepartments } from './harborview/departments';
import { providers as harborviewProviders } from './harborview/providers';
import { patients as harborviewPatients } from './harborview/patients';
import { encounters as harborviewEncounters } from './harborview/encounters';
import { crosswalk } from './shared/crosswalk';
import {
  Encounter,
  Facility,
  FacilityId,
  Patient,
  Provider,
} from './shared/types';

export * from './shared/types';
export { riverside, harborview, crosswalk };

export const facilities: Facility[] = [riverside, harborview];

export const departments = [
  ...riversideDepartments,
  ...harborviewDepartments,
];

export const providers = [...riversideProviders, ...harborviewProviders];
export const patients = [...riversidePatients, ...harborviewPatients];
export const encounters = [...riversideEncounters, ...harborviewEncounters];

export function getFacilityById(id: FacilityId): Facility | undefined {
  return facilities.find((f) => f.id === id);
}

export function getPatientsByFacility(facilityId: FacilityId): Patient[] {
  return patients.filter((p) => p.facilityId === facilityId);
}

export function getEncountersByPatientMrn(mrn: string): Encounter[] {
  return encounters.filter((e) => e.patientMrn === mrn);
}

export function getProviderById(id: string): Provider | undefined {
  return providers.find((p) => p.id === id);
}

export function findCrosswalkByMrn(mrn: string) {
  return crosswalk.find((entry) =>
    entry.identifiers.some((identifier) => identifier.value === mrn)
  );
}
