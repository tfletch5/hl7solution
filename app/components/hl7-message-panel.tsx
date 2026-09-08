'use client';

import { useRef, useState } from 'react';
import {
  buildAck,
  buildJaneDoeAdmission,
  ControlIdTracker,
  Hl7Message,
  parseMessage,
} from '@/lib/hl7';

export function Hl7MessagePanel() {
  const [message, setMessage] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Hl7Message | null>(null);
  const [ack, setAck] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const tracker = useRef(new ControlIdTracker());

  const sendAdt = () => {
    const raw = buildJaneDoeAdmission();
    const controlId = parseMessage(raw).getField('MSH', 10) ?? '';
    const check = tracker.current.check(controlId);

    if (check.isDuplicate) {
      setStatus(`Duplicate control ID detected: ${controlId}`);
      setAck(null);
    } else {
      tracker.current.record(controlId);
      setMessage(raw);
      setParsed(parseMessage(raw));
      setAck(null);
      setStatus(`ADT^A01 sent with control ID ${controlId}`);
    }
  };

  const acknowledge = () => {
    if (!message) return;
    const raw = buildAck(message, 'AA');
    setAck(raw);
    setStatus('ACK^AA returned by Harbor View');
  };

  const reset = () => {
    tracker.current.reset();
    setMessage(null);
    setParsed(null);
    setAck(null);
    setStatus(null);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold">HL7 v2 event notification</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={sendAdt}
            className="rounded-md bg-riverside px-3 py-1.5 text-sm font-medium text-white hover:bg-riverside-dark"
          >
            Send ADT^A01
          </button>
          <button
            onClick={acknowledge}
            disabled={!message}
            className="rounded-md bg-harborview px-3 py-1.5 text-sm font-medium text-white hover:bg-harborview-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Acknowledge
          </button>
          <button
            onClick={reset}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Reset
          </button>
        </div>
      </div>

      {status && (
        <p className="mb-4 rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          {status}
        </p>
      )}

      {message && (
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Raw HL7 v2 message
            </p>
            <pre className="overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
              {message}
            </pre>
          </div>

          {parsed && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Parsed segments
              </p>
              <div className="space-y-3">
                {parsed.segments.map((segment) => (
                  <div
                    key={segment.name + segment.raw}
                    className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                  >
                    <p className="mb-1 text-sm font-semibold text-zinc-800">
                      {segment.name}
                    </p>
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3">
                      {segment.fields.map((field, index) => {
                        if (index === 0 || !field) return null;
                        return (
                          <div
                            key={index}
                            className="overflow-hidden text-ellipsis text-xs text-zinc-600"
                          >
                            <span className="font-mono text-zinc-400">
                              {segment.name}-{index}
                            </span>{' '}
                            {field}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {ack && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            ACK response
          </p>
          <pre className="overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
            {ack}
          </pre>
        </div>
      )}

      {!message && !status && (
        <p className="text-sm text-zinc-500">
          Click “Send ADT^A01” to generate a synthetic admission event from Riverside for
          Jane Doe (RG-000445).
        </p>
      )}
    </div>
  );
}
