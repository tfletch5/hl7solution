import { CrosswalkEntry } from './types';

/**
 * The crosswalk represents the integration layer's understanding that two
 * facility-local medical-record numbers describe the same person.
 *
 * In a production environment this mapping would be maintained by an enterprise
 * master patient index (MPI), an identity-matching service, or a trusted
 * third-party identifier. It is intentionally separate from the source
 * facility records, neither of which stores the other organization's MRN.
 */
export const crosswalk: CrosswalkEntry[] = [
  {
    patientId: 'PAT-001',
    firstName: 'Jane',
    lastName: 'Doe',
    dateOfBirth: '1985-04-12',
    gender: 'female',
    address: {
      line: ['321 River Street', 'Apt 2B'],
      city: 'River City',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    },
    phone: '(212) 555-0101',
    identifiers: [
      { system: 'https://riverside.example.org/mrn', value: 'RG-000445', facilityId: 'riverside' },
      { system: 'https://harborview.example.org/mrn', value: 'HV-100782', facilityId: 'harborview' },
    ],
    matchConfidence: 0.998,
  },
  {
    patientId: 'PAT-002',
    firstName: 'Michael',
    lastName: 'Chen',
    dateOfBirth: '1972-09-30',
    gender: 'male',
    address: {
      line: ['55 Riverside Avenue'],
      city: 'River City',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    },
    phone: '(212) 555-0102',
    identifiers: [
      { system: 'https://riverside.example.org/mrn', value: 'RG-000511', facilityId: 'riverside' },
      { system: 'https://harborview.example.org/mrn', value: 'HV-100814', facilityId: 'harborview' },
    ],
    matchConfidence: 0.998,
  },
  {
    patientId: 'PAT-003',
    firstName: 'Amara',
    lastName: 'Williams',
    dateOfBirth: '1994-11-08',
    gender: 'female',
    address: {
      line: ['88 Ocean Parkway'],
      city: 'River City',
      state: 'NY',
      postalCode: '10004',
      country: 'US',
    },
    phone: '(212) 555-0103',
    identifiers: [
      { system: 'https://riverside.example.org/mrn', value: 'RG-000566', facilityId: 'riverside' },
      { system: 'https://harborview.example.org/mrn', value: 'HV-100863', facilityId: 'harborview' },
    ],
    matchConfidence: 0.997,
  },
  {
    patientId: 'PAT-004',
    firstName: 'Robert',
    lastName: 'Miller',
    dateOfBirth: '1960-02-21',
    gender: 'male',
    address: {
      line: ['44 Harbor View Drive'],
      city: 'River City',
      state: 'NY',
      postalCode: '10004',
      country: 'US',
    },
    phone: '(212) 555-0104',
    identifiers: [
      { system: 'https://riverside.example.org/mrn', value: 'RG-000604', facilityId: 'riverside' },
      { system: 'https://harborview.example.org/mrn', value: 'HV-100904', facilityId: 'harborview' },
    ],
    matchConfidence: 0.998,
  },
];
