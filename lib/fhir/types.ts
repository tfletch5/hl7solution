export interface FhirMeta {
  versionId?: string;
  lastUpdated: string;
  source?: string;
  profile?: string[];
}

export interface FhirNarrative {
  status: "generated" | "extensions" | "additional" | "empty";
  div: string;
}

export interface FhirCoding {
  system: string;
  code: string;
  display?: string;
}

export interface FhirCodeableConcept {
  coding?: FhirCoding[];
  text?: string;
}

export interface FhirIdentifier {
  use?: "usual" | "official" | "temp" | "secondary" | "old";
  type?: FhirCodeableConcept;
  system: string;
  value: string;
}

export interface FhirReference {
  reference: string;
  type?: string;
  display?: string;
}

export interface FhirContactPoint {
  system?: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
  value?: string;
  use?: "home" | "work" | "temp" | "old" | "mobile";
}

export interface FhirHumanName {
  use?:
    | "usual"
    | "official"
    | "temp"
    | "nickname"
    | "anonymous"
    | "old"
    | "maiden";
  family?: string;
  given?: string[];
}

export interface FhirAddress {
  use?: "home" | "work" | "temp" | "old" | "billing";
  line?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface FhirResource {
  resourceType: string;
  id: string;
  meta?: FhirMeta;
  text?: FhirNarrative;
}

export interface FhirPatient extends FhirResource {
  resourceType: "Patient";
  identifier: FhirIdentifier[];
  active?: boolean;
  name: FhirHumanName[];
  telecom?: FhirContactPoint[];
  gender: "male" | "female" | "other" | "unknown";
  birthDate: string;
  address?: FhirAddress[];
  managingOrganization?: FhirReference;
}

export type FhirEncounterStatus =
  | "planned"
  | "arrived"
  | "triaged"
  | "in-progress"
  | "onleave"
  | "finished"
  | "cancelled";

export interface FhirEncounter extends FhirResource {
  resourceType: "Encounter";
  status: FhirEncounterStatus;
  class: FhirCoding;
  type?: FhirCodeableConcept[];
  subject: FhirReference;
  participant?: Array<{
    type?: FhirCodeableConcept[];
    individual: FhirReference;
  }>;
  period: { start: string; end?: string };
  reasonCode?: FhirCodeableConcept[];
  serviceProvider?: FhirReference;
}

export type FhirConditionStatus =
  | "active"
  | "recurrence"
  | "relapse"
  | "inactive"
  | "remission"
  | "resolved";
export type FhirConditionVerification =
  | "unconfirmed"
  | "provisional"
  | "differential"
  | "confirmed"
  | "refuted"
  | "entered-in-error";

export interface FhirCondition extends FhirResource {
  resourceType: "Condition";
  clinicalStatus: FhirCodeableConcept;
  verificationStatus: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: FhirReference;
  onsetDateTime?: string;
  recordedDate?: string;
  asserter?: FhirReference;
}

export type FhirObservationStatus =
  | "registered"
  | "preliminary"
  | "final"
  | "amended"
  | "corrected"
  | "cancelled"
  | "entered-in-error"
  | "unknown";

export interface FhirObservation extends FhirResource {
  resourceType: "Observation";
  status: FhirObservationStatus;
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: FhirReference;
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  interpretation?: FhirCodeableConcept[];
  referenceRange?: Array<{
    low?: { value: number; unit: string };
    high?: { value: number; unit: string };
    text?: string;
  }>;
}

export type FhirMedicationRequestStatus =
  | "active"
  | "on-hold"
  | "cancelled"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "draft"
  | "unknown";
export type FhirMedicationRequestIntent =
  | "proposal"
  | "plan"
  | "order"
  | "instance-order";

export interface FhirMedicationRequest extends FhirResource {
  resourceType: "MedicationRequest";
  status: FhirMedicationRequestStatus;
  intent: FhirMedicationRequestIntent;
  medicationCodeableConcept: FhirCodeableConcept;
  subject: FhirReference;
  authoredOn: string;
  requester?: FhirReference;
  dosageInstruction?: Array<{
    text: string;
    route?: FhirCodeableConcept;
    timing?: {
      repeat?: { frequency: number; period: number; periodUnit: string };
    };
  }>;
}

export type FhirDiagnosticReportStatus =
  | "registered"
  | "partial"
  | "preliminary"
  | "final"
  | "amended"
  | "corrected"
  | "appended"
  | "cancelled"
  | "entered-in-error";

export interface FhirDiagnosticReport extends FhirResource {
  resourceType: "DiagnosticReport";
  status: FhirDiagnosticReportStatus;
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: FhirReference;
  effectiveDateTime: string;
  issued: string;
  result?: FhirReference[];
  conclusion?: string;
  performer?: FhirReference[];
}

export interface FhirBundle {
  resourceType: "Bundle";
  id: string;
  meta?: FhirMeta;
  type:
    | "document"
    | "message"
    | "transaction"
    | "transaction-response"
    | "batch"
    | "batch-response"
    | "history"
    | "searchset"
    | "collection";
  entry: Array<{
    fullUrl: string;
    resource: FhirResourceAny;
  }>;
}

export type FhirResourceAny =
  | FhirPatient
  | FhirEncounter
  | FhirCondition
  | FhirObservation
  | FhirMedicationRequest
  | FhirDiagnosticReport;
