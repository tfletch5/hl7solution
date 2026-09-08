import {
  FhirCondition,
  FhirDiagnosticReport,
  FhirEncounter,
  FhirMedicationRequest,
  FhirObservation,
  FhirPatient,
  FhirResource,
} from './types';

export interface FhirValidationIssue {
  resourceType: string;
  id: string;
  field: string;
  message: string;
}

export interface FhirValidationResult {
  valid: boolean;
  issues: FhirValidationIssue[];
}

export function validateResource(resource: FhirResource): FhirValidationIssue[] {
  const issues: FhirValidationIssue[] = [];
  const issue = (field: string, message: string) =>
    issues.push({ resourceType: resource.resourceType, id: resource.id, field, message });

  switch (resource.resourceType) {
    case 'Patient': {
      const p = resource as FhirPatient;
      if (!p.identifier?.length) issue('identifier', 'Patient must have at least one identifier');
      if (!p.name?.length) issue('name', 'Patient must have a name');
      if (!p.birthDate) issue('birthDate', 'Patient must have a birthDate');
      if (!['male', 'female', 'other', 'unknown'].includes(p.gender)) {
        issue('gender', 'Patient gender must be male, female, other, or unknown');
      }
      break;
    }
    case 'Encounter': {
      const e = resource as FhirEncounter;
      if (!e.status) issue('status', 'Encounter must have a status');
      if (!e.class) issue('class', 'Encounter must have a class');
      if (!e.subject) issue('subject', 'Encounter must reference a subject');
      if (!e.period?.start) issue('period.start', 'Encounter must have a period start');
      break;
    }
    case 'Condition': {
      const c = resource as FhirCondition;
      if (!c.clinicalStatus) issue('clinicalStatus', 'Condition must have a clinicalStatus');
      if (!c.verificationStatus) issue('verificationStatus', 'Condition must have a verificationStatus');
      if (!c.code) issue('code', 'Condition must have a code');
      if (!c.subject) issue('subject', 'Condition must reference a subject');
      break;
    }
    case 'Observation': {
      const o = resource as FhirObservation;
      if (!o.status) issue('status', 'Observation must have a status');
      if (!o.code) issue('code', 'Observation must have a code');
      if (!o.subject) issue('subject', 'Observation must reference a subject');
      if (!o.effectiveDateTime) issue('effectiveDateTime', 'Observation must have an effectiveDateTime');
      if (!o.valueQuantity && !o.valueString) {
        issue('value[x]', 'Observation should have a valueQuantity or valueString');
      }
      break;
    }
    case 'MedicationRequest': {
      const m = resource as FhirMedicationRequest;
      if (!m.status) issue('status', 'MedicationRequest must have a status');
      if (!m.intent) issue('intent', 'MedicationRequest must have an intent');
      if (!m.medicationCodeableConcept) issue('medicationCodeableConcept', 'MedicationRequest must specify a medication');
      if (!m.subject) issue('subject', 'MedicationRequest must reference a subject');
      if (!m.authoredOn) issue('authoredOn', 'MedicationRequest must have an authoredOn');
      break;
    }
    case 'DiagnosticReport': {
      const d = resource as FhirDiagnosticReport;
      if (!d.status) issue('status', 'DiagnosticReport must have a status');
      if (!d.code) issue('code', 'DiagnosticReport must have a code');
      if (!d.subject) issue('subject', 'DiagnosticReport must reference a subject');
      if (!d.effectiveDateTime) issue('effectiveDateTime', 'DiagnosticReport must have an effectiveDateTime');
      if (!d.issued) issue('issued', 'DiagnosticReport must have an issued time');
      break;
    }
    default:
      issue('resourceType', `Unsupported resource type: ${resource.resourceType}`);
  }

  return issues;
}

export function validateAllResources(resources: FhirResource[]): FhirValidationResult {
  const issues = resources.flatMap(validateResource);
  return { valid: issues.length === 0, issues };
}
