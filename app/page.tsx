"use client";

import { useMemo, useState } from "react";
import {
  FacilityId,
  findCrosswalkByMrn,
  getEncountersByPatientMrn,
  getFacilityById,
  getPatientsByFacility,
  getProviderById,
  patients,
} from "@/data";
import { Hl7MessagePanel } from "@/app/components/hl7-message-panel";
import { FhirCoveragePanel } from "@/app/components/fhir-coverage-panel";
import { IntegrationPanel } from "@/app/components/integration-panel";

const facilityMeta: Record<
  FacilityId,
  { label: string; color: string; lightColor: string; darkColor: string }
> = {
  riverside: {
    label: "Riverside General Memorial",
    color: "bg-riverside",
    lightColor: "bg-riverside-light",
    darkColor: "text-riverside-dark",
  },
  harborview: {
    label: "Harbor View Primary Care",
    color: "bg-harborview",
    lightColor: "bg-harborview-light",
    darkColor: "text-harborview-dark",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Home() {
  const [selectedFacilityId, setSelectedFacilityId] =
    useState<FacilityId>("riverside");
  const [search, setSearch] = useState("");
  const [selectedMrn, setSelectedMrn] = useState<string | null>(null);

  const selectedFacility = getFacilityById(selectedFacilityId)!;
  const facilityPatients = useMemo(
    () => getPatientsByFacility(selectedFacilityId),
    [selectedFacilityId],
  );

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return facilityPatients;
    return facilityPatients.filter(
      (p) =>
        p.localMrn.toLowerCase().includes(q) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q),
    );
  }, [facilityPatients, search]);

  const selectedPatient = useMemo(() => {
    if (selectedMrn) {
      return filteredPatients.find((p) => p.localMrn === selectedMrn);
    }
    return filteredPatients[0];
  }, [filteredPatients, selectedMrn]);

  const crosswalk = useMemo(
    () =>
      selectedPatient
        ? findCrosswalkByMrn(selectedPatient.localMrn)
        : undefined,
    [selectedPatient],
  );

  const encounters = useMemo(
    () =>
      selectedPatient
        ? getEncountersByPatientMrn(selectedPatient.localMrn)
        : [],
    [selectedPatient],
  );

  const activeCount = facilityPatients.filter(
    (p) => p.workflowStatus === "Active",
  ).length;
  const followUpCount = facilityPatients.filter(
    (p) => p.workflowStatus === "Follow-up",
  ).length;

  const remoteIdentifier = crosswalk?.identifiers.find(
    (id) => id.facilityId !== selectedFacilityId,
  );

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CareBridge</h1>
            <p className="text-sm text-zinc-500">
              Healthcare interoperability workspace
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-zinc-100 p-1">
            {(Object.keys(facilityMeta) as FacilityId[]).map((id) => {
              const active = id === selectedFacilityId;
              return (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedFacilityId(id);
                    setSelectedMrn(null);
                  }}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    active
                      ? `${facilityMeta[id].color} text-white shadow-sm`
                      : "text-zinc-600 hover:bg-white hover:text-zinc-900"
                  }`}
                >
                  {id === "riverside" ? "Riverside" : "Harbor View"}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Patients in workspace"
            value={patients.length}
            subtitle="Across both facilities"
          />
          <MetricCard
            label="Facility patients"
            value={facilityPatients.length}
            subtitle={facilityMeta[selectedFacilityId].label}
          />
          <MetricCard
            label="Active workflow"
            value={activeCount}
            subtitle="Needs ongoing review"
          />
          <MetricCard
            label="Follow-up pending"
            value={followUpCount}
            subtitle="Scheduled or pending"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:col-span-1">
            <h2 className="mb-3 text-lg font-semibold">Patient directory</h2>
            <input
              type="text"
              placeholder="Search by name or MRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-riverside focus:outline-none focus:ring-1 focus:ring-riverside"
            />
            <ul className="max-h-[28rem] divide-y divide-zinc-100 overflow-auto">
              {filteredPatients.map((patient) => {
                const active = patient.localMrn === selectedPatient?.localMrn;
                return (
                  <li key={patient.localMrn}>
                    <button
                      onClick={() => setSelectedMrn(patient.localMrn)}
                      className={`w-full px-3 py-3 text-left transition hover:bg-zinc-50 ${
                        active
                          ? `${facilityMeta[selectedFacilityId].lightColor}`
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </span>
                        <StatusPill status={patient.workflowStatus} />
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                        <span>{patient.localMrn}</span>
                        <span>&bull;</span>
                        <span>{patient.primaryConcern}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
              {filteredPatients.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-zinc-500">
                  No patients match your search.
                </li>
              )}
            </ul>
          </section>

          <section className="space-y-6 lg:col-span-2">
            {selectedPatient ? (
              <>
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                        facilityMeta[selectedFacilityId].color
                      }`}
                    >
                      {selectedFacilityId === "riverside"
                        ? "Riverside"
                        : "Harbor View"}{" "}
                      view
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Local MRN
                      </p>
                      <p className="text-lg font-mono font-medium">
                        {selectedPatient.localMrn}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Cross-reference
                      </p>
                      <p className="text-lg font-mono font-medium">
                        {remoteIdentifier?.value ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Match confidence
                      </p>
                      <p className="text-lg font-medium text-emerald-600">
                        {crosswalk
                          ? `${(crosswalk.matchConfidence * 100).toFixed(1)}%`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Date of birth
                      </p>
                      <p className="text-lg">
                        {formatDate(selectedPatient.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 font-semibold">Care timeline</h3>
                  {encounters.length > 0 ? (
                    <ol className="relative space-y-4 border-l-2 border-zinc-200 pl-4">
                      {encounters.map((encounter) => {
                        const provider = getProviderById(encounter.providerId);
                        const remote =
                          encounter.facilityId !== selectedFacilityId;
                        return (
                          <li key={encounter.id} className="relative">
                            <span
                              className={`absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-white ${
                                remote
                                  ? facilityMeta[encounter.facilityId].color
                                  : "bg-zinc-400"
                              }`}
                            />
                            <p className="font-medium">{encounter.reason}</p>
                            <p className="text-sm text-zinc-500">
                              {formatDateTime(encounter.startDate)} &bull;{" "}
                              {encounter.type} &bull;{" "}
                              {provider?.name ?? encounter.providerId} &bull;{" "}
                              {encounter.status}
                            </p>
                            {remote && (
                              <p className="mt-1 text-xs text-zinc-500">
                                From{" "}
                                <span className="font-medium">
                                  {encounter.facilityId === "riverside"
                                    ? "Riverside General Memorial"
                                    : "Harbor View Primary Care"}
                                </span>
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="text-sm text-zinc-500">
                      No encounters recorded for this patient in the selected
                      facility.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 font-semibold">Facility profile</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Name
                      </p>
                      <p className="font-medium">{selectedFacility.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Type
                      </p>
                      <p>{selectedFacility.facilityType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Address
                      </p>
                      <p>{selectedFacility.address.line.join(", ")}</p>
                      <p>
                        {selectedFacility.address.city},{" "}
                        {selectedFacility.address.state}{" "}
                        {selectedFacility.address.postalCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Interoperability role
                      </p>
                      <p>{selectedFacility.role}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Departments
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedFacility.departments.map((dept) => (
                        <span
                          key={dept.code}
                          className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700"
                        >
                          {dept.code}: {dept.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Hl7MessagePanel />

                <FhirCoveragePanel />

                <IntegrationPanel />
              </>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
                Select a patient to view identity cross-reference, timeline, and
                facility details.
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 py-4 text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl">
          <strong>Synthetic data only.</strong> This workspace is for
          educational purposes and does not connect to a production EHR or
          transmit real PHI.
        </div>
      </footer>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: number | string;
  subtitle: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
    </div>
  );
}

function StatusPill({ status }: { status?: string }) {
  if (!status) return null;
  const styles: Record<string, string> = {
    Active: "bg-amber-100 text-amber-800",
    "Follow-up": "bg-blue-100 text-blue-800",
    Imported: "bg-zinc-100 text-zinc-700",
    "Needs review": "bg-red-100 text-red-800",
    Accepted: "bg-emerald-100 text-emerald-800",
    Rejected: "bg-rose-100 text-rose-800",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-zinc-100 text-zinc-700"}`}
    >
      {status}
    </span>
  );
}
