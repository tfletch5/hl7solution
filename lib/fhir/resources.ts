import { crosswalk } from '@/data/shared/crosswalk';
import {
  FhirBundle,
  FhirCondition,
  FhirDiagnosticReport,
  FhirEncounter,
  FhirMedicationRequest,
  FhirObservation,
  FhirPatient,
} from './types';

const patient = crosswalk.find((p) => p.patientId === 'PAT-001');
if (!patient) {
  throw new Error('PAT-001 (Jane Doe) not found in crosswalk');
}

const sourceRiverside = 'https://riverside.example.org/fhir';
const sourceHarborview = 'https://harborview.example.org/fhir';
const now = new Date().toISOString();

export const fhirPatient: FhirPatient = {
  resourceType: 'Patient',
  id: 'PAT-001',
  meta: {
    lastUpdated: now,
    source: sourceHarborview,
    profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
  },
  text: {
    status: 'generated',
    div: `<div xmlns="http://www.w3.org/1999/xhtml">${patient.firstName} ${patient.lastName}</div>`,
  },
  identifier: [
    {
      use: 'usual',
      type: {
        text: 'Riverside MRN',
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR',
            display: 'Medical record number',
          },
        ],
      },
      system: 'https://riverside.example.org/mrn',
      value: 'RG-000445',
    },
    {
      use: 'usual',
      type: {
        text: 'Harbor View MRN',
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR',
            display: 'Medical record number',
          },
        ],
      },
      system: 'https://harborview.example.org/mrn',
      value: 'HV-100782',
    },
  ],
  active: true,
  name: [
    {
      use: 'official',
      family: patient.lastName,
      given: [patient.firstName],
    },
  ],
  telecom: [
    {
      system: 'phone',
      value: patient.phone,
      use: 'home',
    },
  ],
  gender:
    patient.gender === 'female'
      ? 'female'
      : patient.gender === 'male'
        ? 'male'
        : 'other',
  birthDate: patient.dateOfBirth,
  address: [
    {
      use: 'home',
      line: patient.address.line,
      city: patient.address.city,
      state: patient.address.state,
      postalCode: patient.address.postalCode,
      country: patient.address.country,
    },
  ],
  managingOrganization: {
    reference: 'Organization/harborview',
    display: 'Harbor View Primary Care',
  },
};

export const fhirEncounters: FhirEncounter[] = [
  {
    resourceType: 'Encounter',
    id: 'enc-rg-001',
    meta: {
      lastUpdated: now,
      source: sourceRiverside,
    },
    text: {
      status: 'generated',
      div: '<div xmlns="http://www.w3.org/1999/xhtml">Inpatient admission for hyperglycemia and dehydration</div>',
    },
    status: 'in-progress',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'IMP',
      display: 'inpatient encounter',
    },
    type: [
      {
        text: 'Emergency to inpatient admission',
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '308335008',
            display: 'Patient encounter procedure',
          },
        ],
      },
    ],
    subject: {
      reference: 'Patient/PAT-001',
      display: `${patient.firstName} ${patient.lastName}`,
    },
    participant: [
      {
        type: [
          {
            text: 'Attending physician',
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                code: 'ATND',
                display: 'attender',
              },
            ],
          },
        ],
        individual: {
          reference: 'Practitioner/RG-PROV-001',
          display: 'Alex Smith, MD',
        },
      },
    ],
    period: { start: '2026-09-01T08:30:00Z' },
    reasonCode: [
      {
        text: 'Hyperglycemia and dehydration',
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '237620003',
            display: 'Hyperglycemia due to diabetes mellitus',
          },
        ],
      },
    ],
    serviceProvider: {
      reference: 'Organization/riverside',
      display: 'Riverside General Memorial',
    },
  },
  {
    resourceType: 'Encounter',
    id: 'enc-hv-001',
    meta: {
      lastUpdated: now,
      source: sourceHarborview,
    },
    text: {
      status: 'generated',
      div: '<div xmlns="http://www.w3.org/1999/xhtml">Hospital discharge follow-up</div>',
    },
    status: 'planned',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory',
    },
    type: [
      {
        text: 'Hospital discharge follow-up',
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '390906007',
            display: 'Follow-up encounter',
          },
        ],
      },
    ],
    subject: {
      reference: 'Patient/PAT-001',
      display: `${patient.firstName} ${patient.lastName}`,
    },
    participant: [
      {
        type: [
          {
            text: 'Primary care provider',
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                code: 'PPRF',
                display: 'primary performer',
              },
            ],
          },
        ],
        individual: {
          reference: 'Practitioner/HV-PROV-001',
          display: 'Elena Rodriguez, MD',
        },
      },
    ],
    period: { start: '2026-09-10T09:00:00Z' },
    reasonCode: [
      {
        text: 'Hospital discharge follow-up',
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '390906007',
            display: 'Follow-up encounter',
          },
        ],
      },
    ],
    serviceProvider: {
      reference: 'Organization/harborview',
      display: 'Harbor View Primary Care',
    },
  },
];

