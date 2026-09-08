import { NextRequest, NextResponse } from "next/server";
import { buildAck, ControlIdTracker, parseMessage } from "@/lib/hl7";
import { matchPatient } from "@/lib/identity/patient-matching";
import { getAuditLogByControlId, recordAudit } from "@/lib/audit/provenance";
import { operationOutcome } from "@/lib/fhir/operation-outcome";

// Module-level tracker persists for the lifetime of the server process.
// In production this belongs in a database or interface engine.
const controlIdTracker = new ControlIdTracker();

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { message?: string };
    const raw = body.message;

    if (!raw || typeof raw !== "string") {
      return NextResponse.json(
        operationOutcome(
          "error",
          "invalid",
          'Request body must include a "message" string containing the HL7 v2 ADT message.',
        ),
        { status: 400 },
      );
    }

    const parsed = parseMessage(raw);
    const msh = parsed.getSegment("MSH");

    if (!msh) {
      return NextResponse.json(
        operationOutcome(
          "error",
          "structure",
          "MSH segment not found in message.",
        ),
        { status: 400 },
      );
    }

    const controlId = msh.fields[9] ?? "UNKNOWN";
    const source = msh.fields[2] ?? "UNKNOWN";
    const target = msh.fields[4] ?? "UNKNOWN";
    const duplicate = controlIdTracker.check(controlId).isDuplicate;

    if (duplicate) {
      const ack = buildAck(raw, "AR");
      recordAudit({
        source,
        target,
        action: "ADT rejected (duplicate control ID)",
        messageType: "ADT^A01",
        controlId,
        status: "warning",
        details: `Duplicate message control ID ${controlId} rejected.`,
      });

      return NextResponse.json({
        accepted: false,
        reason: "Duplicate message control ID",
        controlId,
        ack,
        audit: getAuditLogByControlId(controlId),
      });
    }

    controlIdTracker.record(controlId);

    // Extract the sending facility's local MRN and corroborating demographics.
    const pid3 = parsed.getComponent("PID", 3, 1) ?? "";
    const lastName = parsed.getComponent("PID", 5, 1);
    const firstName = parsed.getComponent("PID", 5, 2);
    const dateOfBirth = parsed.getField("PID", 7);
    const phone = parsed.getField("PID", 13);
    const line1 = parsed.getComponent("PID", 11, 1);
    const line2 = parsed.getComponent("PID", 11, 2);
    const city = parsed.getComponent("PID", 11, 3);
    const state = parsed.getComponent("PID", 11, 4);
    const postalCode = parsed.getComponent("PID", 11, 5);

    const match = matchPatient({
      mrn: pid3,
      facilityId: "riverside",
      firstName,
      lastName,
      dateOfBirth,
      phone,
      address:
        line1 || city
          ? {
              line: [line1, line2].filter(Boolean) as string[],
              city,
              state,
              postalCode,
            }
          : undefined,
    });

    const ack = buildAck(raw, "AA");

    recordAudit({
      source,
      target,
      action: match.matched
        ? "ADT accepted and matched"
        : "ADT accepted with match warning",
      messageType: "ADT^A01",
      controlId,
      patientRef: match.crosswalk
        ? `Patient/${match.crosswalk.patientId}`
        : `MRN/${pid3}`,
      status: match.matched ? "success" : "warning",
      details: match.matched
        ? `Patient matched with confidence ${match.confidence.toFixed(3)}`
        : `Match review needed: ${match.reasons.join("; ")}`,
    });

    return NextResponse.json({
      accepted: true,
      controlId,
      duplicate: false,
      match,
      ack,
      parsed: {
        msh: msh.fields,
        evn: parsed.getSegment("EVN")?.fields,
        pid: parsed.getSegment("PID")?.fields,
        pv1: parsed.getSegment("PV1")?.fields,
      },
      audit: getAuditLogByControlId(controlId),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(operationOutcome("error", "exception", message), {
      status: 500,
    });
  }
}
