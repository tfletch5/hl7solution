import { Provider } from '../shared/types';

export const providers: Provider[] = [
  {
    id: 'RG-PROV-001',
    name: 'Alex Smith',
    credentials: 'MD',
    role: 'Emergency Medicine Physician',
    department: 'ED',
    facilityId: 'riverside',
  },
  {
    id: 'RG-PROV-002',
    name: 'Priya Nair',
    credentials: 'MD',
    role: 'Hospitalist',
    department: 'IM',
    facilityId: 'riverside',
  },
  {
    id: 'RG-PROV-003',
    name: 'Maya Chen',
    credentials: 'PharmD',
    role: 'Clinical Pharmacist',
    department: 'RX',
    facilityId: 'riverside',
  },
  {
    id: 'RG-PROV-004',
    name: 'Jordan Brooks',
    credentials: 'RHIA',
    role: 'Health Information Management Director',
    department: 'HIM',
    facilityId: 'riverside',
  },
];
