'use client';

import { useMemo, useState } from 'react';
import {
  buildJaneDoeBundle,
  fhirPatient,
  fhirResources,
  validateAllResources,
} from '@/lib/fhir';

export function FhirCoveragePanel() {
  const [showBundle, setShowBundle] = useState(false);
  const [showPatient, setShowPatient] = useState(false);
  const [validation, setValidation] = useState<{
    valid: boolean;
    issues: { resourceType: string; id: string; field: string; message: string }[];
  } | null>(null);

  const counts = useMemo(() => {
    return fhirResources.reduce<Record<string, number>>((acc, r) => {
      acc[r.resourceType] = (acc[r.resourceType] ?? 0) + 1;
      return acc;
    }, {});
  }, []);

  const bySource = useMemo(() => {
    return fhirResources.reduce<Record<string, number>>((acc, r) => {
      const source = r.meta?.source ?? 'unknown';
      acc[source] = (acc[source] ?? 0) + 1;
      return acc;
    }, {});
  }, []);

  const runValidation = () => {
    setValidation(validateAllResources(fhirResources));
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold">FHIR resource coverage</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={runValidation}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Validate resources
          </button>
          <button
            onClick={() => setShowPatient((v) => !v)}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            {showPatient ? 'Hide' : 'View'} Patient JSON
          </button>
          <button
            onClick={() => setShowBundle((v) => !v)}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            {showBundle ? 'Hide' : 'View'} Bundle JSON
          </button>
        </div>
      </div>

      <p className="mb-3 text-sm text-zinc-600">
        These are typed R4-style FHIR resources for the demonstration patient, Jane
        Doe. They include real-ish coding from SNOMED CT, LOINC, RxNorm, and ICD-10.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {['Patient', 'Encounter', 'Condition', 'Observation', 'MedicationRequest', 'DiagnosticReport'].map(
          (type) => (
            <div
              key={type}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center"
            >
              <p className="text-2xl font-bold">{counts[type] ?? 0}</p>
              <p className="text-xs text-zinc-500">{type}</p>
            </div>
          )
        )}
      </div>

      <div className="mb-4 text-sm text-zinc-600">
        <p className="font-medium">Resources by source:</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {Object.entries(bySource).map(([source, count]) => (
            <span
              key={source}
              className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
            >
              {source.replace(/^https:\/\//, '')} &bull; {count}
            </span>
          ))}
        </div>
      </div>

      {validation && (
        <div
          className={`mb-4 rounded-md px-3 py-2 text-sm ${validation.valid ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}
        >
          {validation.valid ? (
            'All FHIR resources passed basic validation.'
          ) : (
            <>
              {validation.issues.length} validation issue(s) found:
              <ul className="mt-1 list-disc pl-4">
                {validation.issues.map((issue, i) => (
                  <li key={i}>
                    {issue.resourceType}/{issue.id} &bull; {issue.field}: {issue.message}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {showPatient && (
        <div className="mb-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Patient resource (FHIR R4)
          </p>
          <pre className="overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
            {JSON.stringify(fhirPatient, null, 2)}
          </pre>
        </div>
      )}

      {showBundle && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            FHIR Bundle (collection)
          </p>
          <pre className="overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
            {JSON.stringify(buildJaneDoeBundle(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
