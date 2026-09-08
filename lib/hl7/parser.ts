export interface Hl7Segment {
  name: string;
  raw: string;
  fields: string[];
}

export interface Hl7Message {
  raw: string;
  segments: Hl7Segment[];
  getSegment(name: string): Hl7Segment | undefined;
  getField(segmentName: string, fieldIndex: number): string | undefined;
  getComponent(
    segmentName: string,
    fieldIndex: number,
    componentIndex: number
  ): string | undefined;
}

export interface Hl7Separators {
  field: string;
  component: string;
  repetition: string;
  escape: string;
  subcomponent: string;
}

function toHl7DateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number, len: number) => String(n).padStart(len, '0');
  return (
    `${pad(d.getUTCFullYear(), 4)}` +
    `${pad(d.getUTCMonth() + 1, 2)}` +
    `${pad(d.getUTCDate(), 2)}` +
    `${pad(d.getUTCHours(), 2)}` +
    `${pad(d.getUTCMinutes(), 2)}` +
    `${pad(d.getUTCSeconds(), 2)}`
  );
}

export function toHl7Date(iso: string): string {
  return toHl7DateTime(iso).slice(0, 8);
}

export { toHl7DateTime };

export function detectSeparators(raw: string): Hl7Separators {
  const firstLine = raw.split(/\r|\n/).find((line) => line.trim().startsWith('MSH')) ?? '';
  const field = firstLine[3] ?? '|';
  const encEnd = firstLine.indexOf(field, 4);
  const enc = firstLine.substring(4, encEnd > 4 ? encEnd : 4 + 4);
  return {
    field,
    component: enc[0] ?? '^',
    repetition: enc[1] ?? '~',
    escape: enc[2] ?? '\\',
    subcomponent: enc[3] ?? '&',
  };
}

export function parseMessage(raw: string): Hl7Message {
  const separators = detectSeparators(raw);
  const lines = raw
    .split(/\r|\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const segments: Hl7Segment[] = lines.map((line) => {
    const fields = line.split(separators.field);
    return {
      name: fields[0]?.toUpperCase() ?? '',
      raw: line,
      fields,
    };
  });

  const byName = new Map<string, Hl7Segment>();
  for (const segment of segments) {
    if (!byName.has(segment.name)) {
      byName.set(segment.name, segment);
    }
  }

  return {
    raw,
    segments,
    getSegment: (name: string) => byName.get(name.toUpperCase()),
    getField: (segmentName: string, fieldIndex: number) => {
      const segment = byName.get(segmentName.toUpperCase());
      return segment?.fields[fieldIndex];
    },
    getComponent: (segmentName: string, fieldIndex: number, componentIndex: number) => {
      const field = byName.get(segmentName.toUpperCase())?.fields[fieldIndex];
      if (!field) return undefined;
      const components = field.split(separators.component);
      return components[componentIndex - 1]; // 1-based HL7 component position
    },
  };
}

export function segmentToObject(segment: Hl7Segment): Record<number, string | undefined> {
  const result: Record<number, string | undefined> = {};
  for (let i = 1; i < segment.fields.length; i++) {
    result[i] = segment.fields[i];
  }
  return result;
}