export const fhirConditions: FhirCondition[] = [
  {
    resourceType: 'Condition',
    id: 'cond-001',
    meta: {
      lastUpdated: now,
      source: sourceHarborview,
    },
    text: {
      status: 'generated',
      div: '<div xmlns="http://www.w3.org/1999/xhtml">Type 2 diabetes mellitus</div>',
    },
    clinicalStatus: {
      text: 'Active',
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active',
          display: 'Active',
        },
      ],
    },
    verificationStatus: {
      text: 'Confirmed',
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: 'confirmed',
          display: 'Confirmed',
        },
      ],
    },
    category: [
      {
        text: 'Problem',
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-category',
            code: 'problem-list-item',
            display: 'Problem List Item',
          },
        ],
      },
    ],
    code: {
      text: 'Type 2 diabetes mellitus',
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '44054006',
          display: 'Type 2 diabetes mellitus',
        },
        {
          system: 'http://hl7.org/fhir/sid/icd-10-cm',
          code: 'E11.9',
          display: 'Type 2 diabetes mellitus without complications',
        },
      ],
    },
    subject: {
      reference: 'Patient/PAT-001',
      display: `${patient.firstName} ${patient.lastName}`,
    },
    onsetDateTime: '2015-06-01',
    recordedDate: '2015-06-15',
    asserter: {
      reference: 'Practitioner/HV-PROV-001',
      display: 'Elena Rodriguez, MD',
    },
  },
];

export const fhirObservations: FhirObservation[] = [
  {
    resourceType: 'Observation',
    id: 'obs-glucose-001',
    meta: {
      lastUpdated: now,
      source: sourceRiverside,
    },
    status: 'final',
    category: [
      {
        text: 'Laboratory',
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory',
            display: 'Laboratory',
          },
        ],
      },
    ],
    code: {
      text: 'Glucose in Blood',
      coding: [
        {
          system: 'http://loinc.org',
          code: '2339-0',
          display: 'Glucose [Mass/volume] in Blood',
        },
      ],
    },
    subject: {
      reference: 'Patient/PAT-001',
      display: `${patient.firstName} ${patient.lastName}`,
    },
    effectiveDateTime: '2026-09-01T09:00:00Z',
    valueQuantity: {
      value: 385,
      unit: 'mg/dL',
      system: 'http://unitsofmeasure.org',
      code: 'mg/dL',
    },
    interpretation: [
      {
        text: 'High',
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: 'H',
            display: 'High',
          },
        ],
      },
    ],
    referenceRange: [
      {
        low: { value: 70, unit: 'mg/dL' },
        high: { value: 140, unit: 'mg/dL' },
        text: '70 - 140 mg/dL',
      },
    ],
  },
  {
    resourceType: 'Observation',
    id: 'obs-sodium-001',
    meta: {
      lastUpdated: now,
      source: sourceRiverside,
    },
    status: 'final',
    category: [
      {
        text: 'Laboratory',
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory',
            display: 'Laboratory',
          },
        ],
      },
    ],
    code: {
      text: 'Sodium in Serum or Plasma',
      coding: [
        {
          system: 'http://loinc.org',
          code: '2951-2',
          display: 'Sodium [Moles/volume] in Serum or Plasma',
        },
      ],
    },
    subject: {
      reference: 'Patient/PAT-001',
      display: `${patient.firstName} ${patient.lastName}`,
    },
    effectiveDateTime: '2026-09-01T09:00:00Z',
    valueQuantity: {
      value: 132,
      unit: 'mmol/L',
      system: 'http://unitsofmeasure.org',
      code: 'mmol/L',
    },
    interpretation: [
      {
        text: 'Low',
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: 'L',
            display: 'Low',
          },
        ],
      },
    ],
    referenceRange: [
      {
        low: { value: 135, unit: 'mmol/L' },
        high: { value: 145, unit: 'mmol/L' },
        text: '135 - 145 mmol/L',
      },
    ],
  },
];

