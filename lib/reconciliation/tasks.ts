import {
  fhirConditions,
  fhirDiagnosticReports,
  fhirEncounters,
  fhirMedicationRequests,
  fhirObservations,
} from '@/lib/fhir';

export type ReconciliationStatus =
  | 'Imported'
  | 'Needs review'
  | 'Accepted'
  | 'Rejected'
  | 'Failed';

export type ClinicalType =
  | 'medication'
  | 'diagnosis'
  | 'lab'
  | 'procedure'
  | 'follow-up'
  | 'report';

export interface ReconciliationTask {
  id: string;
  resourceType: string;
  resourceId: string;
  patientId: string;
  display: string;
  clinicalType: ClinicalType;
  source: string;
  status: ReconciliationStatus;
  comment?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

function formatSource(raw?: string): string {
  if (!raw) return 'unknown';
  if (raw.includes('riverside')) return 'Riverside General Memorial';
  if (raw.includes('harborview')) return 'Harbor View Primary Care';
  return raw;
}

function summarizeMedication(resource: (typeof fhirMedicationRequests)[number]): string {
  const name = resource.medicationCodeableConcept.text ?? resource.medicationCodeableConcept.coding?.[0]?.display ?? 'Unknown medication';
  return `Medication order: ${name}`;
}

function summarizeCondition(resource: (typeof fhirConditions)[number]): string {
  const name = resource.code.text ?? resource.code.coding?.[0]?.display ?? 'Unknown condition';
  return `Diagnosis: ${name}`;
}

function summarizeObservation(resource: (typeof fhirObservations)[number]): string {
  const name = resource.code.text ?? resource.code.coding?.[0]?.display ?? 'Unknown observation';
  const value = resource.valueQuantity
    ? `${resource.valueQuantity.value} ${resource.valueQuantity.unit}`
    : resource.valueString;
  return value ? `${name} — ${value}` : name;
}

function summarizeDiagnosticReport(resource: (typeof fhirDiagnosticReports)[number]): string {
  const name = resource.code.text ?? resource.code.coding?.[0]?.display ?? 'Unknown report';
  return `Report: ${name}`;
}

function summarizeEncounter(resource: (typeof fhirEncounters)[number]): string {
  const type = resource.type?.[0]?.text ?? resource.reasonCode?.[0]?.text ?? 'Encounter';
  const provider = resource.participant?.[0]?.individual.display ?? '';
  return provider ? `${type} — ${provider}` : type;
}

export const initialReconciliationTasks: ReconciliationTask[] = [
  ...fhirMedicationRequests.map((r) => ({
    id: `task-${r.resourceType}-${r.id}`,
    resourceType: r.resourceType,
    resourceId: r.id,
    patientId: 'PAT-001',
    display: summarizeMedication(r),
    clinicalType: 'medication' as ClinicalType,
    source: formatSource(r.meta?.source),
    status: 'Needs review' as ReconciliationStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  ...fhirConditions.map((r) => ({
    id: `task-${r.resourceType}-${r.id}`,
    resourceType: r.resourceType,
    resourceId: r.id,
    patientId: 'PAT-001',
    display: summarizeCondition(r),
    clinicalType: 'diagnosis' as ClinicalType,
    source: formatSource(r.meta?.source),
    status: 'Needs review' as ReconciliationStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  ...fhirObservations.map((r) => ({
    id: `task-${r.resourceType}-${r.id}`,
    resourceType: r.resourceType,
    resourceId: r.id,
    patientId: 'PAT-001',
    display: summarizeObservation(r),
    clinicalType: 'lab' as ClinicalType,
    source: formatSource(r.meta?.source),
    status: 'Needs review' as ReconciliationStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  ...fhirDiagnosticReports.map((r) => ({
    id: `task-${r.resourceType}-${r.id}`,
    resourceType: r.resourceType,
    resourceId: r.id,
    patientId: 'PAT-001',
    display: summarizeDiagnosticReport(r),
    clinicalType: 'report' as ClinicalType,
    source: formatSource(r.meta?.source),
    status: 'Needs review' as ReconciliationStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  ...fhirEncounters.map((r) => ({
    id: `task-${r.resourceType}-${r.id}`,
    resourceType: r.resourceType,
    resourceId: r.id,
    patientId: 'PAT-001',
    display: summarizeEncounter(r),
    clinicalType: r.class.code === 'AMB' ? ('follow-up' as ClinicalType) : ('procedure' as ClinicalType),
    source: formatSource(r.meta?.source),
    status: 'Needs review' as ReconciliationStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
];

export function updateTaskStatus(
  tasks: ReconciliationTask[],
  taskId: string,
  update: {
    status: ReconciliationStatus;
    comment?: string;
    assignedTo?: string;
  }
): ReconciliationTask[] {
  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          ...update,
          updatedAt: new Date().toISOString(),
        }
      : task
  );
}

export function countByStatus(
  tasks: ReconciliationTask[]
): Record<ReconciliationStatus, number> {
  return tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] ?? 0) + 1;
    return acc;
  }, {} as Record<ReconciliationStatus, number>);
}
