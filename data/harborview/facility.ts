import { Facility } from '../shared/types';
import { departments } from './departments';
import { providers } from './providers';

export const harborview: Facility = {
  id: 'harborview',
  name: 'Harbor View Primary Care',
  facilityType: 'Outpatient primary-care practice',
  address: {
    line: ['22 Harbor View Drive'],
    city: 'River City',
    state: 'NY',
    postalCode: '10004',
    country: 'US',
  },
  phone: '(212) 555-0188',
  npi: '1649820375',
  taxId: '13-7091842',
  mrnPrefix: 'HV',
  role: 'HL7 v2 event consumer and FHIR data requester',
  departments,
  providers,
};
