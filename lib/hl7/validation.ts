export interface ControlIdValidationResult {
  controlId: string;
  isDuplicate: boolean;
}

/**
 * A simple in-memory tracker for HL7 message control IDs.
 *
 * In production this state would live in a database, an interface engine,
 * or a durable queue so duplicates can be detected across restarts and
 * multiple workers.
 */
export class ControlIdTracker {
  private seen = new Set<string>();

  check(controlId: string): ControlIdValidationResult {
    return {
      controlId,
      isDuplicate: this.seen.has(controlId),
    };
  }

  record(controlId: string): void {
    this.seen.add(controlId);
  }

  reset(): void {
    this.seen.clear();
  }
}
