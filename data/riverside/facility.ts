import { Facility } from '../shared/types';
import { departments } from './departments';
import { providers } from './providers';

export const riverside: Facility = {
  id: 'riverside',
  name: 'Riverside General Memorial',
  facilityType: 'Acute-care hospital',
  address: {
    line: ['410 Riverside Avenue'],
    city: 'River City',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
  },
  phone: '(212) 555-0140',
  npi: '1790348216',
  taxId: '13-4829167',
  mrnPrefix: 'RG',
  role: 'HL7 v2 event publisher and FHIR data responder',
  departments,
  providers,
};
