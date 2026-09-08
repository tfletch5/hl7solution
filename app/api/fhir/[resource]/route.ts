import { NextRequest, NextResponse } from "next/server";
import { buildJaneDoeBundle, fhirResources } from "@/lib/fhir";
import { FhirBundle, FhirPatient } from "@/lib/fhir/types";
import { operationOutcome } from "@/lib/fhir/operation-outcome";

const supportedResources = new Set([
  "Patient",
  "Encounter",
  "Condition",
  "Observation",
  "MedicationRequest",
  "DiagnosticReport",
  "Bundle",
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;

  if (!supportedResources.has(resource)) {
    return NextResponse.json(
      operationOutcome(
        "error",
        "not-supported",
        `Resource type "${resource}" is not supported by this demonstration FHIR endpoint.`,
      ),
      { status: 404 },
    );
  }

  if (resource === "Bundle") {
    return NextResponse.json(buildJaneDoeBundle());
  }

  const searchParams = request.nextUrl.searchParams;
  const identifier = searchParams.get("identifier");
  const patient = searchParams.get("patient");

  let results = fhirResources.filter((r) => r.resourceType === resource);

  if (resource === "Patient" && identifier) {
    results = (results as FhirPatient[]).filter((p) =>
      p.identifier.some(
        (id) =>
          id.value === identifier ||
          `${id.system}|${id.value}` === identifier ||
          id.system === identifier,
      ),
    );
  } else if (patient) {
    const patientRef = `Patient/${patient}`;
    results = results.filter((r) => {
      const any = r as unknown as Record<string, unknown>;
      const subject = any.subject as { reference?: string } | undefined;
      return subject?.reference === patientRef;
    });
  }

  const bundle: FhirBundle = {
    resourceType: "Bundle",
    id: `searchset-${resource.toLowerCase()}-${Date.now()}`,
    meta: { lastUpdated: new Date().toISOString() },
    type: "searchset",
    entry: results.map((r) => ({
      fullUrl: `urn:uuid:${r.id}`,
      resource: r,
    })),
  };

  return NextResponse.json(bundle);
}
