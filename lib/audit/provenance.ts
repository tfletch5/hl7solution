export interface AuditEvent {
  id: string;
  timestamp: string;
  source: string;
  target: string;
  action: string;
  messageType?: string;
  controlId?: string;
  patientRef?: string;
  status: 'success' | 'warning' | 'failure';
  details: string;
}

const auditLog: AuditEvent[] = [];

export function recordAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
  const entry: AuditEvent = {
    ...event,
    id: `AUD-${Date.now()}-${auditLog.length + 1}`,
    timestamp: new Date().toISOString(),
  };
  auditLog.push(entry);
  return entry;
}

export function getAuditLog(): AuditEvent[] {
  return [...auditLog];
}

export function getAuditLogByControlId(controlId: string): AuditEvent[] {
  return auditLog.filter((e) => e.controlId === controlId);
}

export function clearAuditLog(): void {
  auditLog.length = 0;
}
