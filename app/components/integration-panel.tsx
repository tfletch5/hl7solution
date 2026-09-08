"use client";

import { useState } from "react";
import { buildJaneDoeAdmission } from "@/lib/hl7";

export function IntegrationPanel() {
  const [adtResult, setAdtResult] = useState<object | null>(null);
  const [fhirResult, setFhirResult] = useState<object | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const sendAdt = async () => {
    setLoading("adt");
    const message = buildJaneDoeAdmission();
    const res = await fetch("/api/hl7/adt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    setAdtResult(data as object);
    setLoading(null);
  };

  const fetchFhir = async (path: string) => {
    setLoading("fhir");
    const res = await fetch(path);
    const data = await res.json();
    setFhirResult(data as object);
    setLoading(null);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-semibold">
        Integration layer (API test console)
      </h3>
      <p className="mb-4 text-sm text-zinc-600">
        These calls exercise the thin API adapters that delegate to the shared
        business-logic modules. The dashboard is a client; the integration logic
        lives server-side in <code>lib/</code>.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={sendAdt}
          disabled={loading === "adt"}
          className="rounded-md bg-riverside px-3 py-1.5 text-sm font-medium text-white hover:bg-riverside-dark disabled:opacity-50"
        >
          {loading === "adt" ? "Sending…" : "POST /api/hl7/adt"}
        </button>
        <button
          onClick={() => fetchFhir("/api/fhir/Patient?identifier=RG-000445")}
          disabled={loading === "fhir"}
          className="rounded-md bg-harborview px-3 py-1.5 text-sm font-medium text-white hover:bg-harborview-dark disabled:opacity-50"
        >
          {loading === "fhir" ? "Fetching…" : "GET /api/fhir/Patient"}
        </button>
        <button
          onClick={() => fetchFhir("/api/fhir/Bundle")}
          disabled={loading === "fhir"}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          {loading === "fhir" ? "Fetching…" : "GET /api/fhir/Bundle"}
        </button>
      </div>

      {adtResult !== null && (
        <div className="mb-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            HL7 ADT response
          </p>
          <pre className="overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
            {JSON.stringify(adtResult, null, 2)}
          </pre>
        </div>
      )}

      {fhirResult !== null && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            FHIR response
          </p>
          <pre className="overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
            {JSON.stringify(fhirResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