export const fhirMedicationRequests: FhirMedicationRequest[] = [
  {
    resourceType: 'MedicationRequest',
    id: 'med-insulin-001',
    meta: {
      lastUpdated: now,
      source: sourceRiverside,
    },
    text: {
      status: 'generated',
      div: '<div xmlns="http://www.w3.org/1999/xhtml">Insulin lispro 100 units/mL injectable solution</div>',
    },
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: {
      text: 'Insulin lispro 100 units/mL injectable solution',
      coding: [
        {
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          code: '311027',
          display: 'insulin lispro 100 UNT/ML Injectable Solution [Humalog]',
        },
      ],
    },
    subject: {
      reference: 'Patient/PAT-001',
      display: `${patient.firstName} ${patient.lastName}`,
    },
    authoredOn: '2026-09-01T10:15:00Z',
    requester: {
      reference: 'Practitioner/RG-PROV-003',
      display: 'Maya Chen, PharmD',
    },
    dosageInstruction: [
      {
        text: '10 units subcutaneously before meals',
        route: {
          text: 'Subcutaneous',
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '34206005',
              display: 'Subcutaneous route',
            },
          ],
        },
        timing: {
          repeat: {
            frequency: 3,
            period: 1,
            periodUnit: 'd',
          },
        },
      },
    ],
  },
];

export const fhirDiagnosticReports: FhirDiagnosticReport[] = [
  {
    resourceType: 'DiagnosticReport',
    id: 'report-bmp-001',
    meta: {
      lastUpdated: now,
      source: sourceRiverside,
    },
    text: {
      status: 'generated',
      div: '<div xmlns="http://www.w3.org/1999/xhtml">Basic metabolic panel</div>',
    },
    status: 'final',
    category: [
      {
        text: 'Laboratory',
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: 'LAB',
            display: 'Laboratory',
          },
        ],
      },
    ],
    code: {
      text: 'Basic metabolic panel',
      coding: [
        {
          system: 'http://loinc.org',
          code: '51990-0',
          display: 'Basic metabolic panel - Blood',
        },
      ],
    },
    subject: {
      reference: 'Patient/PAT-001',
      display: `${patient.firstName} ${patient.lastName}`,
    },
    effectiveDateTime: '2026-09-01T09:00:00Z',
    issued: '2026-09-01T11:00:00Z',
    result: [
      { reference: 'Observation/obs-glucose-001', display: 'Glucose' },
      { reference: 'Observation/obs-sodium-001', display: 'Sodium' },
    ],
    conclusion:
      'Hyperglycemia with mild hyponatremia, consistent with dehydration.',
    performer: [
      {
        reference: 'Organization/riverside',
        display: 'Riverside General Memorial',
      },
    ],
  },
];

export const fhirResources = [
  fhirPatient,
  ...fhirEncounters,
  ...fhirConditions,
  ...fhirObservations,
  ...fhirMedicationRequests,
  ...fhirDiagnosticReports,
];

export function buildJaneDoeBundle(): FhirBundle {
  return {
    resourceType: 'Bundle',
    id: 'bundle-jane-doe-001',
    meta: {
      lastUpdated: now,
    },
    type: 'collection',
    entry: fhirResources.map((resource) => ({
      fullUrl: `urn:uuid:${resource.id}`,
      resource,
    })),
  };
}
