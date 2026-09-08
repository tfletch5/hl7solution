import { parseMessage, toHl7DateTime } from './parser';

const FIELD = '|';
const ENCODING_CHARS = '^~\\&';

export type AckCode = 'AA' | 'AE' | 'AR';

export function buildAck(inboundMessage: string, ackCode: AckCode = 'AA'): string {
  const parsed = parseMessage(inboundMessage);
  const msh = parsed.getSegment('MSH');

  if (!msh) {
    throw new Error('Cannot build ACK: inbound message has no MSH segment');
  }

  const originalControlId = msh.fields[9] ?? 'UNKNOWN';
  const originalReceivingApp = msh.fields[4] ?? '';
  const originalReceivingFacility = msh.fields[5] ?? '';
  const originalSendingApp = msh.fields[2] ?? '';
  const originalSendingFacility = msh.fields[3] ?? '';
  const timestamp = toHl7DateTime(new Date().toISOString());

  const ackMsh = [
    'MSH',
    ENCODING_CHARS,
    originalReceivingApp,
    originalReceivingFacility,
    originalSendingApp,
    originalSendingFacility,
    timestamp,
    '',
    'ACK',
    `ACK-${originalControlId}`,
    'P',
    '2.5',
  ];

  const msa = ['MSA', ackCode, originalControlId];

  return [ackMsh, msa].map((fields) => fields.join(FIELD)).join('\r');
}
