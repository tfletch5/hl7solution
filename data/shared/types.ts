export type FacilityId = 'riverside' | 'harborview';

export interface Address {
  line: string[];
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Facility {
  id: FacilityId;
  name: string;
  facilityType: string;
  address: Address;
  phone: string;
  npi: string;
  taxId: string;
  mrnPrefix: string;
  role: string;
  departments: Department[];
  providers: Provider[];
}

export interface Department {
  code: string;
  name: string;
  facilityId: FacilityId;
}

export interface Provider {
  id: string;
  name: string;
  credentials: string;
  role: string;
  department: string;
  facilityId: FacilityId;
}

export interface Patient {
  localMrn: string;
  facilityId: FacilityId;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  address: Address;
  phone: string;
  primaryConcern?: string;
  workflowStatus?: string;
}

export type EncounterType =
  | 'emergency'
  | 'inpatient'
  | 'outpatient'
  | 'ambulatory'
  | 'follow-up';

export type EncounterStatus =
  | 'planned'
  | 'in-progress'
  | 'finished'
  | 'cancelled';

export interface Encounter {
  id: string;
  facilityId: FacilityId;
  patientMrn: string;
  type: EncounterType;
  department: string;
  providerId: string;
  startDate: string;
  endDate?: string;
  reason: string;
  status: EncounterStatus;
}

export interface ExchangeEvent {
  id: string;
  timestamp: string;
  source: FacilityId;
  target: FacilityId;
  messageType: string;
  eventType: string;
  patientMrn: string;
  status: 'sent' | 'received' | 'acknowledged' | 'failed';
  details?: string;
}

export interface CrosswalkIdentifier {
  system: string;
  value: string;
  facilityId: FacilityId;
}

export interface CrosswalkEntry {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: Address;
  phone: string;
  identifiers: CrosswalkIdentifier[];
  matchConfidence: number;
}
