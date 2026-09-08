import { FhirResource } from './types';

export interface FhirOperationOutcome extends FhirResource {
  resourceType: 'OperationOutcome';
  issue: Array<{
    severity: 'fatal' | 'error' | 'warning' | 'information';
    code: string;
    diagnostics?: string;
    details?: { text: string };
  }>;
}

export function operationOutcome(
  severity: 'fatal' | 'error' | 'warning' | 'information',
  code: string,
  diagnostics: string
): FhirOperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    id: `oo-${Date.now()}`,
    issue: [
      {
        severity,
        code,
        diagnostics,
        details: { text: diagnostics },
      },
    ],
  };
}
